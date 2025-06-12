// Enhanced Clinic Data Import Script
// Main entry point for the new ingestion system

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import * as path from "path";
import { dirname, resolve } from "path";
import * as fs from "fs";
import Papa from "papaparse";
import { MatchingEngine, MatchResult } from "./matching-engine.js";
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

interface ImportOptions {
  file: string;
  source: string;
  dryRun?: boolean;
  review?: boolean;
}

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const options: ImportOptions = {
    file: "",
    source: "",
    dryRun: false,
    review: false,
  };

  // Parse arguments (--file=data.csv --source=parkinsons --dry-run --review)
  for (const arg of args) {
    if (arg.startsWith("--file=")) {
      options.file = arg.split("=")[1];
    } else if (arg.startsWith("--source=")) {
      options.source = arg.split("=")[1];
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--review") {
      options.review = true;
    }
  }

  // Validate required arguments
  if (!options.file || !options.source) {
    console.error(
      "Usage: npm run import:enhanced -- --file=data.csv --source=parkinsons [--dry-run] [--review]"
    );
    process.exit(1);
  }

  console.log("🚀 Starting enhanced clinic import...");
  console.log(`📁 File: ${options.file}`);
  console.log(`🏷️  Source: ${options.source}`);
  console.log(`🧪 Dry run: ${options.dryRun ? "Yes" : "No"}`);
  console.log(`👀 Manual review: ${options.review ? "Yes" : "No"}`);

  try {
    // 1. Load source configuration
    console.log("\n📋 Loading source configuration...");
    const config = await loadSourceConfig(options.source);
    console.log(`✅ Loaded config for: ${config.description}`);

    // 2. Validate and parse CSV file
    console.log("\n📄 Parsing CSV file...");
    const csvData = await parseCSVFile(options.file, config);
    console.log(`✅ Parsed ${csvData.length} records`);

    // 3. Create batch record
    console.log("\n📦 Creating batch record...");
    const batchId = await createBatch(
      options.source,
      options.file,
      config,
      csvData.length
    );
    console.log(`✅ Created batch: ${batchId}`);

    // 4. Validate records
    console.log("\n🔍 Validating records...");
    const validationResults = await validateRecords(csvData, config);
    console.log(
      `✅ Validation complete: ${validationResults.valid} valid, ${validationResults.invalid} invalid`
    );

    if (options.dryRun) {
      console.log("\n🧪 DRY RUN - No changes made to database");
      console.log("📊 Summary:");
      console.log(`   - Total records: ${csvData.length}`);
      console.log(`   - Valid records: ${validationResults.valid}`);
      console.log(`   - Invalid records: ${validationResults.invalid}`);
      return;
    }

    // 5. Process records with matching
    console.log("\n🔍 Starting clinic matching...");
    const matchingEngine = new MatchingEngine();
    const matchResults = await processRecords(
      csvData,
      matchingEngine,
      batchId,
      config
    );

    console.log(
      `✅ Matching complete: ${matchResults.processed} records processed`
    );
    console.log(`   - High confidence (≥0.75): ${matchResults.highConfidence}`);
    console.log(`   - Manual review (0.4-0.74): ${matchResults.reviewNeeded}`);
    console.log(`   - New clinics (<0.4): ${matchResults.newClinics}`);

    if (options.review && matchResults.reviewNeeded > 0) {
      console.log("\n👀 Starting manual review process...");
      await conductManualReview(batchId);
    }

    // 6. Update batch status
    await updateBatchStatus(batchId, "completed", matchResults);

    // 7. Generate final report
    await generateFinalReport(batchId, options.source, config, options.file);

    console.log("\n✅ Import completed successfully!");
  } catch (error) {
    console.error("\n❌ Import failed:", error);
    throw error;
  }
}

// Helper functions

