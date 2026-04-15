// Stripe Checkout session endpoint for clinic premium upgrades.
// Added: validates ownership and returns hosted checkout URL.

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@/app/utils/supabase/server";
import { getStripeClient, getStripePriceId } from "@/lib/stripe/server";

interface CheckoutRequestBody {
  clinicId?: string;
}

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutRequestBody;
    const clinicId = body.clinicId;
    if (!clinicId) {
      return NextResponse.json({ error: "Mangler clinicId" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Ikke logget ind" }, { status: 401 });
    }

    const { data: ownership, error: ownershipError } = await supabase
      .from("clinic_owners")
      .select("clinic_id")
      .eq("user_id", user.id)
      .eq("clinic_id", clinicId)
      .single();

    if (ownershipError || !ownership) {
      return NextResponse.json({ error: "Du ejer ikke denne klinik" }, { status: 403 });
    }

    const requestHeaders = await headers();
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      requestHeaders.get("origin") ||
      "http://localhost:3000";

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: getStripePriceId(), quantity: 1 }],
      success_url: `${origin}/dashboard/premium/success?clinicId=${clinicId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/clinic/${clinicId}/premium?canceled=1`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      customer_email: user.email || undefined,
      client_reference_id: clinicId,
      metadata: {
        clinic_id: clinicId,
        user_id: user.id,
      },
      subscription_data: {
        metadata: {
          clinic_id: clinicId,
          user_id: user.id,
        },
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Kunne ikke starte checkout" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout creation failed:", error);
    return NextResponse.json(
      { error: "Kunne ikke starte betaling" },
      { status: 500 }
    );
  }
}
