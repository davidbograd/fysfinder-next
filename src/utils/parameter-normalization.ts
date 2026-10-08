import { SearchFilters } from "@/components/search/SearchProvider";

// Parameter order for canonicalization (alphabetical)
const CANONICAL_PARAM_ORDER = ["handicap", "online", "ydernummer"] as const;

/**
 * Normalizes URL search parameters to ensure consistent ordering
 * This prevents duplicate content issues from different parameter orders
 */
export function normalizeSearchParams(params: URLSearchParams): string {
  const normalized = new URLSearchParams();

  CANONICAL_PARAM_ORDER.forEach((key) => {
    const value = params.get(key);
    if (value !== null) {
      normalized.set(key, value);
    }
  });

  return normalized.toString();
}

/**
 * Builds a canonical URL with normalized parameters
 */
export function buildCanonicalUrl(
  basePath: string,
  filters: SearchFilters = {}
): string {
  const params = new URLSearchParams();

  // Only add filters that are on; a missing parameter means off.
  CANONICAL_PARAM_ORDER.forEach((key) => {
    if (filters[key] === true) params.set(key, "true");
  });

  const normalizedParams = normalizeSearchParams(params);
  return normalizedParams ? `${basePath}?${normalizedParams}` : basePath;
}

/**
 * Parses URL parameters into SearchFilters
 */
export function parseFiltersFromURL(
  searchParams: URLSearchParams
): SearchFilters {
  const filters: SearchFilters = {};

  CANONICAL_PARAM_ORDER.forEach((key) => {
    if (searchParams.get(key) === "true") filters[key] = true;
  });

  return filters;
}

/**
 * Builds a search URL with location, specialty, and filters
 */
export function buildSearchUrl(
  location: string,
  specialty?: string,
  filters: SearchFilters = {}
): string {
  let basePath = `/find/fysioterapeut/${location}`;

  if (specialty) {
    basePath += `/${specialty}`;
  }

  return buildCanonicalUrl(basePath, filters);
}
