-- Rollback changes if needed
ALTER TABLE clinics DROP COLUMN city_id;
DROP INDEX IF EXISTS idx_clinics_city_id; 