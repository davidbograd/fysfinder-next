import { createClient } from "@/app/utils/supabase/server";

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
  const supabase = createClient();
  const { data, error } = await supabase
    .from("specialties")
    .select("specialty_id, specialty_name, specialty_name_slug");

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(`Failed to fetch specialties: ${error.message}`);
  }

  return data;
}

export async function fetchCitiesWithCounts() {
  const supabase = createClient();

  const { data, error } = await supabase.from("cities").select(`
      id,
      bynavn,
      bynavn_slug,
      postal_codes,
      clinics:clinics(count)
    `);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(`Failed to fetch cities: ${error.message}`);
  }

  return (data || []).map((city) => ({
    id: city.id,
    bynavn: city.bynavn,
    bynavn_slug: city.bynavn_slug,
    postal_codes: city.postal_codes,
    clinic_count: city.clinics?.[0]?.count || 0,
  }));
}

export function processCities(cities: CityWithCount[]): RegionData[] {
  const regionMap = new Map<string, CityWithCount[]>();

  for (const city of cities) {
    const postalCode = city.postal_codes[0];
    const regionKey = Object.keys(regions).find(
      (key) =>
        postalCode >= regions[key].range[0].toString() &&
        postalCode <= regions[key].range[1].toString()
    );

    if (regionKey) {
      if (!regionMap.has(regionKey)) {
        regionMap.set(regionKey, []);
      }
      regionMap.get(regionKey)!.push(city);
    }
  }

  return Array.from(regionMap.entries())
    .map(([key, cities]) => ({
      name: regions[key].name,
      cities: cities.sort((a, b) => a.bynavn.localeCompare(b.bynavn)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
