import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Type for the response
type ResponseData = {
  success?: boolean;
  error?: string;
  message?: string;
};

interface TallyOption {
  id: string;
  text: string;
}

interface TallyField {
  key: string;
  type: string;
  label: string;
  value: any;
  options?: TallyOption[];
}

function formatPhoneNumber(phone: string | null): string | null {
  if (!phone) return null;

  // Remove any whitespace
  const cleaned = phone.trim();

  // Skip if empty after trim
  if (!cleaned) return null;

  // Check if it's a Danish number (starts with +45)
  if (cleaned.startsWith("+45")) {
    // Remove +45 and format the remaining 8 digits
    const numbers = cleaned.substring(3); // Remove +45
    // Insert spaces after every 2 digits
    return numbers.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
  }

  // For non-Danish numbers, return as is
  return cleaned;
}

function formatWebsiteUrl(url: string | null): string | null {
  if (!url) return null;

  // Remove whitespace
  let formatted = url.trim();

  // Skip if empty after trim
  if (!formatted) return null;

  // Force https:// and remove www.
  formatted = formatted
    .replace(/^https?:\/\//, "") // Remove any existing protocol
    .replace(/^www\./, ""); // Remove www.

  // Add https://
  formatted = `https://${formatted}`;

  return formatted;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Log all incoming requests
  console.log("Webhook received:", {
    method: req.method,
    headers: req.headers,
    body: req.body,
  });

  // Only allow POST requests
  if (req.method !== "POST") {
    console.log("Method not allowed:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Optional: Add webhook security verification
    // const tallySignature = req.headers['x-tally-signature'];
    // if (!verifyTallySignature(tallySignature, req.body)) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

    const tallyData = req.body;
    console.log("Tally data received:", JSON.stringify(tallyData, null, 2));

    if (!tallyData?.data?.fields) {
      console.log("Invalid request body:", tallyData);
      return res.status(400).json({
        error: "Invalid request body",
        message: "Request body must contain Tally form data",
      });
    }

    // Extract fields into a more manageable format
    const fields = tallyData.data.fields as TallyField[];
    const getValue = (label: string) =>
      fields.find((f) => f.label === label)?.value;

    // Get services
    const servicesField = fields.find(
      (f) => f.label === "Hvilke ekstra ydelser har klinikken?"
    );
    const services =
      servicesField?.value
        ?.map((id: string) => {
          // Find the option text for this ID
          const option = servicesField.options?.find((opt) => opt.id === id);
          return option?.text;
        })
        .filter(Boolean) || [];

    // Get excluded insurances
    const excludedInsurancesField = fields.find(
      (f) =>
        f.label === "Er der nogle forsikringsselskaber, I IKKE samarbejder med?"
    );
    const excludedInsurances =
      excludedInsurancesField?.value
        ?.map((id: string) => {
          // Find the option text for this ID
          const option = excludedInsurancesField.options?.find(
            (opt) => opt.id === id
          );
          return option?.text;
        })
        .filter(Boolean) || [];

    // Get specialties from multi-select
    const specialtiesField = fields.find(
      (f) => f.label === "Hvilke specialer har klinikken? (Max 10 kan vælges)"
    );
    const specialties =
      specialtiesField?.value
        ?.map((id: string) => {
          // Find the option text for this ID
          const option = specialtiesField.options?.find((opt) => opt.id === id);
          return option?.text;
        })
        .filter(Boolean) || [];

    // Get ydernummer value
    const ydernummerField = fields.find(
      (f) => f.label === "Har klinikken ydernummer?"
    );
    // Log ydernummer field data
    console.log("Ydernummer field data:", {
      value: ydernummerField?.value,
      options: ydernummerField?.options,
    });
    const ydernummerValue = ydernummerField?.value?.some((id: string) => {
      const option = ydernummerField.options?.find((opt) => opt.id === id);
      return option?.text === "Ja";
    });

    // Get handicap access value
    const handicapField = fields.find(
      (f) => f.label === "Har klinikken handicapadgang?"
    );
    // Log handicap field data
    console.log("Handicap field data:", {
      value: handicapField?.value,
      options: handicapField?.options,
    });
    const handicapValue = handicapField?.value?.some((id: string) => {
      const option = handicapField.options?.find((opt) => opt.id === id);
      return option?.text === "Ja";
    });

    // Get group training value
    const holdtraeningField = fields.find(
      (f) => f.label === "Har klinikken holdtræning?"
    );
    // Log holdtraening field data
    console.log("Holdtraening field data:", {
      value: holdtraeningField?.value,
      options: holdtraeningField?.options,
    });
    const holdtraeningValue = holdtraeningField?.value?.some((id: string) => {
      const option = holdtraeningField.options?.find((opt) => opt.id === id);
      return option?.text === "Ja";
    });

    // Get clinic name
    const klinikNavn = getValue("Klinik navn");

    console.log("========== CLINIC MATCHING ==========");
    console.log("Searching for clinic:", klinikNavn);

    // Normalize the clinic name for matching
    const normalizedName = klinikNavn
      ?.toLowerCase()
      .replace(/[^a-zæøå0-9]/g, ""); // Remove special characters, keep Danish letters

    console.log("Normalized name for matching:", normalizedName);

    // Check for existing clinic with similar name
    const { data: existingClinics, error: matchError } = await supabase
      .from("clinics")
      .select("clinics_id, klinikNavn")
      .neq("klinikNavn", ""); // Ensure we don't match empty names

    let matchedClinic: { clinics_id: string; klinikNavn: string } | null = null;

    if (matchError) {
      console.error("Error checking for existing clinic:", matchError);
    } else {
      console.log(
        "Number of clinics to check against:",
        existingClinics?.length || 0
      );

      // Find best match by comparing normalized names
      const match = existingClinics?.find((clinic) => {
        const normalizedExisting = clinic.klinikNavn
          ?.toLowerCase()
          .replace(/[^a-zæøå0-9]/g, "");

        const isMatch = normalizedName === normalizedExisting;
        if (isMatch) {
          console.log("Found match!");
          console.log("Original submitted name:", klinikNavn);
          console.log("Matched with existing clinic:", clinic.klinikNavn);
          console.log("Clinic ID:", clinic.clinics_id);
        }
        return isMatch;
      });

      if (match) {
        matchedClinic = match;
      } else {
        console.log("No matching clinic found in database");
      }
    }
    console.log("===================================");

    // Insert structured data into staging
    console.log("Attempting to insert into Supabase...");

    // Log optional fields for debugging
    console.log("Optional fields:", {
      email: getValue("Kontakt email (til booking)"),
      website: formatWebsiteUrl(getValue("Link til hjemmeside")),
    });

    const { data, error } = await supabase
      .from("clinic_submissions_staging")
      .insert({
        tally_submission_id: tallyData.eventId,
        submitted_at: new Date().toISOString(),
        raw_data: tallyData,
        // Structured data
        klinik_navn: klinikNavn,
        email: getValue("Kontakt email (til booking)"),
        telefon: formatPhoneNumber(getValue("Telefon nummer")),
        website: formatWebsiteUrl(getValue("Link til hjemmeside")),
        adresse: getValue("Adresse på klinikken"),
        postnummer: parseInt(getValue("Postnummer") || "0"),
        ydernummer: ydernummerValue,
        forste_konsultation_pris: parseInt(
          getValue("Pris for første konsultation?") || "0"
        ),
        normal_konsultation_pris: parseInt(
          getValue("Pris for normal konsultation?") || "0"
        ),
        handicap_adgang: handicapValue,
        holdtraening: holdtraeningValue,
        om_klinikken: getValue(
          'Skriv en "Om klinikken" tekst til jeres kunder. Max 320 karakterer (omkring 4 linjer)'
        ),
        services: services,
        specialties: specialties,
        excluded_insurances: excludedInsurances,
        // Update tracking
        matched_clinic_id: matchedClinic?.clinics_id || null,
        is_update: !!matchedClinic,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insertion error:", error);
      return res.status(500).json({
        error: "Database error",
        message: "Failed to store submission",
      });
    }

    console.log("Successfully inserted data:", data);
    console.log(`Successfully processed submission: ${tallyData.eventId}`);

    // Return success
    return res.status(200).json({
      success: true,
      message: "Submission processed successfully",
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Webhook processing error:", error);

    // Return error response
    return res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred while processing the submission",
    });
  }
}
