"use server";

import { createClient } from "@/app/utils/supabase/server";

/**
 * Get all claims for the current user
 */
export async function getUserClaims() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Ikke logget ind" };
  }

  // Get all claims for this user with clinic details
  // RLS policy allows users to view their own claims
  const { data: claims, error } = await supabase
    .from("clinic_claims")
    .select(
      `
      id,
      clinic_id,
      klinik_navn,
      status,
      created_at,
      reviewed_at,
      admin_notes,
      clinics:clinic_id (
        clinics_id,
        klinikNavn,
        adresse,
        postnummer,
        lokation
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user claims:", error);
    return { error: "Fejl ved hentning af anmodninger" };
  }

  const { data: creationRequests, error: creationRequestsError } = await supabase
    .from("clinic_creation_requests")
    .select(
      "id, clinic_name, address, postal_code, city_name, status, created_at, reviewed_at, admin_notes, created_clinic_id"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (creationRequestsError) {
    console.error("Error fetching user clinic creation requests:", creationRequestsError);
    return { error: "Fejl ved hentning af oprettelses-anmodninger" };
  }

  return { claims: claims || [], creationRequests: creationRequests || [] };
}

