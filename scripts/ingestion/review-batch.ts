// Batch Review Script
// Review uncertain matches from existing import batches

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { ReviewInterface } from "./review-interface.js";

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
    console.error("Usage: npm run review:batch -- --batch-id=<batch-uuid>");
    console.error("\nTo find recent batches with review needed:");
    console.error(
      "SELECT id, source_name, created_at, stats FROM data_ingestion_batches WHERE stats->>'review_needed' != '0' ORDER BY created_at DESC LIMIT 5;"
    );

    // Show recent batches automatically
    await showRecentBatches();
    process.exit(1);
  }

  console.log("👀 Starting manual review process...");
  console.log(`📦 Batch ID: ${batchId}`);

  try {
    await conductManualReview(batchId);
  } catch (error) {
    console.error("❌ Review failed:", error);
    process.exit(1);
  }
}

async function showRecentBatches(): Promise<void> {
  console.log("\n📋 Recent batches with reviews needed:");

  const { data: batches, error } = await supabase
    .from("data_ingestion_batches")
    .select("id, source_name, created_at, stats")
    .not("stats->review_needed", "eq", "0")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error || !batches || batches.length === 0) {
    console.log("   No recent batches found with reviews needed.");
    return;
  }

  for (const batch of batches) {
    const reviewCount = batch.stats?.review_needed || 0;
    const date = new Date(batch.created_at).toLocaleDateString();
    console.log(
      `   ${batch.id} - ${batch.source_name} (${reviewCount} reviews) - ${date}`
    );
  }
}

