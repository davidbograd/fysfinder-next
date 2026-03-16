-- Migration: add coordinate columns for clinic map markers
-- Date: 2026-03-07

ALTER TABLE clinics
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS google_place_id TEXT;

CREATE INDEX IF NOT EXISTS idx_clinics_latitude_longitude
ON clinics(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_clinics_google_place_id
ON clinics(google_place_id);

COMMENT ON COLUMN clinics.latitude IS 'Clinic latitude used for map markers';
COMMENT ON COLUMN clinics.longitude IS 'Clinic longitude used for map markers';
COMMENT ON COLUMN clinics.google_place_id IS 'Google Place ID for syncing map metadata';

