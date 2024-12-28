"use server";

import { City, SearchResult } from "@/app/types";

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function groupPostalCodes(postalCodes: Array<any>): City[] {
  const grouped = postalCodes.reduce<Record<string, City>>((acc, curr) => {
    if (!acc[curr.navn]) {
      acc[curr.navn] = {
        navn: curr.navn,
        postal_codes: [],
        latitude: curr.visueltcenter[1],
        longitude: curr.visueltcenter[0],
        betegnelser: curr.betegnelser || [],
        updated_at: new Date().toISOString(),
      };
    }
    acc[curr.navn].postal_codes.push(curr.nr);
    return acc;
  }, {});

  return Object.values(grouped);
}

export async function searchCities(query: string): Promise<SearchResult> {
  const cleanQuery = query.trim();

  try {
    // Fetch all postal codes
    const response = await fetch("https://api.dataforsyningen.dk/postnumre", {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) throw new Error("Failed to fetch postal codes");

    const postalCodes = await response.json();
    const cities = groupPostalCodes(postalCodes);

    // Find exact match
    const exactMatch =
      cities.find(
        (city) =>
          city.postal_codes.includes(cleanQuery) ||
          city.navn.toLowerCase() === cleanQuery.toLowerCase()
      ) || null;

    // If no exact match found, return empty result
    if (!exactMatch) {
      return {
        exact_match: null,
        nearby_cities: [],
      };
    }

    // Find nearby cities within 5km
    const nearbyCities = cities
      .filter((city) => city.navn !== exactMatch.navn)
      .map((city) => ({
        ...city,
        distance: calculateDistance(
          exactMatch.latitude,
          exactMatch.longitude,
          city.latitude,
          city.longitude
        ),
      }))
      .filter((city) => city.distance <= 5)
      .sort((a, b) => a.distance - b.distance)
      .map((city) => ({
        ...city,
        distance: Math.round(city.distance * 10) / 10,
      }));

    return {
      exact_match: exactMatch,
      nearby_cities: nearbyCities,
    };
  } catch (error) {
    console.error("Search failed:", error);
    throw error;
  }
}
