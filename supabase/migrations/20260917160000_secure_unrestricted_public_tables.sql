-- Lock down the two public tables the dashboard flagged as unrestricted.
-- stripe_webhook_events is internal-only; the Stripe webhook uses service_role, which bypasses RLS.
-- spatial_ref_sys is a PostGIS catalog owned by supabase_admin, so ENABLE RLS may be rejected.

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.stripe_webhook_events FROM anon, authenticated;

COMMENT ON TABLE public.stripe_webhook_events IS
  'Processed Stripe webhook event IDs for idempotency. Internal-only; service_role bypasses RLS.';

DO $$
BEGIN
  ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Could not enable RLS on spatial_ref_sys (owned by supabase_admin)';
END
$$;

DO $$
BEGIN
  REVOKE ALL ON TABLE public.spatial_ref_sys FROM anon, authenticated;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Could not revoke API grants on spatial_ref_sys (owned by supabase_admin)';
END
$$;
