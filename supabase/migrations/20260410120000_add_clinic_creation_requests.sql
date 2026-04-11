-- Add pending admin-review queue for user-submitted new clinics.

CREATE TABLE IF NOT EXISTS public.clinic_creation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    requester_name TEXT NOT NULL,
    requester_email TEXT NOT NULL,
    requester_phone TEXT,
    requester_role TEXT NOT NULL,
    clinic_name TEXT NOT NULL,
    address TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    city_id UUID NOT NULL REFERENCES public.cities(id),
    city_name TEXT NOT NULL,
    website TEXT,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    created_clinic_id UUID REFERENCES public.clinics(clinics_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clinic_creation_requests_status
    ON public.clinic_creation_requests(status);

CREATE INDEX IF NOT EXISTS idx_clinic_creation_requests_user_id
    ON public.clinic_creation_requests(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_pending_creation_request_by_user_and_clinic
    ON public.clinic_creation_requests(user_id, city_id, lower(clinic_name))
    WHERE status = 'pending';

ALTER TABLE public.clinic_creation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own clinic creation requests"
    ON public.clinic_creation_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own clinic creation requests"
    ON public.clinic_creation_requests
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