async function loadSourceConfig(sourceName: string): Promise<any> {
  const configPath = resolve(
    __dirname,
    "../config/sources",
    `${sourceName}.json`
  );

  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file not found: ${configPath}`);
  }

  const configContent = fs.readFileSync(configPath, "utf-8");
  return JSON.parse(configContent);
}

async function parseCSVFile(filePath: string, config: any): Promise<any[]> {
  // Handle relative paths from project root
  let fullPath: string;

  if (path.isAbsolute(filePath)) {
    fullPath = filePath;
  } else {
    // For relative paths, resolve from project root
    fullPath = resolve(process.cwd(), filePath);
  }

  if (!fs.existsSync(fullPath)) {
    throw new Error(`CSV file not found: ${fullPath}`);
  }

  const csvContent = fs.readFileSync(fullPath, "utf-8");

  return new Promise((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn("⚠️  CSV parsing warnings:", results.errors);
        }
        resolve(results.data);
      },
      error: (error: any) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}

async function createBatch(
  sourceName: string,
  fileName: string,
  config: any,
  recordCount: number
): Promise<string> {
  const { data, error } = await supabase
    .from("data_ingestion_batches")
    .insert({
      source_name: sourceName,
      source_type: config.source_type,
      file_name: fileName,
      config: config,
      metadata: {
        record_count: recordCount,
        import_started_at: new Date().toISOString(),
      },
      status: "processing",
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create batch: ${error.message}`);
  }

  return data.id;
}

interface ValidationResult {
  valid: number;
  invalid: number;
  errors: string[];
}

async function validateRecords(
  csvData: any[],
  config: any
): Promise<ValidationResult> {
  const result: ValidationResult = {
    valid: 0,
    invalid: 0,
    errors: [],
  };

  // Check if all expected columns are present
  if (csvData.length > 0) {
    const csvColumns = Object.keys(csvData[0]);
    const missingColumns = config.expected_columns.filter(
      (col: string) => !csvColumns.includes(col)
    );

    if (missingColumns.length > 0) {
      result.errors.push(
        `Missing expected columns: ${missingColumns.join(", ")}`
      );
    }
  }

  // Validate each record
  for (let i = 0; i < csvData.length; i++) {
    const record = csvData[i];
    let isValid = true;

    // Check required columns
    for (const requiredCol of config.required_columns) {
      if (!record[requiredCol] || record[requiredCol].trim() === "") {
        result.errors.push(
          `Row ${i + 2}: Missing required field '${requiredCol}'`
        );
        isValid = false;
      }
    }

    // Validate postal code format if present
    if (record.postnummer && config.validation_rules?.postnummer_format) {
      const postalRegex = new RegExp(config.validation_rules.postnummer_format);
      if (!postalRegex.test(record.postnummer)) {
        result.errors.push(
          `Row ${i + 2}: Invalid postal code format '${record.postnummer}'`
        );
        isValid = false;
      }
    }

    if (isValid) {
      result.valid++;
    } else {
      result.invalid++;
    }
  }

  // Show first few errors if any
  if (result.errors.length > 0) {
    console.log("⚠️  Validation errors found:");
    result.errors.slice(0, 5).forEach((error) => console.log(`   - ${error}`));
    if (result.errors.length > 5) {
      console.log(`   ... and ${result.errors.length - 5} more errors`);
    }
  }

  return result;
}

interface ProcessingResults {
  processed: number;
  highConfidence: number;
  reviewNeeded: number;
  newClinics: number;
  errors: number;
}

