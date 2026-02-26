-- Migration: Add aggregate event counts function for admin analytics
-- Returns per-event-type counts with unique clinic counts, all in Postgres (no row limit)

CREATE OR REPLACE FUNCTION get_aggregate_event_counts(
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE(
  event_type TEXT,
  count BIGINT,
  unique_clinics BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    ce.event_type,
    COUNT(*) as count,
    COUNT(DISTINCT ce.clinic_id) as unique_clinics
  FROM clinic_events ce
  WHERE ce.created_at >= p_start_date
    AND ce.created_at <= p_end_date
  GROUP BY ce.event_type;
$$;
