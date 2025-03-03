import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get current file path in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local file
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// Verify environment variables are loaded
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY
) {
  console.error("Missing required environment variables:");
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL:",
    !!process.env.NEXT_PUBLIC_SUPABASE_URL
  );
  console.error(
    "SUPABASE_SERVICE_ROLE_KEY:",
    !!process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  process.exit(1);
}

// Database types
interface Database {
  public: {
    Tables: {
      clinics: {
        Row: {
          clinics_id: string;
          klinikNavn: string;
          adresse: string;
          postnummer: string;
          lokation: string;
          tlf: string | null;
          email: string | null;
          website: string | null;
          google_maps_url_cid: string | null;
          avgRating: number | null;
          ratingCount: number | null;
          mandag: string | null;
          tirsdag: string | null;
          onsdag: string | null;
          torsdag: string | null;
          fredag: string | null;
          lørdag: string | null;
          søndag: string | null;
          parkering: string | null;
          handicapadgang: string | null;
          holdtræning: string | null;
          hjemmetræning: string | null;
          om_os: string | null;
          ydernummer: boolean | null;
          antalBehandlere: number | null;
          førsteKons: number | null;
          opfølgning: number | null;
          city_id: string | null;
        };
      };
      cities: {
        Row: {
          id: string;
          bynavn: string;
        };
      };
    };
  };
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

interface ImportLog {
  skippedClinics: Array<{ name: string; reason: string }>;
  duplicates: Array<{
    name: string;
    action: string;
    updates?: { field: string; oldValue: any; newValue: any }[];
  }>;
  successful: Array<{ name: string; action: "inserted" | "updated" }>;
  errors: Array<{ name: string; error: string }>;
}

interface ClinicData {
  klinikNavn: string;
  adresse: string;
  postnummer: string;
  lokation: string;
  tlf: string | null;
  email: string | null;
  website: string | null;
  google_maps_url_cid: string | null;
  avgRating: number | null;
  ratingCount: number | null;
  mandag: string | null;
  tirsdag: string | null;
  onsdag: string | null;
  torsdag: string | null;
  fredag: string | null;
  lørdag: string | null;
  søndag: string | null;
  parkering: string | null;
  handicapadgang: string | null;
  holdtræning: string | null;
  hjemmetræning: string | null;
  om_os: string | null;
  // Fields that will be set to null for new imports
  ydernummer: null;
  antalBehandlere: null;
  førsteKons: null;
  opfølgning: null;
  // Will be set after city lookup
  city_id: string | null;
}

const importLog: ImportLog = {
  skippedClinics: [],
  duplicates: [],
  successful: [],
  errors: [],
};

function validateRequiredFields(row: any): {
  isValid: boolean;
  missingFields: string[];
} {
  const requiredFields = ["klinikNavn", "adresse", "postnummer"];
  const missingFields = requiredFields.filter((field) => !row[field]);
  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Cleans the address by removing the postal code and everything after it
 * Example inputs and outputs:
 * "Vestre Landevej 67, 6800 Varde, Danmark" → "Vestre Landevej 67"
 * "Gothersgade 137, st, 1123 København, Danmark" → "Gothersgade 137, st"
 * "Jernbanegade 75-77(lok.13, 5500 Middelfart, Danmark" → "Jernbanegade 75-77(lok.13"
 */
function cleanAddress(address: string): string {
  // Match pattern: comma + space + 4 digits
  const match = address.match(/, \d{4}/);
  if (!match) return address;

  // Return everything before the match
  return address.substring(0, match.index);
}

async function processCSV(
  filePath: string,
  limit?: number
): Promise<ClinicData[]> {
  const clinics: ClinicData[] = [];
  let count = 0;

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(parse({ columns: true, delimiter: "," }))
      .on("data", (row: any) => {
        if (limit && count >= limit) {
          return;
        }

        const validation = validateRequiredFields(row);
        if (!validation.isValid) {
          importLog.errors.push({
            name: row.klinikNavn || "Unknown Clinic",
            error: `Missing required fields: ${validation.missingFields.join(
              ", "
            )}`,
          });
          return;
        }

        // Log address cleaning
        const cleanedAddress = cleanAddress(row.adresse);
        console.log(`\nCleaning address for ${row.klinikNavn}:`);
        console.log(`Before: ${row.adresse}`);
        console.log(`After:  ${cleanedAddress}`);

        const clinic: ClinicData = {
          klinikNavn: row.klinikNavn,
          adresse: cleanedAddress,
          postnummer: row.postnummer,
          lokation: "", // Will be set from city data
          tlf: row.tlf || null,
          email: row.email || null,
          website: row.website || null,
          google_maps_url_cid: row.mapsUrl || null,
          avgRating: row.avgRating ? parseFloat(row.avgRating) : null,
          ratingCount: row.ratingCount ? parseInt(row.ratingCount, 10) : null,
          mandag: row.mandag || null,
          tirsdag: row.tirsdag || null,
          onsdag: row.onsdag || null,
          torsdag: row.torsdag || null,
          fredag: row.fredag || null,
          lørdag: row.lørdag || null,
          søndag: row.søndag || null,
          parkering: row.parkering || null,
          handicapadgang: row.handicapadgang || null,
          holdtræning: row.holdtræning || null,
          hjemmetræning: row.hjemmetræning || null,
          om_os: row.om_os || null,
          // Set these to null for new imports
          ydernummer: null,
          antalBehandlere: null,
          førsteKons: null,
          opfølgning: null,
          city_id: null,
        };
        clinics.push(clinic);
        count++;
      })
      .on("end", () => resolve(clinics))
      .on("error", reject);
  });
}

