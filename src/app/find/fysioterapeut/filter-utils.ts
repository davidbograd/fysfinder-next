// Added: 2026-03-30 - Shared query-filter parsing for location and specialty pages.
export interface LocationFilters {
  ydernummer?: boolean;
  handicap?: boolean;
  online?: boolean;
}

export function parseFilters(
  searchParams: { [key: string]: string | string[] | undefined } | undefined
): LocationFilters {
  const filters: LocationFilters = {};
  if (searchParams?.ydernummer === "true") filters.ydernummer = true;
  if (searchParams?.handicap === "true") filters.handicap = true;
  if (searchParams?.online === "true") filters.online = true;
  return filters;
}
