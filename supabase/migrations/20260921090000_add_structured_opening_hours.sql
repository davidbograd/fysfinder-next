-- Structured opening hours + Google sync bookkeeping.
--
-- Background: opening hours live in seven free-text columns (mandag..søndag) that four
-- different writers fill with four different formats ("08.00–18.00", "08:00 – 17:00",
-- "09:00-17:00", "7-19"). "Lukket" doubles as both "closed that day" and "we have no
-- data", which is why the Google sync silently marked ~1,550 clinics closed all week.
--
-- This adds a single validated jsonb column as the new source of truth. The legacy text
-- columns stay in place and are still dual-written until every reader has moved over.

ALTER TABLE public.clinics
  ADD COLUMN IF NOT EXISTS opening_hours jsonb,
  ADD COLUMN IF NOT EXISTS opening_hours_source text,
  ADD COLUMN IF NOT EXISTS google_synced_at timestamptz,
  ADD COLUMN IF NOT EXISTS google_business_status text;

COMMENT ON COLUMN public.clinics.opening_hours IS
  'Structured weekly opening hours. Keys mon..sun; a missing key means "unknown", an empty array means "closed that day". Times are ISO HH:MM in Europe/Copenhagen; "24:00" is end-of-day. Multiple ranges per day represent split shifts.';

COMMENT ON COLUMN public.clinics.opening_hours_source IS
  'Where opening_hours last came from: google | owner | import.';

COMMENT ON COLUMN public.clinics.google_synced_at IS
  'Last time the Google Places sync successfully processed this clinic, regardless of whether anything changed. Drives the monthly rotation that keeps the job under the 1,000-call free tier.';

COMMENT ON COLUMN public.clinics.google_business_status IS
  'Latest businessStatus reported by Google (OPERATIONAL, CLOSED_TEMPORARILY, CLOSED_PERMANENTLY).';

-- Shape enforcement. Without this the format drift that caused the original bug can
-- simply happen again from a different writer.
ALTER TABLE public.clinics
  DROP CONSTRAINT IF EXISTS clinics_opening_hours_shape;

ALTER TABLE public.clinics
  ADD CONSTRAINT clinics_opening_hours_shape CHECK (
    opening_hours IS NULL
    OR extensions.jsonb_matches_schema(
      '{
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "mon": { "$ref": "#/$defs/day" },
          "tue": { "$ref": "#/$defs/day" },
          "wed": { "$ref": "#/$defs/day" },
          "thu": { "$ref": "#/$defs/day" },
          "fri": { "$ref": "#/$defs/day" },
          "sat": { "$ref": "#/$defs/day" },
          "sun": { "$ref": "#/$defs/day" }
        },
        "$defs": {
          "day": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": false,
              "required": ["open", "close"],
              "properties": {
                "open":  { "type": "string", "pattern": "^([01][0-9]|2[0-3]):[0-5][0-9]$" },
                "close": { "type": "string", "pattern": "^(([01][0-9]|2[0-3]):[0-5][0-9]|24:00)$" }
              }
            }
          }
        }
      }',
      opening_hours
    )
  );

ALTER TABLE public.clinics
  DROP CONSTRAINT IF EXISTS clinics_opening_hours_source_check;

ALTER TABLE public.clinics
  ADD CONSTRAINT clinics_opening_hours_source_check CHECK (
    opening_hours_source IS NULL
    OR opening_hours_source IN ('google', 'owner', 'import')
  );

ALTER TABLE public.clinics
  DROP CONSTRAINT IF EXISTS clinics_google_business_status_check;

ALTER TABLE public.clinics
  ADD CONSTRAINT clinics_google_business_status_check CHECK (
    google_business_status IS NULL
    OR google_business_status IN ('OPERATIONAL', 'CLOSED_TEMPORARILY', 'CLOSED_PERMANENTLY')
  );

-- The sync picks the least-recently-synced clinics first; nulls (never synced) must sort first.
CREATE INDEX IF NOT EXISTS clinics_google_sync_rotation_idx
  ON public.clinics (google_synced_at NULLS FIRST)
  WHERE google_place_id IS NOT NULL;
