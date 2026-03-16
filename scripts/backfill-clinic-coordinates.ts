/**
 * One-time backfill: populate clinic latitude/longitude from Google Place IDs.
 *
 * Usage:
 *   tsx scripts/backfill-clinic-coordinates.ts [--dry-run] [--limit N]
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../.env.local") });

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const API_DELAY_MS = 200;

interface Clinic {
  clinics_id: string;
  klinikNavn: string;
  google_place_id: string;
  latitude: number | null;
  longitude: number | null;
}

interface PlaceDetailsResponse {
  location?: {
    latitude?: number;
    longitude?: number;
  };
}

const parseArgs = () => {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : undefined;
  return { dryRun, limit };
};

async function fetchPlaceCoordinates(placeId: string): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": GOOGLE_API_KEY,
      "X-Goog-FieldMask": "location",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Place Details API ${response.status}: ${body}`);
  }

  const data = (await response.json()) as PlaceDetailsResponse;
  const latitude = data.location?.latitude;
  const longitude = data.location?.longitude;

  if (typeof latitude !== "number" || typeof longitude !== "number") return null;
  return { latitude, longitude };
}

async function fetchTargetClinics(
  supabase: SupabaseClient,
  limit?: number
): Promise<Clinic[]> {
  const PAGE_SIZE = 1000;
  const all: Clinic[] = [];
  let from = 0;

  while (true) {
    const to =
      limit !== undefined
        ? Math.min(from + PAGE_SIZE - 1, limit - 1)
        : from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("clinics")
      .select("clinics_id, klinikNavn, google_place_id, latitude, longitude")
      .not("google_place_id", "is", null)
      .or("latitude.is.null,longitude.is.null")
      .order("klinikNavn")
      .range(from, to);

    if (error) throw error;
    if (!data || data.length === 0) break;

    all.push(...(data as unknown as Clinic[]));

    if (limit !== undefined && all.length >= limit) break;
    if (data.length < PAGE_SIZE) break;

    from += PAGE_SIZE;
  }

  return all;
}

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const { dryRun, limit } = parseArgs();

  if (!GOOGLE_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    console.error(
      "Missing required environment variables (GOOGLE_PLACES_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)."
    );
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const clinics = await fetchTargetClinics(supabase, limit);

  if (clinics.length === 0) {
    console.log("All clinics already have coordinates.");
    return;
  }

  console.log(`Found ${clinics.length} clinics missing coordinates.`);

  const stats = {
    total: clinics.length,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  for (let index = 0; index < clinics.length; index++) {
    const clinic = clinics[index];
    const tag = `[${index + 1}/${clinics.length}]`;

    try {
      const coordinates = await fetchPlaceCoordinates(clinic.google_place_id);

      if (!coordinates) {
        stats.skipped++;
        console.log(`${tag} WARN No coordinates for "${clinic.klinikNavn}"`);
        await delay(API_DELAY_MS);
        continue;
      }

      if (!dryRun) {
        const { error: updateError } = await supabase
          .from("clinics")
          .update({
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            updated_at: new Date().toISOString(),
          })
          .eq("clinics_id", clinic.clinics_id);

        if (updateError) {
          throw updateError;
        }
      }

      stats.updated++;
      console.log(
        `${tag} OK ${clinic.klinikNavn}: ${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`
      );
    } catch (error) {
      stats.errors++;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`${tag} ERROR ${clinic.klinikNavn}: ${message}`);
    }

    await delay(API_DELAY_MS);
  }

  console.log("\nSummary");
  console.log(`Total processed: ${stats.total}`);
  console.log(`Updated: ${stats.updated}`);
  console.log(`Skipped: ${stats.skipped}`);
  console.log(`Errors: ${stats.errors}`);
  console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });

