-- Migration: Add clinic-level aggregate event counts for admin analytics

CREATE OR REPLACE FUNCTION get_clinic_admin_event_counts(
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW(),
  p_limit INTEGER DEFAULT NULL,
  p_offset INTEGER DEFAULT 0,
  p_sort_by TEXT DEFAULT 'lead_clicks',
  p_sort_dir TEXT DEFAULT 'desc'
)
RETURNS TABLE(
  clinic_id UUID,
  clinic_name TEXT,
  suburb TEXT,
  lead_clicks BIGINT,
  phone_clicks BIGINT,
  website_clicks BIGINT,
  email_clicks BIGINT,
  booking_clicks BIGINT,
  views BIGINT,
  list_impressions BIGINT,
  profile_views BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH clinic_counts AS (
    SELECT
      c.clinics_id AS clinic_id,
      c."klinikNavn" AS clinic_name,
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
      ) AS views,
      COUNT(*) FILTER (WHERE ce.event_type = 'list_impression') AS list_impressions,
      COUNT(*) FILTER (WHERE ce.event_type = 'profile_view') AS profile_views
    FROM clinic_events ce
    INNER JOIN clinics c ON c.clinics_id = ce.clinic_id
    WHERE (p_start_date IS NULL OR ce.created_at >= p_start_date)
      AND (p_end_date IS NULL OR ce.created_at <= p_end_date)
    GROUP BY c.clinics_id, c."klinikNavn", c.lokation
  )
  SELECT
    clinic_counts.clinic_id,
    clinic_counts.clinic_name,
    clinic_counts.suburb,
    clinic_counts.lead_clicks,
    clinic_counts.phone_clicks,
    clinic_counts.website_clicks,
    clinic_counts.email_clicks,
    clinic_counts.booking_clicks,
    clinic_counts.views,
    clinic_counts.list_impressions,
    clinic_counts.profile_views
  FROM clinic_counts
  ORDER BY
    CASE
      WHEN p_sort_by = 'views' AND p_sort_dir = 'asc' THEN clinic_counts.views
      WHEN p_sort_by = 'lead_clicks' AND p_sort_dir = 'asc' THEN clinic_counts.lead_clicks
    END ASC,
    CASE
      WHEN p_sort_by = 'views' AND p_sort_dir <> 'asc' THEN clinic_counts.views
      WHEN p_sort_by = 'lead_clicks' AND p_sort_dir <> 'asc' THEN clinic_counts.lead_clicks
    END DESC,
    clinic_counts.clinic_name ASC,
    clinic_counts.clinic_id ASC
  LIMIT COALESCE(p_limit, 2147483647)
  OFFSET GREATEST(p_offset, 0);
$$;

REVOKE EXECUTE ON FUNCTION get_clinic_admin_event_counts(
  TIMESTAMPTZ,
  TIMESTAMPTZ,
  INTEGER,
  INTEGER,
  TEXT,
  TEXT
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION get_clinic_admin_event_counts(
  TIMESTAMPTZ,
  TIMESTAMPTZ,
  INTEGER,
  INTEGER,
  TEXT,
  TEXT
) TO service_role;
