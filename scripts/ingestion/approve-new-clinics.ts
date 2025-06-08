// Approve New Clinics Script
// Allows manual approval of potential new clinics and adds specialties to matched existing clinics

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import * as readline from "readline";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "../../.env.local") });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ReviewRecord {
  id: string;
  raw_data: any;
  match_confidence: number;
  batch_id: string;
}

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  let batchId = "";

  for (const arg of args) {
    if (arg.startsWith("--batch-id=")) {
      batchId = arg.split("=")[1];
    }
  }

  if (!batchId) {
    console.error(
      "Usage: npm run approve:new-clinics -- --batch-id=<batch-uuid>"
    );
    console.error("\nTo find batches with potential new clinics:");
    console.error("npm run list:new-clinics");
    process.exit(1);
  }

  console.log("🏥 Starting approval process for potential new clinics...");
  console.log(`📦 Batch ID: ${batchId}`);

  try {
    await approveNewClinics(batchId);
    console.log("\n✅ Approval process completed!");
  } catch (error) {
    console.error("❌ Approval process failed:", error);
    process.exit(1);
  }
}

async function approveNewClinics(batchId: string): Promise<void> {
  // Get potential new clinics from the batch
  const { data: records, error } = await supabase
    .from("data_ingestion_records")
    .select("id, raw_data, match_confidence, batch_id")
    .eq("batch_id", batchId)
    .eq("status", "pending")
    .order("match_confidence", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch records: ${error.message}`);
  }

  if (!records || records.length === 0) {
    console.log("✅ No potential new clinics found in this batch.");
    return;
  }

  console.log(
    `\n🔍 Found ${records.length} potential new clinics for review:\n`
  );

  // Load source configuration
  const { data: batchInfo } = await supabase
    .from("data_ingestion_batches")
    .select("source_name")
    .eq("id", batchId)
    .single();

  const config = await loadSourceConfig(batchInfo?.source_name || "parkinsons");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let approved = 0;
  let rejected = 0;
  let skipped = 0;

  try {
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const data = record.raw_data;
      const confidence = (record.match_confidence * 100).toFixed(1);

      console.log(`\n${"=".repeat(70)}`);
      console.log(`🏥 POTENTIAL NEW CLINIC`);
      console.log(`📍 Progress: ${i + 1}/${records.length}`);
      console.log(`${"=".repeat(70)}`);

      console.log(`\n📝 Clinic Details:`);
      console.log(`   Name: ${data.klinikNavn}`);
      console.log(
        `   Address: ${data.adresse || "N/A"}, ${data.postnummer || "N/A"} ${
          data.by || ""
        }`
      );
      console.log(`   Phone: ${data.tlf || "N/A"}`);
      console.log(`   Email: ${data.email || "N/A"}`);
      console.log(`   Website: ${data.website || "N/A"}`);
      console.log(`   Match confidence: ${confidence}%`);

      console.log(`\n📋 Options:`);
      console.log(`   [y] Approve - Find existing clinic and add specialty`);
      console.log(`   [n] Reject - Not a valid clinic for our platform`);
      console.log(`   [s] Skip for now`);
      console.log(`   [q] Quit approval process`);

      const answer = await askQuestion(rl, "\nChoice: ");

      switch (answer.toLowerCase()) {
        case "y":
        case "yes":
          await approveRecord(record, config);
          approved++;
          console.log(
            "✅ Approved - will search for existing clinic and add specialty"
          );
          break;
        case "n":
        case "no":
          await rejectRecord(record.id);
          rejected++;
          console.log("❌ Rejected - marked as not suitable for platform");
          break;
        case "s":
        case "skip":
          skipped++;
          console.log("⏭️  Skipped for later review");
          break;
        case "q":
        case "quit":
          console.log("👋 Exiting approval process...");
          return;
        default:
          console.log("❌ Invalid choice. Please enter y, n, s, or q.");
          i--; // Retry the same record
          break;
      }
    }

    console.log(`\n🎉 Approval session completed!`);
    console.log(
      `📊 Results: ${approved} approved, ${rejected} rejected, ${skipped} skipped`
    );
  } finally {
    rl.close();
  }
}

async function approveRecord(record: ReviewRecord, config: any): Promise<void> {
  try {
    // Try to find an existing clinic that matches this data
    const existingClinic = await findExistingClinic(record.raw_data);

    if (existingClinic) {
      console.log(`   🎯 Found existing clinic: ${existingClinic.klinikNavn}`);

      // Add specialty to existing clinic
      if (config.actions?.add_specialties) {
        await addSpecialtiesToClinic(
          existingClinic.clinics_id,
          config.actions.add_specialties
        );
      }

      // Update the ingestion record
      await supabase
        .from("data_ingestion_records")
        .update({
          matched_clinic_id: existingClinic.clinics_id,
          status: "updated",
          review_decision: "approved",
          processed_at: new Date().toISOString(),
        })
        .eq("id", record.id);
    } else {
      console.log(
        `   ⚠️  No existing clinic found - keeping as potential new clinic`
      );

      // Mark as approved but no clinic found
      await supabase
        .from("data_ingestion_records")
        .update({
          status: "pending",
          review_decision: "approved",
          processed_at: new Date().toISOString(),
        })
        .eq("id", record.id);
    }
  } catch (error) {
    console.error(`   ❌ Failed to approve record: ${error}`);
    throw error;
  }
}

async function rejectRecord(recordId: string): Promise<void> {
  await supabase
    .from("data_ingestion_records")
    .update({
      status: "failed",
      review_decision: "rejected",
      processed_at: new Date().toISOString(),
    })
    .eq("id", recordId);
}

async function findExistingClinic(csvData: any): Promise<any> {
  // Try to find by name and postal code
  const { data: clinics } = await supabase
    .from("clinics")
    .select("clinics_id, klinikNavn, adresse, postnummer")
    .eq("klinikNavn", csvData.klinikNavn)
    .eq("postnummer", csvData.postnummer);

  if (clinics && clinics.length > 0) {
    return clinics[0];
  }

  // Try fuzzy matching by name in same postal code
  const { data: allClinics } = await supabase
    .from("clinics")
    .select("clinics_id, klinikNavn, adresse, postnummer")
    .eq("postnummer", csvData.postnummer);

  if (allClinics) {
    for (const clinic of allClinics) {
      const similarity = calculateNameSimilarity(
        csvData.klinikNavn,
        clinic.klinikNavn
      );
      if (similarity >= 0.8) {
        return clinic;
      }
    }
  }

  return null;
}

function calculateNameSimilarity(name1: string, name2: string): number {
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const n1 = normalize(name1);
  const n2 = normalize(name2);

  if (n1 === n2) return 1.0;
  if (n1.includes(n2) || n2.includes(n1)) return 0.85;

  return levenshteinSimilarity(n1, n2);
}

function levenshteinSimilarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1.0;
  return 1 - distance / maxLength;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[str2.length][str1.length];
}

async function addSpecialtiesToClinic(
  clinicId: string,
  specialtyNames: string[]
): Promise<void> {
  const { data: specialties, error: specialtyError } = await supabase
    .from("specialties")
    .select("specialty_id, specialty_name")
    .in("specialty_name", specialtyNames);

  if (specialtyError) {
    throw new Error(`Failed to fetch specialties: ${specialtyError.message}`);
  }

  if (!specialties || specialties.length === 0) {
    console.warn(
      `   ⚠️  No matching specialties found for: ${specialtyNames.join(", ")}`
    );
    return;
  }

  const junctionRecords = specialties.map((specialty) => ({
    clinics_id: clinicId,
    specialty_id: specialty.specialty_id,
  }));

  const { error: insertError } = await supabase
    .from("clinic_specialties")
    .upsert(junctionRecords, {
      onConflict: "clinics_id,specialty_id",
    });

  if (insertError) {
    throw new Error(`Failed to add specialties: ${insertError.message}`);
  }

  console.log(
    `   ✅ Added specialties: ${specialties
      .map((s) => s.specialty_name)
      .join(", ")}`
  );
}

async function loadSourceConfig(sourceName: string): Promise<any> {
  const configPath = resolve(__dirname, `../config/sources/${sourceName}.json`);

  try {
    const { readFile } = await import("fs/promises");
    const configContent = await readFile(configPath, "utf-8");
    return JSON.parse(configContent);
  } catch (error) {
    throw new Error(`Failed to load source configuration: ${error}`);
  }
}

function askQuestion(
  rl: readline.Interface,
  question: string
): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("❌ Approval failed:", error);
    process.exit(1);
  });
}
