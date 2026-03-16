-- Migration: Remove owns_clinic column
-- Description: Removes the owns_clinic field from user_profiles as it's no longer collected at signup

ALTER TABLE public.user_profiles
DROP COLUMN IF EXISTS owns_clinic;

