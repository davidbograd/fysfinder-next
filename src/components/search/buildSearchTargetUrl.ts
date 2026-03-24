// Added: 2026-03-24 - Centralized canonical search URL building for location/specialty/filter combinations
import { SearchFilters, SearchState } from "./SearchProvider";
import { buildSearchUrl } from "@/utils/parameter-normalization";

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

export function buildSearchTargetUrlFromState(state: SearchState): string {
  return buildSearchTargetUrl({
    locationSlug: state.location?.slug,
    specialtySlug: state.specialty?.slug,
    filters: state.filters,
  });
}
