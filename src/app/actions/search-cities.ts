"use server";

// City typeahead for location search.
// Updated: 2026-09-06 - Rank name matches with Danish folding, contains, and light typo tolerance.

import { createClient } from "@/app/utils/supabase/server";
import { slugify } from "@/app/utils/slugify";
import { City, SearchResult } from "@/app/types";
import { foldSearchText, rankSearchItems } from "@/lib/search-matching";

function sanitizeIlikeValue(value: string): string {
  return value.replace(/[%_,()]/g, " ").replace(/\s+/g, " ").trim();
}

function buildCityNameFilters(query: string): string | null {
  const sanitized = sanitizeIlikeValue(query);
  if (!sanitized) return null;

  const slug = slugify(sanitized);
  const prefix = foldSearchText(sanitized).slice(0, 2);
  const filters = [
    `bynavn.ilike.%${sanitized}%`,
    `bynavn_slug.eq.${slug}`,
    `bynavn_slug.ilike.%${slug}%`,
  ];

  if (prefix.length >= 2) {
    filters.push(`bynavn_slug.ilike.${prefix}%`);
  }

  return filters.join(",");
}

export async function searchCities(query: string): Promise<SearchResult> {
  const supabase = await createClient();
  const cleanQuery = query.trim().toLowerCase();

  if (cleanQuery.length < 2) {
    return {
      exact_match: null,
      nearby_cities: [],
    };
  }

  try {
    let matches: City[] = [];

    const isFullPostalCode = /^\d{4}$/.test(cleanQuery);
    const isPartialPostalCode = /^\d{1,3}$/.test(cleanQuery);

    if (isFullPostalCode) {
      const { data: postalMatches } = await supabase
        .from("cities")
        .select("*")
        .contains("postal_codes", [cleanQuery])
        .order("bynavn")
        .limit(10);

      matches = (postalMatches as City[]) || [];
    } else if (isPartialPostalCode) {
      return {
        exact_match: null,
        nearby_cities: [],
        prompt_message: `Skriv det fulde 4-cifrede postnummer (f.eks. 2100)`,
      };
    } else {
      const orFilters = buildCityNameFilters(cleanQuery);
      if (!orFilters) {
        return { exact_match: null, nearby_cities: [] };
      }

      const { data: cityMatches } = await supabase
        .from("cities")
        .select("*")
        .or(orFilters)
        .order("bynavn")
        .limit(40);

      matches = rankSearchItems(
        (cityMatches as City[]) || [],
        cleanQuery,
        (city) => `${city.bynavn} ${city.bynavn_slug}`
      ).slice(0, 10);
    }

    if (!matches || matches.length === 0) {
      return {
        exact_match: null,
        nearby_cities: [],
      };
    }

    const exactMatch = matches.find(
      (city) =>
        city.bynavn.toLowerCase() === cleanQuery ||
        city.bynavn_slug === slugify(cleanQuery) ||
        city.postal_codes.some((code) => code === cleanQuery)
    );

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

    return {
      exact_match: null,
      nearby_cities: matches.map((city) => ({
        ...city,
        distance: -1,
      })),
    };
  } catch (error) {
    console.error("Search failed:", error);
    throw error;
  }
}
