/**
 * Extended parameter normalization for complex filters
 * This shows how to support both boolean and string-based filters
 */

// Extended filter types to support different value types
export type BooleanFilter = "handicap" | "ydernummer";
export type StringFilter = "insurance" | "region";
export type AllFilters = BooleanFilter | StringFilter;

// Filter value types
export type FilterValues = {
  handicap?: boolean;
  ydernummer?: boolean;
  insurance?: string; // e.g., "danmark", "tryg", "alka"
  region?: string; // e.g., "hovedstaden", "midtjylland"
};

// Canonical parameter order (alphabetical, then by value for strings)
export const CANONICAL_PARAM_ORDER: AllFilters[] = [
  "handicap",
  "insurance",
  "region",
  "ydernummer",
];

/**
 * Extended normalization for mixed filter types
 */
export function normalizeSearchParamsExtended(params: URLSearchParams): string {
  const normalized = new URLSearchParams();

  // Process each filter type in canonical order
  CANONICAL_PARAM_ORDER.forEach((key) => {
    const value = params.get(key);
    if (value !== null && value !== "") {
      // For boolean filters, only add if true
      if ((key === "handicap" || key === "ydernummer") && value === "true") {
        normalized.set(key, value);
      }
      // For string filters, add the value
      else if (key === "insurance" || key === "region") {
        normalized.set(key, value);
      }
    }
  });

  return normalized.toString();
}

/**
 * Extended canonical URL builder
 */
export function buildCanonicalUrlExtended(
  location: string,
  specialty?: string,
  filters?: Partial<FilterValues>
): string {
  const basePath = `/find/fysioterapeut/${location}${
    specialty ? `/${specialty}` : ""
  }`;

  if (!filters || Object.keys(filters).length === 0) {
    return basePath;
  }

  const params = new URLSearchParams();

  // Add filters in canonical order
  CANONICAL_PARAM_ORDER.forEach((key) => {
    const value = filters[key as keyof FilterValues];
    if (value !== undefined) {
      if (typeof value === "boolean" && value) {
        params.set(key, "true");
      } else if (typeof value === "string" && value) {
        params.set(key, value);
      }
    }
  });

  const normalizedParams = normalizeSearchParamsExtended(params);

  return normalizedParams ? `${basePath}?${normalizedParams}` : basePath;
}

/**
 * Extended filter context generator
 */
export function getFilterContextExtended(
  filters?: Partial<FilterValues>
): string {
  if (!filters) return "";

  const filterContextMap = {
    handicap: "med handicapadgang",
    ydernummer: "med ydernummer",
    insurance: (value: string) => `forsikring: ${value}`,
    region: (value: string) => `region: ${value}`,
  };

  const activeFilters: string[] = [];

  CANONICAL_PARAM_ORDER.forEach((key) => {
    const value = filters[key as keyof FilterValues];
    if (value) {
      if (typeof value === "boolean") {
        activeFilters.push(filterContextMap[key as BooleanFilter]);
      } else if (typeof value === "string") {
        const contextFn = filterContextMap[key as StringFilter];
        activeFilters.push(contextFn(value));
      }
    }
  });

  if (activeFilters.length === 0) return "";
  if (activeFilters.length === 1) return activeFilters[0];

  return (
    activeFilters.slice(0, -1).join(", ") +
    " og " +
    activeFilters[activeFilters.length - 1]
  );
}

/**
 * Example usage:
 */
export const extendedExamples = {
  // Complex filter combinations
  filters: {
    example1: { handicap: true, insurance: "danmark" },
    example2: { ydernummer: true, region: "hovedstaden", insurance: "tryg" },
    example3: { handicap: true, ydernummer: true, insurance: "alka" },
  },

  // Resulting URLs (all normalized)
  urls: [
    "/find/fysioterapeut/kobenhavn?handicap=true&insurance=danmark",
    "/find/fysioterapeut/aarhus?insurance=tryg&region=hovedstaden&ydernummer=true",
    "/find/fysioterapeut/odense?handicap=true&insurance=alka&ydernummer=true",
  ],

  // Filter contexts
  contexts: [
    "med handicapadgang og forsikring: danmark",
    "forsikring: tryg, region: hovedstaden og med ydernummer",
    "med handicapadgang, forsikring: alka og med ydernummer",
  ],
};

/**
 * Parameter normalization ensures consistent ordering:
 * Input:  ?ydernummer=true&insurance=danmark&handicap=true
 * Output: ?handicap=true&insurance=danmark&ydernummer=true
 */
