// City utilities for fetching and processing city data with clinic counts
// Updated: 2025-02-14 - Switched to static Supabase client to avoid cookies() usage
// This allows pages using these utilities to be statically rendered (ISR/SSG)
// Previously used the cookie-based server client which forced dynamic rendering

import { createStaticClient } from "@/app/utils/supabase/static";

export interface CityWithCount {
  id: string;
  bynavn: string;
  bynavn_slug: string;
  postal_codes: string[];
  clinic_count: number;
}

export interface RegionData {
  name: string;
  cities: CityWithCount[];
}

export interface Specialty {
  specialty_id: string;
  specialty_name: string;
  specialty_name_slug: string;
}

export const regions: {
  [key: string]: { name: string; range: [number, number] };
} = {
  hovedstaden: { name: "Hovedstaden", range: [1000, 2999] },
  sjaelland: { name: "Sjælland", range: [3000, 4999] },
  syddanmark: { name: "Syddanmark", range: [5000, 6999] },
  midtjylland: { name: "Midtjylland", range: [7000, 8999] },
  nordjylland: { name: "Nordjylland", range: [9000, 9999] },
};

export async function fetchSpecialties(): Promise<Specialty[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("specialties")
    .select("specialty_id, specialty_name, specialty_name_slug");

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(`Failed to fetch specialties: ${error.message}`);
  }

  return data;
}

export async function fetchCitiesWithCounts(): Promise<CityWithCount[]> {
  const supabase = createStaticClient();

  // Use the city_clinic_counts view for fast, pre-computed aggregates
  // This avoids expensive nested queries and prevents timeouts
  const { data, error } = await supabase
    .from("city_clinic_counts")
    .select("id, bynavn, bynavn_slug, postal_codes, clinic_count");

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(`Failed to fetch cities: ${error.message}`);
  }

  return data || [];
}

export function processCities(cities: CityWithCount[]): RegionData[] {
  // Initialize regionMap with all regions
  const regionMap = new Map<string, CityWithCount[]>(
    Object.entries(regions).map(([key, _]) => [key, []])
  );

  // Process each city
  for (const city of cities) {
    // Check each postal code of the city
    for (const postalCode of city.postal_codes) {
      const regionKey = Object.keys(regions).find(
        (key) =>
          postalCode >= regions[key].range[0].toString() &&
          postalCode <= regions[key].range[1].toString()
      );

      if (regionKey) {
        // Add city to region if not already present
        const regionCities = regionMap.get(regionKey)!;
        if (!regionCities.some((c) => c.id === city.id)) {
          regionCities.push(city);
        }
      }
    }
  }

  // Convert map to array and sort cities by clinic count
  return Array.from(regionMap.entries())
    .map(([key, cities]) => ({
      name: regions[key].name,
      cities: cities.sort((a, b) => b.clinic_count - a.clinic_count),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
