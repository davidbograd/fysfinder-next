// Updated: 2026-03-17 - Polished homepage search bar sizing/typography and desktop CTA style to match redesign reference
"use client";

import React, { useState, Suspense } from "react";
import {
  SearchProvider,
  LocationQuery,
  SpecialtyQuery,
  useSearch,
} from "./SearchProvider";
import { LocationSearch } from "./SearchInput/LocationSearch";
import { SpecialtySearch } from "./SearchInput/SpecialtySearch";
import { SearchButton } from "./SearchButton";
import { Checkbox } from "@/components/ui/checkbox";
import { BookHeart, Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchInterfaceProps {
  specialties: {
    specialty_name: string;
    specialty_name_slug: string;
    specialty_id: string;
  }[];
  currentSpecialty?: string;
  citySlug: string;
  defaultSearchValue?: string;
  showFilters?: boolean;
  initialFilters?: { ydernummer?: boolean; handicap?: boolean };
}

/**
 * Inline search button for desktop
 */
function InlineSearchButton() {
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const { state } = useSearch();

  const handleClick = async () => {
    setIsSearching(true);

    try {
      // Build URL with filter parameters from SearchProvider state
      const params = new URLSearchParams();
      if (state.filters.ydernummer) params.set("ydernummer", "true");
      if (state.filters.handicap) params.set("handicap", "true");

      const queryString = params.toString();

      // Determine target URL based on search state
      let targetUrl;

      if (state.location) {
        // Build URL with location and optional specialty
        const specialtyPart = state.specialty?.slug
          ? `/${state.specialty.slug}`
          : "";
        targetUrl = `/find/fysioterapeut/${state.location.slug}${specialtyPart}`;

        // Add filter parameters
        if (queryString) {
          targetUrl += `?${queryString}`;
        }
      } else if (state.specialty?.slug) {
        // Allow specialty-only search across Denmark
        targetUrl = `/find/fysioterapeut/danmark/${state.specialty.slug}`;

        // Add filter parameters
        if (queryString) {
          targetUrl += `?${queryString}`;
        }
      } else {
        // Neither location nor specialty selected
        setIsSearching(false);
        return;
      }

      // Navigate to the target URL
      router.push(targetUrl);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Button is disabled if neither location nor specialty is selected
  const isDisabled = (!state.location && !state.specialty) || isSearching;

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        py-3 px-8 rounded-full transition-colors duration-200 inline-flex items-center justify-center gap-2 text-[18px] font-normal
        ${
          isDisabled
            ? "bg-[#c5cbc9] text-[#6d7875] cursor-not-allowed"
            : "bg-[#0b5b43] hover:bg-[#084c39] text-white"
        }
      `}
      aria-label={isSearching ? "Søger..." : "Find"}
    >
      {isSearching ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
      ) : (
        <>
          <Search className="w-6 h-6" />
          <span className="leading-none">Find</span>
        </>
      )}
    </button>
  );
}

/**
 * Simple filter toggles using SearchProvider
 */
function SimpleFilters() {
  const { state, setYdernummer, setHandicapAccess } = useSearch();

  const { ydernummer, handicap: handicapAccess } = state.filters;

  return (
    <>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="ydernummer"
          checked={ydernummer || false}
          onCheckedChange={(checked) => setYdernummer(checked === true)}
        />
        <label
          htmlFor="ydernummer"
          className="text-sm text-gray-700 cursor-pointer"
        >
          Ydernummer
        </label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="handicap"
          checked={handicapAccess || false}
          onCheckedChange={(checked) => setHandicapAccess(checked === true)}
        />
        <label
          htmlFor="handicap"
          className="text-sm text-gray-700 cursor-pointer"
        >
          Handicapadgang
        </label>
      </div>
    </>
  );
}

/**
 * Inner component that uses SearchProvider context
 */
function MigrationContent({ showFilters }: { showFilters: boolean }) {
  const isHomeVariant = !showFilters;

  return (
    <div className="space-y-4">
      {/* Unified Search Bar */}
      <div className="mb-4">
        <div
          className={`flex flex-col md:flex-row bg-white border border-[#d8ddd9] rounded-xl md:rounded-full shadow-[0_1px_1px_rgba(15,23,42,0.05)] transition-shadow duration-200 ${
            isHomeVariant ? "max-w-[920px]" : ""
          }`}
        >
          {/* Location Search */}
          <div className="flex-1 relative flex items-center">
            <div className="flex items-center pl-4">
              <svg
                className="w-6 h-6 text-[#8a9491] mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <LocationSearch
              className={`flex-1 border-0 bg-transparent focus:ring-0 focus:border-0 h-14 ${
                isHomeVariant
                    ? "text-[18px] placeholder:text-[18px]"
                  : ""
              }`}
            />
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px bg-[#e6e9e7] my-3"></div>
          <div className="md:hidden h-px bg-[#e6e9e7] mx-4"></div>

          {/* Specialty Search */}
          <div
            className={`w-full relative flex items-center ${
              isHomeVariant ? "md:w-[340px]" : "md:w-[280px]"
            }`}
          >
            <div className="flex items-center pl-4">
              <BookHeart className="w-6 h-6 text-[#8a9491] mr-3" />
            </div>
            <SpecialtySearch
              className={`flex-1 border-0 bg-transparent focus:ring-0 focus:border-0 h-14 ${
                isHomeVariant
                    ? "text-[18px] placeholder:text-[18px]"
                  : ""
              }`}
            />
          </div>

          {/* Inline Search Button (Desktop Only) */}
          <div className="hidden md:flex items-center p-1.5">
            <InlineSearchButton />
          </div>
        </div>
      </div>

      {/* Filters and Search Button Row */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Filter Checkboxes */}
          <div className="flex flex-wrap gap-6">
            <SimpleFilters />
          </div>

          {/* Search Button (Mobile Only - Desktop uses inline button) */}
          <div className="flex md:hidden">
            <SearchButton
              text="Find"
              className="bg-[#0b5b43] hover:bg-[#084c39] text-white px-8 py-3 rounded-full font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
            />
          </div>
        </div>
      )}

      {/* Mobile Search Button for Homepage (when no filters) */}
      {!showFilters && (
        <div className="flex md:hidden justify-center mt-4">
          <SearchButton
            text="Find"
              className="bg-[#0b5b43] hover:bg-[#084c39] text-white px-8 py-3 rounded-full font-medium shadow-sm w-full transition-colors"
          />
        </div>
      )}
    </div>
  );
}

/**
 * Main search interface component that provides location, specialty, and filter functionality
 * Integrates with existing page structure and supports both homepage and location pages
 */
export function SearchInterface({
  specialties,
  currentSpecialty,
  citySlug,
  defaultSearchValue,
  showFilters = false,
  initialFilters = {},
}: SearchInterfaceProps) {
  // Transform props to SearchProvider format
  const initialLocation: LocationQuery | null = defaultSearchValue
    ? {
        name: defaultSearchValue,
        slug: citySlug,
      }
    : null;

  const initialSpecialty: SpecialtyQuery | null = currentSpecialty
    ? specialties.find((s) => s.specialty_name_slug === currentSpecialty)
      ? {
          name: specialties.find(
            (s) => s.specialty_name_slug === currentSpecialty
          )!.specialty_name,
          slug: currentSpecialty,
          id: specialties.find(
            (s) => s.specialty_name_slug === currentSpecialty
          )!.specialty_id,
        }
      : null
    : null;

  return (
    <Suspense>
      <SearchProvider
        initialLocation={initialLocation}
        initialSpecialty={initialSpecialty}
        initialFilters={initialFilters}
      >
        <MigrationContent showFilters={showFilters} />
      </SearchProvider>
    </Suspense>
  );
}
