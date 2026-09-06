// Resolve typed search drafts into a canonical find URL.
// Updated: 2026-09-06 - Honor unselected typeahead text instead of silently going to Danmark.

import { searchCities } from "@/app/actions/search-cities";
import { SearchResult } from "@/app/types";
import { pickBestSearchItem } from "@/lib/search-matching";
import type {
  LocationQuery,
  SearchFilters,
  SpecialtyQuery,
} from "./SearchProvider";
import { buildSearchTargetUrl } from "./buildSearchTargetUrl";

export interface SearchSpecialtyOption {
  specialty_id: string;
  specialty_name: string;
  specialty_name_slug: string;
}

export interface ResolveSearchTargetArgs {
  location: LocationQuery | null;
  locationDraft: string;
  specialty: SpecialtyQuery | null;
  specialtyDraft: string;
  filters?: SearchFilters;
  specialties?: SearchSpecialtyOption[];
  fetchCities?: (query: string) => Promise<SearchResult>;
}

export type ResolveSearchTargetResult =
  | { ok: true; url: string; location: LocationQuery | null; specialty: SpecialtyQuery | null }
  | { ok: false; reason: "no-location-match" };

function cityToLocation(city: {
  bynavn: string;
  bynavn_slug: string;
  postal_codes: string[];
}): LocationQuery {
  return {
    name: city.bynavn,
    slug: city.bynavn_slug,
    postalCodes: city.postal_codes,
  };
}

export function pickBestCityFromResult(
  result: SearchResult,
  query: string
) {
  const candidates = [
    ...(result.exact_match ? [result.exact_match] : []),
    ...result.nearby_cities.filter((city) => city.distance <= 0),
  ];
  const pool = candidates.length > 0 ? candidates : result.nearby_cities;
  return pickBestSearchItem(
    pool,
    query,
    (city) => `${city.bynavn} ${city.bynavn_slug}`
  );
}

export function pickBestSpecialty(
  specialties: SearchSpecialtyOption[],
  query: string
): SearchSpecialtyOption | null {
  return pickBestSearchItem(
    specialties,
    query,
    (specialty) => `${specialty.specialty_name} ${specialty.specialty_name_slug}`
  );
}

export async function resolveSearchTarget({
  location,
  locationDraft,
  specialty,
  specialtyDraft,
  filters = {},
  specialties = [],
  fetchCities = searchCities,
}: ResolveSearchTargetArgs): Promise<ResolveSearchTargetResult> {
  let resolvedLocation = location;
  const trimmedLocationDraft = locationDraft.trim();

  if (!resolvedLocation && trimmedLocationDraft) {
    const result = await fetchCities(trimmedLocationDraft);
    const bestCity = pickBestCityFromResult(result, trimmedLocationDraft);
    if (!bestCity) return { ok: false, reason: "no-location-match" };
    resolvedLocation = cityToLocation(bestCity);
  }

  let resolvedSpecialty = specialty;
  const trimmedSpecialtyDraft = specialtyDraft.trim();
  if (!resolvedSpecialty && trimmedSpecialtyDraft) {
    const bestSpecialty = pickBestSpecialty(specialties, trimmedSpecialtyDraft);
    if (bestSpecialty) {
      resolvedSpecialty = {
        name: bestSpecialty.specialty_name,
        slug: bestSpecialty.specialty_name_slug,
        id: bestSpecialty.specialty_id,
      };
    }
  }

  return {
    ok: true,
    url: buildSearchTargetUrl({
      locationSlug: resolvedLocation?.slug,
      specialtySlug: resolvedSpecialty?.slug,
      filters,
    }),
    location: resolvedLocation,
    specialty: resolvedSpecialty,
  };
}
