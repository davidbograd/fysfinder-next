-- Migration: pick nearby clinics by real address, spread across towns, widening when sparse
--
-- Three problems with the previous get_nearby_clinics:
--
-- 1. Distance was measured city-centroid to city-centroid even though 91% of clinics are
--    geocoded. The error averaged 3.12 km against a 10 km radius and was large enough to
--    invert the ordering: from Greve, Ishøj's centroid sits 5.84 km away but its clinics are
--    8.16 km out, while Karlslunde's centroid is 9.33 km but its clinics are 6.56 km out.
--    1,522 clinic/page pairs were inside 10 km by address yet excluded, and 728 were shown
--    as nearby while actually being further than 10 km.
--
-- 2. LIMIT applied to clinics, so the single nearest town took every slot. 117 of 242 city
--    pages showed clinics from only one other town; Greve showed five from Ishøj and one
--    from Solrød, hiding Karlslunde, Hvidovre, Vallensbæk Strand and Brøndby Strand.
--
-- 3. A hard 10 km cutoff left 132 of 374 city pages with no nearby section at all.
--
-- The function now measures to the clinic's own coordinates (falling back to the city
-- centroid for the 9% without any), lets each town put forward at most its best two
-- clinics, and widens the search only when the preferred radius cannot fill the list.
--
-- The per-town cap is soft: if honouring it would leave the list short, the remaining
-- slots are backfilled. Otherwise a page whose only neighbour is one clinic-rich town
-- would show two results where it used to show six.

-- Shared rating score, mirroring getWeightedRatingScore in src/lib/clinic-entitlements.ts:
-- the lower bound of the Wilson interval, so review volume can only ever help a clinic.
-- NULL for unrated clinics so they sort last. Keep in sync with RATING_CONFIDENCE_Z (z = 1).
CREATE OR REPLACE FUNCTION public.rating_confidence_score(
  avg_rating NUMERIC,
  rating_count NUMERIC
)
RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT CASE
    WHEN avg_rating IS NULL OR rating_count IS NULL THEN NULL
    WHEN rating_count <= 0 OR avg_rating <= 0 THEN NULL
    ELSE (
      (p + 1.0 / (2 * rating_count))
      - sqrt((p * (1 - p) + 1.0 / (4 * rating_count)) / rating_count)
    ) / (1 + 1.0 / rating_count)
  END
  -- Wilson works on a success rate, so map the star average onto 0-1. Clamped because a
  -- rating outside the star range would put a negative under the square root.
  FROM (SELECT LEAST(GREATEST((avg_rating - 1) / 4, 0), 1) AS p) AS mapped;
$$;

-- Signature gains two optional arguments, so the old one has to go rather than be
-- overloaded: PostgREST calls this with four named arguments and would find both ambiguous.
DROP FUNCTION IF EXISTS public.get_nearby_clinics(
  double precision, double precision, double precision, uuid
);

CREATE OR REPLACE FUNCTION public.get_nearby_clinics(
  origin_lat DOUBLE PRECISION,
  origin_lng DOUBLE PRECISION,
  -- Preferred radius. Kept under the original name so existing callers need no change.
  max_distance_km DOUBLE PRECISION,
  exclude_city_id UUID,
  -- Only reached when the preferred radius cannot fill result_limit.
  fallback_distance_km DOUBLE PRECISION DEFAULT 30,
  result_limit INTEGER DEFAULT 6,
  max_per_city INTEGER DEFAULT 2
)
RETURNS TABLE(
  clinics_id UUID,
  "klinikNavn" TEXT,
  ydernummer BOOLEAN,
  "avgRating" NUMERIC,
  "ratingCount" NUMERIC,
  adresse TEXT,
  postnummer NUMERIC,
  lokation TEXT,
  "klinikNavnSlug" TEXT,
  website TEXT,
  tlf TEXT,
  logo_url TEXT,
  handicapadgang BOOLEAN,
  verified_klinik BOOLEAN,
  city_name TEXT,
  distance DOUBLE PRECISION,
  clinic_specialties JSON,
  specialties JSON
)
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $$
DECLARE
  origin GEOGRAPHY := ST_SetSRID(ST_MakePoint(origin_lng, origin_lat), 4326)::GEOGRAPHY;
  outer_radius_km DOUBLE PRECISION := GREATEST(max_distance_km, fallback_distance_km);
