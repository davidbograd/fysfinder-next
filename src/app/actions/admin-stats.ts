"use server";

import { createClient } from "@/app/utils/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/admin";

/**
 * Get clinic statistics (admin only)
 */
export async function getClinicStats() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Ikke logget ind" };
  }

  // Check if user is admin
  if (!isAdminEmail(user.email)) {
    return { error: "Ingen adgang - kun administratorer kan se dette" };
  }

  // Use service role to bypass RLS for admin queries
  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get total verified clinics count
  const { count: verifiedCount, error: verifiedError } = await serviceSupabase
    .from("clinics")
    .select("*", { count: "exact", head: true })
    .eq("verified_klinik", true);

  if (verifiedError) {
    console.error("Error fetching verified clinics count:", verifiedError);
    return { error: "Fejl ved hentning af statistik" };
  }

  // Get total clinics with active premium listings (paid subscription)
  const now = new Date().toISOString();
  const { count: premiumCount, error: premiumError } = await serviceSupabase
    .from("premium_listings")
    .select("*", { count: "exact", head: true })
    .lte("start_date", now)
    .gte("end_date", now);

  if (premiumError) {
    console.error("Error fetching premium clinics count:", premiumError);
    return { error: "Fejl ved hentning af statistik" };
  }

  return {
    verifiedCount: verifiedCount || 0,
    premiumCount: premiumCount || 0,
  };
}

/**
 * Get verified clinics list (admin only)
 */
export async function getVerifiedClinics(limit: number = 10, offset: number = 0) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Ikke logget ind" };
  }

  // Check if user is admin
  if (!isAdminEmail(user.email)) {
    return { error: "Ingen adgang - kun administratorer kan se dette" };
  }

  // Use service role to bypass RLS for admin queries
  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get verified clinics
  const { data: clinics, error } = await serviceSupabase
    .from("clinics")
    .select(
      `
      clinics_id,
      klinikNavn,
      lokation,
      adresse,
      postnummer,
      tlf,
      email,
      website,
      verified_klinik,
      verified_email,
      created_at,
      updated_at
    `
    )
    .eq("verified_klinik", true)
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching verified clinics:", error);
    return { error: "Fejl ved hentning af klinikker" };
  }

  return { clinics: clinics || [] };
}

export interface AggregateAnalytics {
  profileViews: number;
  listImpressions: number;
  phoneClicks: number;
  websiteClicks: number;
  emailClicks: number;
  bookingClicks: number;
  totalEvents: number;
  uniqueClinicsWithEvents: number;
}

export interface SuburbAnalyticsRow {
  suburb: string;
  leadClicks: number;
  phoneClicks: number;
  websiteClicks: number;
  emailClicks: number;
  bookingClicks: number;
  views: number;
  listImpressions: number;
  profileViews: number;
}

export interface SuburbAnalyticsPeriod {
  startDate: string | null;
  endDate: string | null;
  oldestEventDate: string | null;
}

type SuburbSortKey = "leadClicks" | "views";
type SuburbSortDirection = "asc" | "desc";

interface GetSuburbAnalyticsOptions {
  limit?: number;
  sortBy?: SuburbSortKey;
  sortDirection?: SuburbSortDirection;
}

/**
 * Get aggregate analytics across all clinics (admin only)
 */
export async function getAggregateAnalytics(
  days: number = 30
): Promise<{ stats?: AggregateAnalytics; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Ikke logget ind" };
  }

  if (!isAdminEmail(user.email)) {
    return { error: "Ingen adgang - kun administratorer" };
  }

  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await serviceSupabase.rpc(
    "get_aggregate_event_counts",
    {
      p_start_date: startDate.toISOString(),
      p_end_date: new Date().toISOString(),
    }
  );

  if (error) {
    console.error("Error fetching aggregate analytics:", error);
    return { error: "Fejl ved hentning af analytics" };
  }

  const rows = (data as { event_type: string; count: number; unique_clinics: number }[]) || [];
  const getCount = (type: string) =>
    rows.find((r) => r.event_type === type)?.count || 0;

  const totalEvents = rows.reduce((sum, r) => sum + r.count, 0);
  const allUniqueClinics = new Set<number>();
  rows.forEach((r) => allUniqueClinics.add(r.unique_clinics));
  const maxUniqueClinics = Math.max(...rows.map((r) => r.unique_clinics), 0);

  // unique_clinics per event_type is a lower bound for total unique;
  // for an exact total, we take the max across types as a reasonable approximation
  // (a clinic with views likely also has impressions)

  return {
    stats: {
      profileViews: getCount("profile_view"),
      listImpressions: getCount("list_impression"),
      phoneClicks: getCount("phone_click"),
      websiteClicks: getCount("website_click"),
      emailClicks: getCount("email_click"),
      bookingClicks: getCount("booking_click"),
      totalEvents,
      uniqueClinicsWithEvents: maxUniqueClinics,
    },
  };
}

