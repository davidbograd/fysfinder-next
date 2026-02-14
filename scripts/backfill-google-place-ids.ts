/**
 * One-time backfill: Find Google Place IDs for all clinics.
 *
 * Uses Places API (New) Text Search to find each clinic on Google Maps,
 * then stores the Place ID for future lookups.
 *
 * Usage:
 *   tsx scripts/backfill-google-place-ids.ts [--dry-run] [--limit N]
 *
 * Cost: Text Search Pro is free for first 5,000 calls/month.
 *       For ~1,916 clinics this is completely free.
 *
 * The script is resumable: it only processes clinics without a google_place_id,
 * so you can safely re-run it after an interruption.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../.env.local") });

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** Delay between API calls (ms) to stay well within rate limits */
const API_DELAY_MS = 250;

/** Minimum name-match score (0–1) to accept a result automatically */
const MIN_MATCH_SCORE = 0.3;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Clinic {
  clinics_id: string;
  klinikNavn: string;
  adresse: string | null;
  postnummer: number | null;
  lokation: string | null;
  google_maps_url_cid: string | null;
  google_place_id: string | null;
}

interface TextSearchPlace {
  id: string;
  displayName?: { text: string; languageCode: string };
  formattedAddress?: string;
  googleMapsUri?: string;
}

interface TextSearchResponse {
  places?: TextSearchPlace[];
}

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

const parseArgs = () => {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : undefined;

  return { dryRun, limit };
};

// ---------------------------------------------------------------------------
// Google Places API (New) – Text Search
// ---------------------------------------------------------------------------

