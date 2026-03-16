-- Migration: Create city_clinic_counts view
-- Created: 2025-01-24
-- Purpose: Pre-compute clinic counts per city to avoid expensive nested aggregates in PostgREST queries
-- This fixes timeout issues when fetching all cities with clinic counts

-- Create view that aggregates clinic counts per city
CREATE OR REPLACE VIEW public.city_clinic_counts AS
SELECT
  c.id,
  c.bynavn,
  c.bynavn_slug,
  c.postal_codes,
  COALESCE(clinic_counts.clinic_count, 0)::integer AS clinic_count
FROM public.cities c
LEFT JOIN (
  SELECT 
    city_id, 
    COUNT(*)::integer AS clinic_count
  FROM public.clinics
  WHERE city_id IS NOT NULL
  GROUP BY city_id
) AS clinic_counts ON clinic_counts.city_id = c.id;

-- Grant SELECT permissions to anon and authenticated roles
GRANT SELECT ON public.city_clinic_counts TO anon;
GRANT SELECT ON public.city_clinic_counts TO authenticated;

-- Enable RLS on the view (inherits from cities table policies)
ALTER VIEW public.city_clinic_counts SET (security_invoker = true);

-- Add comment to document the view
COMMENT ON VIEW public.city_clinic_counts IS 'Pre-computed view of cities with their clinic counts. Used to avoid expensive nested aggregate queries.';

