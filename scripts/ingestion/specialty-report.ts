// Specialty Addition Report Script
// Generates detailed reports on specialty additions for any batch

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import * as fs from "fs";
import * as path from "path";

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
    console.error("Usage: npm run specialty:report -- --batch-id=<batch-uuid>");
    console.error("\nTo find recent batches:");
    console.error(
      "SELECT id, source_name, created_at FROM data_ingestion_batches ORDER BY created_at DESC LIMIT 5;"
    );

    // Show recent batches automatically
    await showRecentBatches();
    process.exit(1);
  }

  console.log("📊 Generating specialty addition report...");
  console.log(`📦 Batch ID: ${batchId}`);

  try {
    await generateSpecialtyReport(batchId);
  } catch (error) {
    console.error("❌ Report generation failed:", error);
    process.exit(1);
  }
}

async function showRecentBatches(): Promise<void> {
  console.log("\n📋 Recent batches:");

  const { data: batches, error } = await supabase
    .from("data_ingestion_batches")
    .select("id, source_name, created_at, stats")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error || !batches || batches.length === 0) {
    console.log("   No recent batches found.");
    return;
  }

  for (const batch of batches) {
    const date = new Date(batch.created_at).toLocaleDateString();
    const time = new Date(batch.created_at).toLocaleTimeString();
    console.log(`   ${batch.id} - ${batch.source_name} (${date} ${time})`);
  }
}

