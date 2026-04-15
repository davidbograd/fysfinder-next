import type Stripe from "stripe";
import { getInvoiceSubscriptionId } from "../invoice";

describe("getInvoiceSubscriptionId", () => {
  it("reads subscription id from parent.subscription_details (string)", () => {
    const invoice = {
      parent: {
        type: "subscription_details" as const,
        subscription_details: {
          subscription: "sub_123",
          metadata: null,
        },
        quote_details: null,
      },
    } as Stripe.Invoice;
    expect(getInvoiceSubscriptionId(invoice)).toBe("sub_123");
  });

  it("reads subscription id from parent.subscription_details (expanded object)", () => {
    const invoice = {
      parent: {
        type: "subscription_details" as const,
        subscription_details: {
          subscription: { id: "sub_abc", object: "subscription" } as Stripe.Subscription,
          metadata: null,
        },
        quote_details: null,
      },
    } as Stripe.Invoice;
    expect(getInvoiceSubscriptionId(invoice)).toBe("sub_abc");
  });

  it("falls back to legacy top-level subscription field", () => {
    const invoice = {
      parent: null,
      subscription: "sub_legacy",
    } as Stripe.Invoice;
    expect(getInvoiceSubscriptionId(invoice)).toBe("sub_legacy");
  });

  it("returns null when no subscription reference exists", () => {
    const invoice = {
      parent: null,
    } as Stripe.Invoice;
    expect(getInvoiceSubscriptionId(invoice)).toBeNull();
  });
});
