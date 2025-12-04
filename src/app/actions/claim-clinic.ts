"use server";

import { createClient } from "@/app/utils/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

// Search clinics by city
export async function searchClinicsByCity(citySlug: string) {
  const supabase = await createClient();

  try {
    // First get the city
    const { data: cityData, error: cityError } = await supabase
      .from("cities")
      .select("id, bynavn")
      .eq("bynavn_slug", citySlug)
      .single();

    if (cityError || !cityData) {
      return { error: "By ikke fundet" };
    }

    // Get clinics in that city
    const { data: clinics, error: clinicsError } = await supabase
      .from("clinics")
      .select(
        "clinics_id, klinikNavn, adresse, postnummer, lokation, verified_klinik"
      )
      .eq("city_id", cityData.id)
      .order("klinikNavn");

    if (clinicsError) {
      return { error: "Fejl ved hentning af klinikker" };
    }

    return { clinics: clinics || [] };
  } catch (error) {
    console.error("Search clinics error:", error);
    return { error: "Uventet fejl" };
  }
}

// Submit clinic claim
export async function submitClinicClaim(data: {
  clinic_id: string;
  klinik_navn: string;
  job_titel: string;
  fulde_navn: string;
  email: string;
  telefon: string;
}) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Ikke logget ind" };
  }

  // Check if clinic is already verified
  const { data: clinic, error: clinicError } = await supabase
    .from("clinics")
    .select("verified_klinik")
    .eq("clinics_id", data.clinic_id)
    .single();

  if (clinicError) {
    return { error: "Klinik ikke fundet" };
  }

  if (clinic.verified_klinik) {
    return { error: "Denne klinik er allerede verificeret og kan ikke claims" };
  }

  // Check if user has already submitted a claim for this clinic
  const { data: existingClaim, error: existingClaimError } = await supabase
    .from("clinic_claims")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("clinic_id", data.clinic_id)
    .in("status", ["pending", "approved"]) // Only check pending or approved claims
    .maybeSingle();

  if (existingClaimError) {
    console.error("Error checking existing claims:", existingClaimError);
  }

  if (existingClaim) {
    if (existingClaim.status === "approved") {
      return { error: "Du ejer allerede denne klinik" };
    } else {
      return { error: "Du har allerede indsendt en anmodning for denne klinik" };
    }
  }

  // Use service role to insert claim (bypasses RLS)
  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: claimError } = await serviceSupabase
    .from("clinic_claims")
    .insert({
      user_id: user.id,
      clinic_id: data.clinic_id,
      klinik_navn: data.klinik_navn,
      job_titel: data.job_titel,
      fulde_navn: data.fulde_navn,
      email: data.email,
      telefon: data.telefon,
      status: "pending",
    });

  if (claimError) {
    console.error("Claim submission error:", claimError);
    return { error: "Fejl ved indsendelse af claim" };
  }

  return { success: true };
}

