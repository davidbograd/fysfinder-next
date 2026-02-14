/**
 * Monthly update: refresh clinic data from Google Places API (New).
 *
 * For every clinic that has a google_place_id, fetches the latest:
 *   - Rating & review count    (always updated)
 *   - Opening hours             (non-verified clinics only)
 *   - Phone number              (non-verified clinics only)
 *   - Website                   (non-verified clinics only)
 *   - Google Maps URL           (always updated)
 *
 * Verified clinics (verified_klinik = true) only get their ratings
 * and Google Maps URL refreshed – the rest is managed by the owner.
 *
 * Usage:
 *   tsx scripts/update-clinic-google-data.ts [--dry-run] [--limit N]
 *
 * Cost: Place Details Enterprise SKU = $20 / 1,000 calls (first 1,000 free).
 *       For ~1,916 clinics: ~$18.32/month.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";
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
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter((e) => e.length > 0);

/** Delay between API calls (ms) */
const API_DELAY_MS = 200;

/**
 * Fields to request from Place Details (New).
 * All of these are in the Enterprise SKU ($20/1K) or below.
 */
const FIELD_MASK = [
  "displayName",
  "businessStatus",
  "rating",
  "userRatingCount",
  "regularOpeningHours",
  "internationalPhoneNumber",
  "websiteUri",
  "googleMapsUri",
].join(",");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Clinic {
  clinics_id: string;
  klinikNavn: string;
  google_place_id: string;
  verified_klinik: boolean;
  avgRating: number | null;
  ratingCount: number | null;
  mandag: string | null;
  tirsdag: string | null;
  onsdag: string | null;
  torsdag: string | null;
  fredag: string | null;
  lørdag: string | null;
  søndag: string | null;
  tlf: string | null;
  website: string | null;
  google_maps_url_cid: string | null;
}

interface PlaceDetails {
  displayName?: { text: string; languageCode: string };
  businessStatus?: string;
  rating?: number;
  userRatingCount?: number;
  regularOpeningHours?: {
    weekdayDescriptions?: string[];
    openNow?: boolean;
  };
  internationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
}

interface Stats {
  total: number;
  updated: number;
  unchanged: number;
  permanentlyClosed: number;
  errors: number;
  changes: {
    rating: number;
    reviewCount: number;
    hours: number;
    phone: number;
    website: number;
    mapsUrl: number;
  };
}

// Day column names in the database, in Monday→Sunday order
const DAY_COLUMNS = [
  "mandag",
  "tirsdag",
  "onsdag",
  "torsdag",
  "fredag",
  "lørdag",
  "søndag",
] as const;

type DayColumn = (typeof DAY_COLUMNS)[number];

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
// Google Places API (New) – Place Details
// ---------------------------------------------------------------------------

