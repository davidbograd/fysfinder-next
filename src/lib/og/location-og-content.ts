// Resolves the Open Graph text for a find page from the same cached data the page renders.
// Added: 2026-10-11

import { deslugify } from "@/app/utils/slugify";
import { fetchLocationData } from "@/app/find/fysioterapeut/[location]/fetch-location-data";
import { buildLocationOgText, LocationOgText } from "@/lib/og/location-og-text";

export interface LocationOgContent {
  text: LocationOgText;
  specialtyName?: string;
}

export async function getLocationOgContent(
  locationSlug: string,
  specialtySlug?: string
): Promise<LocationOgContent> {
  const data = await fetchLocationData(locationSlug, specialtySlug);
  const isDanmark = locationSlug === "danmark";
  const specialtyName = specialtySlug
    ? data.specialties.find((s) => s.specialty_name_slug === specialtySlug)
        ?.specialty_name
    : undefined;

  return {
    specialtyName,
    text: buildLocationOgText({
      locationName: isDanmark
        ? "Danmark"
        : (data.city?.bynavn ?? deslugify(locationSlug)),
      clinicCount: data.clinics.length,
      specialtyName,
      locationPreposition: data.city?.location_preposition,
      isDanmark,
    }),
  };
}
