-- Migration: Add custom timing columns to clinics table
-- Date: 2024-12-19
-- Description: Allows clinics to define custom durations for first consultation and follow-up consultations

-- Add custom timing columns to the clinics table
ALTER TABLE clinics 
ADD COLUMN IF NOT EXISTS første_kons_minutter INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS opfølgning_minutter INTEGER DEFAULT 30;

-- Add comments to explain the columns
COMMENT ON COLUMN clinics.første_kons_minutter IS 'Duration in minutes for the first consultation (default: 60 minutes)';
COMMENT ON COLUMN clinics.opfølgning_minutter IS 'Duration in minutes for follow-up consultations (default: 30 minutes)';

-- Update existing records to have the default values
UPDATE clinics 
SET første_kons_minutter = 60, opfølgning_minutter = 30 
WHERE første_kons_minutter IS NULL OR opfølgning_minutter IS NULL;

-- Optional: Add constraints to ensure reasonable timing values (5-180 minutes)
ALTER TABLE clinics 
ADD CONSTRAINT check_første_kons_minutter CHECK (første_kons_minutter >= 5 AND første_kons_minutter <= 180),
ADD CONSTRAINT check_opfølgning_minutter CHECK (opfølgning_minutter >= 5 AND opfølgning_minutter <= 180);

-- Update the stored procedure to include timing columns with defaults
CREATE OR REPLACE FUNCTION process_verified_submission(submission_id UUID)
RETURNS void AS $$
DECLARE
    staging_record RECORD;
    current_clinic_id UUID;
    matching_city_id UUID;
    matching_city_name TEXT;
BEGIN
    -- Get the staging record
    SELECT * INTO staging_record 
    FROM clinic_submissions_staging 
    WHERE id = submission_id;

    -- Find the matching city based on postal code
    SELECT id, bynavn INTO matching_city_id, matching_city_name
    FROM cities
    WHERE staging_record.postnummer::text = ANY(postal_codes);

    IF staging_record.is_update THEN
        -- Update existing clinic
        UPDATE clinics SET
            "klinikNavn" = staging_record.klinik_navn,
            "email" = staging_record.email,
            "tlf" = staging_record.telefon,
            "website" = staging_record.website,
            "adresse" = staging_record.adresse,
            "postnummer" = staging_record.postnummer,
            "ydernummer" = staging_record.ydernummer,
            "førsteKons" = staging_record.forste_konsultation_pris::text,
            "opfølgning" = staging_record.normal_konsultation_pris::text,
            "første_kons_minutter" = COALESCE(staging_record.forste_konsultation_minutter, 60),
            "opfølgning_minutter" = COALESCE(staging_record.normal_konsultation_minutter, 30),
            "handicapadgang" = staging_record.handicap_adgang,
            "holdtræning" = staging_record.holdtraening,
            "om_os" = staging_record.om_klinikken,
            "verified_klinik" = TRUE,
            "city_id" = matching_city_id,
            "lokation" = matching_city_name,
            "updated_at" = NOW()
        WHERE "clinics_id" = staging_record.matched_clinic_id
        RETURNING "clinics_id" INTO current_clinic_id;

        -- Delete existing relationships
        DELETE FROM clinic_specialties WHERE "clinics_id" = current_clinic_id;
        DELETE FROM clinic_services WHERE "clinic_id" = current_clinic_id;
        DELETE FROM clinic_insurances WHERE "clinic_id" = current_clinic_id;
    ELSE
        -- Insert new clinic
        INSERT INTO clinics (
            "klinikNavn",
            "email",
            "tlf",
            "website",
            "adresse",
            "postnummer",
            "ydernummer",
            "førsteKons",
            "opfølgning",
            "første_kons_minutter",
            "opfølgning_minutter",
            "handicapadgang",
            "holdtræning",
            "om_os",
            "verified_klinik",
            "city_id",
            "lokation"
        ) VALUES (
            staging_record.klinik_navn,
            staging_record.email,
            staging_record.telefon,
            staging_record.website,
            staging_record.adresse,
            staging_record.postnummer,
            staging_record.ydernummer,
            staging_record.forste_konsultation_pris::text,
            staging_record.normal_konsultation_pris::text,
            COALESCE(staging_record.forste_konsultation_minutter, 60),
            COALESCE(staging_record.normal_konsultation_minutter, 30),
            staging_record.handicap_adgang,
            staging_record.holdtraening,
            staging_record.om_klinikken,
            TRUE,
            matching_city_id,
            matching_city_name
        )
        RETURNING "clinics_id" INTO current_clinic_id;
    END IF;

    -- Handle specialties - lookup IDs by name
    INSERT INTO clinic_specialties ("clinics_id", "specialty_id")
    SELECT 
        current_clinic_id,
        s.specialty_id
    FROM unnest(staging_record.specialties) AS submitted_specialty_name
    JOIN specialties s ON s.specialty_name = submitted_specialty_name;

    -- Handle services - lookup IDs by name
    INSERT INTO clinic_services ("clinic_id", "service_id")
    SELECT 
        current_clinic_id,
        es.service_id
    FROM unnest(staging_record.services) AS submitted_service_name
    JOIN extra_services es ON es.service_name = submitted_service_name;

    -- Handle insurances - lookup IDs by name
    INSERT INTO clinic_insurances ("clinic_id", "insurance_id")
    SELECT 
        current_clinic_id,
        ic.insurance_id
    FROM insurance_companies ic
    WHERE ic.insurance_name NOT IN (
        SELECT unnest(staging_record.excluded_insurances)
    );

    -- Update staging record as processed
    UPDATE clinic_submissions_staging
    SET processed_at = NOW()
    WHERE id = submission_id;
END;
$$ LANGUAGE plpgsql; 