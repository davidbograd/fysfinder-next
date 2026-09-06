-- Migration: add get_nearby_cities_with_clinics for the location-page town link cluster
--
-- Feeds the "Udforsk fysioterapeuter i andre byer" links beside the nearby-clinics list.
-- The existing get_nearby_cities is not usable here: it caps at five towns and includes
-- towns with no clinics, which would point internal links at empty listing pages.
--
-- Uses a wider default radius than the clinic list because the cluster exists for internal
-- linking, where reaching one town further is useful rather than misleading.

CREATE OR REPLACE FUNCTION public.get_nearby_cities_with_clinics(
  origin_lat DOUBLE PRECISION,
  origin_lng DOUBLE PRECISION,
  max_distance_km DOUBLE PRECISION DEFAULT 20,
  exclude_city_id UUID DEFAULT NULL,
  result_limit INTEGER DEFAULT 12
)
RETURNS TABLE(
  id UUID,
  bynavn TEXT,
  bynavn_slug TEXT,
  clinic_count BIGINT,
  distance DOUBLE PRECISION
)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT
    c.id,
    c.bynavn,
    c.bynavn_slug,
    count(cl.clinics_id) AS clinic_count,
    ST_Distance(
      c.location_point,
      ST_SetSRID(ST_MakePoint(origin_lng, origin_lat), 4326)::GEOGRAPHY
    ) / 1000 AS distance
  FROM cities c
  JOIN clinics cl ON cl.city_id = c.id
  WHERE
    (exclude_city_id IS NULL OR c.id != exclude_city_id)
    AND c.bynavn_slug NOT IN ('danmark', 'online')
    AND ST_DWithin(
      c.location_point,
      ST_SetSRID(ST_MakePoint(origin_lng, origin_lat), 4326)::GEOGRAPHY,
      max_distance_km * 1000
    )
  GROUP BY c.id, c.bynavn, c.bynavn_slug, c.location_point
  HAVING count(cl.clinics_id) > 0
  ORDER BY distance
  LIMIT result_limit;
$$;
