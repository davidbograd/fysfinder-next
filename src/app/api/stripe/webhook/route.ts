// Stripe webhook endpoint for premium entitlement synchronization.
// Added: verified event handling that updates premium listing access from subscription state.

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import {
  getStripeClient,
  getStripeWebhookSecret,
} from "@/lib/stripe/server";
import {
  getSubscriptionPremiumPeriod,
  isSubscriptionEntitled,
} from "@/lib/stripe/premium-sync";
import { getInvoiceSubscriptionId } from "@/lib/stripe/invoice";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getServiceSupabase() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function hasProcessedEvent(event: Stripe.Event): Promise<boolean> {
  const serviceSupabase = getServiceSupabase();
  const { data, error } = await serviceSupabase
    .from("stripe_webhook_events")
    .select("event_id")
    .eq("event_id", event.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Webhook idempotency lookup failed: ${error.message}`);
  }

  return Boolean(data?.event_id);
}

async function markEventProcessed(event: Stripe.Event) {
  const serviceSupabase = getServiceSupabase();
  const { error } = await serviceSupabase.from("stripe_webhook_events").insert({
    event_id: event.id,
    event_type: event.type,
  });

  if (error && error.code !== "23505") {
    throw new Error(`Webhook idempotency insert failed: ${error.message}`);
  }
}

async function ensureHomeCityLocation(premiumListingId: string, clinicId: string) {
  const serviceSupabase = getServiceSupabase();
  const { data: clinic } = await serviceSupabase
    .from("clinics")
    .select("city_id")
    .eq("clinics_id", clinicId)
    .single();

  if (!clinic?.city_id) return;

  await serviceSupabase.from("premium_listing_locations").upsert(
    {
      premium_listing_id: premiumListingId,
      city_id: clinic.city_id,
    },
    {
      onConflict: "premium_listing_id,city_id",
      ignoreDuplicates: true,
    }
  );
}

async function syncSubscriptionEntitlement(subscriptionId: string) {
  const stripe = getStripeClient();
  const serviceSupabase = getServiceSupabase();

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const clinicId = subscription.metadata?.clinic_id;

  if (!clinicId) {
    console.warn("Subscription missing clinic_id metadata:", subscriptionId);
    return;
  }

  const { startDateIso, endDateIso } = getSubscriptionPremiumPeriod(subscription);
  const entitled = isSubscriptionEntitled(subscription.status);

  const { data: existingListingBySubscription } = await serviceSupabase
    .from("premium_listings")
    .select("id, start_date, end_date")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();

  const nowIso = new Date().toISOString();

  const { data: fallbackListing } = await serviceSupabase
    .from("premium_listings")
    .select("id, start_date, end_date")
    .eq("clinic_id", clinicId)
    .gt("end_date", nowIso)
    .order("end_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const existingListing = existingListingBySubscription || fallbackListing;

  if (entitled) {
    if (existingListing) {
      const mergedStartDate =
        new Date(existingListing.start_date) < new Date(startDateIso)
          ? existingListing.start_date
          : startDateIso;

      const { error: updateError } = await serviceSupabase
        .from("premium_listings")
        .update({
          start_date: mergedStartDate,
          end_date: endDateIso,
          stripe_subscription_id: subscription.id,
          stripe_customer_id:
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer?.id || null,
          stripe_price_id: subscription.items.data[0]?.price?.id || null,
        })
        .eq("id", existingListing.id);

      if (updateError) {
        throw new Error(`Failed to update premium listing: ${updateError.message}`);
      }

      await ensureHomeCityLocation(existingListing.id, clinicId);
      return;
    }

    const { data: insertedListing, error: insertError } = await serviceSupabase
      .from("premium_listings")
      .insert({
        clinic_id: clinicId,
        start_date: startDateIso,
        end_date: endDateIso,
        stripe_subscription_id: subscription.id,
        stripe_customer_id:
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id || null,
        stripe_price_id: subscription.items.data[0]?.price?.id || null,
      })
      .select("id")
      .single();

    if (insertError || !insertedListing) {
      throw new Error(`Failed to create premium listing: ${insertError?.message}`);
    }

    await ensureHomeCityLocation(insertedListing.id, clinicId);
    return;
  }

  if (existingListing) {
    const { error: endError } = await serviceSupabase
      .from("premium_listings")
      .update({
        end_date: nowIso,
        stripe_subscription_id: subscription.id,
      })
      .eq("id", existingListing.id);

    if (endError) {
      throw new Error(`Failed to end premium listing: ${endError.message}`);
    }
  }
}

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, getStripeWebhookSecret());
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const alreadyProcessed = await hasProcessedEvent(event);
    if (alreadyProcessed) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          await syncSubscriptionEntitlement(subscriptionId);
        }
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = getInvoiceSubscriptionId(invoice);
        if (subscriptionId) {
          await syncSubscriptionEntitlement(subscriptionId);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscriptionEntitlement(subscription.id);
        break;
      }
      default:
        break;
    }

    await markEventProcessed(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook handler failed:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
