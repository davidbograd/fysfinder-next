/**
 * One-time clinic duplicate merge. Refuses to run without --apply.
 * Creates a local JSON backup, remaps FKs, unions junction rows, fills empty
 * keeper fields, deletes extras, and writes clinic-duplicate-redirects.js.
 *
 * Usage:
 *   npx tsx scripts/dedupe-clinics/apply.ts
 *   npx tsx scripts/dedupe-clinics/apply.ts --apply
 */

import { mkdir, writeFile } from "fs/promises";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import type { SupabaseClient } from "@supabase/supabase-js";
import { APPROVED_EXTRA_MERGES } from "./approved-extra-merges";
import { createDedupeClient, loadDuplicateCandidates } from "./fetch-groups";
import { classifyGroups, mergeFillableFields, type ClinicCandidate } from "./logic";
import { collectMergeJobs } from "./merge-plan";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BACKUP_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS public.clinic_duplicate_merge_backup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merged_at timestamptz NOT NULL DEFAULT now(),
  keeper_id uuid NOT NULL,
  dropped_id uuid NOT NULL,
  google_place_id text,
  keeper_row jsonb NOT NULL,
  dropped_row jsonb NOT NULL
);
`;

interface RedirectEntry {
  source: string;
  destination: string;
  permanent: boolean;
}

function parseArgs() {
  return { apply: process.argv.includes("--apply") };
}

async function ensureBackupTable(supabase: SupabaseClient) {
  const { error } = await supabase.from("clinic_duplicate_merge_backup").select("id").limit(1);
  if (!error) return true;
  console.warn(
    "Backup table clinic_duplicate_merge_backup is missing. Local JSON backup will still be written.\n" +
      "Create the table with:\n" +
      BACKUP_TABLE_SQL
  );
  return false;
}

async function insertBackupRow(
  supabase: SupabaseClient,
  tableExists: boolean,
  keeper: ClinicCandidate,
  dropped: ClinicCandidate
) {
  if (!tableExists) return;
  const { error } = await supabase.from("clinic_duplicate_merge_backup").insert({
    keeper_id: keeper.clinics_id,
    dropped_id: dropped.clinics_id,
    google_place_id: keeper.google_place_id,
    keeper_row: keeper,
    dropped_row: dropped,
  });
  if (error) {
    throw new Error(`Failed to insert backup row: ${error.message}`);
  }
}

async function remappingClinicId(
  supabase: SupabaseClient,
  table: string,
  column: string,
  fromId: string,
  toId: string
) {
  const { error } = await supabase.from(table).update({ [column]: toId }).eq(column, fromId);
  if (error) {
    throw new Error(`Failed to remap ${table}.${column}: ${error.message}`);
  }
}

async function unionJunction(
  supabase: SupabaseClient,
  table: string,
  clinicColumn: string,
  keyColumn: string,
  fromId: string,
  toId: string
) {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq(clinicColumn, fromId);
  if (error) {
    throw new Error(`Failed to read ${table} for drop ${fromId}: ${error.message}`);
  }

  for (const row of data ?? []) {
    const insertRow = {
      [clinicColumn]: toId,
      [keyColumn]: row[keyColumn],
    };
    const { error: insertError } = await supabase.from(table).insert(insertRow);
    if (
      insertError &&
      !insertError.message.toLowerCase().includes("duplicate") &&
      insertError.code !== "23505"
    ) {
      throw new Error(`Failed to union ${table}: ${insertError.message}`);
    }
  }

  const { error: deleteError } = await supabase.from(table).delete().eq(clinicColumn, fromId);
  if (deleteError) {
    throw new Error(`Failed to delete leftover ${table} rows: ${deleteError.message}`);
  }
}

async function fillKeeperFromLoser(
  supabase: SupabaseClient,
  keeper: ClinicCandidate,
  loser: ClinicCandidate
) {
  const updates = mergeFillableFields(keeper, loser);
  if (Object.keys(updates).length === 0) return;
  const { error } = await supabase
    .from("clinics")
    .update(updates)
    .eq("clinics_id", keeper.clinics_id);
  if (error) {
    throw new Error(`Failed to fill keeper fields: ${error.message}`);
  }
  Object.assign(keeper, updates);
}

async function mergePair(
  supabase: SupabaseClient,
  tableExists: boolean,
  keeper: ClinicCandidate,
  dropped: ClinicCandidate
) {
  await insertBackupRow(supabase, tableExists, keeper, dropped);

  await remappingClinicId(supabase, "clinic_owners", "clinic_id", dropped.clinics_id, keeper.clinics_id);
  await remappingClinicId(supabase, "clinic_claims", "clinic_id", dropped.clinics_id, keeper.clinics_id);
  await remappingClinicId(
    supabase,
    "clinic_creation_requests",
    "created_clinic_id",
    dropped.clinics_id,
    keeper.clinics_id
  );
  await remappingClinicId(supabase, "premium_listings", "clinic_id", dropped.clinics_id, keeper.clinics_id);
  await remappingClinicId(supabase, "clinic_team_members", "clinic_id", dropped.clinics_id, keeper.clinics_id);
  await remappingClinicId(supabase, "clinic_events", "clinic_id", dropped.clinics_id, keeper.clinics_id);
  await remappingClinicId(
    supabase,
    "data_ingestion_records",
    "matched_clinic_id",
    dropped.clinics_id,
    keeper.clinics_id
  );

  await unionJunction(
    supabase,
    "clinic_specialties",
    "clinics_id",
    "specialty_id",
    dropped.clinics_id,
    keeper.clinics_id
  );
  await unionJunction(
    supabase,
    "clinic_services",
    "clinic_id",
    "service_id",
    dropped.clinics_id,
    keeper.clinics_id
  );
  await unionJunction(
    supabase,
    "clinic_insurances",
    "clinic_id",
    "insurance_id",
    dropped.clinics_id,
    keeper.clinics_id
  );

  await fillKeeperFromLoser(supabase, keeper, dropped);

  const { error: deleteError } = await supabase
    .from("clinics")
    .delete()
    .eq("clinics_id", dropped.clinics_id);
  if (deleteError) {
    throw new Error(`Failed to delete dropped clinic ${dropped.klinikNavn}: ${deleteError.message}`);
  }
}

function redirectsFromJobs(
  jobs: { keeper: ClinicCandidate; dropped: ClinicCandidate }[]
): RedirectEntry[] {
  const redirects: RedirectEntry[] = [];
  const seen = new Set<string>();
  for (const job of jobs) {
    if (!job.dropped.klinikNavnSlug || job.dropped.klinikNavnSlug === job.keeper.klinikNavnSlug) {
      continue;
    }
    const source = `/klinik/${job.dropped.klinikNavnSlug}`;
    if (seen.has(source)) continue;
    seen.add(source);
    redirects.push({
      source,
      destination: `/klinik/${job.keeper.klinikNavnSlug}`,
      permanent: true,
    });
  }
  return redirects;
}

function renderRedirectsFile(redirects: RedirectEntry[]): string {
  return `// Generated by scripts/dedupe-clinics/apply.ts — do not edit by hand.
