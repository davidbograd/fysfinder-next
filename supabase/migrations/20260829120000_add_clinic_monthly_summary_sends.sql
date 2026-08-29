-- Idempotency log for monthly clinic summary emails (one send per owner per calendar month).

CREATE TABLE IF NOT EXISTS clinic_monthly_summary_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_ym TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  resend_id TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT clinic_monthly_summary_sends_period_ym_check
    CHECK (period_ym ~ '^[0-9]{4}-[0-9]{2}$'),
  CONSTRAINT clinic_monthly_summary_sends_user_period_unique
    UNIQUE (user_id, period_ym)
);

CREATE INDEX idx_clinic_monthly_summary_sends_period_ym
  ON clinic_monthly_summary_sends(period_ym);

ALTER TABLE clinic_monthly_summary_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert monthly summary sends"
  ON clinic_monthly_summary_sends
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can read monthly summary sends"
  ON clinic_monthly_summary_sends
  FOR SELECT
  TO service_role
  USING (true);

COMMENT ON TABLE clinic_monthly_summary_sends IS
  'Records monthly clinic value emails so retries do not mail the same owner twice for a period.';
