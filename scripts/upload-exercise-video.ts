/**
 * Uploads an exercise demo video to the public `exercise-videos` Storage bucket
 * and prints the public URL to paste into an exercise's `videoUrl` frontmatter.
 *
 * Storage serves these through the Smart CDN, so they bill as cached egress
 * rather than the pricier uncached tier. The long `cacheControl` keeps them
 * there; filenames must therefore change when the footage changes.
 *
 * Usage:
 *   tsx scripts/upload-exercise-video.ts <file> [--name my-clip.mp4] [--bucket NAME]
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import { basename, dirname, extname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const DEFAULT_BUCKET = "exercise-videos";
const CACHE_CONTROL = "31536000";
/** Matches the project-wide Storage upload ceiling; raising it needs a plan/setting change. */
const FILE_SIZE_LIMIT = 50 * 1024 * 1024;

const CONTENT_TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const file = args.find((arg) => !arg.startsWith("--"));
  const nameIdx = args.indexOf("--name");
  const bucketIdx = args.indexOf("--bucket");
  return {
    file,
    name: nameIdx !== -1 ? args[nameIdx + 1] : undefined,
    bucket: bucketIdx !== -1 ? args[bucketIdx + 1] : DEFAULT_BUCKET,
  };
};

const formatBytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

async function main() {
  const { file, name, bucket } = parseArgs();

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
    process.exit(1);
  }

  if (!file) {
    console.error("Usage: tsx scripts/upload-exercise-video.ts <file> [--name x.mp4]");
    process.exit(1);
  }

  const sourcePath = resolve(process.cwd(), file);
  if (!fs.existsSync(sourcePath)) {
    console.error(`No such file: ${sourcePath}`);
    process.exit(1);
  }

  const extension = extname(sourcePath).toLowerCase();
  const contentType = CONTENT_TYPES[extension];
  if (!contentType) {
    console.error(
      `Unsupported extension "${extension}". Supported: ${Object.keys(CONTENT_TYPES).join(", ")}`
    );
    process.exit(1);
  }

  const objectName = name ?? basename(sourcePath);
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const { data: buckets, error: listError } =
    await supabase.storage.listBuckets();
  if (listError) {
    throw new Error(`Failed to list buckets: ${listError.message}`);
  }

  if (!buckets?.some((b) => b.name === bucket)) {
    console.log(`Creating public bucket "${bucket}"...`);
    const { error: createError } = await supabase.storage.createBucket(bucket, {
      public: true,
      allowedMimeTypes: Object.values(CONTENT_TYPES),
      fileSizeLimit: FILE_SIZE_LIMIT,
    });
    if (createError) {
      throw new Error(`Failed to create bucket: ${createError.message}`);
    }
  }

  const body = fs.readFileSync(sourcePath);
  console.log(`Uploading ${objectName} (${formatBytes(body.byteLength)})...`);

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(objectName, body, {
      contentType,
      cacheControl: CACHE_CONTROL,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(objectName);

  console.log("\nDone. Add to the exercise frontmatter:");
  console.log(`videoUrl: ${publicUrl}`);
}

main().catch((error) => {
  console.error("Upload failed:", error);
  process.exit(1);
});
