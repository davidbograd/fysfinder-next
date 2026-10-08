// Updated: 2026-10-08 - Online fysioterapi is a ?online=true filter chip like the others.
"use client";

import React, { useState, Suspense } from "react";
import {
  SearchProvider,
  LocationQuery,
  SearchFilters,
  SpecialtyQuery,
  useSearch,
} from "./SearchProvider";
import { LocationSearch } from "./SearchInput/LocationSearch";
import { SpecialtySearch } from "./SearchInput/SpecialtySearch";
import { SearchButton } from "./SearchButton";
import { BookHeart, Check, Search } from "lucide-react";

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
  initialFilters?: SearchFilters;
}

/**
 * Inline search button for desktop
 */
function InlineSearchButton() {
  const [isSearching, setIsSearching] = useState(false);
  const { navigateToSearch } = useSearch();

  const handleClick = async () => {
    setIsSearching(true);

    try {
      await navigateToSearch();
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const isDisabled = isSearching;

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        py-3 px-8 rounded-full transition-colors duration-200 inline-flex items-center justify-center gap-2 text-[18px] font-normal
        ${
          isDisabled
            ? "bg-[#c5cbc9] text-[#6d7875] cursor-not-allowed"
            : "bg-[#0b5b43] hover:bg-[#084c39] text-white cursor-pointer"
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

function FilterChip({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onToggle(!checked)}
      className={`inline-flex items-center gap-2 rounded-full border py-1.5 pl-2 pr-3.5 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:ring-offset-1 ${
        checked
          ? "border-[#b9d3c7] bg-[#e8f1ec] text-brand-primary"
          : "border-[#d8ddd9] bg-white text-gray-700 hover:border-[#b9c3bf] hover:bg-[#f8f7f2]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors duration-150 ${
          checked
            ? "border-[#0b5b43] bg-[#0b5b43] text-white"
            : "border-[#8a9491] bg-white text-transparent"
        }`}
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
      <span className="leading-none">{label}</span>
    </button>
  );
}

/**
 * Filter chips using SearchProvider
 */
function SimpleFilters() {
  const { state, setFilters, navigateToSearch } = useSearch();

  const { ydernummer, handicap: handicapAccess, online } = state.filters;

  const applyFilter = (key: keyof SearchFilters, enabled: boolean) => {
    const nextFilters = { ...state.filters };
    if (enabled) {
      nextFilters[key] = true;
    } else {
      delete nextFilters[key];
    }

    setFilters(nextFilters);
    void navigateToSearch({ filters: nextFilters });
  };

  return (
    <>
      <FilterChip
        label="Med ydernummer"
        checked={ydernummer || false}
        onToggle={(checked) => applyFilter("ydernummer", checked)}
      />
      <FilterChip
        label="Handicapadgang"
        checked={handicapAccess || false}
        onToggle={(checked) => applyFilter("handicap", checked)}
      />
      <FilterChip
        label="Online fysioterapi"
        checked={online || false}
        onToggle={(checked) => applyFilter("online", checked)}
      />
    </>
  );
}

/**
 * Inner component that uses SearchProvider context
 */
function MigrationContent({
  showFilters,
  specialties,
}: {
  showFilters: boolean;
  specialties: SearchInterfaceProps["specialties"];
}) {
  const isHomeVariant = !showFilters;

  return (
    <div className={isHomeVariant ? "space-y-4" : "mb-4"}>
      {/* Unified Search Bar */}
      <div className={isHomeVariant ? "mb-4" : ""}>
        <div
          className={`flex flex-col md:flex-row bg-white border border-[#d8ddd9] rounded-xl md:rounded-full shadow-[0_1px_1px_rgba(15,23,42,0.05)] transition-shadow duration-200 ${
            isHomeVariant ? "max-w-[820px]" : ""
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
            id="top-search-specialty"
            className={`w-full relative flex items-center ${
              isHomeVariant ? "md:w-[290px]" : "md:w-[280px]"
            } scroll-mt-[260px] md:scroll-mt-[220px] rounded-xl md:rounded-full`}
          >
            <div className="flex items-center pl-4">
              <BookHeart className="w-6 h-6 text-[#8a9491] mr-3" />
            </div>
            <SpecialtySearch
              specialties={specialties}
              className={`flex-1 border-0 bg-transparent focus:ring-0 focus:border-0 h-14 ${
                isHomeVariant
                    ? "text-[18px] placeholder:text-[18px]"
                  : ""
              }`}
            />
          </div>

          {/* Inline Search Button (Desktop Only) */}
          <div className="hidden md:flex shrink-0 items-center p-1.5 relative z-10">
            <InlineSearchButton />
          </div>
        </div>
      </div>

      {/* Filters and Search Button Row */}
      {showFilters && (
        <>
          {/* Inset by the bar's corner radius so the tab meets its flat bottom edge */}
          <div
            role="group"
            aria-label="Filtre"
            className="mx-3 flex flex-wrap gap-2 rounded-b-2xl border border-t-0 border-[#d8ddd9] bg-[#f2f1ec] px-2.5 pb-2.5 pt-2.5 md:mx-8"
          >
            <SimpleFilters />
          </div>

          {/* Search Button (Mobile Only - Desktop uses inline button) */}
          <div className="mt-4 flex md:hidden">
            <SearchButton
              text="Find"
              className="w-full bg-[#0b5b43] hover:bg-[#084c39] text-white px-8 py-3 rounded-full font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
            />
          </div>
        </>
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
        specialties={specialties}
      >
        <MigrationContent showFilters={showFilters} specialties={specialties} />
      </SearchProvider>
    </Suspense>
  );
}
