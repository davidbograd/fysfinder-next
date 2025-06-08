// Process Approved Reviews Script
// Processes approved manual reviews and applies them to the database

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
    console.error("Usage: npm run process:approved -- --batch-id=<batch-uuid>");
    console.error("\nTo find batches with approved reviews:");
    console.error(
      "SELECT id, source_name, created_at FROM data_ingestion_batches WHERE id IN (SELECT DISTINCT batch_id FROM data_ingestion_records WHERE review_decision = 'approved' AND status = 'matched');"
    );
    process.exit(1);
  }

  console.log("🔄 Processing approved reviews...");
  console.log(`📦 Batch ID: ${batchId}`);

  try {
    await processApprovedReviews(batchId);
    console.log("\n✅ Processing completed successfully!");
  } catch (error) {
    console.error("❌ Processing failed:", error);
    process.exit(1);
  }
}

async function processApprovedReviews(batchId: string): Promise<void> {
  // Get approved records that haven't been processed yet
  const { data: approvedRecords, error } = await supabase
    .from("data_ingestion_records")
    .select(
      `
      id,
      raw_data,
      matched_clinic_id,
      match_confidence,
      batch_id,
      data_ingestion_batches!inner(source_name)
    `
    )
    .eq("batch_id", batchId)
    .eq("review_decision", "approved")
    .eq("status", "matched")
    .is("processed_at", null);

  if (error) {
    throw new Error(`Failed to fetch approved records: ${error.message}`);
  }

  if (!approvedRecords || approvedRecords.length === 0) {
    console.log("✅ No approved records to process in this batch.");
    return;
  }

  console.log(
    `\n🔍 Found ${approvedRecords.length} approved records to process.`
  );

  // Load source configuration
  const sourceName = (approvedRecords[0] as any).data_ingestion_batches
    .source_name;
  const config = await loadSourceConfig(sourceName);

  let processed = 0;
  let errors = 0;

  for (const record of approvedRecords) {
    try {
      await processApprovedRecord(record, config);
      processed++;
      console.log(`   ✅ Processed: ${record.raw_data.klinikNavn}`);
    } catch (error) {
      errors++;
      console.error(
        `   ❌ Failed to process: ${record.raw_data.klinikNavn} - ${error}`
      );
    }
  }

  console.log(
    `\n📊 Processing complete: ${processed} processed, ${errors} errors`
  );
}

async function processApprovedRecord(record: any, config: any): Promise<void> {
  if (!record.matched_clinic_id) {
    throw new Error("Approved record missing matched clinic ID");
  }

  // Update the existing clinic with new data from CSV
  const updateData: any = {};

  // Map CSV fields to database fields based on configuration
  for (const [csvField, dbField] of Object.entries(config.field_mapping)) {
    if (record.raw_data[csvField] && record.raw_data[csvField].trim()) {
      updateData[dbField as string] = record.raw_data[csvField].trim();
    }
  }

  // Add any configured post-processing actions
  if (config.actions?.add_specialties) {
    // Get existing specialties
    const { data: existingClinic } = await supabase
      .from("clinics")
      .select("specialer")
      .eq("clinics_id", record.matched_clinic_id)
      .single();

    const existingSpecialties = existingClinic?.specialer || [];
    const combinedSpecialties = [
      ...existingSpecialties,
      ...config.actions.add_specialties,
    ];
    const newSpecialties = Array.from(new Set(combinedSpecialties));
    updateData.specialer = newSpecialties;
  }

  // Set configured fields
  if (config.actions?.set_fields) {
    Object.assign(updateData, config.actions.set_fields);
  }

  // Update the clinic record
  const { error: updateError } = await supabase
    .from("clinics")
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq("clinics_id", record.matched_clinic_id);

  if (updateError) {
    throw new Error(`Failed to update clinic: ${updateError.message}`);
  }

  // Update the ingestion record to mark as processed
  const { error: recordError } = await supabase
    .from("data_ingestion_records")
    .update({
      status: "updated",
      processed_at: new Date().toISOString(),
    })
    .eq("id", record.id);

  if (recordError) {
    throw new Error(
      `Failed to update ingestion record: ${recordError.message}`
    );
  }
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

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("❌ Processing failed:", error);
    process.exit(1);
  });
}
