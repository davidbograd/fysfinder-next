-- Migration: Change clinic_name to owns_clinic
-- Description: Updates user_profiles table to use a boolean field for clinic ownership tracking
-- instead of requiring a clinic name at signup

-- First, add the new owns_clinic column as nullable
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS owns_clinic BOOLEAN DEFAULT false;

-- Update existing records: set owns_clinic to true if clinic_name is not empty
UPDATE public.user_profiles
SET owns_clinic = (clinic_name IS NOT NULL AND clinic_name != '');

-- Now we can drop the clinic_name column
ALTER TABLE public.user_profiles
DROP COLUMN IF EXISTS clinic_name;

-- Make owns_clinic NOT NULL with default false
ALTER TABLE public.user_profiles
ALTER COLUMN owns_clinic SET NOT NULL;

ALTER TABLE public.user_profiles
ALTER COLUMN owns_clinic SET DEFAULT false;