async function conductManualReview(batchId: string): Promise<void> {
  // Get records needing review
  const { data: reviewRecords, error } = await supabase
    .from("data_ingestion_records")
    .select(
      `
      id,
      raw_data,
      matched_clinic_id,
      match_confidence,
      batch_id,
      clinics!inner(clinics_id, klinikNavn, adresse, postnummer, lokation)
    `
    )
    .eq("batch_id", batchId)
    .eq("status", "review_needed")
    .order("match_confidence", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch review records: ${error.message}`);
  }

  if (!reviewRecords || reviewRecords.length === 0) {
    console.log("✅ No records need manual review in this batch.");
    return;
  }

  console.log(
    `\n🔍 Found ${reviewRecords.length} records needing manual review.`
  );
  console.log("Records are sorted by confidence (highest first).\n");

  const reviewInterface = new ReviewInterface();
  let approved = 0;
  let rejected = 0;
  let skipped = 0;

  try {
    for (let i = 0; i < reviewRecords.length; i++) {
      const record = reviewRecords[i];

      const reviewRecord = {
        id: record.id,
        csvData: record.raw_data,
        matchedClinic: record.clinics,
        confidence: record.match_confidence,
        reasons: [
          `${(record.match_confidence * 100).toFixed(1)}% confidence match`,
        ],
      };

      const decision = await reviewInterface.reviewMatch(
        reviewRecord,
        i + 1,
        reviewRecords.length
      );

      // Update the record with the decision
      await updateReviewDecision(record.id, decision);

      if (decision === "approved") {
        approved++;
        console.log("✅ Match approved - will be processed");
      } else if (decision === "rejected") {
        rejected++;
        console.log("❌ Match rejected - will create new clinic");
      } else {
        skipped++;
        console.log("⏭️  Skipped for later review");
      }
    }

    console.log("\n🎉 Manual review session completed!");
    console.log(
      `📊 Results: ${approved} approved, ${rejected} rejected, ${skipped} skipped`
    );

    // Automatically process approved records
    if (approved > 0) {
      console.log("\n🔄 Processing approved records automatically...");
      try {
        await processApprovedRecords(batchId);
        console.log("✅ All approved records have been processed!");
      } catch (error) {
        console.error("❌ Failed to process approved records:", error);
        console.error("💡 You can manually process them later with:");
        console.error(`   npm run process:approved -- --batch-id=${batchId}`);
      }
    }

    // Process rejected records (create new clinics)
    if (rejected > 0) {
      console.log("\n🆕 Processing rejected records (creating new clinics)...");
      try {
        await processRejectedRecords(batchId);
        console.log(
          "✅ All rejected records have been processed as new clinics!"
        );
      } catch (error) {
        console.error("❌ Failed to process rejected records:", error);
        console.error("💡 You can manually process them later with:");
        console.error(
          `   npm run approve:new-clinics -- --batch-id=${batchId}`
        );
      }
    }
  } finally {
    reviewInterface.close();
  }
}

async function updateReviewDecision(
  recordId: string,
  decision: "approved" | "rejected" | "skipped"
): Promise<void> {
  const newStatus =
    decision === "approved"
      ? "matched"
      : decision === "rejected"
      ? "pending"
      : "review_needed";

  const { error } = await supabase
    .from("data_ingestion_records")
    .update({
      review_decision: decision,
      status: newStatus,
      processed_at: new Date().toISOString(),
    })
    .eq("id", recordId);

  if (error) {
    throw new Error(`Failed to update review decision: ${error.message}`);
  }
}

async function processApprovedRecords(batchId: string): Promise<void> {
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
    console.log("   ℹ️  No approved records to process.");
    return;
  }

  console.log(`   🔍 Processing ${approvedRecords.length} approved records...`);

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
      console.log(`   ✅ Updated: ${record.raw_data.klinikNavn}`);
    } catch (error) {
      errors++;
      console.error(`   ❌ Failed: ${record.raw_data.klinikNavn} - ${error}`);
    }
  }

  console.log(
    `   📊 Approved processing: ${processed} updated, ${errors} errors`
  );
}

async function processRejectedRecords(batchId: string): Promise<void> {
  // Get rejected records that haven't been processed yet
  const { data: rejectedRecords, error } = await supabase
    .from("data_ingestion_records")
    .select(
      `
      id,
      raw_data,
      batch_id,
      data_ingestion_batches!inner(source_name)
    `
    )
    .eq("batch_id", batchId)
    .eq("review_decision", "rejected")
    .eq("status", "pending")
    .is("processed_at", null);

  if (error) {
    throw new Error(`Failed to fetch rejected records: ${error.message}`);
  }

  if (!rejectedRecords || rejectedRecords.length === 0) {
    console.log("   ℹ️  No rejected records to process.");
    return;
  }

  console.log(`   🔍 Creating ${rejectedRecords.length} new clinics...`);

  // Load source configuration
  const sourceName = (rejectedRecords[0] as any).data_ingestion_batches
    .source_name;
  const config = await loadSourceConfig(sourceName);

  let processed = 0;
  let errors = 0;

  for (const record of rejectedRecords) {
    try {
      await processRejectedRecord(record, config);
      processed++;
      console.log(`   ✅ Created: ${record.raw_data.klinikNavn}`);
    } catch (error) {
      errors++;
      console.error(`   ❌ Failed: ${record.raw_data.klinikNavn} - ${error}`);
    }
  }

  console.log(
    `   📊 New clinic processing: ${processed} created, ${errors} errors`
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

async function processRejectedRecord(record: any, config: any): Promise<void> {
  // Create new clinic from CSV data
  const clinicData: any = {};

  // Map CSV fields to database fields based on configuration
  for (const [csvField, dbField] of Object.entries(config.field_mapping)) {
    if (record.raw_data[csvField] && record.raw_data[csvField].trim()) {
      clinicData[dbField as string] = record.raw_data[csvField].trim();
    }
  }

  // Add any configured post-processing actions
  if (config.actions?.add_specialties) {
    clinicData.specialer = config.actions.add_specialties;
  }

  // Set configured fields
  if (config.actions?.set_fields) {
    Object.assign(clinicData, config.actions.set_fields);
  }

  // Set required fields
  clinicData.created_at = new Date().toISOString();
  clinicData.updated_at = new Date().toISOString();

  // Insert the new clinic
  const { data: newClinic, error: insertError } = await supabase
    .from("clinics")
    .insert(clinicData)
    .select("clinics_id")
    .single();

  if (insertError) {
    throw new Error(`Failed to create clinic: ${insertError.message}`);
  }

  // Update the ingestion record to mark as processed
  const { error: recordError } = await supabase
    .from("data_ingestion_records")
    .update({
      status: "inserted",
      matched_clinic_id: newClinic.clinics_id,
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
    console.error("❌ Review failed:", error);
    process.exit(1);
  });
}
