// Admin actions for the premium overview: listing every premium subscription and
// granting or revoking premium manually.
// Premium lives in `premium_listings`, the same rows the Stripe webhook writes to,
// so Stripe-backed windows stay read-only here and revoking never touches billing.
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/app/utils/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/admin";
import { isPremiumListingActive } from "@/lib/clinic-entitlements";
import {
  resolvePremiumGrantEndDate,
  type AdminPremiumListing,
  type AdminPremiumOverview,
} from "@/lib/admin-premium";
import type { User } from "@supabase/supabase-js";

type AdminPremiumActionResult<T> = T | { error: string };
type RequireAdminResult = { ok: true; user: User } | { ok: false; error: string };

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function requireAdmin(): Promise<RequireAdminResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Ikke logget ind" };
  }

  if (!isAdminEmail(user.email)) {
    return { ok: false, error: "Ingen adgang - kun administratorer kan bruge værktøjet" };
  }

  return { ok: true, user };
}

export async function getPremiumListingsForAdmin(): Promise<
  AdminPremiumActionResult<AdminPremiumOverview>
> {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return { error: admin.error };
  }

  const serviceSupabase = getServiceClient();
  const { data: listingRows, error: listingsError } = await serviceSupabase
    .from("premium_listings")
    .select("id, clinic_id, start_date, end_date, stripe_subscription_id")
    .order("end_date", { ascending: false });

  if (listingsError) {
    console.error("Error loading premium listings for admin:", listingsError);
    return { error: "Kunne ikke hente premium-abonnementer" };
  }

  const listings = listingRows || [];
  if (listings.length === 0) {
    return { listings: [], activeCount: 0, expiredCount: 0 };
  }

  const clinicIds = Array.from(
    new Set(listings.map((listing) => listing.clinic_id).filter(Boolean))
  );
  const listingIds = listings.map((listing) => listing.id);

  const [clinicsResult, locationsResult] = await Promise.all([
    serviceSupabase
      .from("clinics")
      .select("clinics_id, klinikNavn, klinikNavnSlug, lokation")
      .in("clinics_id", clinicIds),
    serviceSupabase
      .from("premium_listing_locations")
      .select("premium_listing_id, city_id")
      .in("premium_listing_id", listingIds),
  ]);

  if (clinicsResult.error) {
    console.error("Error loading clinics for premium overview:", clinicsResult.error);
    return { error: "Kunne ikke hente klinikker til premium-oversigten" };
  }

  const clinicById = new Map(
    (clinicsResult.data || []).map((clinic) => [clinic.clinics_id, clinic])
  );

  // City placements are supporting context, so a failure there empties the
  // "byer" column instead of failing the whole overview.
  if (locationsResult.error) {
    console.error("Error loading premium listing locations:", locationsResult.error);
  }
  const locationRows = locationsResult.error ? [] : locationsResult.data || [];
  const cityIds = Array.from(
    new Set(locationRows.map((row) => row.city_id).filter(Boolean))
  );

  const cityNameById = new Map<string, string>();
  if (cityIds.length > 0) {
    const { data: cityRows, error: citiesError } = await serviceSupabase
      .from("cities")
      .select("id, bynavn")
      .in("id", cityIds);

    if (citiesError) {
      console.error("Error loading city names for premium overview:", citiesError);
    } else {
      (cityRows || []).forEach((row) => {
        cityNameById.set(row.id, row.bynavn);
      });
    }
  }

  const cityNamesByListingId = new Map<string, string[]>();
  for (const row of locationRows) {
    const cityName = cityNameById.get(row.city_id);
    if (!cityName) continue;
    const cityNames = cityNamesByListingId.get(row.premium_listing_id) || [];
    cityNames.push(cityName);
    cityNamesByListingId.set(row.premium_listing_id, cityNames);
  }

  const mappedListings: AdminPremiumListing[] = listings.map((listing) => {
    const clinic = clinicById.get(listing.clinic_id);
    return {
      listingId: listing.id,
      clinicId: listing.clinic_id,
      clinicName: clinic?.klinikNavn || "Ukendt klinik",
      clinicSlug: clinic?.klinikNavnSlug || null,
      location: clinic?.lokation || null,
      startDate: listing.start_date,
      endDate: listing.end_date,
      isActive: isPremiumListingActive(listing),
      cityNames: (cityNamesByListingId.get(listing.id) || []).sort((a, b) =>
        a.localeCompare(b, "da-DK")
      ),
      isStripeManaged: Boolean(listing.stripe_subscription_id),
    };
  });

  // Active first, soonest to expire on top, so anything needing attention leads.
  const sortedListings = [...mappedListings].sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    const aEnd = new Date(a.endDate).getTime();
    const bEnd = new Date(b.endDate).getTime();
    return a.isActive ? aEnd - bEnd : bEnd - aEnd;
  });

  const activeCount = sortedListings.filter((listing) => listing.isActive).length;

  return {
    listings: sortedListings,
    activeCount,
    expiredCount: sortedListings.length - activeCount,
  };
}

export async function grantPremiumForAdmin(input: {
  clinicId: string;
  durationMonths?: number | null;
  customEndDate?: string | null;
}): Promise<
  AdminPremiumActionResult<{
    success: true;
    clinicName: string;
    endDate: string;
    extended: boolean;
  }>
