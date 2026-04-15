// Stripe server utilities for checkout and webhook handling.
// Added: central Stripe client and required env guard helpers.

import Stripe from "stripe";

/** Pinned to match Stripe dashboard / webhook API version. */
const STRIPE_API_VERSION = "2026-01-28.clover";

let stripeClient: Stripe | null = null;

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(getRequiredEnv("STRIPE_SECRET_KEY"), {
      apiVersion: STRIPE_API_VERSION,
    });
  }
  return stripeClient;
}

export function getStripePriceId(): string {
  return getRequiredEnv("STRIPE_PREMIUM_PRICE_ID");
}

export function getStripeWebhookSecret(): string {
  return getRequiredEnv("STRIPE_WEBHOOK_SECRET");
}
