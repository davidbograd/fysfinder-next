-- Migration: Add tool_events for counting interactions on the værktøjer pages
-- tool_ratings keeps one row per visitor per tool, so repeated actions such as
-- downloading a result image get their own append-only table instead.

CREATE TABLE IF NOT EXISTS tool_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_slug TEXT NOT NULL,
  event_type TEXT NOT NULL,
  variant TEXT,
  client_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tool_events
  ADD CONSTRAINT tool_events_event_type_check
  CHECK (event_type IN ('result_download'));

ALTER TABLE tool_events
  ADD CONSTRAINT tool_events_slug_format_check
  CHECK (tool_slug ~ '^[a-z0-9-]{3,64}$');

-- Separates tools with more than one download, e.g. the pace-beregner's run and plan.
ALTER TABLE tool_events
  ADD CONSTRAINT tool_events_variant_format_check
  CHECK (variant IS NULL OR variant ~ '^[a-z0-9-]{1,32}$');

ALTER TABLE tool_events
  ADD CONSTRAINT tool_events_client_id_format_check
  CHECK (client_id ~ '^[a-zA-Z0-9_-]{8,64}$');

CREATE INDEX idx_tool_events_slug_type_created
  ON tool_events(tool_slug, event_type, created_at);

ALTER TABLE tool_events ENABLE ROW LEVEL SECURITY;

-- Writes only ever happen through /api/tool-event, which uses the service role.
CREATE POLICY "Service role can insert tool events"
  ON tool_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can read tool events"
  ON tool_events
  FOR SELECT
  TO service_role
  USING (true);
