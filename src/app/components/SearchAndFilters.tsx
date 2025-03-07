"use client";

import { useState, useEffect, useRef } from "react";
import { useDebounce } from "use-debounce";
import { searchCities } from "@/app/actions/search-cities";
import { SpecialtyDropdown } from "./SpecialtyDropdown";
import { SearchResult } from "@/app/types";
import Link from "next/link";
import { MapPin, Loader2 } from "lucide-react";

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
  const [debouncedQuery] = useDebounce(query, query.length < 2 ? 0 : 300);
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
    if (!debouncedQuery || debouncedQuery.length < 2) {
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
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="flex flex-col sm:flex-row sm:gap-0 mb-4">
        <div className="flex-1 flex flex-col sm:flex-row border bg-white rounded-xl sm:border-0 overflow-hidden">
          {/* Search Input Group */}
          <div className="flex-1 relative flex">
            <div className="flex-1 flex items-center relative sm:border bg-white sm:rounded-l-full overflow-hidden group">
              <div className="pl-4 flex items-center">
                <MapPin className="text-gray-400 size-5" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={handleFocus}
                placeholder="By eller postnummer"
                className="w-full h-12 pl-3 pr-5 focus:outline-none focus:ring-0 text-gray-900 placeholder:text-gray-500 text-base bg-white group-hover:bg-gray-50/50 transition-colors"
              />
            </div>
          </div>

          {/* Divider for mobile */}
          <div className="h-px bg-gray-200 sm:hidden" />

          {/* Specialty Dropdown */}
          <div className="w-full sm:w-[260px]">
            <SpecialtyDropdown
              specialties={specialties}
              currentSpecialty={currentSpecialty}
              citySlug={citySlug}
              className="sm:rounded-l-none sm:rounded-r-full h-12 w-full"
            />
          </div>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {query && isFocused && (
        <div className="absolute z-50 left-0 right-0 -mt-2 bg-white border rounded-md shadow-lg max-h-[calc(100vh-220px)] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-gray-500 text-center flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Finder klinikker</span>
            </div>
          ) : searchResult ? (
            <>
              {searchResult.exact_match && (
                <Link
                  href={`/find/fysioterapeut/${searchResult.exact_match.bynavn_slug}`}
                  className="block p-4 hover:bg-gray-50 border-b"
                >
                  <div className="font-medium flex items-center gap-2">
                    <span>{searchResult.exact_match.bynavn}</span>
                    <span className="text-gray-500">
                      {searchResult.exact_match.postal_codes.join(", ")}
                    </span>
                  </div>
                </Link>
              )}
              {searchResult.nearby_cities.map((city) => (
                <Link
                  key={city.id}
                  href={`/find/fysioterapeut/${city.bynavn_slug}`}
                  className="block p-4 hover:bg-gray-50 border-b last:border-b-0"
                >
                  <div className="font-medium flex items-center gap-2">
                    <span>{city.bynavn}</span>
                    <span className="text-gray-500">
                      {city.postal_codes.join(", ")}
                      {city.distance >= 0 && (
                        <> • {city.distance.toFixed(1)} km væk</>
                      )}
                    </span>
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