// Updated: permanent redirects from dropped duplicate clinic slugs to the keeper page.

const clinicDuplicateRedirects = ${JSON.stringify(redirects, null, 2)};

export default clinicDuplicateRedirects;
`;
}

async function main() {
  const { apply } = parseArgs();
  const supabase = createDedupeClient();
  const candidates = await loadDuplicateCandidates(supabase);
  const groups = classifyGroups(candidates);
  const jobs = collectMergeJobs(groups, APPROVED_EXTRA_MERGES, candidates);
  const plannedRedirects = redirectsFromJobs(jobs);

  console.log(
    `Merge jobs: ${jobs.length}. Redirects: ${plannedRedirects.length}.`
  );

  if (!apply) {
    console.log("Refusing to change the database. Re-run with --apply after you have approved the list.");
    return;
  }

  const tableExists = await ensureBackupTable(supabase);
  const backupPayload = {
    merged_at: new Date().toISOString(),
    jobs,
  };
  const backupDir = resolve(__dirname, "backups");
  await mkdir(backupDir, { recursive: true });
  const backupPath = resolve(
    backupDir,
    `merge-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
  );
  await writeFile(backupPath, JSON.stringify(backupPayload, null, 2), "utf8");
  console.log(`Wrote local backup ${backupPath}`);

  for (const job of jobs) {
    console.log(`Merging "${job.dropped.klinikNavn}" → "${job.keeper.klinikNavn}" (${job.source})`);
    await mergePair(supabase, tableExists, job.keeper, job.dropped);
  }

  const redirectsPath = resolve(__dirname, "../../clinic-duplicate-redirects.js");
  await writeFile(redirectsPath, renderRedirectsFile(plannedRedirects), "utf8");
  console.log(`Wrote ${redirectsPath}`);
  console.log(`Merged ${jobs.length} duplicate clinics.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
