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

  const { data, error } = await serviceSupabase
    .from("clinic_events")
    .select("event_type, clinic_id")
    .gte("created_at", startDate.toISOString());

  if (error) {
    console.error("Error fetching aggregate analytics:", error);
    return { error: "Fejl ved hentning af analytics" };
  }

  const events = data || [];
  const uniqueClinics = new Set(events.map((e) => e.clinic_id));

  const countByType = (type: string) =>
    events.filter((e) => e.event_type === type).length;

  return {
    stats: {
      profileViews: countByType("profile_view"),
      listImpressions: countByType("list_impression"),
      phoneClicks: countByType("phone_click"),
      websiteClicks: countByType("website_click"),
      emailClicks: countByType("email_click"),
      bookingClicks: countByType("booking_click"),
      totalEvents: events.length,
      uniqueClinicsWithEvents: uniqueClinics.size,
    },
  };
}

