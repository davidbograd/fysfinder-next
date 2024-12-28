"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { searchCities } from "@/app/actions/search-cities";
import { SearchResult } from "@/app/types";

export default function PostalCodeSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSearch() {
    if (!debouncedQuery) {
      setSearchResult(null);
      return;
    }

    setIsLoading(true);
    try {
      const result = await searchCities(debouncedQuery);
      setSearchResult(result);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    handleSearch();
  }, [debouncedQuery]);

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-xl mx-auto">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Søg efter postnummer eller by..."
          className="w-full p-2 border rounded-md mb-4"
        />

        {isLoading && <div>Søger...</div>}

        {searchResult?.exact_match && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Resultat</h2>
            <div className="p-4 border rounded-md">
              <h3 className="font-semibold">{searchResult.exact_match.navn}</h3>
              <p>
                Postnumre: {searchResult.exact_match.postal_codes.join(", ")}
              </p>
            </div>
          </div>
        )}

        {searchResult?.nearby_cities &&
          searchResult.nearby_cities.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-2">Byer i nærheden</h2>
              <div className="space-y-2">
                {searchResult.nearby_cities.map((city) => (
                  <div key={city.navn} className="p-4 border rounded-md">
                    <h3 className="font-semibold">{city.navn}</h3>
                    <p>Postnumre: {city.postal_codes.join(", ")}</p>
                    <p>Afstand: {city.distance} km</p>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
