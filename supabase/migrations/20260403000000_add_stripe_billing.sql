-- Stripe billing schema support for premium subscriptions.
-- Added: subscription identifiers on premium listings and webhook idempotency table.

ALTER TABLE public.premium_listings
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

CREATE INDEX IF NOT EXISTS idx_premium_listings_stripe_subscription_id
ON public.premium_listings (stripe_subscription_id);

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
