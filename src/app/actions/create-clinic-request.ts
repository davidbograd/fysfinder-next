"use server";

import { createClient } from "@/app/utils/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { sendClinicCreationNotificationToAdmins } from "@/lib/email";

const MAX_NAME_LENGTH = 120;
const MAX_ADDRESS_LENGTH = 180;
const MAX_ROLE_LENGTH = 100;
const MAX_PHONE_LENGTH = 40;
const MAX_WEBSITE_LENGTH = 220;
const MAX_DESCRIPTION_LENGTH = 600;

interface ClinicCreationRequestInput {
  clinic_name: string;
  address: string;
  postal_code: string;
  city_id: string;
  city_name: string;
  requester_name: string;
  requester_email: string;
  requester_phone?: string;
  requester_role: string;
  website?: string;
  description?: string;
}

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateInput(input: ClinicCreationRequestInput): string | null {
  if (!input.clinic_name?.trim()) return "Kliniknavn er påkrævet";
  if (!input.address?.trim()) return "Adresse er påkrævet";
  if (!input.postal_code?.trim()) return "Postnummer er påkrævet";
  if (!input.city_id?.trim()) return "By skal vælges";
  if (!input.city_name?.trim()) return "Bynavn mangler";
  if (!input.requester_name?.trim()) return "Fulde navn er påkrævet";
  if (!input.requester_role?.trim()) return "Din rolle i klinikken er påkrævet";
  if (!input.requester_email?.trim()) return "Email er påkrævet";
  if (!isValidEmail(input.requester_email.trim())) return "Indtast en gyldig email";

  if (input.clinic_name.trim().length > MAX_NAME_LENGTH) return "Kliniknavn er for langt";
  if (input.address.trim().length > MAX_ADDRESS_LENGTH) return "Adresse er for lang";
  if (input.requester_role.trim().length > MAX_ROLE_LENGTH) return "Rolle er for lang";
  if (input.requester_phone && input.requester_phone.trim().length > MAX_PHONE_LENGTH) {
    return "Telefonnummer er for langt";
  }
  if (input.website && input.website.trim().length > MAX_WEBSITE_LENGTH) return "Website er for lang";
  if (input.description && input.description.trim().length > MAX_DESCRIPTION_LENGTH) {
    return "Beskrivelse er for lang";
  }

  return null;
}

export async function submitClinicCreationRequest(input: ClinicCreationRequestInput) {
  const validationError = validateInput(input);
  if (validationError) {
    return { error: validationError };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Ikke logget ind" };
  }

  const normalizedClinicName = normalizeText(input.clinic_name);
  const normalizedAddress = normalizeText(input.address);

  const { data: city, error: cityError } = await supabase
    .from("cities")
    .select("id, bynavn")
    .eq("id", input.city_id)
    .single();

  if (cityError || !city) {
    return { error: "By ikke fundet" };
  }

  const { data: existingClinics, error: clinicLookupError } = await supabase
    .from("clinics")
    .select("clinics_id, klinikNavn, adresse")
    .eq("city_id", input.city_id)
    .ilike("klinikNavn", input.clinic_name.trim());

  if (clinicLookupError) {
    console.error("Error checking existing clinics:", clinicLookupError);
    return { error: "Fejl ved validering af klinik" };
  }

  const duplicateClinic = (existingClinics || []).find((clinic) => {
    const sameName = normalizeText(clinic.klinikNavn || "") === normalizedClinicName;
    const sameAddress = normalizeText(clinic.adresse || "") === normalizedAddress;
    return sameName || (sameName && sameAddress);
  });

  if (duplicateClinic) {
    return { error: "Klinikken findes allerede. Prøv i stedet at tage ejerskab af den eksisterende klinik." };
  }

  const { data: existingRequest, error: existingRequestError } = await supabase
    .from("clinic_creation_requests")
    .select("id")
    .eq("user_id", user.id)
    .eq("city_id", input.city_id)
    .eq("clinic_name", input.clinic_name.trim())
    .in("status", ["pending", "approved"])
    .maybeSingle();

  if (existingRequestError) {
    console.error("Error checking existing creation requests:", existingRequestError);
    return { error: "Fejl ved kontrol af eksisterende anmodninger" };
  }

  if (existingRequest) {
    return { error: "Du har allerede indsendt en anmodning for denne klinik" };
  }

  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const payload = {
    user_id: user.id,
    requester_name: input.requester_name.trim(),
    requester_email: input.requester_email.trim(),
    requester_phone: input.requester_phone?.trim() || null,
    requester_role: input.requester_role.trim(),
    clinic_name: input.clinic_name.trim(),
    address: input.address.trim(),
    postal_code: input.postal_code.trim(),
    city_id: city.id,
    city_name: city.bynavn,
    website: input.website?.trim() || null,
    description: input.description?.trim() || null,
    status: "pending",
  };

  const { error: insertError } = await serviceSupabase
    .from("clinic_creation_requests")
    .insert(payload);

  if (insertError) {
    console.error("Clinic creation request insert error:", insertError);
    return { error: "Fejl ved indsendelse af anmodning" };
  }

  const emailResult = await sendClinicCreationNotificationToAdmins({
    clinic_name: payload.clinic_name,
    city_name: payload.city_name,
    address: payload.address,
    postal_code: payload.postal_code,
    requester_name: payload.requester_name,
    requester_email: payload.requester_email,
    requester_phone: payload.requester_phone || undefined,
    requester_role: payload.requester_role,
  });

  if (!emailResult.success) {
    console.error(
      "Failed to send admin clinic creation notification:",
      emailResult.error
    );
  }

  return { success: true };
}

export async function getUserClinicCreationRequests() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Ikke logget ind" };
  }

  const { data, error } = await supabase
    .from("clinic_creation_requests")
    .select(
      "id, clinic_name, address, postal_code, city_name, status, created_at, reviewed_at, admin_notes, created_clinic_id"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching clinic creation requests:", error);
    return { error: "Fejl ved hentning af oprettelses-anmodninger" };
  }

  return { requests: data || [] };
}
