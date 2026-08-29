/**
 * Repair map pins for clinics that share a Google Place ID across different postcodes.
 * Keeps google_place_id and Maps URLs; rewrites latitude/longitude from each clinic address.
 *
 * Dry-run by default. Pass --apply to write.
 *
 * Usage:
 *   tsx scripts/repair-shared-place-coordinates.ts
 *   tsx scripts/repair-shared-place-coordinates.ts --apply
 *   tsx scripts/repair-shared-place-coordinates.ts --apply --limit 10
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { geocodeDanishAddress } from "../src/lib/geocoding/geocode-danish-address";
import { selectClinicsSharingPlaceIdAcrossPostcodes } from "../src/lib/geocoding/shared-place-coordinates";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const API_DELAY_MS = 150;

interface Clinic {
  clinics_id: string;
  klinikNavn: string;
  adresse: string | null;
  postnummer: number | null;
  lokation: string | null;
  google_place_id: string | null;
  google_maps_url_cid: string | null;
  latitude: number | null;
  longitude: number | null;
}

const parseArgs = () => {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : undefined;
  return { apply, limit };
};

async function fetchClinicsWithPlaceIds(supabase: SupabaseClient): Promise<Clinic[]> {
  const PAGE_SIZE = 1000;
  const all: Clinic[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("clinics")
      .select(
        "clinics_id, klinikNavn, adresse, postnummer, lokation, google_place_id, google_maps_url_cid, latitude, longitude"
      )
      .not("google_place_id", "is", null)
      .order("klinikNavn")
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    all.push(...(data as unknown as Clinic[]));
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return all;
}

const delay = (ms: number) =>
  new Promise((resolveDelay) => setTimeout(resolveDelay, ms));

async function main() {
  const { apply, limit } = parseArgs();

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error(
      "Missing required environment variables (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)."
    );
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const clinics = await fetchClinicsWithPlaceIds(supabase);
  const targets = selectClinicsSharingPlaceIdAcrossPostcodes(clinics).slice(
    0,
    limit ?? Number.POSITIVE_INFINITY
  );

  if (targets.length === 0) {
    console.log("No shared-Place-ID clinics with different postcodes found.");
    return;
  }

  console.log(
    `Found ${targets.length} clinics sharing a Place ID across different postcodes.`
  );
  console.log(`Mode: ${apply ? "APPLY" : "DRY RUN"}`);

  const stats = {
    total: targets.length,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  for (let index = 0; index < targets.length; index++) {
    const clinic = targets[index];
    const tag = `[${index + 1}/${targets.length}]`;

    try {
      const coordinates = await geocodeDanishAddress({
        adresse: clinic.adresse,
        postnummer: clinic.postnummer,
        lokation: clinic.lokation,
      });

      if (!coordinates) {
        stats.skipped++;
        console.log(
          `${tag} WARN No address coordinates for "${clinic.klinikNavn}" (${clinic.adresse}, ${clinic.postnummer} ${clinic.lokation})`
        );
        await delay(API_DELAY_MS);
        continue;
      }

      const samePin =
        clinic.latitude === coordinates.latitude &&
        clinic.longitude === coordinates.longitude;

      console.log(
        `${tag} ${samePin ? "KEEP" : "MOVE"} ${clinic.klinikNavn}: ${clinic.adresse}, ${clinic.postnummer} ${clinic.lokation} → ${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)} (place ${clinic.google_place_id})`
      );

      if (apply && !samePin) {
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
  console.log("Place IDs and Maps URLs were left unchanged.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
