-- Add mapsUrl column to clinics table
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS mapsUrl TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN clinics.mapsUrl IS 'Google Maps URL for the clinic location';

-- Migration can be reverted with:
-- ALTER TABLE clinics DROP COLUMN IF EXISTS mapsUrl; 