async function processRecords(
  csvData: any[],
  matchingEngine: MatchingEngine,
  batchId: string,
  config: any
): Promise<ProcessingResults> {
  const results: ProcessingResults = {
    processed: 0,
    highConfidence: 0,
    reviewNeeded: 0,
    newClinics: 0,
    errors: 0,
  };

  for (let i = 0; i < csvData.length; i++) {
    const record = csvData[i];

    try {
      // Find potential matches
      const matchResult = await matchingEngine.findBestMatch(record);

      // Store the record with match results
      await storeProcessingRecord(batchId, record, matchResult);

      // Categorize by confidence
      if (matchResult.confidence >= 0.75) {
        results.highConfidence++;
        // Auto-process high confidence matches
        await processHighConfidenceMatch(batchId, record, matchResult, config);
      } else if (matchResult.confidence >= 0.4) {
        results.reviewNeeded++;
        // Queue for manual review (already stored with review_needed status)
        let matchedClinicName = "Unknown";
        if (matchResult.clinicId) {
          const { data: clinic } = await supabase
            .from("clinics")
            .select("klinikNavn")
            .eq("clinics_id", matchResult.clinicId)
            .single();
          matchedClinicName = clinic?.klinikNavn || "Unknown";
        }
        console.log(
          `   🤔 Manual review needed: ${
            record.klinikNavn
          } → ${matchedClinicName} (${(matchResult.confidence * 100).toFixed(
            1
          )}% confidence)`
        );
      } else {
        results.newClinics++;
        // Don't auto-create new clinics - just track them for manual review
        console.log(
          `   📝 Potential new clinic: ${record.klinikNavn} (${(
            matchResult.confidence * 100
          ).toFixed(1)}% confidence)`
        );
      }

      results.processed++;

      // Show progress every 20 records
      if ((i + 1) % 20 === 0) {
        console.log(`   Processed ${i + 1}/${csvData.length} records...`);
      }
    } catch (error) {
      console.error(`Error processing record ${i + 1}:`, error);
      results.errors++;
    }
  }

  return results;
}

async function storeProcessingRecord(
  batchId: string,
  rawData: any,
  matchResult: MatchResult
): Promise<void> {
  const status =
    matchResult.confidence >= 0.75
      ? "matched"
      : matchResult.confidence >= 0.4
      ? "review_needed"
      : "pending"; // Low confidence - no clinic created, pending manual decision

  const { error } = await supabase.from("data_ingestion_records").insert({
    batch_id: batchId,
    raw_data: rawData,
    matched_clinic_id: matchResult.clinicId,
    match_confidence: matchResult.confidence,
    status: status,
    processed_at: null, // Only set when actually processed
  });

  if (error) {
    throw new Error(`Failed to store processing record: ${error.message}`);
  }
}

async function updateBatchStatus(
  batchId: string,
  status: string,
  stats: ProcessingResults
): Promise<void> {
  const { error } = await supabase
    .from("data_ingestion_batches")
    .update({
      status: status,
      processed_at: new Date().toISOString(),
      stats: {
        total_records: stats.processed,
        high_confidence: stats.highConfidence,
        review_needed: stats.reviewNeeded,
        new_clinics: stats.newClinics,
        errors: stats.errors,
        processing_completed_at: new Date().toISOString(),
      },
    })
    .eq("id", batchId);

  if (error) {
    throw new Error(`Failed to update batch status: ${error.message}`);
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
    console.log("No records need manual review.");
    return;
  }

  console.log(`Found ${reviewRecords.length} records needing manual review.`);

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

      console.log(`\n📍 Review ${i + 1} of ${reviewRecords.length}`);
      const decision = await reviewInterface.reviewMatch(reviewRecord);

      // Update the record with the decision
      await updateReviewDecision(record.id, decision);

      if (decision === "approved") {
        approved++;
        console.log("✅ Match approved - will be processed");
      } else if (decision === "rejected") {
        rejected++;
        console.log("❌ Match rejected - record will be ignored");
      } else {
        skipped++;
        console.log("⏭️  Skipped for later review");
      }
    }

    console.log("\n🎉 Manual review completed!");
    console.log(
      `📊 Results: ${approved} approved, ${rejected} rejected, ${skipped} skipped`
    );

    // Load source configuration for processing
    const { data: batchInfo } = await supabase
      .from("data_ingestion_batches")
      .select("source_name")
      .eq("id", batchId)
      .single();
    const config = await loadSourceConfig(batchInfo?.source_name || "");

    // Automatically process approved records
    if (approved > 0) {
      console.log("\n🔄 Processing approved records automatically...");
      try {
        await processApprovedRecordsInline(batchId, config);
        console.log("✅ All approved records have been processed!");
      } catch (error) {
        console.error("❌ Failed to process approved records:", error);
        console.error("💡 You can manually process them later with:");
        console.error(`   npm run process:approved -- --batch-id=${batchId}`);
      }
    }

    // Rejected records are ignored - no processing needed
    if (rejected > 0) {
      console.log(
        `\n🗑️  ${rejected} rejected records will be ignored (no action taken)`
      );
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
      // Don't set processed_at here - let the actual processing functions set it
    })
    .eq("id", recordId);

  if (error) {
    throw new Error(`Failed to update review decision: ${error.message}`);
  }
}

