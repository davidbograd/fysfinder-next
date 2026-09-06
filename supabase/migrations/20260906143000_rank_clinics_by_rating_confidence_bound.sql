-- Migration: score get_clinic_city_rank on the lower bound of the rating confidence interval
-- Mirrors getWeightedRatingScore in src/lib/clinic-entitlements.ts.
--
-- Replaces the Bayesian average added in 20260906120000. Shrinking toward the corpus mean
-- worked in both directions, so among clinics rated below the mean the ones with fewest
-- reviews were lifted most: a 4.3 with 15 reviews outranked a 4.4 with 59. The Wilson lower
-- bound is monotonic in review count, so more reviews can only ever raise a clinic's score.
--
-- Keep the confidence constant below in sync with RATING_CONFIDENCE_Z (z = 1).

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
  proportions AS (
    SELECT
      d.clinics_id,
      d.premium_score,
      d.rating_count,
      -- Wilson works on a success rate, so map the star average onto 0-1. Clamped because
      -- a rating outside the star range would put a negative under the square root.
      CASE
        WHEN d.rating_count > 0 AND d.avg_rating > 0
          THEN LEAST(GREATEST((d.avg_rating - 1) / 4, 0), 1)
      END AS p
    FROM deduplicated d
  ),
  scored AS (
    SELECT
      pr.clinics_id,
      pr.premium_score,
      pr.rating_count,
      -- NULL for unrated clinics so they sort last rather than being scored as reviewed.
      CASE
        WHEN pr.p IS NOT NULL THEN
          (
            (pr.p + 1.0 / (2 * pr.rating_count))
            - sqrt(
                (pr.p * (1 - pr.p) + 1.0 / (4 * pr.rating_count))
                / pr.rating_count
              )
          ) / (1 + 1.0 / pr.rating_count)
      END AS rating_confidence
    FROM proportions pr
  ),
  ranked AS (
    SELECT
      s.clinics_id,
      ROW_NUMBER() OVER (
        ORDER BY
          s.premium_score DESC,
          s.rating_confidence DESC NULLS LAST,
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
