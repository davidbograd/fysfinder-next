-- Idempotency: set when Resend onboarding automation event was sent successfully
ALTER TABLE public.clinic_owners
ADD COLUMN IF NOT EXISTS onboarding_drip_started_at timestamptz;

COMMENT ON COLUMN public.clinic_owners.onboarding_drip_started_at IS
  'Timestamp when fysfinder.clinic.onboarding_drip_started was sent to Resend for this owner–clinic row.';
