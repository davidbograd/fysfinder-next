// Tests for Stripe-to-premium entitlement helper logic.
// Added: verifies subscription status gating and billing period extraction.

import {
  getSubscriptionPremiumPeriod,
  isSubscriptionEntitled,
} from "@/lib/stripe/premium-sync";

describe("premium-sync helpers", () => {
  it("marks active and trialing subscriptions as entitled", () => {
    expect(isSubscriptionEntitled("active")).toBe(true);
    expect(isSubscriptionEntitled("trialing")).toBe(true);
    expect(isSubscriptionEntitled("canceled")).toBe(false);
    expect(isSubscriptionEntitled("past_due")).toBe(false);
  });

  it("derives iso period boundaries from subscription timestamps", () => {
    const subscription = {
      current_period_start: 1_710_000_000,
      current_period_end: 1_712_592_000,
    } as any;

    const period = getSubscriptionPremiumPeriod(subscription);
    expect(period.startDateIso).toBe("2024-03-09T16:00:00.000Z");
    expect(period.endDateIso).toBe("2024-04-08T16:00:00.000Z");
  });
});
