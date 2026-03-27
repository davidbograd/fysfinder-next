// Server action for dashboard uplift metrics (value + rank + missed opportunity)
// Updated: removed unused map-point payload and coordinate fetch logic.

"use server";

import { createClient } from "@/app/utils/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getClinicAnalytics } from "@/app/actions/clinic-analytics";

interface ClinicCityRankRow {
  clinic_id: string;
  rank_position: number;
  total_clinics: number;
}

interface NeighborOpportunityRow {
  city_id: string;
  city_name: string;
  city_slug: string;
  distance_km: number;
  phone_clicks: number;
  website_clicks: number;
  total_lead_actions: number;
  captured_by_clinic: number;
  missed_actions: number;
}

interface ClinicIdentity {
  clinics_id: string;
  city_id: string | null;
  lokation: string | null;
}

export interface NeighborCityActivityRow {
  cityId: string;
  cityName: string;
  distanceKm: number;
  isHome: boolean;
  leadClicks: number;
  views: number;
}

interface NeighborCityActivityRpcRow {
  city_id: string;
  city_name: string;
  distance_km: number;
  is_home: boolean;
  lead_clicks: number;
  views: number;
}

export interface DashboardUpliftMetrics {
  clinicId: string;
  clinicName?: string | null;
  homeCityId: string | null;
  homeCityName: string;
  rankInHomeCity: number | null;
  totalClinicsInHomeCity: number | null;
  periodDays: number;
  currentValue: {
    profileViews: number;
    listImpressions: number;
    phoneClicks: number;
    websiteClicks: number;
    totalContactClicks: number;
  };
  neighborOpportunity: {
    totalLeadActions: number;
    totalMissedActions: number;
    cities: NeighborOpportunityRow[];
  };
  cityActivity: NeighborCityActivityRow[];
}

export async function getClinicDashboardUplift(
  clinicId: string,
  days: number = 30
): Promise<{ data?: DashboardUpliftMetrics; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Ikke logget ind" };
  }

  const { data: ownership, error: ownershipError } = await supabase
    .from("clinic_owners")
    .select("clinic_id")
    .eq("user_id", user.id)
    .eq("clinic_id", clinicId)
    .single();

  if (ownershipError || !ownership) {
    return { error: "Du ejer ikke denne klinik" };
  }

  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: clinicIdentity, error: clinicError } = await serviceSupabase
    .from("clinics")
    .select("clinics_id, city_id, lokation, klinikNavn")
    .eq("clinics_id", clinicId)
    .single();

  if (clinicError || !clinicIdentity) {
    return { error: "Kunne ikke hente klinikdata" };
  }

  const identity = clinicIdentity as ClinicIdentity & { klinikNavn?: string | null };

  const analyticsResult = await getClinicAnalytics(clinicId, days);
  if (analyticsResult.error || !analyticsResult.stats) {
    return { error: analyticsResult.error || "Kunne ikke hente aktivitetsdata" };
  }

  let rankRow: ClinicCityRankRow | null = null;
  if (identity.city_id) {
    const { data: rankData, error: rankError } = await serviceSupabase.rpc(
      "get_clinic_city_rank",
      {
        p_clinic_id: clinicId,
        p_city_id: identity.city_id,
      }
    );

    if (!rankError && Array.isArray(rankData) && rankData.length > 0) {
      rankRow = rankData[0] as ClinicCityRankRow;
    }
  }

  const { data: opportunityData, error: opportunityError } = await serviceSupabase.rpc(
    "get_clinic_neighbor_opportunity",
    {
      p_clinic_id: clinicId,
      p_days: days,
      p_max_distance_km: 10,
    }
  );

  const opportunityRows =
    !opportunityError && Array.isArray(opportunityData)
      ? (opportunityData as NeighborOpportunityRow[])
      : [];

  const { data: cityActivityData, error: cityActivityError } = await serviceSupabase.rpc(
    "get_clinic_neighbor_city_activity",
    {
      p_clinic_id: clinicId,
      p_days: days,
      p_max_distance_km: 10,
    }
  );

  const cityActivityRows: NeighborCityActivityRow[] =
    !cityActivityError && Array.isArray(cityActivityData)
      ? (cityActivityData as NeighborCityActivityRpcRow[]).map((row) => ({
          cityId: row.city_id,
          cityName: row.city_name,
          distanceKm: Number(row.distance_km || 0),
          isHome: Boolean(row.is_home),
          leadClicks: Number(row.lead_clicks || 0),
          views: Number(row.views || 0),
        }))
      : [];

  const totalLeadActions = opportunityRows.reduce(
    (sum, row) => sum + Number(row.total_lead_actions || 0),
    0
  );
  const totalMissedActions = opportunityRows.reduce(
    (sum, row) => sum + Number(row.missed_actions || 0),
    0
  );

  return {
    data: {
      clinicId,
      clinicName: identity.klinikNavn || null,
      homeCityId: identity.city_id,
      homeCityName: identity.lokation || "Din by",
      rankInHomeCity: rankRow?.rank_position ?? null,
      totalClinicsInHomeCity: rankRow?.total_clinics ?? null,
      periodDays: days,
      currentValue: {
        profileViews: analyticsResult.stats.profileViews,
        listImpressions: analyticsResult.stats.listImpressions,
        phoneClicks: analyticsResult.stats.phoneClicks,
        websiteClicks: analyticsResult.stats.websiteClicks,
        totalContactClicks: analyticsResult.stats.totalContactClicks,
      },
      neighborOpportunity: {
        totalLeadActions,
        totalMissedActions,
        cities: opportunityRows,
      },
      cityActivity: cityActivityRows,
    },
  };
}
