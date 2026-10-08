// Added: 2026-03-24 - Centralized canonical search URL building for location/specialty/filter combinations
import { LocationQuery, SearchFilters } from "./SearchProvider";
import { buildSearchUrl } from "@/utils/parameter-normalization";

export const ONLINE_LOCATION: LocationQuery = { name: "Online", slug: "online" };
export const DANMARK_LOCATION: LocationQuery = { name: "Danmark", slug: "danmark" };

/** Online is a location route rather than a query filter, so toggling it swaps the location. */
export function getOnlineToggleLocation(enabled: boolean): LocationQuery {
  return enabled ? ONLINE_LOCATION : DANMARK_LOCATION;
}

interface BuildSearchTargetUrlArgs {
  locationSlug?: string | null;
  specialtySlug?: string | null;
  filters?: SearchFilters;
}

export function buildSearchTargetUrl({
  locationSlug,
  specialtySlug,
  filters = {},
}: BuildSearchTargetUrlArgs): string {
  if (locationSlug) return buildSearchUrl(locationSlug, specialtySlug || undefined, filters);
  if (specialtySlug) return buildSearchUrl("danmark", specialtySlug, filters);
  return buildSearchUrl("danmark", undefined, filters);
}
