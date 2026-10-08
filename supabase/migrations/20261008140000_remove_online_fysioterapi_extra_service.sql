-- clinics.online_fysioterapeut is the single source of truth for online physiotherapy.
-- Every clinic with the old "Online fysioterapi" extra service was flagged in
-- 20261008130000_add_online_fysioterapeut_filter.sql; clinic_services rows cascade.

UPDATE public.clinics c
SET online_fysioterapeut = true
WHERE COALESCE(c.online_fysioterapeut, false) = false
  AND EXISTS (
    SELECT 1
    FROM public.clinic_services cs
    JOIN public.extra_services s ON s.service_id = cs.service_id
    WHERE cs.clinic_id = c.clinics_id
      AND s.service_name_slug = 'online-fysioterapi'
  );

DELETE FROM public.extra_services
WHERE service_name_slug = 'online-fysioterapi';
