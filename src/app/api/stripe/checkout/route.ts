// Stripe Checkout session endpoint for clinic premium upgrades.
// Added: validates ownership and returns hosted checkout URL.

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@/app/utils/supabase/server";
import { getStripeClient, getStripePriceId } from "@/lib/stripe/server";
import { normalizePremiumNeighborCityIds } from "@/lib/stripe/premium-locations";

interface NearbyCityActivityRpcRow {
  city_id: string;
}

interface CheckoutRequestBody {
  clinicId?: string;
  selectedCityIds?: string[];
}

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutRequestBody;
    const clinicId = body.clinicId;
    const requestedSelectedCityIds = Array.isArray(body.selectedCityIds)
      ? body.selectedCityIds.filter((value): value is string => typeof value === "string")
      : [];
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

    const { data: clinic, error: clinicError } = await supabase
      .from("clinics")
      .select("city_id")
      .eq("clinics_id", clinicId)
      .single();

    if (clinicError) {
      return NextResponse.json({ error: "Kunne ikke hente klinikdata" }, { status: 500 });
    }

    const { data: allowedCityRows, error: allowedCityError } = await supabase.rpc(
      "get_clinic_neighbor_city_activity",
      {
        p_clinic_id: clinicId,
        p_days: 30,
        p_max_distance_km: 20,
      }
    );
    const fallbackCandidateIds = Array.from(
      new Set([...(clinic.city_id ? [clinic.city_id] : []), ...requestedSelectedCityIds])
    );

    let validCityRows: Array<{ id: string }> = [];
    if (fallbackCandidateIds.length > 0) {
      const { data, error: validCityError } = await supabase
        .from("cities")
        .select("id")
        .in("id", fallbackCandidateIds);

      if (validCityError) {
        return NextResponse.json({ error: "Kunne ikke validere byvalg" }, { status: 500 });
      }

      validCityRows = data || [];
    }

    const allowedCityIds = new Set<string>(
      !allowedCityError && Array.isArray(allowedCityRows)
        ? (allowedCityRows as NearbyCityActivityRpcRow[]).map((row) => row.city_id)
        : validCityRows.map((row) => row.id)
    );
    const selectedNeighborCityIds = normalizePremiumNeighborCityIds({
      homeCityId: clinic.city_id || null,
      selectedCityIds: requestedSelectedCityIds,
      allowedCityIds,
    });
    const selectedNeighborCityIdsParam = selectedNeighborCityIds.join(",");

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
      cancel_url: `${origin}/dashboard/clinic/${clinicId}/premium?canceled=1${
        selectedNeighborCityIdsParam
          ? `&selectedCityIds=${encodeURIComponent(selectedNeighborCityIdsParam)}`
          : ""
      }`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      customer_email: user.email || undefined,
      client_reference_id: clinicId,
      metadata: {
        clinic_id: clinicId,
        user_id: user.id,
        selected_city_ids: selectedNeighborCityIdsParam,
      },
      subscription_data: {
        metadata: {
          clinic_id: clinicId,
          user_id: user.id,
          selected_city_ids: selectedNeighborCityIdsParam,
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