/**
 * Process high confidence matches by updating existing clinic records
 */
async function processHighConfidenceMatch(
  batchId: string,
  csvRecord: any,
  matchResult: MatchResult,
  config: any
): Promise<void> {
  if (!matchResult.clinicId) {
    throw new Error("High confidence match missing clinic ID");
  }

  try {
    // Get current clinic data to check for empty fields
    const { data: currentClinic, error: fetchError } = await supabase
      .from("clinics")
      .select("*")
      .eq("clinics_id", matchResult.clinicId)
      .single();

    if (fetchError) {
      throw new Error(
        `Failed to fetch current clinic data: ${fetchError.message}`
      );
    }

    // Build update data only for empty/null fields
    const updateData: any = {};

    for (const [csvField, dbField] of Object.entries(config.field_mapping)) {
      if (
        csvRecord[csvField] &&
        csvRecord[csvField].trim() &&
        dbField !== "klinikNavn"
      ) {
        // Only update if the current field is empty, null, or undefined
        const currentValue = currentClinic[dbField as string];
        if (
          !currentValue ||
          (typeof currentValue === "string" && currentValue.trim() === "")
        ) {
          updateData[dbField as string] = csvRecord[csvField].trim();
        }
      }
    }

    // Add specialties via junction table
    if (config.actions?.add_specialties) {
      await addSpecialtiesToClinic(
        matchResult.clinicId,
        config.actions.add_specialties
      );
    }

    // Set configured fields (only if they don't overwrite existing data)
    if (config.actions?.set_fields) {
      for (const [field, value] of Object.entries(config.actions.set_fields)) {
        const currentValue = currentClinic[field];
        if (
          !currentValue ||
          (typeof currentValue === "string" && currentValue.trim() === "")
        ) {
          updateData[field] = value;
        }
      }
    }

    // Only update if we have fields to update
    if (Object.keys(updateData).length > 0) {
      updateData.updated_at = new Date().toISOString();

      const { error: updateError } = await supabase
        .from("clinics")
        .update(updateData)
        .eq("clinics_id", matchResult.clinicId);

      if (updateError) {
        throw new Error(`Failed to update clinic: ${updateError.message}`);
      }
    } else {
      // Just update timestamp if only specialties were added
      const { error: updateError } = await supabase
        .from("clinics")
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq("clinics_id", matchResult.clinicId);

      if (updateError) {
        throw new Error(
          `Failed to update clinic timestamp: ${updateError.message}`
        );
      }
    }

    // Update the ingestion record to mark as processed
    const { error: recordError } = await supabase
      .from("data_ingestion_records")
      .update({
        status: "updated",
        processed_at: new Date().toISOString(),
      })
      .eq("batch_id", batchId)
      .eq("matched_clinic_id", matchResult.clinicId);

    if (recordError) {
      throw new Error(
        `Failed to update ingestion record: ${recordError.message}`
      );
    }

    console.log(
      `   ✅ Auto-processed: ${csvRecord.klinikNavn} → ${
        matchResult.clinicId
      } (${(matchResult.confidence * 100).toFixed(1)}% confidence)`
    );
  } catch (error) {
    console.error(`   ❌ Failed to process high confidence match: ${error}`);
    throw error;
  }
}