> {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return { error: admin.error };
  }

  const clinicId = input.clinicId?.trim();
  if (!clinicId) {
    return { error: "Vælg en klinik" };
  }

  const now = new Date();
  const resolvedEndDate = resolvePremiumGrantEndDate({
    now,
    durationMonths: input.durationMonths,
    customEndDate: input.customEndDate,
  });
  if ("error" in resolvedEndDate) {
    return { error: resolvedEndDate.error };
  }

  const serviceSupabase = getServiceClient();
  const { data: clinic, error: clinicError } = await serviceSupabase
    .from("clinics")
    .select("clinics_id, klinikNavn, city_id")
    .eq("clinics_id", clinicId)
    .maybeSingle();

  if (clinicError) {
    console.error("Error loading clinic for premium grant:", clinicError);
    return { error: "Kunne ikke hente klinikken" };
  }

  if (!clinic) {
    return { error: "Klinikken findes ikke" };
  }

  const nowIso = now.toISOString();
  const endDateIso = resolvedEndDate.endDate.toISOString();

  const { data: existingListing, error: existingListingError } = await serviceSupabase
    .from("premium_listings")
    .select("id, end_date, stripe_subscription_id")
    .eq("clinic_id", clinicId)
    .gt("end_date", nowIso)
    .order("end_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingListingError) {
    console.error("Error checking existing premium listing:", existingListingError);
    return { error: "Kunne ikke tjekke nuværende premium-status" };
  }

  if (existingListing?.stripe_subscription_id) {
    return {
      error:
        "Klinikken har et aktivt Stripe-abonnement. Perioden styres af Stripe og kan ikke ændres her.",
    };
  }

  let premiumListingId: string;

  if (existingListing) {
    if (
      new Date(existingListing.end_date).getTime() >= resolvedEndDate.endDate.getTime()
    ) {
      return {
        error: "Klinikken har allerede premium i en længere periode end den valgte",
      };
    }

    const { error: updateError } = await serviceSupabase
      .from("premium_listings")
      .update({ end_date: endDateIso })
      .eq("id", existingListing.id);

    if (updateError) {
      console.error("Error extending premium listing:", updateError);
      return { error: "Kunne ikke forlænge premium" };
    }

    premiumListingId = existingListing.id;
  } else {
    const { data: insertedListing, error: insertError } = await serviceSupabase
      .from("premium_listings")
      .insert({
        clinic_id: clinicId,
        start_date: nowIso,
        end_date: endDateIso,
      })
      .select("id")
      .single();

    if (insertError || !insertedListing) {
      console.error("Error creating premium listing:", insertError);
      return { error: "Kunne ikke oprette premium" };
    }

    premiumListingId = insertedListing.id;
  }

  // Mirrors the Stripe webhook: without its own city as a placement the clinic
  // gets no priority on the city page it actually belongs to.
  if (clinic.city_id) {
    const { error: locationError } = await serviceSupabase
      .from("premium_listing_locations")
      .upsert(
        {
          premium_listing_id: premiumListingId,
          city_id: clinic.city_id,
        },
        {
          onConflict: "premium_listing_id,city_id",
          ignoreDuplicates: true,
        }
      );

    if (locationError) {
      console.error("Error ensuring home city for premium grant:", locationError);
    }
  }

  console.info("Admin granted premium listing", {
    adminUserId: admin.user.id,
    clinicId,
    premiumListingId,
    endDate: endDateIso,
    extended: Boolean(existingListing),
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin/premium");

  return {
    success: true,
    clinicName: clinic.klinikNavn,
    endDate: endDateIso,
    extended: Boolean(existingListing),
  };
}

export async function revokePremiumForAdmin(input: {
  listingId: string;
}): Promise<
  AdminPremiumActionResult<{
    success: true;
    clinicName: string;
    hadStripeSubscription: boolean;
  }>
> {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return { error: admin.error };
  }

  const listingId = input.listingId?.trim();
  if (!listingId) {
    return { error: "Vælg et premium-abonnement" };
  }

  const serviceSupabase = getServiceClient();
  const { data: listing, error: listingError } = await serviceSupabase
    .from("premium_listings")
    .select("id, clinic_id, end_date, stripe_subscription_id")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError) {
    console.error("Error loading premium listing for revoke:", listingError);
    return { error: "Kunne ikke hente premium-abonnementet" };
  }

  if (!listing) {
    return { error: "Premium-abonnementet findes ikke" };
  }

  const now = new Date();
  if (new Date(listing.end_date).getTime() <= now.getTime()) {
    return { error: "Premium er allerede udløbet for denne klinik" };
  }

  // Same shape as the Stripe webhook cancel path: close the window rather than
  // deleting the row, so history and city placements survive.
  const { error: updateError } = await serviceSupabase
    .from("premium_listings")
    .update({ end_date: now.toISOString() })
    .eq("id", listingId);

  if (updateError) {
    console.error("Error revoking premium listing:", updateError);
    return { error: "Kunne ikke fjerne premium" };
  }

  const { data: clinic } = await serviceSupabase
    .from("clinics")
    .select("klinikNavn")
    .eq("clinics_id", listing.clinic_id)
    .maybeSingle();

  console.info("Admin revoked premium listing", {
    adminUserId: admin.user.id,
    clinicId: listing.clinic_id,
    premiumListingId: listing.id,
    hadStripeSubscription: Boolean(listing.stripe_subscription_id),
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin/premium");

  return {
    success: true,
    clinicName: clinic?.klinikNavn || "Klinikken",
    hadStripeSubscription: Boolean(listing.stripe_subscription_id),
  };
}
