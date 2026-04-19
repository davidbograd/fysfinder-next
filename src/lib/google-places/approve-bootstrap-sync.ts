import type { SupabaseClient } from "@supabase/supabase-js";

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

/** Maps API weekday label (English or Danish) to our DB column. */
const WEEKDAY_LABEL_TO_COLUMN: Record<string, DayColumn> = {
  mandag: "mandag",
  tirsdag: "tirsdag",
  onsdag: "onsdag",
  torsdag: "torsdag",
  fredag: "fredag",
  lørdag: "lørdag",
  lordag: "lørdag",
  søndag: "søndag",
  sondag: "søndag",
  monday: "mandag",
  tuesday: "tirsdag",
  wednesday: "onsdag",
  thursday: "torsdag",
  friday: "fredag",
  saturday: "lørdag",
  sunday: "søndag",
};

const normalizeWeekdayLabel = (raw: string): string =>
  raw
    .trim()
    .toLowerCase()
    .replace(/\.$/, "")
    .replace(/^[\d.\s•\-–—]+/, "");

const PLACE_DETAILS_FIELD_MASK = [
  "displayName",
  "businessStatus",
  "rating",
  "userRatingCount",
  "regularOpeningHours",
  "internationalPhoneNumber",
  "websiteUri",
  "googleMapsUri",
  "location",
].join(",");

const TEXT_SEARCH_FIELD_MASK =
  "places.id,places.displayName,places.formattedAddress,places.googleMapsUri";

const MAX_REDIRECTS = 5;
const REDIRECT_FETCH_TIMEOUT_MS = 12_000;

const ALLOWED_MAP_HOSTS = new Set([
  "maps.app.goo.gl",
  "goo.gl",
  "www.google.com",
  "google.com",
  "maps.google.com",
]);

export type GoogleSyncResult = { ok: true } | { ok: false; message: string };

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
  location?: { latitude?: number; longitude?: number };
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

interface ClinicRowForSync {
  clinics_id: string;
  klinikNavn: string;
  adresse: string | null;
  postnummer: number | null;
  lokation: string | null;
  mandag: string | null;
  tirsdag: string | null;
  onsdag: string | null;
  torsdag: string | null;
  fredag: string | null;
  lørdag: string | null;
  søndag: string | null;
  tlf: string | null;
  website: string | null;
}

/**
 * Parses Places API `regularOpeningHours.weekdayDescriptions` into DB columns.
 * Google often returns English day names ("Monday: …") even for DK businesses unless `languageCode=da` is set — we map both EN and DA.
 */
export const parseOpeningHoursFromGoogleDescriptions = (
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

  if (!descriptions?.length) return hours as Record<DayColumn, string>;

  for (const line of descriptions) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;

    const dayRaw = line.substring(0, colonIdx);
    const dayKey = normalizeWeekdayLabel(dayRaw);
    const column = WEEKDAY_LABEL_TO_COLUMN[dayKey];
    if (!column) continue;

    const value = line.substring(colonIdx + 1).trim();
    hours[column] = value || "Lukket";
  }

  return hours as Record<DayColumn, string>;
};

const hasAnyNonClosedParsedHour = (hours: Record<DayColumn, string>): boolean =>
  DAY_COLUMNS.some((d) => hours[d] !== "Lukket");

const isNullishOrBlank = (value: string | null | undefined): boolean => {
  if (value === null || value === undefined) return true;
  return value.trim() === "";
};

const areAllWeekdayHoursUnsetInDb = (row: ClinicRowForSync): boolean => {
  for (const day of DAY_COLUMNS) {
    const v = row[day];
    if (!isNullishOrBlank(v)) return false;
  }
  return true;
};

const normalize = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-zæøåé0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

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

const MIN_MATCH_SCORE = 0.3;

const normalizePlaceIdForRequest = (id: string): string => {
  const trimmed = id.trim();
  if (trimmed.startsWith("places/")) {
    return trimmed.slice("places/".length);
  }
  return trimmed;
};

export const isLikelyGoogleMapsUrl = (raw: string): boolean => {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const url = new URL(withProtocol);
    const host = url.hostname.toLowerCase();
    if (!ALLOWED_MAP_HOSTS.has(host)) return false;
    if (host === "google.com" || host === "www.google.com") {
      return url.pathname.includes("/maps");
    }
    return true;
  } catch {
    return false;
  }
};

const isShortLinkHost = (hostname: string): boolean => {
  const h = hostname.toLowerCase();
  return h === "maps.app.goo.gl" || h === "goo.gl";
};

const isAllowedRedirectHost = (hostname: string): boolean => {
  const h = hostname.toLowerCase();
  return ALLOWED_MAP_HOSTS.has(h);
};

