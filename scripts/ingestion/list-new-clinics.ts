// List New Clinics Script
// Shows potential new clinics that were identified but not automatically created

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "../../.env.local") });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    console.log("🏥 Listing potential new clinics from recent batches...\n");
    await showRecentNewClinics();
  } else {
    console.log(`🏥 Listing potential new clinics from batch: ${batchId}\n`);
    await showNewClinicsFromBatch(batchId);
  }
}

async function showRecentNewClinics(): Promise<void> {
  // Get recent batches with potential new clinics
  const { data: batches, error: batchError } = await supabase
    .from("data_ingestion_batches")
    .select("id, source_name, created_at, stats")
    .not("stats->new_clinics", "eq", "0")
    .order("created_at", { ascending: false })
    .limit(5);

  if (batchError || !batches || batches.length === 0) {
    console.log("No recent batches with potential new clinics found.");
    return;
  }

  console.log("📋 Recent batches with potential new clinics:");
  for (const batch of batches) {
    const newClinicCount = batch.stats?.new_clinics || 0;
    const date = new Date(batch.created_at).toLocaleDateString();
    console.log(
      `   ${batch.id} - ${batch.source_name} (${newClinicCount} potential) - ${date}`
    );
  }

  console.log("\n💡 Use --batch-id=<uuid> to see details for a specific batch");
}

async function showNewClinicsFromBatch(batchId: string): Promise<void> {
  // Get potential new clinics from the batch
  const { data: records, error } = await supabase
    .from("data_ingestion_records")
    .select("id, raw_data, match_confidence, created_at")
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

  console.log(`🔍 Found ${records.length} potential new clinics:\n`);

  records.forEach((record, index) => {
    const data = record.raw_data;
    const confidence = (record.match_confidence * 100).toFixed(1);

    console.log(`${index + 1}. ${data.klinikNavn}`);
    console.log(
      `   📍 Address: ${data.adresse || "N/A"}, ${data.postnummer || "N/A"} ${
        data.by || ""
      }`
    );
    console.log(`   📞 Phone: ${data.tlf || "N/A"}`);
    console.log(`   📧 Email: ${data.email || "N/A"}`);
    console.log(`   🌐 Website: ${data.website || "N/A"}`);
    console.log(`   📊 Match confidence: ${confidence}%`);
    console.log(`   🆔 Record ID: ${record.id}`);
    console.log("");
  });

  console.log("💡 These clinics were not automatically added to the database.");
  console.log(
    "💡 Review them manually and use create-clinic script if they should be added."
  );
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("❌ Failed to list new clinics:", error);
    process.exit(1);
  });
}
