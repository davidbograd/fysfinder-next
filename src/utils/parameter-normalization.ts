import { SearchFilters } from "@/components/search/SearchProvider";

// Parameter order for canonicalization (alphabetical)
const CANONICAL_PARAM_ORDER = ["handicap", "ydernummer"] as const;

/**
 * Normalizes URL search parameters to ensure consistent ordering
 * This prevents duplicate content issues from different parameter orders
 */
export function normalizeSearchParams(params: URLSearchParams): string {
  const normalized = new URLSearchParams();

  // Add parameters in canonical order
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
  console.log("buildCanonicalUrl called with:", { basePath, filters });

  const params = new URLSearchParams();

  // Add filters in canonical order - only add if true, omit if false
  if (filters.handicap === true) {
    params.set("handicap", "true");
  }
  if (filters.ydernummer === true) {
    params.set("ydernummer", "true");
  }

  const normalizedParams = normalizeSearchParams(params);
  const result = normalizedParams
    ? `${basePath}?${normalizedParams}`
    : basePath;

  console.log("buildCanonicalUrl result:", result);
  return result;
}

/**
 * Generates filter context for meta tags and UI display
 */
export function getFilterContext(filters: SearchFilters): string {
  const contexts: string[] = [];

  if (filters.handicap === true) {
    contexts.push("med handicapadgang");
  }
  if (filters.ydernummer === true) {
    contexts.push("med ydernummer");
  }

  return contexts.length > 0 ? contexts.join(" og ") : "";
}

/**
 * Determines SEO strategy for filtered pages
 */
export function getFilteredPageSEO(filters: SearchFilters): {
  robots: string;
  shouldIndex: boolean;
} {
  const activeFilters = Object.values(filters).filter(Boolean).length;

  // Simple filters (1-2 parameters): indexable
  if (activeFilters <= 2) {
    return {
      robots: "index, follow",
      shouldIndex: true,
    };
  }

  // Complex filters (3+ parameters): noindex
  return {
    robots: "noindex, follow",
    shouldIndex: false,
  };
}

/**
 * Parses URL parameters into SearchFilters
 */
export function parseFiltersFromURL(
  searchParams: URLSearchParams
): SearchFilters {
  const filters: SearchFilters = {};

  const handicap = searchParams.get("handicap");
  if (handicap === "true") {
    filters.handicap = true;
  }
  // If parameter is missing or not "true", leave as undefined

  const ydernummer = searchParams.get("ydernummer");
  if (ydernummer === "true") {
    filters.ydernummer = true;
  }
  // If parameter is missing or not "true", leave as undefined

  return filters;
}

/**
 * Checks if URL parameters are in canonical order
 */
export function isCanonicalParameterOrder(params: URLSearchParams): boolean {
  const currentOrder = Array.from(params.keys()).sort();
  const expectedOrder = CANONICAL_PARAM_ORDER.filter((key) =>
    params.has(key)
  ).sort();

  return JSON.stringify(currentOrder) === JSON.stringify(expectedOrder);
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

/**
 * Builds URL for the isolated search-v2 routes during development
 */
export function buildSearchV2Url(
  location: string,
  specialty?: string,
  filters: SearchFilters = {}
): string {
  let basePath = `/search-v2/find/${location}`;

  if (specialty) {
    basePath += `/${specialty}`;
  }

  return buildCanonicalUrl(basePath, filters);
}
