// Helpers for Stripe Invoice objects (API shape differs by version; webhooks may include legacy fields).

import type Stripe from "stripe";

/**
 * Subscription id for subscription invoices. Stripe v22+ exposes this under
 * `parent.subscription_details.subscription`; older payloads may use top-level `subscription`.
 */
export function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const details = invoice.parent?.subscription_details;
  if (details?.subscription) {
    const sub = details.subscription;
    return typeof sub === "string" ? sub : sub.id;
  }
  const legacy = (invoice as Stripe.Invoice & {
    subscription?: string | Stripe.Subscription;
  }).subscription;
  if (legacy) {
    return typeof legacy === "string" ? legacy : legacy.id;
  }
  return null;
}
