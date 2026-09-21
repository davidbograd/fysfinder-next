/**
 * Scheduled refresh of clinic data from the Google Places API (New).
 *
 * For every clinic with a google_place_id we refresh:
 *   - Rating, review count, Maps URL, business status  (always)
 *   - Opening hours, phone, website, wheelchair access  (unclaimed clinics only)
 *
 * Verified clinics are owner-managed, so only the always-on fields are touched.
 *
 * Usage:
 *   tsx scripts/update-clinic-google-data.ts [--dry-run] [--limit N] [--all]
 *
 * Cost: Place Details Enterprise = $20/1,000 calls, with the first 1,000 free every
 * calendar month. The default batch size keeps a monthly run inside that free tier, and
 * clinics are processed least-recently-synced first so the whole table rotates through
 * roughly every two months. Use --all for a one-off full refresh.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

import {
  buildClinicSyncUpdate,
  isUnexpectedPlaceType,
  type ClinicSyncRow,
  type PlaceDetailsForSync,
  type SyncChangeKind,
} from "../src/lib/google-places/sync-clinic-update";
import { LEGACY_DAY_COLUMNS } from "../src/lib/opening-hours";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../.env.local") });

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter((e) => e.length > 0);

/** Delay between API calls (ms). */
const API_DELAY_MS = 200;

/** Place Details Enterprise calls that are free each calendar month. */
const FREE_MONTHLY_CALLS = 1000;

/** Default rotation size, kept under the free tier with headroom for admin-triggered syncs. */
const DEFAULT_BATCH_SIZE = 800;

const MAX_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 500;

/**
 * Every field here is Essentials, Pro or Enterprise, so the whole request bills at the
 * Enterprise rate it would cost anyway for `rating` alone. `parkingOptions` is
 * deliberately absent: it is Enterprise + Atmosphere and would push every call to $25/1K.
 */
const FIELD_MASK = [
  "displayName",
  "businessStatus",
  "rating",
  "userRatingCount",
  "regularOpeningHours",
  "internationalPhoneNumber",
  "nationalPhoneNumber",
  "websiteUri",
  "googleMapsUri",
  "accessibilityOptions",
  "primaryType",
  "types",
].join(",");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Stats {
  clinics: number;
  apiCalls: number;
  updated: number;
  unchanged: number;
  permanentlyClosed: number;
  errors: number;
  changes: Record<SyncChangeKind, number>;
}

