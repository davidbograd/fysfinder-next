/**
 * Send monthly clinic value emails for the previous calendar month.
 *
 * Usage:
 *   tsx scripts/send-monthly-clinic-summary.ts [--dry-run] [--preview-to=email] [--period=YYYY-MM]
 */

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { sendMonthlySummaryAdminReport } from "../src/lib/monthly-clinic-summary-email";
import { runMonthlyClinicSummary } from "../src/lib/monthly-clinic-summary-job";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../.env.local") });

function parseArgs(argv: string[]): {
  dryRun: boolean;
  previewTo?: string;
  periodYm?: string;
} {
  let dryRun = false;
  let previewTo: string | undefined;
  let periodYm: string | undefined;

  for (const arg of argv) {
    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (arg.startsWith("--preview-to=")) {
      previewTo = arg.slice("--preview-to=".length).trim();
      continue;
    }
    if (arg.startsWith("--period=")) {
      periodYm = arg.slice("--period=".length).trim();
    }
  }

  return { dryRun, previewTo, periodYm };
}

async function main() {
  const { dryRun, previewTo, periodYm } = parseArgs(process.argv.slice(2));
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.fysfinder.dk";

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  }
  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY is required");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const resend = new Resend(resendApiKey);

  const result = await runMonthlyClinicSummary({
    supabase,
    resend,
    dryRun,
    previewTo,
    periodYm,
    siteUrl,
  });

  console.log(
    JSON.stringify(
      {
        periodYm: result.periodYm,
        monthLabelDa: result.monthLabelDa,
        sent: result.sent,
        skipped: result.skipped,
        failed: result.failed,
        dryRun: result.dryRun,
        previewTo: result.previewTo,
        details: result.details,
      },
      null,
      2
    )
  );

  await sendMonthlySummaryAdminReport({
    periodYm: result.periodYm,
    monthLabelDa: result.monthLabelDa,
    sent: result.sent,
    skipped: result.skipped,
    failed: result.failed,
    dryRun: result.dryRun,
    details: result.details,
  });

  if (result.failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
