require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const Papa = require("papaparse");
const fs = require("fs");
const path = require("path");

// To run this script, run:
// npx ts-node scripts/import-specialties.ts

// Define types
interface Clinic {
  clinics_id: string;
  klinikNavn: string;
}

interface Specialty {
  specialty_id: string;
  specialty_name: string;
  parent_id: string | null;
}

interface CsvRow {
  clinicName: string;
  specialties: string;
}

interface RawCsvRow {
  clinicName: string;
  specialties: string;
  [key: string]: string;
}

interface ParseResult {
  data: RawCsvRow[];
  errors: any[];
  meta: any;
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function importSpecialties() {
  try {
    const failedRows: {
      rowNumber: number;
      clinicName: string;
      reason: string;
    }[] = [];

    // Step 1: Read and parse CSV
    const fileContent = fs.readFileSync(
      path.join(process.cwd(), "data", "specialties.csv"),
      "utf-8"
    );

    const { data } = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    }) as ParseResult;

    const csvData: CsvRow[] = data.map((row: RawCsvRow) => ({
      clinicName: row.clinicName.trim(),
      specialties: row.specialties.trim(),
    }));

    // Step 2: Get all clinics from Supabase
    const { data: clinics, error: clinicsError } = await supabase
      .from("clinics")
      .select("clinics_id, klinikNavn");

    if (clinicsError) throw clinicsError;

    // Step 3: Get all specialties from Supabase
    const { data: specialties, error: specialtiesError } = await supabase
      .from("specialties")
      .select("specialty_id, specialty_name, parent_id");

    if (specialtiesError) throw specialtiesError;

    // Step 4: Process each row and create clinic-specialty associations
    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      const rowNumber = i + 2; // Adding 2 because: 1 for 0-based index, 1 for header row

      // Find clinic ID
      const clinic = clinics.find(
        (c: Clinic) => c.klinikNavn === row.clinicName
      );
      if (!clinic) {
        failedRows.push({
          rowNumber,
          clinicName: row.clinicName,
          reason: "Clinic not found",
        });
        continue;
      }

      // Process specialties
      const specialtyNames = row.specialties.split(",").map((s) => s.trim());
      let hasSpecialtyError = false;

      for (const specialtyName of specialtyNames) {
        const specialty = specialties.find(
          (s: Specialty) =>
            s.specialty_name.toLowerCase() === specialtyName.toLowerCase()
        );

        if (!specialty) {
          hasSpecialtyError = true;
          failedRows.push({
            rowNumber,
            clinicName: row.clinicName,
            reason: `Specialty not found: ${specialtyName}`,
          });
          continue;
        }

        // Insert into clinic_specialties table
        const { error: insertError } = await supabase
          .from("clinic_specialties")
          .upsert(
            {
              clinics_id: clinic.clinics_id,
              specialty_id: specialty.specialty_id,
            },
            {
              onConflict: "clinics_id,specialty_id",
            }
          );

        if (insertError) {
          hasSpecialtyError = true;
          failedRows.push({
            rowNumber,
            clinicName: row.clinicName,
            reason: `Insert error for specialty ${specialtyName}: ${insertError.message}`,
          });
        } else {
          console.log(`Added ${specialtyName} to ${row.clinicName}`);
        }
      }
    }

    // Print summary
    console.log("\n=== Import Summary ===");
    console.log(`Total rows processed: ${csvData.length}`);
    console.log(`Failed rows: ${failedRows.length}`);
    console.log(
      `Success rate: ${(
        ((csvData.length - failedRows.length) / csvData.length) *
        100
      ).toFixed(2)}%`
    );

    if (failedRows.length > 0) {
      console.log("\n=== Failed Rows Details ===");
      failedRows.forEach(({ rowNumber, clinicName, reason }) => {
        console.log(`Row ${rowNumber}: "${clinicName}" - ${reason}`);
      });
    }

    console.log("\nImport completed!");
  } catch (error) {
    console.error("Import failed:", error);
  }
}

// Run the import
importSpecialties();
