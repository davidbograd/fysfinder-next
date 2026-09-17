-- Migration: Add tool_ratings for per-tool user feedback on the værktøjer pages
-- Replaces the single hard-coded aggregateRating with real per-tool ratings.
-- Thumbs-up responses carry a star rating; thumbs-down responses carry free-text
-- feedback and are never counted toward the published average.

CREATE TABLE IF NOT EXISTS tool_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_slug TEXT NOT NULL,
  sentiment TEXT NOT NULL,
  rating SMALLINT,
  feedback_text TEXT,
  client_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tool_ratings
  ADD CONSTRAINT tool_ratings_sentiment_check
  CHECK (sentiment IN ('up', 'down'));

ALTER TABLE tool_ratings
  ADD CONSTRAINT tool_ratings_rating_range_check
  CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5));

-- A thumbs up is only meaningful once the visitor picked a star count.
ALTER TABLE tool_ratings
  ADD CONSTRAINT tool_ratings_up_requires_rating_check
  CHECK (sentiment <> 'up' OR rating IS NOT NULL);

ALTER TABLE tool_ratings
  ADD CONSTRAINT tool_ratings_slug_format_check
  CHECK (tool_slug ~ '^[a-z0-9-]{3,64}$');

ALTER TABLE tool_ratings
  ADD CONSTRAINT tool_ratings_feedback_length_check
  CHECK (feedback_text IS NULL OR char_length(feedback_text) <= 2000);

ALTER TABLE tool_ratings
  ADD CONSTRAINT tool_ratings_client_id_format_check
  CHECK (client_id ~ '^[a-zA-Z0-9_-]{8,64}$');

-- One response per visitor per tool.
CREATE UNIQUE INDEX idx_tool_ratings_tool_client
  ON tool_ratings(tool_slug, client_id);

CREATE INDEX idx_tool_ratings_created_at ON tool_ratings(created_at);

-- Supports the published-average aggregation, which only reads scored rows.
CREATE INDEX idx_tool_ratings_slug_rating
  ON tool_ratings(tool_slug)
  WHERE rating IS NOT NULL;

ALTER TABLE tool_ratings ENABLE ROW LEVEL SECURITY;

-- Writes only ever happen through /api/tool-rating, which uses the service role.
CREATE POLICY "Service role can insert tool ratings"
  ON tool_ratings
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can read tool ratings"
  ON tool_ratings
  FOR SELECT
  TO service_role
  USING (true);

-- Aggregate helper for the statically rendered tool pages.
-- Exposes only counts and sums, never free-text feedback or client ids, so it is
-- safe to call with the anon key from ISR rendering.
CREATE OR REPLACE FUNCTION get_tool_rating_stats()
RETURNS TABLE(tool_slug TEXT, rating_count BIGINT, rating_sum BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    tr.tool_slug,
    COUNT(*) AS rating_count,
    SUM(tr.rating)::BIGINT AS rating_sum
  FROM tool_ratings tr
  WHERE tr.rating IS NOT NULL
  GROUP BY tr.tool_slug;
$$;

REVOKE ALL ON FUNCTION get_tool_rating_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_tool_rating_stats() TO anon, authenticated, service_role;
