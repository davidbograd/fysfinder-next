"use server";

import { createClient } from "@/app/utils/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-config";

/**
 * Get all clinics owned by the current user
 */
export async function getOwnedClinics() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Ikke logget ind" };
  }

  // Get owned clinics via clinic_owners table
  const { data: ownerships, error: ownershipError } = await supabase
    .from("clinic_owners")
    .select(
      `
      clinic_id,
      clinics:clinic_id (
        clinics_id,
        klinikNavn,
        klinikNavnSlug,
        lokation,
        adresse,
        postnummer,
        email,
        tlf,
        website,
        verified_klinik
      )
    `
    )
    .eq("user_id", user.id);

  if (ownershipError) {
    console.error("Error fetching owned clinics:", ownershipError);
    return { error: "Fejl ved hentning af klinikker" };
  }

  const clinics =
    ownerships?.map((ownership: any) => {
      const clinic = Array.isArray(ownership.clinics)
        ? ownership.clinics[0]
        : ownership.clinics;
      return clinic;
    }) || [];

  return { clinics: clinics.filter(Boolean) };
}

/**
 * Get a single clinic for editing (only if user owns it)
 */
export async function getClinicForEdit(clinicId: string) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Ikke logget ind" };
  }

  // Check ownership
  const { data: ownership, error: ownershipError } = await supabase
    .from("clinic_owners")
    .select("clinic_id")
    .eq("user_id", user.id)
    .eq("clinic_id", clinicId)
    .single();

  if (ownershipError || !ownership) {
    return { error: "Du ejer ikke denne klinik" };
  }

  // Get clinic with specialties and insurances
  const { data: clinic, error: clinicError } = await supabase
    .from("clinics")
    .select(
      `
      clinics_id,
      klinikNavn,
      lokation,
      adresse,
      postnummer,
      email,
      tlf,
      website,
      mandag,
      tirsdag,
      onsdag,
      torsdag,
      fredag,
      lørdag,
      søndag,
      hjemmetræning,
      holdtræning,
      parkering,
      handicapadgang,
      ydernummer,
      antalBehandlere,
      førsteKons,
      opfølgning,
      første_kons_minutter,
      opfølgning_minutter,
      om_os,
      online_fysioterapeut,
      ikkeAkutVentetidUger,
      vederlagsfriVentetidUger,
      clinic_specialties (
        specialty_id,
        specialty:specialty_id (
          specialty_id,
          specialty_name
        )
      ),
      clinic_insurances (
        insurance_id,
        insurance:insurance_id (
          insurance_id,
          insurance_name
        )
      )
    `
    )
    .eq("clinics_id", clinicId)
    .single();

  if (clinicError) {
    console.error("Error fetching clinic:", clinicError);
    return { error: "Fejl ved hentning af klinik" };
  }

  return { clinic };
}

/**
 * Update clinic data (only if user owns it)
 */
export async function updateClinic(
  clinicId: string,
  data: {
    adresse?: string;
    email?: string;
    tlf?: string;
    website?: string;
    lokation?: string;
    mandag?: string;
    tirsdag?: string;
    onsdag?: string;
    torsdag?: string;
    fredag?: string;
    lørdag?: string;
    søndag?: string;
    hjemmetræning?: string;
    holdtræning?: string;
    parkering?: string;
    handicapadgang?: boolean;
    ydernummer?: boolean;
    antalBehandlere?: number;
    førsteKons?: string;
    opfølgning?: string;
    første_kons_minutter?: number;
    opfølgning_minutter?: number;
    om_os?: string;
    online_fysioterapeut?: boolean;
    ikkeAkutVentetidUger?: number;
    vederlagsfriVentetidUger?: number;
  }
) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Ikke logget ind" };
  }

  // Check ownership
  const { data: ownership, error: ownershipError } = await supabase
    .from("clinic_owners")
    .select("clinic_id")
    .eq("user_id", user.id)
    .eq("clinic_id", clinicId)
    .single();

  if (ownershipError || !ownership) {
    return { error: "Du ejer ikke denne klinik" };
  }

  // Update clinic using service role (since RLS might block)
  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: updateError } = await serviceSupabase
    .from("clinics")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("clinics_id", clinicId);

  if (updateError) {
    console.error("Error updating clinic:", updateError);
    return { error: "Fejl ved opdatering af klinik" };
  }

  // Fetch clinic slug for cache invalidation
  const { data: clinicData } = await serviceSupabase
    .from("clinics")
    .select("klinikNavnSlug")
    .eq("clinics_id", clinicId)
    .single();

  // Revalidate cache tags (runs server-side, no token needed!)
  try {
    updateTag(CACHE_TAGS.clinic(clinicId));
    if (clinicData?.klinikNavnSlug) {
      updateTag(CACHE_TAGS.clinicBySlug(clinicData.klinikNavnSlug));
    }
    updateTag(CACHE_TAGS.ALL_CLINICS);
  } catch (revalidateError) {
    // Log but don't fail the operation
    console.error("Cache revalidation failed:", revalidateError);
  }

  return { success: true };
}

