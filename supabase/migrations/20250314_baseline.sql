-- Baseline migration file representing the current database structure
-- Created: March 14, 2025

-- Cities table
CREATE TABLE IF NOT EXISTS public.cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bynavn TEXT NOT NULL,
    postal_codes TEXT[] NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    betegnelse TEXT,
    bynavn_slug TEXT,
    location_point GEOMETRY(Point, 4326),
    seo_tekst TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Specialties table
CREATE TABLE IF NOT EXISTS public.specialties (
    specialty_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialty_name TEXT NOT NULL,
    specialty_name_slug TEXT NOT NULL,
    seo_tekst TEXT,
    UNIQUE(specialty_name_slug)
);

-- Insurance companies table
CREATE TABLE IF NOT EXISTS public.insurance_companies (
    insurance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    insurance_name TEXT NOT NULL,
    insurance_name_slug TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(insurance_name_slug)
);

-- Clinics table
CREATE TABLE IF NOT EXISTS public.clinics (
    clinics_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    klinikNavn TEXT NOT NULL,
    lokation TEXT,
    tlf TEXT,
    email TEXT,
    website TEXT,
    adresse TEXT,
    ydernummer BOOLEAN,
    mandag TEXT,
    tirsdag TEXT,
    onsdag TEXT,
    torsdag TEXT,
    fredag TEXT,
    lørdag TEXT,
    søndag TEXT,
    antalBehandlere NUMERIC,
    handicapadgang TEXT,
    hjemmetræning TEXT,
    holdtræning TEXT,
    parkering TEXT,
    førsteKons TEXT,
    opfølgning TEXT,
    avgRating NUMERIC,
    ratingCount NUMERIC,
    postnummer NUMERIC,
    ikkeAkutVentetidUger NUMERIC,
    vederlagsfriVentetidUger NUMERIC,
    klinikNavnSlug TEXT,
    lokationSlug TEXT,
    om_os TEXT,
    city_id UUID REFERENCES cities(id),
    google_maps_url_cid TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    verified_klinik BOOLEAN DEFAULT FALSE,
    verified_email TEXT
);

-- Clinic specialties junction table
CREATE TABLE IF NOT EXISTS public.clinic_specialties (
    clinics_id UUID REFERENCES clinics(clinics_id) ON DELETE CASCADE,
    specialty_id UUID REFERENCES specialties(specialty_id) ON DELETE CASCADE,
    PRIMARY KEY (clinics_id, specialty_id)
);

-- Clinic services table
CREATE TABLE IF NOT EXISTS public.clinic_services (
    clinic_id UUID REFERENCES clinics(clinics_id) ON DELETE CASCADE,
    service_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (clinic_id, service_id)
);

-- Clinic insurances junction table
CREATE TABLE IF NOT EXISTS public.clinic_insurances (
    clinic_id UUID REFERENCES clinics(clinics_id) ON DELETE CASCADE,
    insurance_id UUID REFERENCES insurance_companies(insurance_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (clinic_id, insurance_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clinics_kliniknavnslug ON clinics(klinikNavnSlug);
CREATE INDEX IF NOT EXISTS idx_clinics_lokationslug ON clinics(lokationSlug);
CREATE INDEX IF NOT EXISTS idx_cities_bynavn_slug ON cities(bynavn_slug);
CREATE INDEX IF NOT EXISTS idx_specialties_name_slug ON specialties(specialty_name_slug);
CREATE INDEX IF NOT EXISTS idx_insurance_name_slug ON insurance_companies(insurance_name_slug);

-- Enable Row Level Security (RLS)
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_insurances ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for public read access
CREATE POLICY "Allow public read access on cities" ON cities FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on specialties" ON specialties FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on insurance_companies" ON insurance_companies FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on clinics" ON clinics FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on clinic_specialties" ON clinic_specialties FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on clinic_services" ON clinic_services FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on clinic_insurances" ON clinic_insurances FOR SELECT TO public USING (true); 