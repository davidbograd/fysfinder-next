// Resolves the Open Graph text and image URL for a find page from the same cached data the page renders.
// Updated: 2026-10-11 - Filters are passed through so ?online / ?ydernummer pages get their own image.

import { deslugify } from "@/app/utils/slugify";
import { LocationPageData } from "@/app/types/index";
import { fetchLocationData } from "@/app/find/fysioterapeut/[location]/fetch-location-data";
import { LocationFilters } from "@/app/find/fysioterapeut/filter-utils";
import { buildLocationOgText, LocationOgText } from "@/lib/og/location-og-text";

export const FIND_OG_IMAGE_PATH = "/api/og/find";
export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-fysfinder.jpg",
  alt: "Fysfinder - Find den bedste fysioterapeut",
};

/**
 * Generated images cover plain city and city + specialty pages, plus the Danmark
 * ?online=true and ?ydernummer=true pages. Other filter combinations use DEFAULT_OG_IMAGE.
 */
export function hasGeneratedOgImage(
  locationSlug: string,
  specialtySlug?: string,
  filters?: LocationFilters
): boolean {
  const { ydernummer, handicap, online } = filters ?? {};
  if (!ydernummer && !handicap && !online) return true;
  return (
    locationSlug === "danmark" &&
    !specialtySlug &&
    !handicap &&
    Boolean(ydernummer) !== Boolean(online)
  );
}

export function buildLocationOgTextFromData(
  data: LocationPageData,
  locationSlug: string,
  specialtySlug?: string,
  filters?: LocationFilters
): LocationOgText {
  const isDanmark = locationSlug === "danmark";
  const specialtyName = specialtySlug
    ? data.specialties.find((s) => s.specialty_name_slug === specialtySlug)
        ?.specialty_name
    : undefined;

  return buildLocationOgText({
    locationName: isDanmark
      ? "Danmark"
      : (data.city?.bynavn ?? deslugify(locationSlug)),
    clinicCount: data.clinics.length,
    specialtyName,
    locationPreposition: data.city?.location_preposition,
    isDanmark,
    filters,
  });
}

export async function getLocationOgText(
  locationSlug: string,
  specialtySlug?: string,
  filters?: LocationFilters
): Promise<LocationOgText> {
  const data = await fetchLocationData(locationSlug, specialtySlug, filters);
  return buildLocationOgTextFromData(data, locationSlug, specialtySlug, filters);
}

function buildFindOgImagePath(
  locationSlug: string,
  specialtySlug?: string,
  filters?: LocationFilters
): string {
  const params = new URLSearchParams({ location: locationSlug });
  if (specialtySlug) params.set("specialty", specialtySlug);
  if (filters?.ydernummer) params.set("ydernummer", "true");
  if (filters?.online) params.set("online", "true");
  return `${FIND_OG_IMAGE_PATH}?${params.toString()}`;
}

/** The Open Graph image (URL + alt) a find page should advertise. */
export function resolveFindOgImage(
  data: LocationPageData,
  locationSlug: string,
  specialtySlug?: string,
  filters?: LocationFilters
): { url: string; alt: string } {
  if (!hasGeneratedOgImage(locationSlug, specialtySlug, filters)) {
    return DEFAULT_OG_IMAGE;
  }
  return {
    url: buildFindOgImagePath(locationSlug, specialtySlug, filters),
    alt: buildLocationOgTextFromData(data, locationSlug, specialtySlug, filters).alt,
  };
}
