-- Fix nearby-city lookup after cities schema changed from "betegnelser" to "betegnelse".
-- Keeps return shape stable for callers expecting a text[] column.

CREATE OR REPLACE FUNCTION public.get_nearby_cities(
  origin_lat double precision,
  origin_lng double precision,
  max_distance_km double precision,
  exclude_city_id uuid
)
RETURNS TABLE(
  id uuid,
  bynavn text,
  bynavn_slug text,
  postal_codes text[],
  latitude double precision,
  longitude double precision,
  betegnelser text[],
  distance double precision
)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.bynavn,
    c.bynavn_slug,
    c.postal_codes,
    c.latitude,
    c.longitude,
    CASE
      WHEN c.betegnelse IS NULL THEN ARRAY[]::text[]
      ELSE ARRAY[c.betegnelse]
    END AS betegnelser,
    ST_Distance(
      c.location_point,
      ST_SetSRID(ST_MakePoint(origin_lng, origin_lat), 4326)::geography
    ) / 1000 AS distance
  FROM cities c
  WHERE
    c.id != exclude_city_id
    AND ST_DWithin(
      c.location_point,
      ST_SetSRID(ST_MakePoint(origin_lng, origin_lat), 4326)::geography,
      max_distance_km * 1000
    )
  ORDER BY distance
  LIMIT 5;
END;
$function$;
