"use server";

import { createClient } from "@/app/utils/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/admin";
import { sendClinicApprovalEmailToUser, sendClinicRejectionEmailToUser } from "@/lib/email";
import {
  syncClinicFromGoogleMapsUrlOnApprove,
  type GoogleSyncResult,
} from "@/lib/google-places/approve-bootstrap-sync";

export type AdminApproveWithOptionalGoogleSyncResult =
  | { success: true; googleSync?: GoogleSyncResult }
  | { error: string };

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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
export async function approveClaim(
  claimId: string,
  options?: { googleMapsUrl?: string }
): Promise<AdminApproveWithOptionalGoogleSyncResult> {
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

  const claimApprovalEmailResult = await sendClinicApprovalEmailToUser({
    clinic_name: claim.klinik_navn || "Din klinik",
    recipient_email: claim.email,
    recipient_name: claim.fulde_navn || undefined,
  });

  if (!claimApprovalEmailResult.success) {
    console.error(
      "Failed to send claim approval email to user:",
      claimApprovalEmailResult.error
    );
  }

  const mapsUrl = options?.googleMapsUrl?.trim();
  if (!mapsUrl) {
    return { success: true };
  }

  const googleSync = await syncClinicFromGoogleMapsUrlOnApprove(
    serviceSupabase,
    claim.clinic_id,
    mapsUrl
  );

  return { success: true, googleSync };
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

  const rejectionReason = notes?.trim();
  if (!rejectionReason) {
    return { error: "Afvisningsårsag er påkrævet" };
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
      admin_notes: rejectionReason,
    })
    .eq("id", claimId);

  if (updateError) {
    console.error("Error rejecting claim:", updateError);
    return { error: "Fejl ved afvisning af anmodning" };
  }

  const claimRejectionEmailResult = await sendClinicRejectionEmailToUser({
    clinic_name: claim.klinik_navn || "Din klinik",
    recipient_email: claim.email,
    recipient_name: claim.fulde_navn || undefined,
    rejection_reason: rejectionReason,
  });

  if (!claimRejectionEmailResult.success) {
    console.error(
      "Failed to send claim rejection email to user:",
      claimRejectionEmailResult.error
    );
  }

  return { success: true };
}

/**
 * Get pending new clinic creation requests (admin only)
 */
export async function getPendingClinicCreationRequests() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Ikke logget ind" };
  }

  if (!isAdminEmail(user.email)) {
    return { error: "Ingen adgang - kun administratorer kan se dette" };
  }

  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: requests, error } = await serviceSupabase
    .from("clinic_creation_requests")
    .select(
      "id, user_id, requester_name, requester_email, requester_phone, requester_role, clinic_name, address, postal_code, city_id, city_name, website, description, status, created_at"
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pending clinic creation requests:", error);
    return { error: "Fejl ved hentning af oprettelses-anmodninger" };
  }

  return { requests: requests || [] };
}

/**
 * Approve a clinic creation request by creating a verified clinic and owner relation (admin only)
 */