async function importClinics(clinics: ClinicData[]) {
  console.log(`Starting import of ${clinics.length} clinics...`);

  for (const clinic of clinics) {
    try {
      // Find city by postal code
      const { data: cityData } = await supabase
        .from("cities")
        .select("id, bynavn")
        .contains("postal_codes", [clinic.postnummer])
        .single();

      if (!cityData) {
        importLog.skippedClinics.push({
          name: clinic.klinikNavn,
          reason: `No matching city found for postal code ${clinic.postnummer}`,
        });
        continue;
      }

      // Set city_id and lokation from city data
      clinic.city_id = cityData.id;
      clinic.lokation = cityData.bynavn;

      type ExistingClinicData = Pick<
        Database["public"]["Tables"]["clinics"]["Row"],
        | "clinics_id"
        | "klinikNavn"
        | "adresse"
        | "postnummer"
        | "lokation"
        | "tlf"
        | "email"
        | "website"
        | "google_maps_url_cid"
        | "avgRating"
        | "ratingCount"
        | "mandag"
        | "tirsdag"
        | "onsdag"
        | "torsdag"
        | "fredag"
        | "lørdag"
        | "søndag"
        | "parkering"
        | "handicapadgang"
        | "holdtræning"
        | "hjemmetræning"
        | "om_os"
        | "ydernummer"
        | "antalBehandlere"
        | "førsteKons"
        | "opfølgning"
      >;

      // Check if clinic already exists
      const { data: existingClinic } = (await supabase
        .from("clinics")
        .select("*")
        .eq("klinikNavn", clinic.klinikNavn)
        .single()) as { data: ExistingClinicData | null };

      if (existingClinic) {
        const updates: { field: string; oldValue: any; newValue: any }[] = [];
        const updateData: Partial<
          Database["public"]["Tables"]["clinics"]["Row"]
        > = { ...clinic };

        // Compare and log all field changes
        const fieldsToCompare = [
          { key: "adresse" as keyof ExistingClinicData, label: "Address" },
          { key: "tlf" as keyof ExistingClinicData, label: "Phone" },
          { key: "email" as keyof ExistingClinicData, label: "Email" },
          { key: "website" as keyof ExistingClinicData, label: "Website" },
          {
            key: "google_maps_url_cid" as keyof ExistingClinicData,
            label: "Maps URL",
          },
          { key: "avgRating" as keyof ExistingClinicData, label: "Rating" },
          {
            key: "ratingCount" as keyof ExistingClinicData,
            label: "Review Count",
          },
          { key: "mandag" as keyof ExistingClinicData, label: "Monday Hours" },
          {
            key: "tirsdag" as keyof ExistingClinicData,
            label: "Tuesday Hours",
          },
          {
            key: "onsdag" as keyof ExistingClinicData,
            label: "Wednesday Hours",
          },
          {
            key: "torsdag" as keyof ExistingClinicData,
            label: "Thursday Hours",
          },
          { key: "fredag" as keyof ExistingClinicData, label: "Friday Hours" },
          {
            key: "lørdag" as keyof ExistingClinicData,
            label: "Saturday Hours",
          },
          { key: "søndag" as keyof ExistingClinicData, label: "Sunday Hours" },
          { key: "parkering" as keyof ExistingClinicData, label: "Parking" },
          {
            key: "handicapadgang" as keyof ExistingClinicData,
            label: "Accessibility",
          },
          {
            key: "holdtræning" as keyof ExistingClinicData,
            label: "Group Training",
          },
          {
            key: "hjemmetræning" as keyof ExistingClinicData,
            label: "Home Training",
          },
          { key: "om_os" as keyof ExistingClinicData, label: "About Us" },
        ] as const;

        for (const field of fieldsToCompare) {
          const oldValue = existingClinic[field.key];
          const newValue = clinic[field.key as keyof ClinicData];

          // Only log and record changes when the new value is different and not null
          if (newValue !== null && oldValue !== newValue) {
            // Record the change for the log file only
            updates.push({
              field: field.label,
              oldValue: oldValue || "(empty)",
              newValue: newValue,
            });
          }
        }

        // Only update if there are changes
        if (updates.length > 0) {
          // Preserve existing values for these fields
          updateData.ydernummer = existingClinic.ydernummer;
          updateData.antalBehandlere = existingClinic.antalBehandlere;
          updateData.førsteKons = existingClinic.førsteKons;
          updateData.opfølgning = existingClinic.opfølgning;

          const { error: updateError } = await supabase
            .from("clinics")
            .update(updateData)
            .eq("clinics_id", existingClinic.clinics_id);

          if (updateError) {
            throw updateError;
          }

          importLog.duplicates.push({
            name: clinic.klinikNavn,
            action: "updated",
            updates,
          });
        } else {
          importLog.duplicates.push({
            name: clinic.klinikNavn,
            action: "no changes",
            updates: [],
          });
        }
      } else {
        const { error: insertError } = await supabase
          .from("clinics")
          .insert([clinic]);

        if (insertError) {
          throw insertError;
        }

        importLog.successful.push({
          name: clinic.klinikNavn,
          action: "inserted",
        });
      }
    } catch (error) {
      importLog.errors.push({
        name: clinic.klinikNavn,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

async function main() {
  try {
    const csvPath = path.join(
      __dirname,
      "../data/Google Maps API data Feb 2025 - cleaned-data-feb2025-api-data.csv"
    );

    console.log("Processing all clinics from CSV file...");
    const clinics = await processCSV(csvPath); // Remove the limit to process all clinics

    console.log(`Found ${clinics.length} clinics in CSV`);
    await importClinics(clinics);

    // Generate timestamp for the log file
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const logPath = path.join(
      __dirname,
      `../data/import-log-${timestamp}.json`
    );
    fs.writeFileSync(logPath, JSON.stringify(importLog, null, 2));

    console.log("\nImport Summary:");
    console.log(`- Successfully imported: ${importLog.successful.length}`);
    console.log(`- Duplicates handled: ${importLog.duplicates.length}`);
    console.log(`- Skipped clinics: ${importLog.skippedClinics.length}`);
    console.log(`- Errors: ${importLog.errors.length}`);
    console.log(
      `\nDetailed log has been written to: data/import-log-${timestamp}.json`
    );
  } catch (error) {
    console.error("Error during import:", error);
    process.exit(1);
  }
}

main();
