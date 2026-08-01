/**
 * One-time backfill: raise Cache-Control max-age on existing Supabase Storage objects.
 *
 * Objects uploaded before we set `cacheControl` explicitly carry the SDK default of
 * `max-age=3600`. The Next.js image optimizer takes the larger of that header and
 * `images.minimumCacheTTL`, so a short header forced the optimizer to re-download
 * full-size originals from Storage — billed as egress every time.
 *
 * Storage exposes no metadata-only update, so each object is downloaded and re-uploaded
 * with `upsert`. Bytes are unchanged; only the header differs. Downloading costs egress
 * once (~43 MB for the current bucket), which pays for itself immediately.
 *
 * Usage:
 *   tsx scripts/backfill-storage-cache-headers.ts [--dry-run] [--limit N] [--bucket NAME]
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const TARGET_CACHE_CONTROL = "31536000";
const DEFAULT_BUCKET = "clinic-team-pics";
const PAGE_SIZE = 100;

interface StorageObject {
  name: string;
  metadata: {
    size?: number;
    mimetype?: string;
    cacheControl?: string;
  } | null;
}

const parseArgs = () => {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : undefined;
  const bucketIdx = args.indexOf("--bucket");
  const bucket = bucketIdx !== -1 ? args[bucketIdx + 1] : DEFAULT_BUCKET;
  return { dryRun, limit, bucket };
};

const formatBytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/**
 * Storage `list` only returns one directory level, so walk prefixes recursively.
 * Entries without metadata are folders.
 */
async function listAllObjects(
  supabase: SupabaseClient,
  bucket: string,
  prefix = ""
): Promise<string[]> {
  const paths: string[] = [];
  let offset = 0;

  for (;;) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit: PAGE_SIZE,
      offset,
    });

    if (error) throw new Error(`Failed to list "${prefix}": ${error.message}`);
    if (!data || data.length === 0) break;

    for (const entry of data as unknown as StorageObject[]) {
      const fullPath = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.metadata) {
        paths.push(fullPath);
      } else {
        paths.push(...(await listAllObjects(supabase, bucket, fullPath)));
      }
    }

    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return paths;
}

async function main() {
  const { dryRun, limit, bucket } = parseArgs();

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  console.log(`Bucket: ${bucket}`);
  console.log(`Target Cache-Control: max-age=${TARGET_CACHE_CONTROL}`);
  if (dryRun) console.log("Mode: dry run (no writes)\n");

  const allPaths = await listAllObjects(supabase, bucket);
  const paths = limit ? allPaths.slice(0, limit) : allPaths;

  console.log(`Found ${allPaths.length} objects, processing ${paths.length}\n`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;
  let bytesTransferred = 0;

  for (const [index, path] of paths.entries()) {
    const position = `[${index + 1}/${paths.length}]`;

    try {
      const { data: blob, error: downloadError } = await supabase.storage
        .from(bucket)
        .download(path);

      if (downloadError || !blob) {
        throw new Error(downloadError?.message ?? "empty download");
      }

      bytesTransferred += blob.size;

      if (dryRun) {
        console.log(`${position} would update ${path} (${formatBytes(blob.size)})`);
        skipped += 1;
        continue;
      }

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, blob, {
          contentType: blob.type || "application/octet-stream",
          cacheControl: TARGET_CACHE_CONTROL,
          upsert: true,
        });

      if (uploadError) throw new Error(uploadError.message);

      console.log(`${position} updated ${path} (${formatBytes(blob.size)})`);
      updated += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`${position} FAILED ${path}: ${message}`);
      failed += 1;
    }
  }

  console.log("\n--- Summary ---");
  console.log(`Updated:     ${updated}`);
  console.log(`Skipped:     ${skipped}`);
  console.log(`Failed:      ${failed}`);
  console.log(`Downloaded:  ${formatBytes(bytesTransferred)} (one-time egress)`);

  if (failed > 0) process.exit(1);
}

main().catch((error) => {
  console.error("Backfill failed:", error);
  process.exit(1);
});