// processNewClinic function removed - we no longer auto-create new clinics
// Low confidence matches are kept in "pending" status for manual review

/**
 * Add specialties to a clinic via the junction table
 */
async function addSpecialtiesToClinic(
  clinicId: string,
  specialtyNames: string[]
): Promise<void> {
  // Get specialty IDs by name
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

  // Insert into junction table (upsert to avoid duplicates)
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
    `   🏷️  Added specialties to ${clinicId}: ${specialties
      .map((s) => s.specialty_name)
      .join(", ")}`
  );
}

async function processApprovedRecordsInline(
  batchId: string,
  config: any
): Promise<void> {
  // Debug: Check all approved records first
  const { data: allApproved, error: debugError } = await supabase
    .from("data_ingestion_records")
    .select("id, review_decision, status, processed_at, raw_data")
    .eq("batch_id", batchId)
    .eq("review_decision", "approved");

  if (!debugError && allApproved) {
    console.log(
      `   🔍 Debug: Found ${allApproved.length} total approved records`
    );
    allApproved.forEach((record) => {
      console.log(
        `   📝 ${record.raw_data.klinikNavn}: status=${
          record.status
        }, processed_at=${record.processed_at ? "SET" : "NULL"}`
      );
    });
  }

  // Get approved records that haven't been processed yet
  const { data: approvedRecords, error } = await supabase
    .from("data_ingestion_records")
    .select(
      `
      id,
      raw_data,
      matched_clinic_id,
      match_confidence,
      batch_id
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

  let processed = 0;
  let errors = 0;

  for (const record of approvedRecords) {
    try {
      await processApprovedRecordInline(record, config);
      processed++;
      console.log(
        `   ✅ Updated: ${record.raw_data.klinikNavn} → ${record.matched_clinic_id}`
      );
    } catch (error) {
      errors++;
      console.error(`   ❌ Failed: ${record.raw_data.klinikNavn} - ${error}`);
    }
  }

  console.log(
    `   📊 Approved processing: ${processed} updated, ${errors} errors`
  );
}

// processRejectedRecordsInline function removed - rejected records are now ignored

async function processApprovedRecordInline(
  record: any,
  config: any
): Promise<void> {
  if (!record.matched_clinic_id) {
    throw new Error("Approved record missing matched clinic ID");
  }

  // Get current clinic data to check for empty fields
  const { data: currentClinic, error: fetchError } = await supabase
    .from("clinics")
    .select("*")
    .eq("clinics_id", record.matched_clinic_id)
    .single();

  if (fetchError) {
    throw new Error(
      `Failed to fetch current clinic data: ${fetchError.message}`
    );
  }

  // Build update data only for empty/null fields
  const updateData: any = {};

  for (const [csvField, dbField] of Object.entries(config.field_mapping)) {
    if (
      record.raw_data[csvField] &&
      record.raw_data[csvField].trim() &&
      dbField !== "klinikNavn"
    ) {
      // Only update if the current field is empty, null, or undefined
      const currentValue = currentClinic[dbField as string];
      if (
        !currentValue ||
        (typeof currentValue === "string" && currentValue.trim() === "")
      ) {
        updateData[dbField as string] = record.raw_data[csvField].trim();
      }
    }
  }

  // Add specialties via junction table
  if (config.actions?.add_specialties) {
    await addSpecialtiesToClinic(
      record.matched_clinic_id,
      config.actions.add_specialties
    );
  }

  // Set configured fields (always overwrite existing values)
  if (config.actions?.set_fields) {
    Object.assign(updateData, config.actions.set_fields);
  }

  // Only update if we have fields to update
  if (Object.keys(updateData).length > 0) {
    updateData.updated_at = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("clinics")
      .update(updateData)
      .eq("clinics_id", record.matched_clinic_id);

    if (updateError) {
      throw new Error(`Failed to update clinic: ${updateError.message}`);
    }
  } else {
    // Just update timestamp if only specialties were added
    const { error: updateError } = await supabase
      .from("clinics")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("clinics_id", record.matched_clinic_id);

    if (updateError) {
      throw new Error(
        `Failed to update clinic timestamp: ${updateError.message}`
      );
    }
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

// processRejectedRecordInline function removed - rejected records are now ignored

async function generateFinalReport(
  batchId: string,
  sourceName: string,
  config: any,
  fileName?: string
): Promise<void> {
  const reportLines: string[] = [];

  // Helper function to add line to both console and report
  const addLine = (line: string) => {
    console.log(line);
    reportLines.push(line);
  };

  addLine("\n" + "=".repeat(60));
  addLine("📊 FINAL IMPORT REPORT");
  addLine("=".repeat(60));

  try {
    // Get batch information
    const { data: batch } = await supabase
      .from("data_ingestion_batches")
      .select("*")
      .eq("id", batchId)
      .single();

    // Get all records for this batch
    const { data: records } = await supabase
      .from("data_ingestion_records")
      .select("*")
      .eq("batch_id", batchId);

    if (!batch || !records) {
      addLine("❌ Could not generate report - missing data");
      return;
    }

    addLine(`📦 Batch ID: ${batchId}`);
    addLine(`🏷️  Source: ${sourceName}`);
    addLine(`📅 Processed: ${new Date(batch.processed_at).toLocaleString()}`);
    addLine(`📁 File: ${batch.file_name}`);

    // Count records by status
    const statusCounts = records.reduce((acc: any, record: any) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {});

    // Count review decisions
    const reviewCounts = records.reduce((acc: any, record: any) => {
      if (record.review_decision) {
        acc[record.review_decision] = (acc[record.review_decision] || 0) + 1;
      }
      return acc;
    }, {});

    addLine("\n📈 PROCESSING SUMMARY:");
    addLine(`   Total records: ${records.length}`);
    addLine(`   ✅ Updated existing: ${statusCounts.updated || 0}`);
    addLine(`   🆕 Created new: ${statusCounts.inserted || 0}`);
    addLine(`   ⏳ Pending review: ${statusCounts.review_needed || 0}`);
    addLine(`   📝 Potential new: ${statusCounts.pending || 0}`);
    addLine(`   ❌ Failed: ${statusCounts.failed || 0}`);

    if (Object.keys(reviewCounts).length > 0) {
      addLine("\n👀 REVIEW DECISIONS:");
      addLine(`   ✅ Approved: ${reviewCounts.approved || 0}`);
      addLine(`   ❌ Rejected: ${reviewCounts.rejected || 0}`);
      addLine(`   ⏭️  Skipped: ${reviewCounts.skipped || 0}`);
    }

    // Show detailed specialty information
    if (config.actions?.add_specialties) {
      addLine("\n🏷️  SPECIALTY ADDITIONS:");
      addLine(`   Specialty: ${config.actions.add_specialties.join(", ")}`);

      // Get detailed breakdown of specialty additions
      const autoProcessed = records.filter(
        (r: any) =>
          r.status === "updated" &&
          r.match_confidence >= 0.75 &&
          !r.review_decision
      );

      const reviewApproved = records.filter(
        (r: any) =>
          (r.status === "updated" || r.status === "inserted") &&
          r.review_decision === "approved"
      );

      const reviewRejected = records.filter(
        (r: any) => r.review_decision === "rejected"
      );

      const notProcessed = records.filter(
        (r: any) =>
          r.status === "pending" ||
          r.status === "review_needed" ||
          r.review_decision === "skipped"
      );

      addLine(`\n   📊 BREAKDOWN BY PROCESSING TYPE:`);
      addLine(
        `   🤖 Auto-processed (≥75% confidence): ${autoProcessed.length} clinics`
      );
      if (autoProcessed.length > 0) {
        autoProcessed.forEach((record: any) => {
          addLine(
            `      ✅ ${record.raw_data.klinikNavn} → ${
              record.matched_clinic_id
            } (${(record.match_confidence * 100).toFixed(1)}%)`
          );
        });
      }

      addLine(`\n   👤 Review approved: ${reviewApproved.length} clinics`);
      if (reviewApproved.length > 0) {
        reviewApproved.forEach((record: any) => {
          const action = record.status === "updated" ? "Updated" : "Created";
          addLine(
            `      ✅ ${record.raw_data.klinikNavn} → ${record.matched_clinic_id} (${action})`
          );
        });
      }

      addLine(
        `\n   🗑️  Review rejected (ignored): ${reviewRejected.length} clinics`
      );
      if (reviewRejected.length > 0) {
        reviewRejected.forEach((record: any) => {
          addLine(
            `      ❌ ${record.raw_data.klinikNavn} (Ignored - no action taken)`
          );
        });
      }

      addLine(
        `\n   ❌ NOT processed (no specialty added): ${notProcessed.length} clinics`
      );
      if (notProcessed.length > 0) {
        notProcessed.forEach((record: any) => {
          let reason = "";
          if (record.status === "pending") {
            reason = `Low confidence (${(record.match_confidence * 100).toFixed(
              1
            )}%)`;
          } else if (record.status === "review_needed") {
            reason = "Awaiting review";
          } else if (record.review_decision === "skipped") {
            reason = "Skipped in review";
          }
          addLine(`      ⏭️  ${record.raw_data.klinikNavn} - ${reason}`);
        });
      }

      const totalWithSpecialty = autoProcessed.length + reviewApproved.length;
      addLine(
        `\n   📈 TOTAL SPECIALTY ADDITIONS: ${totalWithSpecialty} clinics`
      );
    }

    // Show confidence distribution
    const confidenceRanges = {
      high: records.filter((r: any) => r.match_confidence >= 0.75).length,
      medium: records.filter(
        (r: any) => r.match_confidence >= 0.4 && r.match_confidence < 0.75
      ).length,
      low: records.filter((r: any) => r.match_confidence < 0.4).length,
    };

    addLine("\n🎯 CONFIDENCE DISTRIBUTION:");
    addLine(`   High (≥75%): ${confidenceRanges.high} records`);
    addLine(`   Medium (40-74%): ${confidenceRanges.medium} records`);
    addLine(`   Low (<40%): ${confidenceRanges.low} records`);

    // Show any failed records
    const failedRecords = records.filter((r: any) => r.status === "failed");
    if (failedRecords.length > 0) {
      addLine("\n❌ FAILED RECORDS:");
      failedRecords.forEach((record: any) => {
        addLine(`   - ${record.raw_data.klinikNavn}: ${record.error_message}`);
      });
    }

    // Show potential new clinics
    const potentialNew = records.filter(
      (r: any) => r.status === "pending" && r.match_confidence < 0.4
    );
    if (potentialNew.length > 0) {
      addLine("\n🆕 POTENTIAL NEW CLINICS:");
      potentialNew.forEach((record: any) => {
        addLine(
          `   - ${record.raw_data.klinikNavn} (${(
            record.match_confidence * 100
          ).toFixed(1)}% confidence)`
        );
      });
      addLine(
        `\n💡 To review potential new clinics: npm run list:new-clinics -- --batch-id=${batchId}`
      );
    }

    addLine("\n" + "=".repeat(60));

    // Save report to file
    if (fileName) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const baseFileName = path.basename(fileName, path.extname(fileName));
      const reportFileName = `${baseFileName}-report-${timestamp}.txt`;
      const reportPath = path.resolve(
        process.cwd(),
        "scripts/ingestion/reports",
        reportFileName
      );

      // Ensure reports directory exists
      const reportsDir = path.dirname(reportPath);
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      // Write report to file
      const reportContent = reportLines.join("\n");
      fs.writeFileSync(reportPath, reportContent, "utf-8");

      console.log(`\n📄 Report saved to: ${reportPath}`);
    }
  } catch (error) {
    console.error("❌ Failed to generate report:", error);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("❌ Import failed:", error);
    process.exit(1);
  });
}
