-- Migration: attempt to enable RLS on PostGIS metadata table flagged by Security Advisor
-- Date: 2026-03-25
-- Note: In hosted Supabase, this table is typically owned by supabase_admin.
-- If the executing role lacks ownership, skip gracefully to avoid migration failure.

DO $$
BEGIN
  ALTER TABLE IF EXISTS public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Skipped enabling RLS on public.spatial_ref_sys due to insufficient privilege.';
END;
$$;
