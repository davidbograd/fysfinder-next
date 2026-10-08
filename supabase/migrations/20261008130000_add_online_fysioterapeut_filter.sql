-- Online fysioterapi filter: clinics with this flag are listed on /find/fysioterapeut/online.
-- The column already exists in production (added outside migrations); this records it.

ALTER TABLE public.clinics
  ADD COLUMN IF NOT EXISTS online_fysioterapeut BOOLEAN DEFAULT false;

-- Clinics that list the "Online fysioterapi" extra service should also appear in the filter.
UPDATE public.clinics c
SET online_fysioterapeut = true
WHERE COALESCE(c.online_fysioterapeut, false) = false
  AND EXISTS (
    SELECT 1
    FROM public.clinic_services cs
    JOIN public.extra_services s ON s.service_id = cs.service_id
    WHERE cs.clinic_id = c.clinics_id
      AND s.service_name = 'Online fysioterapi'
  );