const emptyChangeCounts = (): Record<SyncChangeKind, number> => ({
  rating: 0,
  reviewCount: 0,
  hours: 0,
  phone: 0,
  website: 0,
  mapsUrl: 0,
  accessibility: 0,
  businessStatus: 0,
});

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const parseArgs = () => {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const all = args.includes("--all");
  const limitIdx = args.indexOf("--limit");
  const limit =
    limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : DEFAULT_BATCH_SIZE;

  return { dryRun, all, limit: all ? undefined : limit };
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Google Places API (New)
// ---------------------------------------------------------------------------

const isRetryableStatus = (status: number): boolean =>
  status === 429 || status >= 500;

/**
 * `languageCode=da` is load-bearing: without it Google answers in English and any parser
 * keyed on Danish weekday names silently produces "closed" for every day.
 */
const getPlaceDetails = async (
  placeId: string
): Promise<PlaceDetailsForSync> => {
  const url = new URL(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`
  );
  url.searchParams.set("languageCode", "da");
  url.searchParams.set("regionCode", "DK");

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let response: Response;

    try {
      response = await fetch(url.toString(), {
        headers: {
          "X-Goog-Api-Key": GOOGLE_API_KEY,
          "X-Goog-FieldMask": FIELD_MASK,
        },
      });
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt === MAX_ATTEMPTS) break;
      await delay(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1));
      continue;
    }

    if (response.ok) {
      return (await response.json()) as PlaceDetailsForSync;
    }

    lastError = new Error(
      `Place Details API ${response.status}: ${await response.text()}`
    );

    // 4xx other than rate limiting will fail identically on a retry.
    if (!isRetryableStatus(response.status)) throw lastError;
    if (attempt === MAX_ATTEMPTS) break;

    await delay(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1));
  }

  throw lastError ?? new Error("Place Details API failed");
};

// ---------------------------------------------------------------------------
// Supabase
// ---------------------------------------------------------------------------

const SELECT_COLUMNS = [
  "clinics_id",
  "klinikNavn",
  "google_place_id",
  "verified_klinik",
  "avgRating",
  "ratingCount",
  "handicapadgang",
  "tlf",
  "website",
  "google_maps_url_cid",
  "google_business_status",
  "opening_hours",
  ...LEGACY_DAY_COLUMNS,
].join(", ");

/**
 * Least-recently-synced first, so consecutive monthly runs rotate through the table
 * instead of re-fetching the same clinics.
 */
const fetchClinicsForSync = async (
  supabase: SupabaseClient,
  limit?: number
): Promise<ClinicSyncRow[]> => {
  const PAGE_SIZE = 1000;
  const all: ClinicSyncRow[] = [];
  let from = 0;

  while (true) {
    const to =
      limit !== undefined
        ? Math.min(from + PAGE_SIZE - 1, limit - 1)
        : from + PAGE_SIZE - 1;

    if (to < from) break;

    const { data, error } = await supabase
      .from("clinics")
      .select(SELECT_COLUMNS)
      .not("google_place_id", "is", null)
      .order("google_synced_at", { ascending: true, nullsFirst: true })
      .order("clinics_id", { ascending: true })
      .range(from, to);

    if (error) throw error;
    if (!data || data.length === 0) break;

    all.push(...(data as unknown as ClinicSyncRow[]));

    if (limit !== undefined && all.length >= limit) break;
    if (data.length < PAGE_SIZE) break;

    from += PAGE_SIZE;
  }

  return all;
};

/** One API call per distinct Place ID; 18 of ours are shared between two clinics. */
const groupByPlaceId = (clinics: ClinicSyncRow[]): Map<string, ClinicSyncRow[]> => {
  const groups = new Map<string, ClinicSyncRow[]>();
  for (const clinic of clinics) {
    const existing = groups.get(clinic.google_place_id);
    if (existing) {
      existing.push(clinic);
    } else {
      groups.set(clinic.google_place_id, [clinic]);
    }
  }
  return groups;
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const main = async () => {
  const { dryRun, all, limit } = parseArgs();

  if (!GOOGLE_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing required environment variables. Check .env.local for:");
    console.error("  GOOGLE_PLACES_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  console.log("╔══════════════════════════════════════╗");
  console.log("║  Google Data – Scheduled Refresh     ║");
  console.log("╚══════════════════════════════════════╝");
  console.log(`Mode:  ${dryRun ? "DRY RUN (no DB writes)" : "LIVE"}`);
  console.log(`Scope: ${all ? "ALL clinics" : `oldest ${limit} by last sync`}`);
  console.log();

  const clinics = await fetchClinicsForSync(supabase, limit);

  if (clinics.length === 0) {
    console.log("No clinics with Place IDs found. Run the backfill script first:");
    console.log("  tsx scripts/backfill-google-place-ids.ts");
    return;
  }

  const groups = groupByPlaceId(clinics);

  console.log(
    `Processing ${clinics.length} clinics across ${groups.size} distinct Place IDs ` +
      `(${clinics.length - groups.size} duplicate call${clinics.length - groups.size === 1 ? "" : "s"} avoided).`
  );
  if (groups.size > FREE_MONTHLY_CALLS) {
    console.log(
      `⚠ ${groups.size} calls exceeds the ${FREE_MONTHLY_CALLS} free monthly calls; ` +
        `${groups.size - FREE_MONTHLY_CALLS} will be billed.`
    );
  }
  console.log();

  const stats: Stats = {
    clinics: clinics.length,
    apiCalls: 0,
    updated: 0,
    unchanged: 0,
    permanentlyClosed: 0,
    errors: 0,
    changes: emptyChangeCounts(),
  };

  const closedClinics: string[] = [];
  const needsReview: string[] = [];
  const syncedAt = new Date().toISOString();

  let index = 0;

  for (const [placeId, clinicsForPlace] of groups) {
    index++;
    const tag = `[${index}/${groups.size}]`;

    let details: PlaceDetailsForSync;
    try {
      details = await getPlaceDetails(placeId);
      stats.apiCalls++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`${tag} ✗ ${clinicsForPlace[0].klinikNavn}: ${msg}`);
      stats.errors += clinicsForPlace.length;

      if (
        msg.includes("SERVICE_DISABLED") ||
        msg.includes("not activated") ||
        msg.includes("has not been used") ||
        msg.includes("it is disabled")
      ) {
        console.error("\n⛔ The Places API (New) is not enabled on your Google Cloud project.");
        console.error("   Enable it at: https://console.developers.google.com/apis/api/places.googleapis.com/overview");
        process.exit(1);
      }

      await delay(API_DELAY_MS);
      continue;
    }

    if (isUnexpectedPlaceType(details)) {
      needsReview.push(
        `${clinicsForPlace[0].klinikNavn} – Place ID peger på "${details.primaryType ?? "ukendt"}"`
      );
    }

    for (const clinic of clinicsForPlace) {
      const { updateData, changes, changeKinds, suspiciousClosedAllWeek } =
        buildClinicSyncUpdate({ clinic, details });

      if (details.businessStatus === "CLOSED_PERMANENTLY") {
        console.log(`${tag} ⚠ PERMANENTLY CLOSED: "${clinic.klinikNavn}"`);
        stats.permanentlyClosed++;
        closedClinics.push(clinic.klinikNavn);
      }

      if (suspiciousClosedAllWeek) {
        needsReview.push(
          `${clinic.klinikNavn} – Google melder lukket hele ugen, men vi har åbningstider`
        );
      }

      for (const kind of changeKinds) {
        stats.changes[kind]++;
      }

      // Recorded even when nothing changed, so the rotation moves on to other clinics.
      updateData.google_synced_at = syncedAt;

      const hasRealChange = changeKinds.length > 0 || "google_maps_url_cid" in updateData;
      if (hasRealChange) {
        updateData.updated_at = syncedAt;
      }

      if (!dryRun) {
        const { error: updateError } = await supabase
          .from("clinics")
          .update(updateData)
          .eq("clinics_id", clinic.clinics_id);

        if (updateError) {
          console.error(`${tag} ✗ DB error for "${clinic.klinikNavn}": ${updateError.message}`);
          stats.errors++;
          continue;
        }
      }

      if (hasRealChange) {
        stats.updated++;
        console.log(`${tag} ✓ "${clinic.klinikNavn}": ${changes.join(", ") || "maps url"}`);
      } else {
        stats.unchanged++;
      }
    }

    await delay(API_DELAY_MS);
  }

  // ------------------------------------------------------------------
  // Summary
  // ------------------------------------------------------------------

  const billable = Math.max(0, stats.apiCalls - FREE_MONTHLY_CALLS);
  const cost = (billable / 1000) * 20;

  console.log("\n╔══════════════════════════════════════╗");
  console.log("║  Summary                             ║");
  console.log("╚══════════════════════════════════════╝");
  console.log(`Clinics processed:      ${stats.clinics}`);
  console.log(`API calls:              ${stats.apiCalls}`);
  console.log(`Updated:                ${stats.updated}`);
  console.log(`Unchanged:              ${stats.unchanged}`);
  console.log(`Permanently closed:     ${stats.permanentlyClosed}`);
  console.log(`Errors:                 ${stats.errors}`);
  console.log();
  console.log("Change breakdown:");
  console.log(`  Rating:               ${stats.changes.rating}`);
  console.log(`  Review count:         ${stats.changes.reviewCount}`);
  console.log(`  Opening hours:        ${stats.changes.hours}`);
  console.log(`  Phone:                ${stats.changes.phone}`);
  console.log(`  Website:              ${stats.changes.website}`);
  console.log(`  Maps URL:             ${stats.changes.mapsUrl}`);
  console.log(`  Accessibility:        ${stats.changes.accessibility}`);
  console.log(`  Business status:      ${stats.changes.businessStatus}`);

  if (closedClinics.length > 0) {
    console.log("\n── Permanently Closed Clinics ──");
    for (const name of closedClinics) console.log(`  "${name}"`);
  }

  if (needsReview.length > 0) {
    console.log("\n── Needs Manual Review ──");
    for (const note of needsReview) console.log(`  ${note}`);
  }

  if (dryRun) {
    console.log("\n(Dry run – no database changes were made)");
  }

  console.log(
    `\nEstimated API cost: $${cost.toFixed(2)} (${stats.apiCalls} calls, ${billable} billable at $20/1K)`
  );

  if (!dryRun) {
    await sendEmailReport(stats, closedClinics, needsReview, cost);
  }
};

// ---------------------------------------------------------------------------
// Email report
// ---------------------------------------------------------------------------

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const sendEmailReport = async (
  stats: Stats,
  closedClinics: string[],
  needsReview: string[],
  cost: number
) => {
  if (!RESEND_API_KEY || ADMIN_EMAILS.length === 0) {
    console.log("\nSkipping email report (RESEND_API_KEY or ADMIN_EMAILS not configured).");
    return;
  }

  const resend = new Resend(RESEND_API_KEY);
  const date = new Date().toLocaleDateString("da-DK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hasErrors = stats.errors > 0;
  const subject = `${hasErrors ? "⚠️" : "✅"} Google Data Update – ${date}`;

  const listSection = (
    title: string,
    color: string,
    intro: string,
    items: string[]
  ) =>
    items.length === 0
      ? ""
      : `
        <h3 style="color: ${color}; margin-top: 24px;">${title} (${items.length})</h3>
        <p style="color: #6b7280; font-size: 14px;">${intro}</p>
        <ul style="font-size: 14px;">
          ${items.map((i) => `<li>${escapeHtml(i)}</li>`).join("\n          ")}
        </ul>`;

  const row = (label: string, value: number | string, shaded: boolean, color?: string) => `
        <tr${shaded ? ' style="background-color: #f8fafc;"' : ""}>
          <td style="padding: 8px 16px; border: 1px solid #e2e8f0;${color ? ` color: ${color}; font-weight: 600;` : ""}">${label}</td>
          <td style="padding: 8px 16px; border: 1px solid #e2e8f0; text-align: right;">${value}</td>
        </tr>`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e293b;">Google Data – Planlagt Opdatering</h2>
      <p style="color: #6b7280;">${date}</p>

      ${hasErrors ? `<p style="color: #dc2626; font-weight: 600;">⚠️ ${stats.errors} fejl opstod under opdateringen. Tjek logs for detaljer.</p>` : ""}

      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        ${row("Klinikker behandlet", stats.clinics, true)}
        ${row("API-kald", stats.apiCalls, false)}
        ${row("Opdateret", stats.updated, true, "#16a34a")}
        ${row("Uændrede", stats.unchanged, false)}
        ${row("Permanent lukkede", stats.permanentlyClosed, true, "#dc2626")}
        ${row("Fejl", stats.errors, false, "#dc2626")}
      </table>

      <h3 style="margin-top: 24px; color: #1e293b;">Ændringer</h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${row("Bedømmelser", stats.changes.rating, true)}
        ${row("Anmeldelsestal", stats.changes.reviewCount, false)}
        ${row("Åbningstider", stats.changes.hours, true)}
        ${row("Telefonnumre", stats.changes.phone, false)}
        ${row("Hjemmesider", stats.changes.website, true)}
        ${row("Maps-links", stats.changes.mapsUrl, false)}
        ${row("Handicapadgang", stats.changes.accessibility, true)}
        ${row("Virksomhedsstatus", stats.changes.businessStatus, false)}
      </table>

      ${listSection("⚠️ Permanent lukkede klinikker", "#dc2626", "Google markerer disse som permanent lukkede. Gennemgå dem manuelt.", closedClinics)}
      ${listSection("🔍 Kræver manuel gennemgang", "#b45309", "Automatisk synkronisering blev sprunget over for disse.", needsReview)}

      <p style="margin-top: 24px; padding: 12px 16px; background-color: #f8fafc; border-radius: 8px; font-size: 14px; color: #6b7280;">
        API-omkostning: <strong>$${cost.toFixed(2)}</strong>
        ${cost === 0 ? " (inden for det gratis månedlige forbrug)" : ""}
      </p>

      <hr style="margin-top: 32px; border: none; border-top: 1px solid #e5e7eb;" />
      <p style="color: #9ca3af; font-size: 12px;">
        Denne email er sendt automatisk fra Fysfinder efter den planlagte Google Data opdatering.
      </p>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: "Fysfinder <noreply@fysfinder.dk>",
      to: ADMIN_EMAILS,
      subject,
      html,
    });

    if (error) {
      console.error("Failed to send email report:", error.message);
    } else {
      console.log(`\nEmail report sent to: ${ADMIN_EMAILS.join(", ")}`);
    }
  } catch (err) {
    console.error("Error sending email report:", err instanceof Error ? err.message : err);
  }
};

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
