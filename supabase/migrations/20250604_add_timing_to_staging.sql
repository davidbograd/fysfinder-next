-- Migration: Add timing columns to staging table
-- Date: 2024-12-19
-- Description: Adds timing fields to the clinic_submissions_staging table to support custom consultation durations

-- Add timing columns to the staging table
ALTER TABLE clinic_submissions_staging 
ADD COLUMN IF NOT EXISTS forste_konsultation_minutter INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS normal_konsultation_minutter INTEGER DEFAULT 30;

-- Add comments to explain the columns
COMMENT ON COLUMN clinic_submissions_staging.forste_konsultation_minutter IS 'Duration in minutes for the first consultation (default: 60 minutes)';
COMMENT ON COLUMN clinic_submissions_staging.normal_konsultation_minutter IS 'Duration in minutes for follow-up consultations (default: 30 minutes)'; 