/**
 * Get suburb-level analytics across all clinics (admin only)
 */
export async function getSuburbAnalytics(
  days: number | null = 30,
  options: GetSuburbAnalyticsOptions = {}
): Promise<{ rows?: SuburbAnalyticsRow[]; period?: SuburbAnalyticsPeriod; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Ikke logget ind" };
  }

  if (!isAdminEmail(user.email)) {
    return { error: "Ingen adgang - kun administratorer" };
  }

  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const startDateIso =
    typeof days === "number"
      ? (() => {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - days);
          return startDate.toISOString();
        })()
      : null;
  const endDateIso = new Date().toISOString();
  const sortBy = options.sortBy || "leadClicks";
  const sortDirection = options.sortDirection || "desc";
  const rpcSortBy = sortBy === "views" ? "views" : "lead_clicks";

  const [
    { data: oldestEventRows, error: oldestEventError },
    { data: latestEventRows, error: latestEventError },
  ] = await Promise.all([
    serviceSupabase
      .from("clinic_events")
      .select("created_at")
      .order("created_at", { ascending: true })
      .limit(1),
    serviceSupabase
      .from("clinic_events")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  if (oldestEventError || latestEventError) {
    console.error("Error fetching suburb analytics period:", oldestEventError || latestEventError);
    return { error: "Fejl ved hentning af periode" };
  }

  const oldestEventDate = oldestEventRows?.[0]?.created_at || null;
  const latestEventDate = latestEventRows?.[0]?.created_at || null;
  const effectiveStartDate =
    startDateIso && oldestEventDate && new Date(startDateIso) < new Date(oldestEventDate)
      ? oldestEventDate
      : startDateIso || oldestEventDate;
  const period: SuburbAnalyticsPeriod = {
    startDate: effectiveStartDate,
    endDate: latestEventDate || endDateIso,
    oldestEventDate,
  };

  const { data, error } = await serviceSupabase.rpc("get_suburb_event_counts", {
    p_start_date: startDateIso,
    p_end_date: endDateIso,
    p_limit: typeof options.limit === "number" ? options.limit : null,
    p_offset: 0,
    p_sort_by: rpcSortBy,
    p_sort_dir: sortDirection,
  });

  if (!error) {
    const rows =
      (
        data as
          | {
              suburb: string;
              lead_clicks: number;
              phone_clicks: number;
              website_clicks: number;
              email_clicks: number;
              booking_clicks: number;
              views: number;
              list_impressions: number;
              profile_views: number;
            }[]
          | null
      )?.map((row) => ({
        suburb: row.suburb,
        leadClicks: Number(row.lead_clicks || 0),
        phoneClicks: Number(row.phone_clicks || 0),
        websiteClicks: Number(row.website_clicks || 0),
        emailClicks: Number(row.email_clicks || 0),
        bookingClicks: Number(row.booking_clicks || 0),
        views: Number(row.views || 0),
        listImpressions: Number(row.list_impressions || 0),
        profileViews: Number(row.profile_views || 0),
      })) || [];
    return { rows, period };
  }

  if (error.code !== "PGRST202") {
    console.error("Error fetching suburb analytics via RPC:", error);
    return { error: "Fejl ved hentning af bydata" };
  }

  console.error("Missing get_suburb_event_counts RPC:", error);
  return { error: "Mangler databasefunktion til bydata" };
}

