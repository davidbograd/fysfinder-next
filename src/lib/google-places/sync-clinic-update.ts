/**
 * Pure update-building for the scheduled Google Places sync.
 *
 * Kept out of the script so the rules that decide what gets overwritten — and, more
 * importantly, what does not — are unit-testable.
 */

import {
  hasAnyKnownOpeningHours,
  isClosedAllWeek,
  legacyColumnsToOpeningHours,
  openingHoursToLegacyColumns,
  parseGoogleOpeningHours,
  type GoogleRegularOpeningHours,
  type LegacyOpeningHoursRow,
  type OpeningHours,
} from "../opening-hours";

export type PlaceDetailsForSync = {
  displayName?: { text?: string };
  businessStatus?: string;
  rating?: number;
  userRatingCount?: number;
  regularOpeningHours?: GoogleRegularOpeningHours;
  internationalPhoneNumber?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  accessibilityOptions?: {
    wheelchairAccessibleEntrance?: boolean;
  };
  primaryType?: string;
  types?: string[];
};

export type ClinicSyncRow = LegacyOpeningHoursRow & {
  clinics_id: string;
  klinikNavn: string;
  google_place_id: string;
  verified_klinik: boolean | null;
  avgRating: number | null;
  ratingCount: number | null;
  handicapadgang: boolean | null;
  tlf: string | null;
  website: string | null;
  google_maps_url_cid: string | null;
  google_business_status: string | null;
  opening_hours: OpeningHours | null;
};

export type SyncChangeKind =
  | "rating"
  | "reviewCount"
  | "hours"
  | "phone"
  | "website"
  | "mapsUrl"
  | "accessibility"
  | "businessStatus";

export type ClinicSyncUpdate = {
  updateData: Record<string, unknown>;
  changes: string[];
  changeKinds: SyncChangeKind[];
  /** Google reports the place closed all week while we hold real hours — review by hand. */
  suspiciousClosedAllWeek: boolean;
};

/** Google types that indicate the Place ID no longer points at a clinic-like business. */
const EXPECTED_PLACE_TYPES = new Set([
  "physiotherapist",
  "medical_clinic",
  "chiropractor",
  "doctor",
  "hospital",
  "health",
  "spa",
  "gym",
  "massage",
  "wellness_center",
  "sports_activity_location",
]);

export const isUnexpectedPlaceType = (
  details: PlaceDetailsForSync
): boolean => {
  const types = details.types;
  if (!types || types.length === 0) return false;
  return !types.some((type) => EXPECTED_PLACE_TYPES.has(type));
};

const normalizePhone = (raw: string): string => raw.replace(/\s+/g, " ").trim();

const sameHours = (
  a: OpeningHours | null,
  b: OpeningHours | null
): boolean => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

export const buildClinicSyncUpdate = (options: {
  clinic: ClinicSyncRow;
  details: PlaceDetailsForSync;
}): ClinicSyncUpdate => {
  const { clinic, details } = options;

  const updateData: Record<string, unknown> = {};
  const changes: string[] = [];
  const changeKinds: SyncChangeKind[] = [];
  let suspiciousClosedAllWeek = false;

  const record = (kind: SyncChangeKind, message: string) => {
    changeKinds.push(kind);
    changes.push(message);
  };

  // ── Always refreshed, including for owner-verified clinics ──

  if (details.rating !== undefined && details.rating !== Number(clinic.avgRating)) {
    updateData.avgRating = details.rating;
    record("rating", `rating: ${clinic.avgRating ?? "–"} → ${details.rating}`);
  }

  if (
    details.userRatingCount !== undefined &&
    details.userRatingCount !== Number(clinic.ratingCount)
  ) {
    updateData.ratingCount = details.userRatingCount;
    record(
      "reviewCount",
      `reviews: ${clinic.ratingCount ?? "–"} → ${details.userRatingCount}`
    );
  }

  if (
    details.googleMapsUri &&
    details.googleMapsUri !== clinic.google_maps_url_cid
  ) {
    updateData.google_maps_url_cid = details.googleMapsUri;
    changeKinds.push("mapsUrl");
  }

  if (
    details.businessStatus &&
    details.businessStatus !== clinic.google_business_status
  ) {
    updateData.google_business_status = details.businessStatus;
    record(
      "businessStatus",
      `status: ${clinic.google_business_status ?? "–"} → ${details.businessStatus}`
    );
  }

  // ── Owner-managed fields: only synced for clinics nobody has claimed ──

  if (clinic.verified_klinik) {
    return { updateData, changes, changeKinds, suspiciousClosedAllWeek };
  }

  const googleHours = parseGoogleOpeningHours(details.regularOpeningHours);
  const currentHours = hasAnyKnownOpeningHours(clinic.opening_hours)
    ? clinic.opening_hours
    : legacyColumnsToOpeningHours(clinic);

  // A null result means Google simply has no hours for this place. Writing "Lukket" here
  // is what made ~800 clinics look permanently shut, so leave the columns untouched.
  if (googleHours) {
    const wipesRealHours =
      isClosedAllWeek(googleHours) &&
      currentHours !== null &&
      !isClosedAllWeek(currentHours);

    if (wipesRealHours) {
      suspiciousClosedAllWeek = true;
    } else if (!sameHours(googleHours, currentHours)) {
      updateData.opening_hours = googleHours;
      updateData.opening_hours_source = "google";
      Object.assign(updateData, openingHoursToLegacyColumns(googleHours));
      record("hours", "hours updated");
    }
  }

  // nationalPhoneNumber is the format the dashboard editor expects ("97 21 70 16");
  // internationalPhoneNumber stays as a fallback.
  const phone = details.nationalPhoneNumber ?? details.internationalPhoneNumber;
  if (phone) {
    const normalized = normalizePhone(phone);
    if (normalized && normalized !== clinic.tlf) {
      updateData.tlf = normalized;
      record("phone", `phone: "${clinic.tlf ?? ""}" → "${normalized}"`);
    }
  }

  if (details.websiteUri && details.websiteUri !== clinic.website) {
    updateData.website = details.websiteUri;
    record("website", "website updated");
  }

  // Only fills a gap; never contradicts an owner or a God Adgang registration.
  const wheelchair = details.accessibilityOptions?.wheelchairAccessibleEntrance;
  if (clinic.handicapadgang === null && typeof wheelchair === "boolean") {
    updateData.handicapadgang = wheelchair;
    record("accessibility", `handicapadgang: – → ${wheelchair ? "ja" : "nej"}`);
  }

  return { updateData, changes, changeKinds, suspiciousClosedAllWeek };
};
