// CLI Review Interface
// Handles manual review of uncertain matches

import * as readline from "readline";

export interface ReviewRecord {
  id: string;
  csvData: any;
  matchedClinic?: any;
  confidence: number;
  reasons: string[];
}

export class ReviewInterface {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Review a single uncertain match
   */
  async reviewMatch(
    record: ReviewRecord,
    current?: number,
    total?: number
  ): Promise<"approved" | "rejected" | "skipped"> {
    console.log("\n" + "=".repeat(70));
    console.log("🤔 UNCERTAIN MATCH FOUND");
    if (current && total) {
      console.log(`📍 Progress: ${current}/${total}`);
    }
    console.log("=".repeat(70));

    if (record.matchedClinic) {
      console.log(
        `\n📊 Confidence: ${(record.confidence * 100).toFixed(
          1
        )}% - ${record.reasons.join(", ")}`
      );
      console.log("\n📊 Side-by-Side Comparison:");
      console.log("");

      // Names comparison
      console.log("📝 Names:");
      console.log(`   CSV:   ${record.csvData.klinikNavn}`);
      console.log(`   Match: ${record.matchedClinic.klinikNavn}`);
      console.log("");

      // Address comparison
      console.log("📍 Addresses:");
      console.log(`   CSV:   ${record.csvData.adresse || "N/A"}`);
      console.log(`   Match: ${record.matchedClinic.adresse || "N/A"}`);
      console.log("");

      // Postal code comparison
      console.log("📮 Postal Codes:");
      console.log(`   CSV:   ${record.csvData.postnummer || "N/A"}`);
      console.log(`   Match: ${record.matchedClinic.postnummer || "N/A"}`);
    }

    const answer = await this.askQuestion(
      "\n📋 [y] Accept  [n] Reject  [s] Skip  [q] Quit → "
    );

    switch (answer.toLowerCase()) {
      case "y":
      case "yes":
        return "approved";
      case "n":
      case "no":
        return "rejected";
      case "s":
      case "skip":
        return "skipped";
      case "q":
      case "quit":
        console.log("👋 Exiting review process...");
        process.exit(0);
      default:
        console.log("❌ Invalid choice. Please enter y, n, s, or q.");
        return this.reviewMatch(record, current, total); // Ask again
    }
  }

  /**
   * Review multiple records
   */
  async reviewBatch(
    records: ReviewRecord[]
  ): Promise<Map<string, "approved" | "rejected" | "skipped">> {
    const decisions = new Map<string, "approved" | "rejected" | "skipped">();

    console.log(
      `\n🔍 Starting manual review of ${records.length} uncertain matches...`
    );

    for (let i = 0; i < records.length; i++) {
      const record = records[i];

      const decision = await this.reviewMatch(record, i + 1, records.length);
      decisions.set(record.id, decision);

      if (decision === "approved") {
        console.log("✅ Match approved");
      } else if (decision === "rejected") {
        console.log("❌ Match rejected - will create new clinic");
      } else {
        console.log("⏭️  Skipped for later review");
      }
    }

    return decisions;
  }

  /**
   * Ask a question and wait for user input
   */
  private askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * Close the readline interface
   */
  close(): void {
    this.rl.close();
  }
}
