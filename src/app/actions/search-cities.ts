"use server";

import { createClient } from "@/app/utils/supabase/server";
import { SearchResult } from "@/app/types";

export async function searchCities(query: string): Promise<SearchResult> {
  const supabase = createClient();
  const cleanQuery = query.trim().toLowerCase();

  // Return early if query is too short
  if (cleanQuery.length < 2) {
    return {
      exact_match: null,
      nearby_cities: [],
    };
  }

  try {
    // Search for both exact and partial matches
    const { data: matches } = await supabase
      .from("cities")
      .select("*")
      .or(
        `postal_codes.cs.{${cleanQuery}},` +
          `bynavn_slug.eq.${cleanQuery},` +
          `bynavn.ilike.${cleanQuery}%` // Added % for prefix matching
      )
      .order("bynavn")
      .limit(10);

    if (!matches || matches.length === 0) {
      return {
        exact_match: null,
        nearby_cities: [],
      };
    }

    // Find exact match if any
    const exactMatch = matches.find(
      (city) =>
        city.bynavn.toLowerCase() === cleanQuery ||
        city.bynavn_slug === cleanQuery ||
        city.postal_codes.some((code: string) => code === cleanQuery)
    );

    // If we have an exact match, find nearby cities
    if (exactMatch) {
      const { data: nearbyCities } = await supabase.rpc("get_nearby_cities", {
        origin_lat: exactMatch.latitude,
        origin_lng: exactMatch.longitude,
        max_distance_km: 5,
        exclude_city_id: exactMatch.id,
      });

      return {
        exact_match: exactMatch,
        nearby_cities: nearbyCities || [],
      };
    }

    // If no exact match, return all partial matches as nearby cities
    return {
      exact_match: null,
      nearby_cities: matches.map((city) => ({
        ...city,
        distance: -1, // Special value to indicate this is a search result, not a nearby city
      })),
    };
  } catch (error) {
    console.error("Search failed:", error);
    throw error;
  }
}
