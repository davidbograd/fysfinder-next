-- Nullable public URL for clinic-uploaded logo (takes priority over logo.dev on listings/profile)
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS logo_url TEXT;