const fetchWithTimeout = async (
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const resolveShortMapsUrl = async (startUrl: string): Promise<string | null> => {
  let current = startUrl;
  for (let i = 0; i < MAX_REDIRECTS; i++) {
    const res = await fetchWithTimeout(
      current,
      {
        method: "GET",
        redirect: "manual",
        headers: { "User-Agent": "FysfinderAdminGoogleSync/1.0" },
      },
      REDIRECT_FETCH_TIMEOUT_MS
    );

    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) return null;
      const next = new URL(loc, current).toString();
      const nextHost = new URL(next).hostname.toLowerCase();
      if (!isAllowedRedirectHost(nextHost)) return null;
      current = next;
      continue;
    }

    if (res.ok) {
      return res.url || current;
    }

    return null;
  }
  return null;
};

const resolveToCanonicalMapsUrl = async (raw: string): Promise<string | null> => {
  const trimmed = raw.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(withProtocol);
  } catch {
    return null;
  }

  if (isShortLinkHost(url.hostname)) {
    return resolveShortMapsUrl(withProtocol);
  }

  return withProtocol;
};

const extractChijFromText = (text: string): string | null => {
  const m = text.match(/ChIJ[A-Za-z0-9+_-]{10,}/);
  return m ? m[0] : null;
};

const extractPlaceNameHintFromMapsPath = (resolvedUrl: string): string | null => {
  try {
    const u = new URL(resolvedUrl);
    const m = u.pathname.match(/\/place\/([^/@]+)/);
    if (!m?.[1]) return null;
    return decodeURIComponent(m[1].replace(/\+/g, " ")).trim() || null;
  } catch {
    return null;
  }
};

const extractPlaceIdFromMapsUrl = (resolvedUrl: string): string | null => {
  try {
    const url = new URL(resolvedUrl);
    const decoded = decodeURIComponent(url.toString());

    const qp = url.searchParams.get("query_place_id") || url.searchParams.get("place_id");
    if (qp) {
      const n = normalizePlaceIdForRequest(qp);
      if (n.startsWith("ChIJ") || n.length > 10) return n;
    }

    const q = url.searchParams.get("q");
    if (q?.includes("place_id:")) {
      const part = q.split("place_id:")[1]?.split(/[,&]/)[0];
      if (part) {
        const n = normalizePlaceIdForRequest(part);
        if (n.startsWith("ChIJ")) return n;
      }
    }

    const fromDecoded = extractChijFromText(decoded);
    if (fromDecoded) return fromDecoded;

    return null;
  } catch {
    return null;
  }
};

const textSearch = async (
  apiKey: string,
  textQuery: string
): Promise<TextSearchResponse> => {
  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": TEXT_SEARCH_FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery,
      languageCode: "da",
      regionCode: "dk",
      pageSize: 5,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Text Search API ${response.status}: ${body}`);
  }

  return response.json() as Promise<TextSearchResponse>;
};

const getPlaceDetails = async (
  apiKey: string,
  placeId: string
): Promise<PlaceDetails> => {
  const id = normalizePlaceIdForRequest(placeId);
  const url = new URL(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(id)}`
  );
  url.searchParams.set("languageCode", "da");

  const response = await fetch(url.toString(), {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": PLACE_DETAILS_FIELD_MASK,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Place Details API ${response.status}: ${body}`);
  }

  return response.json() as Promise<PlaceDetails>;
};

const pickBestTextSearchPlace = (
  places: TextSearchPlace[],
  clinicName: string
): TextSearchPlace | null => {
  if (!places.length) return null;

  let bestPlace = places[0];
  let bestScore = matchScore(clinicName, bestPlace.displayName?.text ?? "");

  for (const place of places.slice(1)) {
    const score = matchScore(clinicName, place.displayName?.text ?? "");
    if (score > bestScore) {
      bestScore = score;
      bestPlace = place;
    }
  }

  if (bestScore < MIN_MATCH_SCORE) {
    return null;
  }

  return bestPlace;
};

const resolvePlaceId = async (
  apiKey: string,
  resolvedMapsUrl: string,
  clinic: ClinicRowForSync
): Promise<string | null> => {
  const fromUrl = extractPlaceIdFromMapsUrl(resolvedMapsUrl);
  if (fromUrl) return fromUrl;

  const nameHint = extractPlaceNameHintFromMapsPath(resolvedMapsUrl);
  if (nameHint) {
    const hintResult = await textSearch(apiKey, `${nameHint} Danmark`);
    const hintPlace = pickBestTextSearchPlace(hintResult.places ?? [], nameHint);
    if (hintPlace) {
      return normalizePlaceIdForRequest(hintPlace.id);
    }
  }

  const queryParts = [clinic.klinikNavn];
  if (clinic.adresse) queryParts.push(clinic.adresse);
  if (clinic.postnummer) queryParts.push(String(clinic.postnummer));
  queryParts.push("Danmark");

  let result = await textSearch(apiKey, queryParts.join(" "));

  if (!result.places?.length) {
    const fallback = `${clinic.klinikNavn} ${clinic.postnummer ?? ""} ${clinic.lokation ?? ""} fysioterapi Danmark`;
    result = await textSearch(apiKey, fallback.trim());
  }

  const bestPlace = pickBestTextSearchPlace(result.places ?? [], clinic.klinikNavn);
  if (!bestPlace) {
    return null;
  }

  return normalizePlaceIdForRequest(bestPlace.id);
};

