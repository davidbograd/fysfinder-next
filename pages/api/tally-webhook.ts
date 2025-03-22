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
      (f) => f.label === "Hvilke af disse ekstra ydelser har klinikken?"
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
    const ydernummerValue =
      ydernummerField?.value?.[0] === "433b7074-8f56-4822-9cab-048b50dc435b"; // This is the ID for "Ja"

    // Get handicap access value
    const handicapField = fields.find(
      (f) => f.label === "Har klinikken handicapadgang?"
    );
    const handicapValue =
      handicapField?.value?.[0] === "c052f6e7-fe52-4f37-a26a-ec9608de2663"; // This is the ID for "Ja"

    // Get group training value
    const holdtraeningField = fields.find(
      (f) => f.label === "Har klinikken holdtræning?"
    );
    const holdtraeningValue =
      holdtraeningField?.value?.[0] === "6960b2b1-f6e8-4f0d-905b-876f6e974842"; // This is the ID for "Ja"

    // Insert structured data into staging
    console.log("Attempting to insert into Supabase...");
    const { data, error } = await supabase
      .from("clinic_submissions_staging")
      .insert([
        {
          tally_submission_id: tallyData.eventId,
          submitted_at: new Date().toISOString(),
          raw_data: tallyData, // Keep raw data for reference
          // Structured data
          klinik_navn: getValue("Klinik navn"),
          email: getValue("Kontakt email (til booking)"),
          telefon: getValue("Telefon nummer"),
          website: getValue("Link til hjemmeside"),
          adresse: getValue("Adresse på klinikken"),
          postnummer: getValue("Postnummer"),
          ydernummer: ydernummerValue,
          forste_konsultation_pris: getValue(
            "Prisen for en første konsultation?"
          ),
          normal_konsultation_pris: getValue(
            "Prisen for en normal konsultation"
          ),
          handicap_adgang: handicapValue,
          holdtraening: holdtraeningValue,
          om_klinikken: getValue(
            'Skriv en "Om klinikken" tekst til jeres kunder. Max 320 karakterer (omkring 4 linjer)'
          ),
          services: services,
          specialties: specialties,
          excluded_insurances: excludedInsurances,
          verified: false,
        },
      ]);

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