const getPlaceDetails = async (placeId: string): Promise<PlaceDetails> => {
  const url = `https://places.googleapis.com/v1/places/${placeId}`;

  const response = await fetch(url, {
    headers: {
      "X-Goog-Api-Key": GOOGLE_API_KEY,
      "X-Goog-FieldMask": FIELD_MASK,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Place Details API ${response.status}: ${body}`);
  }

  return response.json();
};

// ---------------------------------------------------------------------------
// Opening hours parser
// ---------------------------------------------------------------------------

/**
 * Parses the weekdayDescriptions array from Google into our DB columns.
 * Example input: ["mandag: 07.00–19.00", "tirsdag: 07.00–19.00", ...]
 */
const parseOpeningHours = (
  descriptions: string[] | undefined
): Record<DayColumn, string> => {
  const hours: Record<string, string> = {
    mandag: "Lukket",
    tirsdag: "Lukket",
    onsdag: "Lukket",
    torsdag: "Lukket",
    fredag: "Lukket",
    lørdag: "Lukket",
    søndag: "Lukket",
  };

  if (!descriptions) return hours as Record<DayColumn, string>;

  for (const line of descriptions) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;

    const day = line.substring(0, colonIdx).trim().toLowerCase();
    const value = line.substring(colonIdx + 1).trim();

    if (day in hours) {
      hours[day] = value || "Lukket";
    }
  }

  return hours as Record<DayColumn, string>;
};

// ---------------------------------------------------------------------------
// Supabase: paginated fetch
// ---------------------------------------------------------------------------

const fetchClinicsWithPlaceId = async (
  supabase: SupabaseClient,
  limit?: number
): Promise<Clinic[]> => {
  const PAGE_SIZE = 1000;
  const all: Clinic[] = [];
  let from = 0;

  const columns = [
    "clinics_id",
    "klinikNavn",
    "google_place_id",
    "verified_klinik",
    "avgRating",
    "ratingCount",
    ...DAY_COLUMNS,
    "tlf",
    "website",
    "google_maps_url_cid",
  ].join(", ");

  while (true) {
    const to =
      limit !== undefined
        ? Math.min(from + PAGE_SIZE - 1, limit - 1)
        : from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("clinics")
      .select(columns)
      .not("google_place_id", "is", null)
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
      "Missing required environment variables. Check .env.local for:"
    );
    console.error(
      "  GOOGLE_PLACES_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
    );
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  console.log("╔══════════════════════════════════════╗");
  console.log("║  Google Data – Monthly Update        ║");
  console.log("╚══════════════════════════════════════╝");
  console.log(`Mode:  ${dryRun ? "DRY RUN (no DB writes)" : "LIVE"}`);
  if (limit) console.log(`Limit: ${limit} clinics`);
  console.log();

  // ------------------------------------------------------------------
  // 1. Fetch clinics
  // ------------------------------------------------------------------

  const clinics = await fetchClinicsWithPlaceId(supabase, limit);

  if (clinics.length === 0) {
    console.log(
      "No clinics with Place IDs found. Run the backfill script first:"
    );
    console.log("  tsx scripts/backfill-google-place-ids.ts");
    return;
  }

  console.log(
    `Found ${clinics.length} clinics with Place IDs (${clinics.filter((c) => c.verified_klinik).length} verified).\n`
  );

  // ------------------------------------------------------------------
  // 2. Process each clinic
  // ------------------------------------------------------------------

  const stats: Stats = {
    total: clinics.length,
    updated: 0,
    unchanged: 0,
    permanentlyClosed: 0,
    errors: 0,
    changes: {
      rating: 0,
      reviewCount: 0,
      hours: 0,
      phone: 0,
      website: 0,
      mapsUrl: 0,
    },
  };

  const closedClinics: string[] = [];

  for (let i = 0; i < clinics.length; i++) {
    const clinic = clinics[i];
    const tag = `[${i + 1}/${clinics.length}]`;

    try {
      const details = await getPlaceDetails(clinic.google_place_id);

      // Flag permanently closed businesses
      if (details.businessStatus === "CLOSED_PERMANENTLY") {
        console.log(`${tag} ⚠ PERMANENTLY CLOSED: "${clinic.klinikNavn}"`);
        stats.permanentlyClosed++;
        closedClinics.push(clinic.klinikNavn);
        await delay(API_DELAY_MS);
        continue;
      }

      // Build the update payload
      const updateData: Record<string, unknown> = {};
      const changes: string[] = [];

      // ── Ratings (always update, even for verified clinics) ──

      const newRating = details.rating ?? null;
      const newRatingCount = details.userRatingCount ?? null;

      if (newRating !== null && newRating !== Number(clinic.avgRating)) {
        updateData.avgRating = newRating;
        changes.push(`rating: ${clinic.avgRating ?? "–"} → ${newRating}`);
        stats.changes.rating++;
      }

      if (
        newRatingCount !== null &&
        newRatingCount !== Number(clinic.ratingCount)
      ) {
        updateData.ratingCount = newRatingCount;
        changes.push(
          `reviews: ${clinic.ratingCount ?? "–"} → ${newRatingCount}`
        );
        stats.changes.reviewCount++;
      }

      // ── Google Maps URL (always update) ──

      if (
        details.googleMapsUri &&
        details.googleMapsUri !== clinic.google_maps_url_cid
      ) {
        updateData.google_maps_url_cid = details.googleMapsUri;
        stats.changes.mapsUrl++;
      }

      // ── Contact & hours (non-verified clinics only) ──

      if (!clinic.verified_klinik) {
        // Opening hours
        const hours = parseOpeningHours(
          details.regularOpeningHours?.weekdayDescriptions
        );
        let hoursChanged = false;

        for (const day of DAY_COLUMNS) {
          const current = clinic[day] as string | null;
          if (hours[day] && hours[day] !== current) {
            updateData[day] = hours[day];
            hoursChanged = true;
          }
        }

        if (hoursChanged) {
          changes.push("hours updated");
          stats.changes.hours++;
        }

        // Phone
        if (details.internationalPhoneNumber) {
          const newPhone = details.internationalPhoneNumber
            .replace(/\s+/g, " ")
            .trim();
          if (newPhone && newPhone !== clinic.tlf) {
            updateData.tlf = newPhone;
            changes.push(`phone: "${clinic.tlf ?? ""}" → "${newPhone}"`);
            stats.changes.phone++;
          }
        }

        // Website
        if (details.websiteUri && details.websiteUri !== clinic.website) {
          updateData.website = details.websiteUri;
          changes.push("website updated");
          stats.changes.website++;
        }
      }

      // ── Apply update ──

      if (Object.keys(updateData).length === 0) {
        stats.unchanged++;
        // Log progress every 100 unchanged clinics
        if (i % 100 === 0) {
          console.log(`${tag} – "${clinic.klinikNavn}": no changes`);
        }
        await delay(API_DELAY_MS);
        continue;
      }

      updateData.updated_at = new Date().toISOString();

      if (!dryRun) {
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
      }

      stats.updated++;
      console.log(
        `${tag} ✓ "${clinic.klinikNavn}": ${changes.join(", ")}`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`${tag} ✗ Error for "${clinic.klinikNavn}": ${msg}`);
      stats.errors++;

      // Stop immediately if the API is not enabled
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
  console.log(`Updated:                ${stats.updated}`);
  console.log(`Unchanged:              ${stats.unchanged}`);
  console.log(`Permanently closed:     ${stats.permanentlyClosed}`);
  console.log(`Errors:                 ${stats.errors}`);
  console.log();
  console.log("Change breakdown:");
  console.log(`  Rating changes:       ${stats.changes.rating}`);
  console.log(`  Review count changes: ${stats.changes.reviewCount}`);
  console.log(`  Hours changes:        ${stats.changes.hours}`);
  console.log(`  Phone changes:        ${stats.changes.phone}`);
  console.log(`  Website changes:      ${stats.changes.website}`);
  console.log(`  Maps URL changes:     ${stats.changes.mapsUrl}`);

  if (closedClinics.length > 0) {
    console.log("\n── Permanently Closed Clinics ──");
    for (const name of closedClinics) {
      console.log(`  "${name}"`);
    }
  }

  if (dryRun) {
    console.log("\n(Dry run – no database changes were made)");
  }

  // Cost estimate
  const freeCap = 1000;
  const billable = Math.max(0, stats.total - freeCap);
  const cost = (billable / 1000) * 20;
  console.log(
    `\nEstimated API cost: $${cost.toFixed(2)} (${stats.total} calls, ${billable} billable at $20/1K)`
  );

  // ------------------------------------------------------------------
  // 4. Send email report (skip in dry-run mode)
  // ------------------------------------------------------------------

  if (!dryRun) {
    await sendEmailReport(stats, closedClinics, cost);
  }
};

// ---------------------------------------------------------------------------
// Email report
// ---------------------------------------------------------------------------

const sendEmailReport = async (
  stats: Stats,
  closedClinics: string[],
  cost: number
) => {
  if (!RESEND_API_KEY || ADMIN_EMAILS.length === 0) {
    console.log(
      "\nSkipping email report (RESEND_API_KEY or ADMIN_EMAILS not configured)."
    );
    return;
  }

  const resend = new Resend(RESEND_API_KEY);
  const date = new Date().toLocaleDateString("da-DK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hasErrors = stats.errors > 0;
  const hasClosed = closedClinics.length > 0;
  const statusEmoji = hasErrors ? "⚠️" : "✅";
  const subject = `${statusEmoji} Google Data Update – ${date}`;

  const closedSection = hasClosed
    ? `
        <h3 style="color: #dc2626; margin-top: 24px;">⚠️ Permanent lukkede klinikker (${closedClinics.length})</h3>
        <p style="color: #6b7280; font-size: 14px;">Disse klinikker er markeret som permanent lukkede af Google. Gennemgå dem manuelt.</p>
        <ul style="font-size: 14px;">
          ${closedClinics.map((name) => `<li>${name}</li>`).join("\n          ")}
        </ul>`
    : "";

  const errorSection = hasErrors
    ? `<p style="color: #dc2626; font-weight: 600;">⚠️ ${stats.errors} fejl opstod under opdateringen. Tjek logs for detaljer.</p>`
    : "";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e293b;">Google Data – Månedlig Opdatering</h2>
      <p style="color: #6b7280;">${date}</p>

      ${errorSection}

      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <tr style="background-color: #f8fafc;">
          <td style="padding: 10px 16px; border: 1px solid #e2e8f0; font-weight: 600;">Klinikker behandlet</td>
          <td style="padding: 10px 16px; border: 1px solid #e2e8f0; text-align: right;">${stats.total}</td>
        </tr>
        <tr>
          <td style="padding: 10px 16px; border: 1px solid #e2e8f0; font-weight: 600; color: #16a34a;">Opdateret</td>
          <td style="padding: 10px 16px; border: 1px solid #e2e8f0; text-align: right;">${stats.updated}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 10px 16px; border: 1px solid #e2e8f0; font-weight: 600;">Uændrede</td>
          <td style="padding: 10px 16px; border: 1px solid #e2e8f0; text-align: right;">${stats.unchanged}</td>
        </tr>
        <tr>
          <td style="padding: 10px 16px; border: 1px solid #e2e8f0; font-weight: 600; color: #dc2626;">Permanent lukkede</td>
          <td style="padding: 10px 16px; border: 1px solid #e2e8f0; text-align: right;">${stats.permanentlyClosed}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 10px 16px; border: 1px solid #e2e8f0; font-weight: 600; color: #dc2626;">Fejl</td>
          <td style="padding: 10px 16px; border: 1px solid #e2e8f0; text-align: right;">${stats.errors}</td>
        </tr>
      </table>

      <h3 style="margin-top: 24px; color: #1e293b;">Ændringer</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background-color: #f8fafc;">
          <td style="padding: 8px 16px; border: 1px solid #e2e8f0;">Bedømmelser ændret</td>
          <td style="padding: 8px 16px; border: 1px solid #e2e8f0; text-align: right;">${stats.changes.rating}</td>
        </tr>
        <tr>
          <td style="padding: 8px 16px; border: 1px solid #e2e8f0;">Anmeldelsestal ændret</td>
          <td style="padding: 8px 16px; border: 1px solid #e2e8f0; text-align: right;">${stats.changes.reviewCount}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 8px 16px; border: 1px solid #e2e8f0;">Åbningstider opdateret</td>
          <td style="padding: 8px 16px; border: 1px solid #e2e8f0; text-align: right;">${stats.changes.hours}</td>
        </tr>
        <tr>
          <td style="padding: 8px 16px; border: 1px solid #e2e8f0;">Telefonnumre opdateret</td>
          <td style="padding: 8px 16px; border: 1px solid #e2e8f0; text-align: right;">${stats.changes.phone}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 8px 16px; border: 1px solid #e2e8f0;">Hjemmesider opdateret</td>
          <td style="padding: 8px 16px; border: 1px solid #e2e8f0; text-align: right;">${stats.changes.website}</td>
        </tr>
      </table>

      ${closedSection}

      <p style="margin-top: 24px; padding: 12px 16px; background-color: #f8fafc; border-radius: 8px; font-size: 14px; color: #6b7280;">
        API-omkostning: <strong>$${cost.toFixed(2)}</strong>
      </p>

      <hr style="margin-top: 32px; border: none; border-top: 1px solid #e5e7eb;" />
      <p style="color: #9ca3af; font-size: 12px;">
        Denne email er sendt automatisk fra FysFinder efter den månedlige Google Data opdatering.
      </p>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: "FysFinder <noreply@fysfinder.dk>",
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
    console.error(
      "Error sending email report:",
      err instanceof Error ? err.message : err
    );
  }
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
