-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create premium_listings table
CREATE TABLE premium_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(clinics_id),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_dates CHECK (start_date < end_date)
);

-- Add indexes for performance
CREATE INDEX idx_premium_listings_clinic_id ON premium_listings(clinic_id);
CREATE INDEX idx_premium_listings_dates ON premium_listings(start_date, end_date);

-- Rollback
/** 
-- DROP INDEX IF EXISTS idx_premium_listings_dates;
-- DROP INDEX IF EXISTS idx_premium_listings_clinic_id;
-- DROP TABLE IF EXISTS premium_listings;
**/ 