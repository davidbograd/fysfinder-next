/**
 * Parameter normalization utilities for search URLs
 * Prevents duplicate content issues by ensuring consistent parameter order
 */

// Define canonical parameter order (alphabetical)
export const CANONICAL_PARAM_ORDER = ["handicap", "ydernummer"] as const;

export type SearchFilter = "handicap" | "ydernummer";
export type FilterValue = "true" | "false";

/**
 * Normalizes URL search parameters to prevent duplicate content
 * Always sorts parameters in alphabetical order
 */
export function normalizeSearchParams(params: URLSearchParams): string {
  const normalized = new URLSearchParams();

  // Sort parameters in predefined canonical order
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
  location: string,
  specialty?: string,
  filters?: Partial<Record<SearchFilter, boolean>>
): string {
  const basePath = `/find/fysioterapeut/${location}${
    specialty ? `/${specialty}` : ""
  }`;

  if (!filters || Object.keys(filters).length === 0) {
    return basePath;
  }

  // Build URLSearchParams from filters
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, "true");
    }
  });

  const normalizedParams = normalizeSearchParams(params);

  return normalizedParams ? `${basePath}?${normalizedParams}` : basePath;
}

/**
 * Checks if URL parameters are in canonical order
 */
export function isCanonicalOrder(searchParams: URLSearchParams): boolean {
  const originalParams = searchParams.toString();
  const normalizedParams = normalizeSearchParams(searchParams);

  return originalParams === normalizedParams;
}

/**
 * Determines SEO strategy based on filter complexity
 */
export function getFilteredPageSEO(
  filters?: Partial<Record<SearchFilter, boolean>>
) {
  const hasFilters =
    filters && Object.keys(filters).some((key) => filters[key as SearchFilter]);

  if (!hasFilters) {
    return {
      robots: "index, follow",
      canonical: undefined, // No canonical needed for base page
    };
  }

  const filterCount = Object.values(filters).filter(Boolean).length;
  const shouldIndex = filterCount <= 2; // Only index simple filter combinations

  return {
    robots: shouldIndex ? "index, follow" : "noindex, follow",
    canonical: true, // Should point to base page
  };
}

/**
 * Generates filter context for meta tags
 */
export function getFilterContext(
  filters?: Partial<Record<SearchFilter, boolean>>
): string {
  if (!filters) return "";

  const filterContextMap: Record<SearchFilter, string> = {
    handicap: "med handicapadgang",
    ydernummer: "med ydernummer",
  };

  const activeFilters = Object.entries(filters)
    .filter(([, value]) => value)
    .map(([key]) => filterContextMap[key as SearchFilter])
    .filter(Boolean);

  if (activeFilters.length === 0) return "";
  if (activeFilters.length === 1) return activeFilters[0];

  // Join multiple filters with "og" (and)
  return (
    activeFilters.slice(0, -1).join(", ") +
    " og " +
    activeFilters[activeFilters.length - 1]
  );
}

/**
 * Parses search parameters into filter object
 */
export function parseFiltersFromParams(
  searchParams: URLSearchParams
): Partial<Record<SearchFilter, boolean>> {
  const filters: Partial<Record<SearchFilter, boolean>> = {};

  CANONICAL_PARAM_ORDER.forEach((key) => {
    const value = searchParams.get(key);
    if (value === "true") {
      filters[key] = true;
    }
  });

  return filters;
}

/**
 * Example usage and test cases
 */
export const examples = {
  // Test cases for parameter normalization
  testCases: [
    {
      input: "?ydernummer=true&handicap=true",
      expected: "?handicap=true&ydernummer=true",
      isCanonical: false,
    },
    {
      input: "?handicap=true&ydernummer=true",
      expected: "?handicap=true&ydernummer=true",
      isCanonical: true,
    },
    {
      input: "?handicap=true",
      expected: "?handicap=true",
      isCanonical: true,
    },
    {
      input: "?ydernummer=true",
      expected: "?ydernummer=true",
      isCanonical: true,
    },
  ],

  // Example URLs
  urls: {
    canonical: [
      "/find/fysioterapeut/kobenhavn?handicap=true&ydernummer=true",
      "/find/fysioterapeut/kobenhavn/sportsskader?handicap=true",
      "/find/fysioterapeut/aarhus?ydernummer=true",
    ],
    nonCanonical: [
      "/find/fysioterapeut/kobenhavn?ydernummer=true&handicap=true",
      "/find/fysioterapeut/kobenhavn/sportsskader?ydernummer=true&handicap=true",
    ],
  },
};