const fetchClinicRowForSync = async (
  supabase: SupabaseClient,
  clinicId: string
): Promise<{ data: ClinicRowForSync | null; error: string | null }> => {
  const columns = [
    "clinics_id",
    "klinikNavn",
    "adresse",
    "postnummer",
    "lokation",
    ...DAY_COLUMNS,
    "tlf",
    "website",
  ].join(", ");

  const { data, error } = await supabase
    .from("clinics")
    .select(columns)
    .eq("clinics_id", clinicId)
    .single();

  if (error || !data) {
    return { data: null, error: error?.message ?? "Klinik ikke fundet" };
  }

  return { data: data as unknown as ClinicRowForSync, error: null };
};

/**
 * After admin approval, enrich `clinics` from Google Places using a Maps URL.
 * Does not throw — returns structured result for UI toasts.
 */
export const syncClinicFromGoogleMapsUrlOnApprove = async (
  supabase: SupabaseClient,
  clinicId: string,
  googleMapsUrl: string
): Promise<GoogleSyncResult> => {
  const trimmedUrl = googleMapsUrl.trim();
  if (!trimmedUrl) {
    return { ok: true };
  }

  if (!isLikelyGoogleMapsUrl(trimmedUrl)) {
    return {
      ok: false,
      message: "Ugyldigt Google Maps-link. Godkendelsen er gennemført; Google-data blev ikke hentet.",
    };
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      message:
        "GOOGLE_PLACES_API_KEY mangler på serveren. Godkendelsen er gennemført; Google-data blev ikke hentet.",
    };
  }

  const rowResult = await fetchClinicRowForSync(supabase, clinicId);
  if (rowResult.error || !rowResult.data) {
    return {
      ok: false,
      message: `Kunne ikke hente klinik til Google-synk: ${rowResult.error ?? "ukendt fejl"}`,
    };
  }

  const clinic = rowResult.data;

  try {
    const resolved = await resolveToCanonicalMapsUrl(trimmedUrl);
    if (!resolved) {
      return {
        ok: false,
        message:
          "Kunne ikke følge Google Maps-linket. Godkendelsen er gennemført; Google-data blev ikke hentet.",
      };
    }

    const placeId = await resolvePlaceId(apiKey, resolved, clinic);
    if (!placeId) {
      return {
        ok: false,
        message:
          "Kunne ikke finde sted-ID fra linket. Godkendelsen er gennemført; Google-data blev ikke hentet.",
      };
    }

    const details = await getPlaceDetails(apiKey, placeId);

    if (details.businessStatus === "CLOSED_PERMANENTLY") {
      return {
        ok: false,
        message:
          "Google markerer stedet som permanent lukket. Klinikken er ikke opdateret med Google-data.",
      };
    }

    const updateData: Record<string, unknown> = {};
    updateData.google_place_id = placeId;

    if (details.googleMapsUri) {
      updateData.google_maps_url_cid = details.googleMapsUri;
    }

    if (details.rating !== undefined && details.rating !== null) {
      updateData.avgRating = details.rating;
    }

    if (details.userRatingCount !== undefined && details.userRatingCount !== null) {
      updateData.ratingCount = details.userRatingCount;
    }

    const lat = details.location?.latitude;
    const lng = details.location?.longitude;
    if (typeof lat === "number" && typeof lng === "number") {
      updateData.latitude = lat;
      updateData.longitude = lng;
    }

    if (areAllWeekdayHoursUnsetInDb(clinic)) {
      const descriptions = details.regularOpeningHours?.weekdayDescriptions;
      if (descriptions && descriptions.length > 0) {
        const hours = parseOpeningHoursFromGoogleDescriptions(descriptions);
        if (hasAnyNonClosedParsedHour(hours)) {
          for (const day of DAY_COLUMNS) {
            updateData[day] = hours[day];
          }
        }
      }
    }

    if (isNullishOrBlank(clinic.tlf) && details.internationalPhoneNumber) {
      updateData.tlf = details.internationalPhoneNumber.replace(/\s+/g, " ").trim();
    }

    if (isNullishOrBlank(clinic.website) && details.websiteUri) {
      updateData.website = details.websiteUri;
    }

    updateData.updated_at = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("clinics")
      .update(updateData)
      .eq("clinics_id", clinicId);

    if (updateError) {
      console.error("approve-bootstrap-sync update error:", updateError);
      return {
        ok: false,
        message:
          "Kunne ikke gemme Google-data i databasen. Godkendelsen er gennemført; prøv igen senere eller opdater manuelt.",
      };
    }

    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("approve-bootstrap-sync error:", msg);
    return {
      ok: false,
      message: `Google-synk fejlede: ${msg}. Godkendelsen er gennemført.`,
    };
  }
};
