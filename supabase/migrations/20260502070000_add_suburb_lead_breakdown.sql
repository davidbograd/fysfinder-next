-- Migration: Add lead-click breakdown to suburb analytics RPC
-- The raw clinic_events table already stores the breakdown via event_type.

DROP FUNCTION IF EXISTS get_suburb_event_counts(
  TIMESTAMPTZ,
  TIMESTAMPTZ,
  INTEGER,
  INTEGER,
  TEXT,
  TEXT
);

CREATE OR REPLACE FUNCTION get_suburb_event_counts(
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW(),
  p_limit INTEGER DEFAULT NULL,
  p_offset INTEGER DEFAULT 0,
  p_sort_by TEXT DEFAULT 'lead_clicks',
  p_sort_dir TEXT DEFAULT 'desc'
)
RETURNS TABLE(
  suburb TEXT,
  lead_clicks BIGINT,
  phone_clicks BIGINT,
  website_clicks BIGINT,
  email_clicks BIGINT,
  booking_clicks BIGINT,
  views BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH suburb_counts AS (
    SELECT
      c.lokation AS suburb,
      COUNT(*) FILTER (
        WHERE ce.event_type IN ('phone_click', 'website_click', 'email_click', 'booking_click')
      ) AS lead_clicks,
      COUNT(*) FILTER (WHERE ce.event_type = 'phone_click') AS phone_clicks,
      COUNT(*) FILTER (WHERE ce.event_type = 'website_click') AS website_clicks,
      COUNT(*) FILTER (WHERE ce.event_type = 'email_click') AS email_clicks,
      COUNT(*) FILTER (WHERE ce.event_type = 'booking_click') AS booking_clicks,
      COUNT(*) FILTER (
        WHERE ce.event_type IN ('profile_view', 'list_impression')
      ) AS views
    FROM clinic_events ce
    INNER JOIN clinics c ON c.clinics_id = ce.clinic_id
    WHERE (p_start_date IS NULL OR ce.created_at >= p_start_date)
      AND (p_end_date IS NULL OR ce.created_at <= p_end_date)
      AND c.lokation IS NOT NULL
      AND BTRIM(c.lokation) <> ''
    GROUP BY c.lokation
  )
  SELECT
    suburb_counts.suburb,
    suburb_counts.lead_clicks,
    suburb_counts.phone_clicks,
    suburb_counts.website_clicks,
    suburb_counts.email_clicks,
    suburb_counts.booking_clicks,
    suburb_counts.views
  FROM suburb_counts
  ORDER BY
    CASE
      WHEN p_sort_by = 'views' AND p_sort_dir = 'asc' THEN suburb_counts.views
      WHEN p_sort_by = 'lead_clicks' AND p_sort_dir = 'asc' THEN suburb_counts.lead_clicks
    END ASC,
    CASE
      WHEN p_sort_by = 'views' AND p_sort_dir <> 'asc' THEN suburb_counts.views
      WHEN p_sort_by = 'lead_clicks' AND p_sort_dir <> 'asc' THEN suburb_counts.lead_clicks
    END DESC,
    suburb_counts.suburb ASC
  LIMIT COALESCE(p_limit, 2147483647)
  OFFSET GREATEST(p_offset, 0);
$$;

REVOKE EXECUTE ON FUNCTION get_suburb_event_counts(
  TIMESTAMPTZ,
  TIMESTAMPTZ,
  INTEGER,
  INTEGER,
  TEXT,
  TEXT
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION get_suburb_event_counts(
  TIMESTAMPTZ,
  TIMESTAMPTZ,
  INTEGER,
  INTEGER,
  TEXT,
  TEXT
) TO service_role;