/**
 * Update clinic specialties (max 10, only if user owns clinic)
 */
export async function updateClinicSpecialties(
  clinicId: string,
  specialtyIds: string[]
) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Ikke logget ind" };
  }

  // Check ownership
  const { data: ownership, error: ownershipError } = await supabase
    .from("clinic_owners")
    .select("clinic_id")
    .eq("user_id", user.id)
    .eq("clinic_id", clinicId)
    .single();

  if (ownershipError || !ownership) {
    return { error: "Du ejer ikke denne klinik" };
  }

  // Validate limit
  if (specialtyIds.length > 10) {
    return { error: "Maksimum 10 specialiteter tilladt" };
  }

  // Use service role for updates
  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Delete existing specialties
  const { error: deleteError } = await serviceSupabase
    .from("clinic_specialties")
    .delete()
    .eq("clinics_id", clinicId);

  if (deleteError) {
    console.error("Error deleting specialties:", deleteError);
    return { error: "Fejl ved opdatering af specialiteter" };
  }

  // Insert new specialties
  if (specialtyIds.length > 0) {
    const inserts = specialtyIds.map((specialtyId) => ({
      clinics_id: clinicId,
      specialty_id: specialtyId,
    }));

    const { error: insertError } = await serviceSupabase
      .from("clinic_specialties")
      .insert(inserts);

    if (insertError) {
      console.error("Error inserting specialties:", insertError);
      return { error: "Fejl ved opdatering af specialiteter" };
    }
  }

  // Fetch clinic slug for cache invalidation
  const { data: clinicData } = await serviceSupabase
    .from("clinics")
    .select("klinikNavnSlug")
    .eq("clinics_id", clinicId)
    .single();

  // Immediately expire cache tags (read-your-own-writes)
  try {
    updateTag(CACHE_TAGS.clinic(clinicId));
    if (clinicData?.klinikNavnSlug) {
      updateTag(CACHE_TAGS.clinicBySlug(clinicData.klinikNavnSlug));
    }
    updateTag(CACHE_TAGS.ALL_CLINICS);
  } catch (revalidateError) {
    console.error("Cache revalidation failed:", revalidateError);
  }

  return { success: true };
}

/**
 * Update clinic insurances (only if user owns clinic)
 */
export async function updateClinicInsurances(
  clinicId: string,
  insuranceIds: string[]
) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Ikke logget ind" };
  }

  // Check ownership
  const { data: ownership, error: ownershipError } = await supabase
    .from("clinic_owners")
    .select("clinic_id")
    .eq("user_id", user.id)
    .eq("clinic_id", clinicId)
    .single();

  if (ownershipError || !ownership) {
    return { error: "Du ejer ikke denne klinik" };
  }

  // Use service role for updates
  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Delete existing insurances
  const { error: deleteError } = await serviceSupabase
    .from("clinic_insurances")
    .delete()
    .eq("clinic_id", clinicId);

  if (deleteError) {
    console.error("Error deleting insurances:", deleteError);
    return { error: "Fejl ved opdatering af forsikringer" };
  }

  // Insert new insurances
  if (insuranceIds.length > 0) {
    const inserts = insuranceIds.map((insuranceId) => ({
      clinic_id: clinicId,
      insurance_id: insuranceId,
    }));

    const { error: insertError } = await serviceSupabase
      .from("clinic_insurances")
      .insert(inserts);

    if (insertError) {
      console.error("Error inserting insurances:", insertError);
      return { error: "Fejl ved opdatering af forsikringer" };
    }
  }

  // Fetch clinic slug for cache invalidation
  const { data: clinicData } = await serviceSupabase
    .from("clinics")
    .select("klinikNavnSlug")
    .eq("clinics_id", clinicId)
    .single();

  // Immediately expire cache tags (read-your-own-writes)
  try {
    updateTag(CACHE_TAGS.clinic(clinicId));
    if (clinicData?.klinikNavnSlug) {
      updateTag(CACHE_TAGS.clinicBySlug(clinicData.klinikNavnSlug));
    }
    updateTag(CACHE_TAGS.ALL_CLINICS);
  } catch (revalidateError) {
    console.error("Cache revalidation failed:", revalidateError);
  }

  return { success: true };
}

/**
 * Get all specialties for the form
 */
