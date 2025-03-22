-- Create the staging table for Tally form submissions
CREATE TABLE clinic_submissions_staging (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tally_submission_id TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    raw_data JSONB,  -- Keep the raw data for reference
    -- Structured data
    klinik_navn TEXT,
    email TEXT,
    telefon TEXT,
    website TEXT,
    adresse TEXT,
    postnummer INTEGER,
    ydernummer BOOLEAN,
    forste_konsultation_pris INTEGER,
    normal_konsultation_pris INTEGER,
    handicap_adgang BOOLEAN,
    holdtraening BOOLEAN,
    om_klinikken TEXT,
    services TEXT[],
    specialties TEXT[],
    excluded_insurances TEXT[],
    verified BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the function to process verified submissions
CREATE OR REPLACE FUNCTION process_verified_submission(submission_id UUID)
RETURNS void AS $$
DECLARE
    staging_record RECORD;
    clinic_id UUID;
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

    -- Insert into clinics table
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
        staging_record.handicap_adgang,
        staging_record.holdtraening,
        staging_record.om_klinikken,
        TRUE,
        matching_city_id,
        matching_city_name
    )
    RETURNING "clinics_id" INTO clinic_id;

    -- Handle specialties - lookup IDs by name
    INSERT INTO clinic_specialties ("clinics_id", "specialty_id")
    SELECT 
        clinic_id,
        s.specialty_id
    FROM unnest(staging_record.specialties) AS submitted_specialty_name
    JOIN specialties s ON s.specialty_name = submitted_specialty_name;

    -- Handle services - lookup IDs by name
    INSERT INTO clinic_services ("clinic_id", "service_id")
    SELECT 
        clinic_id,
        es.service_id
    FROM unnest(staging_record.services) AS submitted_service_name
    JOIN extra_services es ON es.service_name = submitted_service_name;

    -- Handle insurances - lookup IDs by name
    INSERT INTO clinic_insurances ("clinic_id", "insurance_id")
    SELECT 
        clinic_id,
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