async function generateSpecialtyReport(batchId: string): Promise<void> {
  const reportLines: string[] = [];

  // Helper function to add line to both console and report
  const addLine = (line: string) => {
    console.log(line);
    reportLines.push(line);
  };

  // Get batch information
  const { data: batch, error: batchError } = await supabase
    .from("data_ingestion_batches")
    .select("*")
    .eq("id", batchId)
    .single();

  if (batchError || !batch) {
    throw new Error(
      `Failed to fetch batch: ${batchError?.message || "Batch not found"}`
    );
  }

  // Get all records for this batch
  const { data: records, error: recordsError } = await supabase
    .from("data_ingestion_records")
    .select("*")
    .eq("batch_id", batchId);

  if (recordsError || !records) {
    throw new Error(
      `Failed to fetch records: ${recordsError?.message || "Records not found"}`
    );
  }

  addLine("\n" + "=".repeat(70));
  addLine("🏷️  SPECIALTY ADDITION DETAILED REPORT");
  addLine("=".repeat(70));

  addLine(`📦 Batch ID: ${batchId}`);
  addLine(`🏷️  Source: ${batch.source_name}`);
  addLine(
    `📅 Processed: ${new Date(
      batch.processed_at || batch.created_at
    ).toLocaleString()}`
  );
  addLine(`📁 File: ${batch.file_name}`);

  // Load configuration to get specialty info
  const config = batch.config;
  if (!config?.actions?.add_specialties) {
    addLine("\n❌ No specialty additions configured for this batch.");
    return;
  }

  addLine(`🎯 Target Specialty: ${config.actions.add_specialties.join(", ")}`);

  // Categorize records
  const autoProcessed = records.filter(
    (r: any) =>
      r.status === "updated" && r.match_confidence >= 0.75 && !r.review_decision
  );

  const reviewApproved = records.filter(
    (r: any) =>
      (r.status === "updated" || r.status === "inserted") &&
      r.review_decision === "approved"
  );

  const reviewRejected = records.filter(
    (r: any) => r.status === "inserted" && r.review_decision === "rejected"
  );

  const notProcessed = records.filter(
    (r: any) =>
      r.status === "pending" ||
      r.status === "review_needed" ||
      r.review_decision === "skipped"
  );

  const totalWithSpecialty =
    autoProcessed.length + reviewApproved.length + reviewRejected.length;

  addLine("\n📊 SUMMARY:");
  addLine(`   Total records: ${records.length}`);
  addLine(`   ✅ Specialty added: ${totalWithSpecialty} clinics`);
  addLine(`   ❌ Specialty NOT added: ${notProcessed.length} clinics`);

  // Detailed breakdown
  addLine("\n" + "=".repeat(70));
  addLine("📈 DETAILED BREAKDOWN");
  addLine("=".repeat(70));

  // 1. Auto-processed
  addLine(
    `\n🤖 AUTO-PROCESSED (≥75% confidence): ${autoProcessed.length} clinics`
  );
  if (autoProcessed.length > 0) {
    autoProcessed.forEach((record: any, index: number) => {
      addLine(`   ${index + 1}. ${record.raw_data.klinikNavn}`);
      addLine(`      → Clinic ID: ${record.matched_clinic_id}`);
      addLine(
        `      → Confidence: ${(record.match_confidence * 100).toFixed(1)}%`
      );
      addLine(`      → Status: Updated existing clinic`);
      addLine("");
    });
  } else {
    addLine("   No auto-processed clinics.");
  }

  // 2. Review approved
  addLine(`\n👤 REVIEW APPROVED: ${reviewApproved.length} clinics`);
  if (reviewApproved.length > 0) {
    reviewApproved.forEach((record: any, index: number) => {
      const action =
        record.status === "updated"
          ? "Updated existing clinic"
          : "Created new clinic";
      addLine(`   ${index + 1}. ${record.raw_data.klinikNavn}`);
      addLine(`      → Clinic ID: ${record.matched_clinic_id}`);
      addLine(
        `      → Confidence: ${(record.match_confidence * 100).toFixed(1)}%`
      );
      addLine(`      → Status: ${action} (manually approved)`);
      addLine("");
    });
  } else {
    addLine("   No review-approved clinics.");
  }

  // 3. Review rejected (new clinics)
  addLine(
    `\n🆕 REVIEW REJECTED (New clinics created): ${reviewRejected.length} clinics`
  );
  if (reviewRejected.length > 0) {
    reviewRejected.forEach((record: any, index: number) => {
      addLine(`   ${index + 1}. ${record.raw_data.klinikNavn}`);
      addLine(`      → Clinic ID: ${record.matched_clinic_id}`);
      addLine(
        `      → Confidence: ${(record.match_confidence * 100).toFixed(1)}%`
      );
      addLine(`      → Status: Created new clinic (match rejected)`);
      addLine("");
    });
  } else {
    addLine("   No new clinics created from rejected matches.");
  }

  // 4. Not processed
  addLine(
    `\n❌ NOT PROCESSED (No specialty added): ${notProcessed.length} clinics`
  );
  if (notProcessed.length > 0) {
    notProcessed.forEach((record: any, index: number) => {
      let reason = "";
      if (record.status === "pending") {
        reason = `Low confidence (${(record.match_confidence * 100).toFixed(
          1
        )}%) - potential new clinic`;
      } else if (record.status === "review_needed") {
        reason = "Awaiting manual review";
      } else if (record.review_decision === "skipped") {
        reason = "Skipped during manual review";
      }

      addLine(`   ${index + 1}. ${record.raw_data.klinikNavn}`);
      addLine(`      → Reason: ${reason}`);
      if (record.matched_clinic_id) {
        addLine(`      → Potential match: ${record.matched_clinic_id}`);
      }
      addLine("");
    });
  } else {
    addLine("   All clinics were processed successfully.");
  }

  addLine("=".repeat(70));
  addLine(
    `🎯 FINAL RESULT: ${totalWithSpecialty}/${
      records.length
    } clinics received the "${config.actions.add_specialties.join(
      ", "
    )}" specialty`
  );
  addLine("=".repeat(70));

  if (notProcessed.length > 0) {
    addLine(`\n💡 To process remaining clinics:`);
    addLine(
      `   - Review potential new clinics: npm run list:new-clinics -- --batch-id=${batchId}`
    );
    addLine(
      `   - Approve new clinics: npm run approve:new-clinics -- --batch-id=${batchId}`
    );
    addLine(
      `   - Manual review: npm run review:batch -- --batch-id=${batchId}`
    );
  }

  // Save report to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportFileName = `specialty-report-${batch.source_name}-${timestamp}.txt`;
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

  console.log(`\n📄 Specialty report saved to: ${reportPath}`);
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("❌ Report generation failed:", error);
    process.exit(1);
  });
}
