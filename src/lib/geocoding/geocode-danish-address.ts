/**
 * Geocode a Danish clinic address via DAWA.
 * Fysfinder map pins always come from the clinic address, never from a Google Place.
 */

export interface DanishAddressQuery {
  adresse?: string | null;
  postnummer?: number | string | null;
  lokation?: string | null;
}

export interface GeocodedCoordinates {
  latitude: number;
  longitude: number;
}

interface DawaMiniAddress {
  x?: number;
  y?: number;
  postnr?: string;
}

const DAWA_ADRESSER_URL = "https://api.dataforsyningen.dk/adresser";
const DAWA_ADGANGSADRESSER_URL = "https://api.dataforsyningen.dk/adgangsadresser";

export function buildDanishAddressQuery(parts: DanishAddressQuery): string | null {
  const adresse = parts.adresse?.trim() ?? "";
  const postnummer =
    parts.postnummer === null || parts.postnummer === undefined
      ? ""
      : String(parts.postnummer).trim();
  const lokation = parts.lokation?.trim() ?? "";

  const query = [adresse, [postnummer, lokation].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ")
    .replace(/\s+/g, " ")
    .trim();

  return query.length > 0 ? query : null;
}

function normalizePostnummer(value: number | string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const digits = String(value).replace(/\D/g, "");
  return digits.length > 0 ? digits : null;
}

function toCoordinates(hit: DawaMiniAddress): GeocodedCoordinates | null {
  if (typeof hit.x !== "number" || typeof hit.y !== "number") return null;
  if (!Number.isFinite(hit.x) || !Number.isFinite(hit.y)) return null;
  return { latitude: hit.y, longitude: hit.x };
}

function pickBestDawaHit(
  hits: DawaMiniAddress[],
  postnummer: string | null
): GeocodedCoordinates | null {
  if (hits.length === 0) return null;

  if (postnummer) {
    const matchingPostcode = hits.find((hit) => hit.postnr === postnummer);
    const matched = matchingPostcode ? toCoordinates(matchingPostcode) : null;
    if (matched) return matched;
  }

  return toCoordinates(hits[0]);
}

async function searchDawa(
  url: string,
  query: string,
  fetchImpl: typeof fetch,
  fuzzy: boolean
): Promise<DawaMiniAddress[]> {
  const search = new URL(url);
  search.searchParams.set("q", query);
  search.searchParams.set("per_side", "5");
  search.searchParams.set("struktur", "mini");
  if (fuzzy) search.searchParams.set("fuzzy", "");

  const response = await fetchImpl(search.toString(), {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`DAWA ${response.status}: ${body}`);
  }

  const data = (await response.json()) as unknown;
  return Array.isArray(data) ? (data as DawaMiniAddress[]) : [];
}

export async function geocodeDanishAddress(
  parts: DanishAddressQuery,
  fetchImpl: typeof fetch = fetch
): Promise<GeocodedCoordinates | null> {
  const query = buildDanishAddressQuery(parts);
  if (!query) return null;

  const postnummer = normalizePostnummer(parts.postnummer);
  const endpoints = [DAWA_ADRESSER_URL, DAWA_ADGANGSADRESSER_URL];

  for (const fuzzy of [false, true]) {
    for (const endpoint of endpoints) {
      const hits = await searchDawa(endpoint, query, fetchImpl, fuzzy);
      const coordinates = pickBestDawaHit(hits, postnummer);
      if (coordinates) return coordinates;
    }
  }

  return null;
}
