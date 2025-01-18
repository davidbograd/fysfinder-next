"use client";

import { useState, useEffect, useRef } from "react";
import { useDebounce } from "use-debounce";
import { searchCities } from "@/app/actions/search-cities";
import { SpecialtyDropdown } from "./SpecialtyDropdown";
import { SearchResult } from "@/app/types";
import Link from "next/link";
import { MapPin } from "lucide-react";

interface Props {
  specialties: {
    specialty_name: string;
    specialty_name_slug: string;
    specialty_id: string;
  }[];
  currentSpecialty?: string;
  citySlug: string;
  defaultSearchValue?: string;
}

export function SearchAndFilters({
  specialties,
  currentSpecialty,
  citySlug,
  defaultSearchValue,
}: Props) {
  const [query, setQuery] = useState(defaultSearchValue || "");
  const [debouncedQuery] = useDebounce(query, 300);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const originalCity = useRef(defaultSearchValue || "");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
        if (!searchResult?.exact_match) {
          setQuery(originalCity.current);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchResult]);

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

  const handleFocus = () => {
    setIsFocused(true);
    setQuery("");
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="flex h-12 mb-8">
        {/* Search Input Group */}
        <div className="flex-1 relative flex">
          <div className="flex-1 flex items-center relative border border-r-0 bg-white rounded-l-full overflow-hidden hover:bg-gray-50/50 transition-colors">
            <div className="pl-4 flex items-center">
              <MapPin className="text-gray-400 size-5" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleFocus}
              placeholder="Søg efter postnummer..."
              className="w-full h-full pl-3 pr-5 focus:outline-none focus:ring-0 text-gray-900 placeholder:text-gray-500 text-base bg-transparent"
            />
          </div>
        </div>

        {/* Specialty Dropdown */}
        <div className="w-[260px]">
          <SpecialtyDropdown
            specialties={specialties}
            currentSpecialty={currentSpecialty}
            citySlug={citySlug}
            className="rounded-l-none rounded-r-full h-full"
          />
        </div>
      </div>

      {/* Search Results Dropdown - adjusted z-index and styling */}
      {query && isFocused && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-gray-500 text-center">Søger...</div>
          ) : searchResult ? (
            <>
              {searchResult.exact_match && (
                <Link
                  href={`/find/fysioterapeut/${searchResult.exact_match.bynavn_slug}`}
                  className="block p-3 hover:bg-gray-50 border-b"
                >
                  <div className="font-medium">
                    {searchResult.exact_match.bynavn}
                  </div>
                  <div className="text-sm text-gray-500">
                    {searchResult.exact_match.postal_codes.join(", ")}
                  </div>
                </Link>
              )}
              {searchResult.nearby_cities.map((city) => (
                <Link
                  key={city.id}
                  href={`/find/fysioterapeut/${city.bynavn_slug}`}
                  className="block p-3 hover:bg-gray-50"
                >
                  <div className="font-medium">{city.bynavn}</div>
                  <div className="text-sm text-gray-500">
                    {city.postal_codes.join(", ")} • {city.distance.toFixed(1)}{" "}
                    km væk
                  </div>
                </Link>
              ))}
              {searchResult.exact_match === null &&
                searchResult.nearby_cities.length === 0 && (
                  <div className="p-4 text-gray-500 text-center">
                    Ingen resultater fundet
                  </div>
                )}
            </>
          ) : (
            <div className="p-4 text-gray-500 text-center">
              Skriv for at søge...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