export async function approveClinicCreationRequest(
  requestId: string,
  options?: { googleMapsUrl?: string }
): Promise<AdminApproveWithOptionalGoogleSyncResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Ikke logget ind" };
  }

  if (!isAdminEmail(user.email)) {
    return { error: "Ingen adgang - kun administratorer kan godkende anmodninger" };
  }

  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: request, error: requestError } = await serviceSupabase
    .from("clinic_creation_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (requestError || !request) {
    return { error: "Anmodning ikke fundet" };
  }

  if (request.status !== "pending") {
    return { error: "Anmodning er allerede behandlet" };
  }

  const { data: existingClinic } = await serviceSupabase
    .from("clinics")
    .select("clinics_id")
    .eq("city_id", request.city_id)
    .ilike("klinikNavn", request.clinic_name)
    .maybeSingle();

  if (existingClinic?.clinics_id) {
    const duplicateReason = "Afvist ved godkendelse: klinikken findes allerede i databasen.";

    await serviceSupabase
      .from("clinic_creation_requests")
      .update({
        status: "rejected",
        admin_notes: duplicateReason,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    const duplicateRejectionEmailResult = await sendClinicRejectionEmailToUser({
      clinic_name: request.clinic_name,
      recipient_email: request.requester_email,
      recipient_name: request.requester_name || undefined,
      rejection_reason: duplicateReason,
    });

    if (!duplicateRejectionEmailResult.success) {
      console.error(
        "Failed to send duplicate clinic rejection email to user:",
        duplicateRejectionEmailResult.error
      );
    }

    return { error: "Klinikken findes allerede. Anmodningen blev markeret som afvist." };
  }

  const parsedPostalCode = Number.parseInt(`${request.postal_code}`, 10);

  const { data: createdClinic, error: createClinicError } = await serviceSupabase
    .from("clinics")
    .insert({
      klinikNavn: request.clinic_name,
      klinikNavnSlug: toSlug(request.clinic_name),
      adresse: request.address,
      postnummer: Number.isNaN(parsedPostalCode) ? null : parsedPostalCode,
      lokation: request.city_name,
      lokationSlug: toSlug(request.city_name),
      city_id: request.city_id,
      website: request.website || null,
      om_os: request.description || null,
      verified_klinik: true,
      verified_email: request.requester_email,
    })
    .select("clinics_id")
    .single();

  if (createClinicError || !createdClinic) {
    console.error("Error creating clinic from request:", createClinicError);
    return { error: "Fejl ved oprettelse af klinikken" };
  }

  const { error: ownershipError } = await serviceSupabase
    .from("clinic_owners")
    .insert({
      user_id: request.user_id,
      clinic_id: createdClinic.clinics_id,
    });

  if (ownershipError) {
    console.error("Error creating ownership for clinic request:", ownershipError);
    return { error: "Klinik oprettet, men ejerskab kunne ikke oprettes automatisk" };
  }

  const { data: allInsurances } = await serviceSupabase
    .from("insurance_companies")
    .select("insurance_id");

  if (allInsurances && allInsurances.length > 0) {
    const insuranceInserts = allInsurances.map((insurance) => ({
      clinic_id: createdClinic.clinics_id,
      insurance_id: insurance.insurance_id,
    }));

    const { error: insuranceError } = await serviceSupabase
      .from("clinic_insurances")
      .insert(insuranceInserts);

    if (insuranceError) {
      console.error("Error setting default insurances for created clinic:", insuranceError);
    }
  }

  const { error: approveError } = await serviceSupabase
    .from("clinic_creation_requests")
    .update({
      status: "approved",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      created_clinic_id: createdClinic.clinics_id,
    })
    .eq("id", requestId);

  if (approveError) {
    console.error("Error updating clinic creation request status:", approveError);
    return { error: "Klinik oprettet, men anmodningens status kunne ikke opdateres" };
  }

  const creationApprovalEmailResult = await sendClinicApprovalEmailToUser({
    clinic_name: request.clinic_name,
    recipient_email: request.requester_email,
    recipient_name: request.requester_name || undefined,
  });

  if (!creationApprovalEmailResult.success) {
    console.error(
      "Failed to send clinic creation approval email to user:",
      creationApprovalEmailResult.error
    );
  }

  const mapsUrl = options?.googleMapsUrl?.trim();
  if (!mapsUrl) {
    return { success: true };
  }

  const googleSync = await syncClinicFromGoogleMapsUrlOnApprove(
    serviceSupabase,
    createdClinic.clinics_id,
    mapsUrl
  );

  return { success: true, googleSync };
}

/**
 * Reject a clinic creation request (admin only)
 */
export async function rejectClinicCreationRequest(requestId: string, notes?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Ikke logget ind" };
  }

  if (!isAdminEmail(user.email)) {
    return { error: "Ingen adgang - kun administratorer kan afvise anmodninger" };
  }

  const rejectionReason = notes?.trim();
  if (!rejectionReason) {
    return { error: "Afvisningsårsag er påkrævet" };
  }

  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: request, error: requestError } = await serviceSupabase
    .from("clinic_creation_requests")
    .select("id, status, clinic_name, requester_email, requester_name")
    .eq("id", requestId)
    .single();

  if (requestError || !request) {
    return { error: "Anmodning ikke fundet" };
  }

  if (request.status !== "pending") {
    return { error: "Anmodning er allerede behandlet" };
  }

  const { error: rejectError } = await serviceSupabase
    .from("clinic_creation_requests")
    .update({
      status: "rejected",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      admin_notes: rejectionReason,
    })
    .eq("id", requestId);

  if (rejectError) {
    console.error("Error rejecting clinic creation request:", rejectError);
    return { error: "Fejl ved afvisning af oprettelses-anmodning" };
  }

  const creationRejectionEmailResult = await sendClinicRejectionEmailToUser({
    clinic_name: request.clinic_name,
    recipient_email: request.requester_email,
    recipient_name: request.requester_name || undefined,
    rejection_reason: rejectionReason,
  });

  if (!creationRejectionEmailResult.success) {
    console.error(
      "Failed to send clinic creation rejection email to user:",
      creationRejectionEmailResult.error
    );
  }

  return { success: true };
}

