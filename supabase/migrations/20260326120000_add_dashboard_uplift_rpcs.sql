-- Migration: add dashboard uplift RPCs for rank and neighboring opportunity
-- Provides per-clinic city ranking and nearby suburb lead-action aggregates.

CREATE OR REPLACE FUNCTION public.get_clinic_city_rank(
  p_clinic_id UUID,
  p_city_id UUID
)
RETURNS TABLE(
  clinic_id UUID,
  rank_position BIGINT,
  total_clinics BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH local_clinics AS (
    SELECT
      c.clinics_id,
      c."avgRating",
      c."ratingCount",
      FALSE AS is_premium
    FROM clinics c
    WHERE c.city_id = p_city_id
  ),
  premium_clinics AS (
    SELECT DISTINCT
      c.clinics_id,
      c."avgRating",
      c."ratingCount",
      TRUE AS is_premium
    FROM clinics c
    INNER JOIN premium_listings pl
      ON pl.clinic_id = c.clinics_id
    INNER JOIN premium_listing_locations pll
      ON pll.premium_listing_id = pl.id
    WHERE pll.city_id = p_city_id
      AND pl.start_date <= NOW()
      AND pl.end_date > NOW()
  ),
  combined_clinics AS (
    SELECT * FROM local_clinics
    UNION ALL
    SELECT * FROM premium_clinics
  ),
  deduplicated AS (
    SELECT
      cc.clinics_id,
      COALESCE(MAX(cc.is_premium::int), 0)::int AS premium_score,
      MAX(COALESCE(cc.avgRating, 0)) AS avg_rating,
      MAX(COALESCE(cc.ratingCount, 0)) AS rating_count
    FROM combined_clinics cc
    GROUP BY cc.clinics_id
  ),
  ranked AS (
    SELECT
      d.clinics_id,
      ROW_NUMBER() OVER (
        ORDER BY
          d.premium_score DESC,
          d.avg_rating DESC,
          d.rating_count DESC
      ) AS rank_position,
      COUNT(*) OVER () AS total_clinics
    FROM deduplicated d
  )
  SELECT
    r.clinics_id AS clinic_id,
    r.rank_position,
    r.total_clinics
  FROM ranked r
  WHERE r.clinics_id = p_clinic_id;
$$;

CREATE OR REPLACE FUNCTION public.get_clinic_neighbor_opportunity(
  p_clinic_id UUID,
  p_days INTEGER DEFAULT 30,
  p_max_distance_km NUMERIC DEFAULT 10
)
RETURNS TABLE(
  city_id UUID,
  city_name TEXT,
  city_slug TEXT,
  distance_km DOUBLE PRECISION,
  phone_clicks BIGINT,
  website_clicks BIGINT,
  total_lead_actions BIGINT,
  captured_by_clinic BIGINT,
  missed_actions BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH clinic_home AS (
    SELECT
      c.clinics_id,
      c.city_id,
      ci.latitude,
      ci.longitude
    FROM clinics c
    INNER JOIN cities ci
      ON ci.id = c.city_id
    WHERE c.clinics_id = p_clinic_id
  ),
  nearby_cities AS (
    SELECT
      nc.id AS city_id,
      nc.bynavn,
      nc.bynavn_slug,
      nc.distance
    FROM clinic_home ch
    CROSS JOIN LATERAL get_nearby_cities(
      ch.latitude,
      ch.longitude,
      p_max_distance_km,
      ch.city_id
    ) nc
  ),
  recent_events AS (
    SELECT
      ce.clinic_id,
      ce.event_type,
      ce.metadata,
      ce.created_at,
      c.city_id AS clinic_home_city_id
    FROM clinic_events ce
    INNER JOIN clinics c
      ON c.clinics_id = ce.clinic_id
    WHERE ce.created_at >= NOW() - make_interval(days => p_days)
      AND ce.created_at <= NOW()
      AND ce.event_type IN ('phone_click', 'website_click')
  ),
  neighborhood_totals AS (
    SELECT
      nc.city_id,
      COALESCE(SUM(CASE WHEN re.event_type = 'phone_click' THEN 1 ELSE 0 END), 0) AS phone_clicks,
      COALESCE(SUM(CASE WHEN re.event_type = 'website_click' THEN 1 ELSE 0 END), 0) AS website_clicks,
      COALESCE(SUM(CASE WHEN re.clinic_id = p_clinic_id THEN 1 ELSE 0 END), 0) AS captured_by_clinic
    FROM nearby_cities nc
    LEFT JOIN recent_events re
      ON (
        CASE
          WHEN re.metadata ? 'context_city_id'
            THEN re.metadata->>'context_city_id'
          ELSE re.clinic_home_city_id::text
        END
      ) = nc.city_id::text
    GROUP BY nc.city_id
  )
  SELECT
    nc.city_id,
    nc.bynavn AS city_name,
    nc.bynavn_slug AS city_slug,
    nc.distance AS distance_km,
    nt.phone_clicks,
    nt.website_clicks,
    (nt.phone_clicks + nt.website_clicks) AS total_lead_actions,
    nt.captured_by_clinic,
    GREATEST((nt.phone_clicks + nt.website_clicks) - nt.captured_by_clinic, 0) AS missed_actions
  FROM nearby_cities nc
  LEFT JOIN neighborhood_totals nt
    ON nt.city_id = nc.city_id
  ORDER BY total_lead_actions DESC, distance_km ASC;
$$;

CREATE OR REPLACE FUNCTION public.get_clinic_neighbor_city_activity(
  p_clinic_id UUID,
  p_days INTEGER DEFAULT 30,
  p_max_distance_km NUMERIC DEFAULT 10
)
RETURNS TABLE(
  city_id UUID,
  city_name TEXT,
  distance_km DOUBLE PRECISION,
  is_home BOOLEAN,
  lead_clicks BIGINT,
  views BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH clinic_home AS (
    SELECT
      c.clinics_id,
      c.city_id,
      ci.latitude,
      ci.longitude
    FROM clinics c
    INNER JOIN cities ci
      ON ci.id = c.city_id
    WHERE c.clinics_id = p_clinic_id
  ),
  nearby_cities AS (
    SELECT
      nc.id AS city_id,
      nc.bynavn,
      nc.distance
    FROM clinic_home ch
    CROSS JOIN LATERAL get_nearby_cities(
      ch.latitude,
      ch.longitude,
      p_max_distance_km,
      ch.city_id
    ) nc
  ),
  target_cities AS (
    SELECT
      ch.city_id,
      hc.bynavn,
      0::double precision AS distance,
      TRUE AS is_home
    FROM clinic_home ch
    INNER JOIN cities hc
      ON hc.id = ch.city_id
    UNION ALL
    SELECT
      nc.city_id,
      nc.bynavn,
      nc.distance,
      FALSE AS is_home
    FROM nearby_cities nc
  ),
  recent_events AS (
    SELECT
      ce.clinic_id,
      ce.event_type,
      ce.metadata,
      c.city_id AS clinic_home_city_id
    FROM clinic_events ce
    INNER JOIN clinics c
      ON c.clinics_id = ce.clinic_id
    WHERE ce.created_at >= NOW() - make_interval(days => p_days)
      AND ce.created_at <= NOW()
      AND ce.event_type IN (
        'phone_click',
        'website_click',
        'email_click',
        'list_impression',
        'profile_view'
      )
  ),
  event_city AS (
    SELECT
      re.event_type,
      CASE
        WHEN re.metadata ? 'context_city_id'
          THEN re.metadata->>'context_city_id'
        ELSE re.clinic_home_city_id::text
      END AS attributed_city_id
    FROM recent_events re
  )
  SELECT
    tc.city_id,
    tc.bynavn AS city_name,
    tc.distance AS distance_km,
    tc.is_home,
    COALESCE(
      SUM(
        CASE
          WHEN ec.event_type IN ('phone_click', 'website_click', 'email_click') THEN 1
          ELSE 0
        END
      ),
      0
    ) AS lead_clicks,
    COALESCE(
      SUM(
        CASE
          WHEN ec.event_type IN ('list_impression', 'profile_view') THEN 1
          ELSE 0
        END
      ),
      0
    ) AS views
  FROM target_cities tc
  LEFT JOIN event_city ec
    ON ec.attributed_city_id = tc.city_id::text
  GROUP BY tc.city_id, tc.bynavn, tc.distance, tc.is_home
  ORDER BY tc.is_home DESC, lead_clicks DESC, views DESC;
$$;
