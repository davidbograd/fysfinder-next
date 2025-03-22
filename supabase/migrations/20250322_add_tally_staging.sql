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
    all_insurance_companies TEXT[] := ARRAY[
        'PFA', 'Skandia', 'Mølholm', 'Dansk Sundhedssikring', 'TopDanmark', 
        'PrivatSikring', 'Gjensidig', 'Tryg', 'PensionDanmark', 'Falck Healthcare',
        'Danica', 'Nordic Healthcare', 'Codan', 'AP Pension', 'Alm. Brand',
        'GF Forsikring', 'Købstædernes Forsikring', 'Lærestandends Brandforsikring LB',
        'TJM Forsikring'
    ];
    included_insurances TEXT[];
BEGIN
    -- Get the staging record
    SELECT * INTO staging_record 
    FROM clinic_submissions_staging 
    WHERE id = submission_id;

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
        "om_os"
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
        staging_record.om_klinikken
    )
    RETURNING "clinics_id" INTO clinic_id;

    -- Handle specialties - using the IDs directly from Tally
    INSERT INTO clinic_specialties ("clinics_id", "specialty_id", "clinic_name")
    SELECT 
        clinic_id,
        specialty::uuid,  -- Convert the specialty ID to UUID
        staging_record.klinik_navn
    FROM unnest(staging_record.specialties) AS specialty;

    -- Handle services
    INSERT INTO clinic_services ("clinic_id", "service_name", "clinic_name")
    SELECT 
        clinic_id,
        unnest(staging_record.services),
        staging_record.klinik_navn;

    -- Calculate included insurances (all minus excluded)
    included_insurances := (
        SELECT ARRAY(
            SELECT unnest(all_insurance_companies)
            EXCEPT
            SELECT unnest(staging_record.excluded_insurances)
        )
    );

    -- Insert included insurances
    INSERT INTO clinic_insurances ("clinic_id", "insurance_name", "clinic_name")
    SELECT 
        clinic_id,
        unnest(included_insurances),
        staging_record.klinik_navn;

    -- Update staging record as processed
    UPDATE clinic_submissions_staging
    SET processed_at = NOW()
    WHERE id = submission_id;
END;
$$ LANGUAGE plpgsql; 