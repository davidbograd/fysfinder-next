-- Migration: Add clinic_events table for per-clinic analytics tracking
-- Tracks profile views, list impressions, contact clicks (phone, website, email, booking)

CREATE TABLE IF NOT EXISTS clinic_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES clinics(clinics_id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Constrain event_type to known values
ALTER TABLE clinic_events
  ADD CONSTRAINT clinic_events_event_type_check
  CHECK (event_type IN (
    'profile_view',
    'list_impression',
    'phone_click',
    'website_click',
    'email_click',
    'booking_click'
  ));

-- Indexes for efficient dashboard queries
CREATE INDEX idx_clinic_events_clinic_id ON clinic_events(clinic_id);
CREATE INDEX idx_clinic_events_created_at ON clinic_events(created_at);
CREATE INDEX idx_clinic_events_clinic_date ON clinic_events(clinic_id, created_at);
CREATE INDEX idx_clinic_events_type_clinic ON clinic_events(event_type, clinic_id);

-- RLS: Enable row-level security
ALTER TABLE clinic_events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow inserts from the service role (API route uses service role key)
-- No public read access; stats are fetched via server actions with ownership checks
CREATE POLICY "Service role can insert events"
  ON clinic_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can read events"
  ON clinic_events
  FOR SELECT
  TO service_role
  USING (true);

-- Aggregation helper: get event counts for a clinic within a date range
CREATE OR REPLACE FUNCTION get_clinic_event_counts(
  p_clinic_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE(event_type TEXT, count BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT ce.event_type, COUNT(*) as count
  FROM clinic_events ce
  WHERE ce.clinic_id = p_clinic_id
    AND ce.created_at >= p_start_date
    AND ce.created_at <= p_end_date
  GROUP BY ce.event_type;
$$;