export async function getAllSpecialties() {
  const supabase = await createClient();

  const { data: specialties, error } = await supabase
    .from("specialties")
    .select("specialty_id, specialty_name")
    .order("specialty_name");

  if (error) {
    console.error("Error fetching specialties:", error);
    return { error: "Fejl ved hentning af specialiteter" };
  }

  return { specialties: specialties || [] };
}

/**
 * Get all insurance companies for the form
 */
export async function getAllInsurances() {
  const supabase = await createClient();

  const { data: insurances, error } = await supabase
    .from("insurance_companies")
    .select("insurance_id, insurance_name")
    .order("insurance_name");

  if (error) {
    console.error("Error fetching insurances:", error);
    return { error: "Fejl ved hentning af forsikringer" };
  }

  return { insurances: insurances || [] };
}

/**
 * Get team members for a clinic (only if user owns it)
 */
export async function getClinicTeamMembers(clinicId: string) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Ikke logget ind" };
  }

  // Check ownership
  const { data: ownership, error: ownershipError } = await supabase
    .from("clinic_owners")
    .select("clinic_id")
    .eq("user_id", user.id)
    .eq("clinic_id", clinicId)
    .single();

  if (ownershipError || !ownership) {
    return { error: "Du ejer ikke denne klinik" };
  }

  // Get team members
  const { data: teamMembers, error } = await supabase
    .from("clinic_team_members")
    .select("id, name, role, image_url, display_order")
    .eq("clinic_id", clinicId)
    .order("display_order");

  if (error) {
    console.error("Error fetching team members:", error);
    return { error: "Fejl ved hentning af behandlere" };
  }

  return { teamMembers: teamMembers || [] };
}

/**
 * Update team members for a clinic (only if user owns it)
 */
export async function updateClinicTeamMembers(
  clinicId: string,
  teamMembers: Array<{
    id?: string;
    name: string;
    role: string;
    image_url: string;
    display_order: number;
  }>
) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Ikke logget ind" };
  }

  // Check ownership
  const { data: ownership, error: ownershipError } = await supabase
    .from("clinic_owners")
    .select("clinic_id")
    .eq("user_id", user.id)
    .eq("clinic_id", clinicId)
    .single();

  if (ownershipError || !ownership) {
    return { error: "Du ejer ikke denne klinik" };
  }

  // Use service role for updates
  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Delete all existing team members
  const { error: deleteError } = await serviceSupabase
    .from("clinic_team_members")
    .delete()
    .eq("clinic_id", clinicId);

  if (deleteError) {
    console.error("Error deleting team members:", deleteError);
    return { error: "Fejl ved opdatering af behandlere" };
  }

  // Insert new team members
  if (teamMembers.length > 0) {
    const inserts = teamMembers.map((member) => ({
      clinic_id: clinicId,
      name: member.name,
      role: member.role,
      image_url: member.image_url,
      display_order: member.display_order,
    }));

    const { error: insertError } = await serviceSupabase
      .from("clinic_team_members")
      .insert(inserts);

    if (insertError) {
      console.error("Error inserting team members:", insertError);
      return { error: "Fejl ved opdatering af behandlere" };
    }
  }

  // Fetch clinic slug for cache invalidation
  const { data: clinicData } = await serviceSupabase
    .from("clinics")
    .select("klinikNavnSlug")
    .eq("clinics_id", clinicId)
    .single();

  // Immediately expire cache tags (read-your-own-writes)
  try {
    updateTag(CACHE_TAGS.clinic(clinicId));
    if (clinicData?.klinikNavnSlug) {
      updateTag(CACHE_TAGS.clinicBySlug(clinicData.klinikNavnSlug));
    }
    updateTag(CACHE_TAGS.ALL_CLINICS);
  } catch (revalidateError) {
    console.error("Cache revalidation failed:", revalidateError);
  }

  return { success: true };
}

/**
 * Unclaim a clinic (remove ownership, only if user owns it)
 */
export async function unclaimClinic(clinicId: string) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Ikke logget ind" };
  }

  // Check ownership
  const { data: ownership, error: ownershipError } = await supabase
    .from("clinic_owners")
    .select("clinic_id")
    .eq("user_id", user.id)
    .eq("clinic_id", clinicId)
    .single();

  if (ownershipError || !ownership) {
    return { error: "Du ejer ikke denne klinik" };
  }

  // Delete ownership record using service role
  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: deleteError } = await serviceSupabase
    .from("clinic_owners")
    .delete()
    .eq("user_id", user.id)
    .eq("clinic_id", clinicId);

  if (deleteError) {
    console.error("Error unclaiming clinic:", deleteError);
    return { error: "Fejl ved fjernelse af ejerskab" };
  }

  return { success: true };
}

