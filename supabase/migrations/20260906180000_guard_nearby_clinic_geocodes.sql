-- Migration: ignore clinic coordinates that disagree with the clinic's own town
--
-- Measuring to the clinic address (20260906160000) exposed bad geocodes that the city
-- centroid used to hide. SOLHEIM is registered at Vedbæk Stationsvej 21B, 2950 Vedbæk and
-- assigned to Vedbæk, but its stored point sits 18 km away — 0.89 km from Østerbro — so it
-- surfaced as Østerbro's nearest clinic, labelled Vedbæk.
--
-- Clinics sit a median 2.7 km from their town centre and 90% are within 9 km, which is
-- ordinary spread. Past roughly 12 km the sample is entirely broken geocoding: "Klinik For
-- Fysioterapi Nakskov" on Bredgade in Nakskov is stored 12.6 km from Nakskov, and
-- "Kerteminde Fysioterapi" on Skolegade in Kerteminde 13.2 km from Kerteminde. That covers
-- 93 of 1,610 geocoded clinics.
--
-- So the address is trusted only when it agrees with the town the clinic is filed under;
-- otherwise the town centre is used, which is what the whole listing did before.

CREATE OR REPLACE FUNCTION public.get_nearby_clinics(
  origin_lat DOUBLE PRECISION,
  origin_lng DOUBLE PRECISION,
  max_distance_km DOUBLE PRECISION,
  exclude_city_id UUID,
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
  -- How far a clinic may sit from its own town before its coordinates are treated as bad
  -- data. Not a parameter: this is a correctness guard, not something callers should tune.
  max_geocode_drift_km CONSTANT DOUBLE PRECISION := 12;
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
      -- The clinic's own address when it is plausible, otherwise the centre of its town.
      CASE
        WHEN c.latitude IS NOT NULL
         AND c.longitude IS NOT NULL
         AND ST_DWithin(
               ST_SetSRID(ST_MakePoint(c.longitude, c.latitude), 4326)::GEOGRAPHY,
               ci.location_point,
               max_geocode_drift_km * 1000
             )
        THEN ST_SetSRID(ST_MakePoint(c.longitude, c.latitude), 4326)::GEOGRAPHY
        ELSE ci.location_point
      END AS point
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
