// Stripe premium entitlement helpers.
// Added: subscription status gating and period extraction utilities.

import Stripe from "stripe";

const ENTITLED_SUBSCRIPTION_STATUSES = new Set<Stripe.Subscription.Status>([
  "active",
  "trialing",
]);

export function isSubscriptionEntitled(status: Stripe.Subscription.Status): boolean {
  return ENTITLED_SUBSCRIPTION_STATUSES.has(status);
}

export function getSubscriptionPremiumPeriod(subscription: Stripe.Subscription): {
  startDateIso: string;
  endDateIso: string;
} {
  const rawStart =
    Number((subscription as any).current_period_start) ||
    Number((subscription.items?.data?.[0] as any)?.current_period_start) ||
    Number((subscription as any).start_date);
  const rawEnd =
    Number((subscription as any).current_period_end) ||
    Number((subscription.items?.data?.[0] as any)?.current_period_end) ||
    Number((subscription as any).ended_at);

  if (!rawStart || !rawEnd) {
    throw new Error("Missing subscription billing period");
  }

  return {
    startDateIso: new Date(rawStart * 1000).toISOString(),
    endDateIso: new Date(rawEnd * 1000).toISOString(),
  };
}
