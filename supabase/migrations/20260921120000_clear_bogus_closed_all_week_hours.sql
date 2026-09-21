-- One-off repair of the damage done by the broken Google opening-hours import.
--
-- The old sync requested Place Details without `languageCode`, got English weekday
-- labels back, matched none of them against its Danish-only lookup, and fell through to
-- writing "Lukket" into all seven day columns. For clinics where Google genuinely has no
-- opening hours, that produced a confident "closed all week" out of nothing.
--
-- The rewritten sync now refuses to write hours when Google has none, but it cannot tell
-- that an existing "Lukket" was fabricated. This clears the ones we can prove are wrong.
--
-- Scope is deliberately narrow — every row matched here has just been re-checked against
-- Google (google_synced_at is set), Google returned no hours at all (opening_hours is
-- still null), and no owner has claimed the clinic. NULL means "unknown", which is what
-- the clinic page renders as "Ingen åbningstider tilføjet."
--
-- Not touched:
--   - owner-verified clinics, in case the owner set those values deliberately
--   - clinics whose Place ID returned 404, since we could not verify them

UPDATE public.clinics
SET
  mandag = NULL,
  tirsdag = NULL,
  onsdag = NULL,
  torsdag = NULL,
  fredag = NULL,
  lørdag = NULL,
  søndag = NULL
WHERE google_synced_at IS NOT NULL
  AND opening_hours IS NULL
  AND verified_klinik IS NOT TRUE
  AND mandag = 'Lukket'
  AND tirsdag = 'Lukket'
  AND onsdag = 'Lukket'
  AND torsdag = 'Lukket'
  AND fredag = 'Lukket'
  AND lørdag = 'Lukket'
  AND søndag = 'Lukket';