BEGIN
  RETURN QUERY
  WITH located AS (
    SELECT
      c.clinics_id,
      c."klinikNavn",
      c.ydernummer,
      c."avgRating",
      c."ratingCount",
      c.adresse,
      c.postnummer,
      c.lokation,
      c."klinikNavnSlug",
      c.website,
      c.tlf,
      c.logo_url,
      c.handicapadgang,
      c.verified_klinik,
      c.city_id,
      ci.bynavn AS city_name,
      -- The clinic's own address, or the centre of its town when it has not been geocoded.
      COALESCE(
        ST_SetSRID(ST_MakePoint(c.longitude, c.latitude), 4326)::GEOGRAPHY,
        ci.location_point
      ) AS point
    FROM clinics c
    JOIN cities ci ON ci.id = c.city_id
    WHERE c.city_id != exclude_city_id
  ),
  candidates AS (
    SELECT
      l.*,
      ST_Distance(l.point, origin) / 1000 AS distance_km
    FROM located l
    WHERE ST_DWithin(l.point, origin, outer_radius_km * 1000)
  ),
  -- Stay inside the preferred radius whenever it holds enough clinics, and only reach
  -- further when it does not. Sparse areas get a list instead of an empty section.
  effective AS (
    SELECT CASE
      WHEN (
        SELECT count(*) FROM candidates WHERE distance_km <= max_distance_km
      ) >= result_limit THEN max_distance_km
      ELSE outer_radius_km
    END AS radius_km
  ),
  ranked AS (
    SELECT
      c.*,
      -- Each town's best clinic is rank 1, its second best rank 2, and so on. Ranked on
      -- quality rather than distance because clinics within one town are all roughly the
      -- same distance away, so distance would pick between them close to arbitrarily.
      ROW_NUMBER() OVER (
        PARTITION BY c.city_id
        ORDER BY
          public.rating_confidence_score(c."avgRating", c."ratingCount") DESC NULLS LAST,
          c.distance_km
      ) AS city_rank
    FROM candidates c
    CROSS JOIN effective e
    WHERE c.distance_km <= e.radius_km
  )
  SELECT
    r.clinics_id,
    r."klinikNavn",
    r.ydernummer,
    r."avgRating",
    r."ratingCount",
    r.adresse,
    r.postnummer,
    r.lokation,
    r."klinikNavnSlug",
    r.website,
    r.tlf,
    r.logo_url,
    r.handicapadgang,
    r.verified_klinik,
    r.city_name,
    r.distance_km AS distance,
    (
      SELECT json_agg(json_build_object(
        'specialty_id', s.specialty_id,
        'specialty_name', s.specialty_name
      ))
      FROM clinic_specialties cs
      JOIN specialties s ON cs.specialty_id = s.specialty_id
      WHERE cs.clinics_id = r.clinics_id
    ) AS clinic_specialties,
    (
      SELECT json_agg(json_build_object(
        'specialty_id', s.specialty_id,
        'specialty_name', s.specialty_name,
        'specialty_name_slug', s.specialty_name_slug
      ))
      FROM clinic_specialties cs
      JOIN specialties s ON cs.specialty_id = s.specialty_id
      WHERE cs.clinics_id = r.clinics_id
    ) AS specialties
  FROM ranked r
  -- Nearest first among each town's top few, then backfill if that left the list short.
  ORDER BY
    CASE WHEN r.city_rank <= max_per_city THEN 0 ELSE 1 END,
    r.distance_km,
    r.city_rank
  LIMIT result_limit;
END;
$$;
