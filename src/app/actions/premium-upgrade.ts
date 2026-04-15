// Premium upgrade server actions and loaders.
// Added: ownership checks, nearby-city options, and post-payment location save.

"use server";

import { createClient } from "@/app/utils/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

interface NearbyCityActivityRpcRow {
  city_id: string;
  city_name: string;
  distance_km: number;
  is_home: boolean;
  lead_clicks: number;
  views: number;
}

export interface PremiumCityOption {
  cityId: string;
  cityName: string;
  distanceKm: number;
  isHome: boolean;
  leadClicks: number;
  views: number;
}

export interface PremiumUpgradeContext {
  clinicId: string;
  clinicName: string;
  homeCityName: string | null;
  hasActivePremium: boolean;
  activePremiumListingId: string | null;
  selectedCityIds: string[];
  cityOptions: PremiumCityOption[];
}

async function requireOwnedClinic(clinicId: string): Promise<{
  userId: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Ikke logget ind");
  }

  const { data: ownership, error: ownershipError } = await supabase
    .from("clinic_owners")
    .select("clinic_id")
    .eq("user_id", user.id)
    .eq("clinic_id", clinicId)
    .single();

  if (ownershipError || !ownership) {
    throw new Error("Du ejer ikke denne klinik");
  }

  return { userId: user.id };
}

function getServiceSupabase() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function getPremiumUpgradeContext(
  clinicId: string
): Promise<{ data?: PremiumUpgradeContext; error?: string }> {
  try {
    await requireOwnedClinic(clinicId);
    const serviceSupabase = getServiceSupabase();

    const { data: clinic, error: clinicError } = await serviceSupabase
      .from("clinics")
      .select("clinics_id, klinikNavn, lokation, city_id")
      .eq("clinics_id", clinicId)
      .single();

    if (clinicError || !clinic) {
      return { error: "Kunne ikke hente klinik" };
    }

    const nowIso = new Date().toISOString();
    const { data: activeListing, error: listingError } = await serviceSupabase
      .from("premium_listings")
      .select("id")
      .eq("clinic_id", clinicId)
      .lte("start_date", nowIso)
      .gt("end_date", nowIso)
      .order("end_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (listingError) {
      return { error: "Kunne ikke hente premium-status" };
    }

    let selectedCityIds: string[] = [];
    if (activeListing) {
      const { data: locationRows, error: locationError } = await serviceSupabase
        .from("premium_listing_locations")
        .select("city_id")
        .eq("premium_listing_id", activeListing.id);

      if (locationError) {
        return { error: "Kunne ikke hente valgte byer" };
      }

      selectedCityIds = (locationRows || []).map((row) => row.city_id);
    }

    const { data: cityActivity, error: cityActivityError } = await serviceSupabase.rpc(
      "get_clinic_neighbor_city_activity",
      {
        p_clinic_id: clinicId,
        p_days: 30,
        p_max_distance_km: 20,
      }
    );
    const cityOptions =
      !cityActivityError && Array.isArray(cityActivity)
        ? (cityActivity as NearbyCityActivityRpcRow[]).map((row) => ({
            cityId: row.city_id,
            cityName: row.city_name,
            distanceKm: Number(row.distance_km || 0),
            isHome: Boolean(row.is_home),
            leadClicks: Number(row.lead_clicks || 0),
            views: Number(row.views || 0),
          }))
        : clinic.city_id
          ? [
              {
                cityId: clinic.city_id,
                cityName: clinic.lokation || "Hjemmeby",
                distanceKm: 0,
                isHome: true,
                leadClicks: 0,
                views: 0,
              },
            ]
          : [];

    return {
      data: {
        clinicId: clinic.clinics_id,
        clinicName: clinic.klinikNavn,
        homeCityName: clinic.lokation,
        hasActivePremium: Boolean(activeListing),
        activePremiumListingId: activeListing?.id || null,
        selectedCityIds,
        cityOptions,
      },
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Kunne ikke hente premium-data",
    };
  }
}

export async function savePremiumLocationSelections(
  clinicId: string,
  selectedCityIds: string[]
): Promise<{ success?: true; error?: string }> {
  try {
    await requireOwnedClinic(clinicId);
    const serviceSupabase = getServiceSupabase();

    const nowIso = new Date().toISOString();
    const { data: activeListing, error: listingError } = await serviceSupabase
      .from("premium_listings")
      .select("id")
      .eq("clinic_id", clinicId)
      .lte("start_date", nowIso)
      .gt("end_date", nowIso)
      .order("end_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (listingError || !activeListing) {
      return { error: "Premium-abonnement er ikke aktivt endnu" };
    }

    const { data: clinic, error: clinicError } = await serviceSupabase
      .from("clinics")
      .select("city_id")
      .eq("clinics_id", clinicId)
      .single();

    if (clinicError) {
      return { error: "Kunne ikke hente klinikdata" };
    }

    const { data: allowedCityRows, error: allowedCityError } = await serviceSupabase.rpc(
      "get_clinic_neighbor_city_activity",
      {
        p_clinic_id: clinicId,
        p_days: 30,
        p_max_distance_km: 20,
      }
    );
    const fallbackCandidateIds = Array.from(
      new Set([...(clinic.city_id ? [clinic.city_id] : []), ...selectedCityIds])
    );

    const { data: validCityRows, error: validCityError } = await serviceSupabase
      .from("cities")
      .select("id")
      .in("id", fallbackCandidateIds);

    if (validCityError) {
      return { error: "Kunne ikke validere byvalg" };
    }

    const allowedCityIds = new Set<string>(
      !allowedCityError && Array.isArray(allowedCityRows)
        ? (allowedCityRows as NearbyCityActivityRpcRow[]).map((row) => row.city_id)
        : (validCityRows || []).map((row) => row.id)
    );

    const validSelectedCityIds = selectedCityIds.filter((cityId) =>
      allowedCityIds.has(cityId)
    );

    const { error: deleteError } = await serviceSupabase
      .from("premium_listing_locations")
      .delete()
      .eq("premium_listing_id", activeListing.id);

    if (deleteError) {
      return { error: "Kunne ikke opdatere byer" };
    }

    if (validSelectedCityIds.length > 0) {
      const { error: insertError } = await serviceSupabase
        .from("premium_listing_locations")
        .insert(
          validSelectedCityIds.map((cityId) => ({
            premium_listing_id: activeListing.id,
            city_id: cityId,
          }))
        );

      if (insertError) {
        return { error: "Kunne ikke gemme byer" };
      }
    }

    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Kunne ikke gemme byvalg",
    };
  }
}
