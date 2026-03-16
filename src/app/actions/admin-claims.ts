"use server";

import { createClient } from "@/app/utils/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/admin";

/**
 * Get pending clinic claims (admin only)
 */
export async function getPendingClaims() {
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
  // We've already verified the user is an admin above
  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get pending claims with related data
  const { data: claims, error } = await serviceSupabase
    .from("clinic_claims")
    .select(
      `
      id,
      clinic_id,
      klinik_navn,
      job_titel,
      fulde_navn,
      email,
      telefon,
      status,
      created_at,
      clinics:clinic_id (
        clinics_id,
        klinikNavn,
        adresse,
        postnummer,
        lokation,
        verified_klinik,
        email,
        tlf
      )
    `
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pending claims:", error);
    return { error: "Fejl ved hentning af anmodninger" };
  }

  return { claims: claims || [] };
}

/**
 * Approve a clinic claim (admin only)
 */
export async function approveClaim(claimId: string) {
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
    return { error: "Ingen adgang - kun administratorer kan godkende anmodninger" };
  }

  // Use service role for all operations (admin verified above)
  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get the claim first
  const { data: claim, error: claimError } = await serviceSupabase
    .from("clinic_claims")
    .select("*")
    .eq("id", claimId)
    .single();

  if (claimError || !claim) {
    return { error: "Anmodning ikke fundet" };
  }

  if (claim.status !== "pending") {
    return { error: "Anmodning er allerede behandlet" };
  }

  // Update claim status
  const { error: updateError } = await serviceSupabase
    .from("clinic_claims")
    .update({
      status: "approved",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", claimId);

  if (updateError) {
    console.error("Error approving claim:", updateError);
    return { error: "Fejl ved godkendelse af anmodning" };
  }

  // Update clinic to mark as verified
  const { error: clinicUpdateError } = await serviceSupabase
    .from("clinics")
    .update({
      verified_klinik: true,
      verified_email: claim.email,
    })
    .eq("clinics_id", claim.clinic_id);

  if (clinicUpdateError) {
    console.error("Error updating clinic:", clinicUpdateError);
    // Note: We still mark the claim as approved even if clinic update fails
  }

  // Create ownership record
  const { error: ownershipError } = await serviceSupabase
    .from("clinic_owners")
    .insert({
      user_id: claim.user_id,
      clinic_id: claim.clinic_id,
    });

  if (ownershipError) {
    console.error("Error creating ownership:", ownershipError);
    // Note: We still mark the claim as approved even if ownership creation fails
  }

  // Get all insurance companies and add them to the clinic
  const { data: allInsurances, error: insurancesError } = await serviceSupabase
    .from("insurance_companies")
    .select("insurance_id");

  if (!insurancesError && allInsurances && allInsurances.length > 0) {
    // Delete existing insurances for this clinic
    await serviceSupabase
      .from("clinic_insurances")
      .delete()
      .eq("clinic_id", claim.clinic_id);

    // Insert all insurances
    const insuranceInserts = allInsurances.map((insurance) => ({
      clinic_id: claim.clinic_id,
      insurance_id: insurance.insurance_id,
    }));

    const { error: insertInsurancesError } = await serviceSupabase
      .from("clinic_insurances")
      .insert(insuranceInserts);

    if (insertInsurancesError) {
      console.error("Error setting insurances:", insertInsurancesError);
      // Non-critical error, continue
    }
  }

  return { success: true };
}

/**
 * Reject a clinic claim (admin only)
 */
export async function rejectClaim(claimId: string, notes?: string) {
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
    return { error: "Ingen adgang - kun administratorer kan afvise anmodninger" };
  }

  // Use service role for all operations (admin verified above)
  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get the claim first
  const { data: claim, error: claimError } = await serviceSupabase
    .from("clinic_claims")
    .select("*")
    .eq("id", claimId)
    .single();

  if (claimError || !claim) {
    return { error: "Anmodning ikke fundet" };
  }

  if (claim.status !== "pending") {
    return { error: "Anmodning er allerede behandlet" };
  }

  const { error: updateError } = await serviceSupabase
    .from("clinic_claims")
    .update({
      status: "rejected",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      admin_notes: notes || null,
    })
    .eq("id", claimId);

  if (updateError) {
    console.error("Error rejecting claim:", updateError);
    return { error: "Fejl ved afvisning af anmodning" };
  }

  return { success: true };
}

