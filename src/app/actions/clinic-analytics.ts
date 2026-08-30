// Server action for fetching per-clinic analytics.
// Updated: stop re-exporting ClinicStats — "use server" files may only export async
// functions, and Turbopack fails the production build on type re-exports.

"use server";

import { createClient } from "@/app/utils/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import {
  mapEventCountsToClinicStats,
  type ClinicEventCount,
  type ClinicStats,
} from "@/lib/clinic-stats";

/**
 * Get analytics stats for a single clinic (only if user owns it)
 */
export async function getClinicAnalytics(
  clinicId: string,
  days: number = 30
): Promise<{ stats?: ClinicStats; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Ikke logget ind" };
  }

  // Verify ownership
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

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await serviceSupabase.rpc(
    "get_clinic_event_counts",
    {
      p_clinic_id: clinicId,
      p_start_date: startDate.toISOString(),
      p_end_date: new Date().toISOString(),
    }
  );

  if (error) {
    console.error("Error fetching clinic analytics:", error);
    return { error: "Fejl ved hentning af statistik" };
  }

  return {
    stats: mapEventCountsToClinicStats(
      clinicId,
      `${days} dage`,
      (data as ClinicEventCount[]) || []
    ),
  };
}

/**
 * Get analytics stats for all clinics owned by the current user
 */
export async function getAllOwnedClinicAnalytics(
  days: number = 30
): Promise<{ stats?: Record<string, ClinicStats>; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Ikke logget ind" };
  }

  const { data: ownerships, error: ownershipError } = await supabase
    .from("clinic_owners")
    .select("clinic_id")
    .eq("user_id", user.id);

  if (ownershipError) {
    console.error("Error fetching ownerships:", ownershipError);
    return { error: "Fejl ved hentning af klinikker" };
  }

  const clinicIds = ownerships?.map((o: { clinic_id: string }) => o.clinic_id) || [];
  if (clinicIds.length === 0) {
    return { stats: {} };
  }

  const results: Record<string, ClinicStats> = {};

  const promises = clinicIds.map(async (clinicId: string) => {
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await serviceSupabase.rpc(
      "get_clinic_event_counts",
      {
        p_clinic_id: clinicId,
        p_start_date: startDate.toISOString(),
        p_end_date: new Date().toISOString(),
      }
    );

    if (error) {
      console.error(`Error fetching analytics for ${clinicId}:`, error);
      return;
    }

    results[clinicId] = mapEventCountsToClinicStats(
      clinicId,
      `${days} dage`,
      (data as ClinicEventCount[]) || []
    );
  });

  await Promise.all(promises);

  return { stats: results };
}