const textSearch = async (query: string): Promise<TextSearchResponse> => {
  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        // Pro-tier fields so we can verify the match (free under 5K/month)
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.googleMapsUri",
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: "da",
        regionCode: "dk",
        pageSize: 3,
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Text Search API ${response.status}: ${body}`);
  }

  return response.json();
};

// ---------------------------------------------------------------------------
// Name-matching helpers
// ---------------------------------------------------------------------------

const normalize = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-zæøåé0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Returns a 0–1 score indicating how well two place names match.
 *  1.0 = exact match after normalization
 *  0.8 = one name contains the other
 *  0–0.8 = Jaccard word-overlap similarity
 */
const matchScore = (a: string, b: string): number => {
  const na = normalize(a);
  const nb = normalize(b);

  if (na === nb) return 1.0;
  if (na.includes(nb) || nb.includes(na)) return 0.8;

  const wordsA = new Set(na.split(" "));
  const wordsB = new Set(nb.split(" "));
  const intersection = [...wordsA].filter((w) => wordsB.has(w));
  const union = new Set([...wordsA, ...wordsB]);

  return intersection.length / union.size;
};

// ---------------------------------------------------------------------------
// Supabase: paginated fetch
// ---------------------------------------------------------------------------

const fetchClinicsWithoutPlaceId = async (
  supabase: SupabaseClient,
  limit?: number
): Promise<Clinic[]> => {
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
      .select(
        "clinics_id, klinikNavn, adresse, postnummer, lokation, google_maps_url_cid, google_place_id"
      )
      .is("google_place_id", null)
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
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const main = async () => {
  const { dryRun, limit } = parseArgs();

  if (!GOOGLE_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    console.error(
      "Missing required environment variables (GOOGLE_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)."
    );
    console.error("Make sure .env.local is configured correctly.");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  console.log("╔══════════════════════════════════════╗");
  console.log("║  Google Place ID Backfill            ║");
  console.log("╚══════════════════════════════════════╝");
  console.log(`Mode:  ${dryRun ? "DRY RUN (no DB writes)" : "LIVE"}`);
  if (limit) console.log(`Limit: ${limit} clinics`);
  console.log();

  // ------------------------------------------------------------------
  // 1. Fetch clinics that still need a Place ID
  // ------------------------------------------------------------------

  const clinics = await fetchClinicsWithoutPlaceId(supabase, limit);

  if (clinics.length === 0) {
    console.log("✓ All clinics already have a Place ID. Nothing to do.");
    return;
  }

  console.log(`Found ${clinics.length} clinics without a Place ID.\n`);

  // ------------------------------------------------------------------
  // 2. Process each clinic
  // ------------------------------------------------------------------

  const stats = {
    total: clinics.length,
    matched: 0,
    lowConfidence: 0,
    noResults: 0,
    errors: 0,
    dbUpdated: 0,
  };

  const lowConfidenceList: {
    clinic: string;
    googleName: string;
    score: number;
  }[] = [];
  const noResultsList: string[] = [];

  for (let i = 0; i < clinics.length; i++) {
    const clinic = clinics[i];
    const tag = `[${i + 1}/${clinics.length}]`;

    try {
      // Build a search query: name + address + postal code for specificity
      const queryParts = [clinic.klinikNavn];
      if (clinic.adresse) queryParts.push(clinic.adresse);
      if (clinic.postnummer) queryParts.push(String(clinic.postnummer));
      queryParts.push("Danmark");

      let result = await textSearch(queryParts.join(" "));

      // Retry with simpler query if no results
      if (!result.places?.length) {
        const fallback = `${clinic.klinikNavn} ${clinic.postnummer ?? ""} ${clinic.lokation ?? ""} fysioterapi Danmark`;
        result = await textSearch(fallback.trim());
      }

      if (!result.places?.length) {
        console.log(`${tag} ✗ No results: "${clinic.klinikNavn}"`);
        stats.noResults++;
        noResultsList.push(clinic.klinikNavn);
        await delay(API_DELAY_MS);
        continue;
      }

      // Pick the best match from top results
      let bestPlace = result.places[0];
      let bestScore = matchScore(
        clinic.klinikNavn,
        bestPlace.displayName?.text ?? ""
      );

      for (const place of result.places.slice(1)) {
        const score = matchScore(
          clinic.klinikNavn,
          place.displayName?.text ?? ""
        );
        if (score > bestScore) {
          bestScore = score;
          bestPlace = place;
        }
      }

      // Low confidence → skip, log for manual review
      if (bestScore < MIN_MATCH_SCORE) {
        const pct = (bestScore * 100).toFixed(0);
        console.log(
          `${tag} ⚠ Low confidence (${pct}%): "${clinic.klinikNavn}" → "${bestPlace.displayName?.text}"`
        );
        stats.lowConfidence++;
        lowConfidenceResults(lowConfidenceList, clinic, bestPlace, bestScore);
        await delay(API_DELAY_MS);
        continue;
      }

      // Good match – update the database
      stats.matched++;

      if (!dryRun) {
        const updateData: Record<string, string> = {
          google_place_id: bestPlace.id,
        };

        // Also set CID if the clinic doesn't have one yet
        if (bestPlace.googleMapsUri && !clinic.google_maps_url_cid) {
          updateData.google_maps_url_cid = bestPlace.googleMapsUri;
        }

        const { error: updateError } = await supabase
          .from("clinics")
          .update(updateData)
          .eq("clinics_id", clinic.clinics_id);

        if (updateError) {
          console.error(
            `${tag} ✗ DB error for "${clinic.klinikNavn}":`,
            updateError.message
          );
          stats.errors++;
          await delay(API_DELAY_MS);
          continue;
        }

        stats.dbUpdated++;
      }

      const pct = (bestScore * 100).toFixed(0);
      console.log(
        `${tag} ✓ ${pct}% match: "${clinic.klinikNavn}" → "${bestPlace.displayName?.text}" (${bestPlace.id})`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`${tag} ✗ Error for "${clinic.klinikNavn}": ${msg}`);
      stats.errors++;

      // If it's an API enablement issue, surface it clearly and stop
      if (
        msg.includes("SERVICE_DISABLED") ||
        msg.includes("not activated") ||
        msg.includes("has not been used") ||
        msg.includes("it is disabled")
      ) {
        console.error(
          "\n⛔ The Places API (New) is not enabled on your Google Cloud project."
        );
        console.error(
          "   Enable it at: https://console.developers.google.com/apis/api/places.googleapis.com/overview"
        );
        process.exit(1);
      }
    }

    await delay(API_DELAY_MS);
  }

  // ------------------------------------------------------------------
  // 3. Summary
  // ------------------------------------------------------------------

  console.log("\n╔══════════════════════════════════════╗");
  console.log("║  Summary                             ║");
  console.log("╚══════════════════════════════════════╝");
  console.log(`Total processed:        ${stats.total}`);
  console.log(`Matched:                ${stats.matched}`);
  console.log(`Low confidence (skip):  ${stats.lowConfidence}`);
  console.log(`No results:             ${stats.noResults}`);
  console.log(`Errors:                 ${stats.errors}`);

  if (dryRun) {
    console.log(`\n(Dry run – no database changes were made)`);
  } else {
    console.log(`Database updated:       ${stats.dbUpdated}`);
  }

  if (lowConfidenceList.length > 0) {
    console.log("\n── Low Confidence Matches (manual review needed) ──");
    for (const r of lowConfidenceList) {
      console.log(
        `  "${r.clinic}" → "${r.googleName}" (${(r.score * 100).toFixed(0)}%)`
      );
    }
  }

  if (noResultsList.length > 0) {
    console.log("\n── No Results Found (manual review needed) ──");
    for (const name of noResultsList) {
      console.log(`  "${name}"`);
    }
  }

  // Cost estimate
  const textSearchCalls = stats.total;
  const freeCap = 5000;
  const billable = Math.max(0, textSearchCalls - freeCap);
  const cost = (billable / 1000) * 32;
  console.log(
    `\nEstimated API cost: $${cost.toFixed(2)} (${textSearchCalls} calls, ${billable} billable at $32/1K)`
  );
};

/** Helper to push to the low-confidence list */
const lowConfidenceResults = (
  list: { clinic: string; googleName: string; score: number }[],
  clinic: Clinic,
  place: TextSearchPlace,
  score: number
) => {
  list.push({
    clinic: clinic.klinikNavn,
    googleName: place.displayName?.text ?? "unknown",
    score,
  });
};

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
