-- Migration: rank clinics by review-weighted rating in get_clinic_city_rank
-- Mirrors sortClinicsByPolicy in src/lib/clinic-entitlements.ts, which now shrinks each
-- clinic's rating toward the corpus average by review count. Without this the rank shown
-- to a clinic owner in the dashboard would disagree with its position on the city page.
--
-- Keep the prior constants below in sync with RATING_PRIOR_MEAN and RATING_PRIOR_WEIGHT.

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
      MAX(COALESCE(cc."avgRating", 0)) AS avg_rating,
      MAX(COALESCE(cc."ratingCount", 0)) AS rating_count
    FROM combined_clinics cc
    GROUP BY cc.clinics_id
  ),
  scored AS (
    SELECT
      d.clinics_id,
      d.premium_score,
      d.rating_count,
      -- Bayesian average against the corpus prior. NULL for unrated clinics so they sort
      -- last rather than inheriting the prior mean and landing mid-table.
      CASE
        WHEN d.rating_count > 0 AND d.avg_rating > 0
          THEN (d.rating_count * d.avg_rating + 10 * 4.7) / (d.rating_count + 10)
      END AS weighted_rating
    FROM deduplicated d
  ),
  ranked AS (
    SELECT
      s.clinics_id,
      ROW_NUMBER() OVER (
        ORDER BY
          s.premium_score DESC,
          s.weighted_rating DESC NULLS LAST,
          s.rating_count DESC
      ) AS rank_position,
      COUNT(*) OVER () AS total_clinics
    FROM scored s
  )
  SELECT
    r.clinics_id AS clinic_id,
    r.rank_position,
    r.total_clinics
  FROM ranked r
  WHERE r.clinics_id = p_clinic_id;
$$;
