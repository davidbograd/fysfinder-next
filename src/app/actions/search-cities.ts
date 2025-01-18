"use server";

import { createClient } from "@/app/utils/supabase/server";
import { SearchResult } from "@/app/types";

export async function searchCities(query: string): Promise<SearchResult> {
  const supabase = createClient();
  const cleanQuery = query.trim().toLowerCase();

  try {
    // First try to find exact match
    const { data: exactMatch } = await supabase
      .from("cities")
      .select("*")
      .or(`postal_codes.cs.{${cleanQuery}},bynavn_slug.eq.${cleanQuery}`)
      .single();

    if (!exactMatch) {
      return {
        exact_match: null,
        nearby_cities: [],
      };
    }

    // Then find nearby cities using PostGIS
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
  } catch (error) {
    console.error("Search failed:", error);
    throw error;
  }
}
