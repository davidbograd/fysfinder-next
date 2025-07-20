import React from "react";
import { SearchProvider } from "./SearchProvider";
import { LocationSearch } from "./SearchInput/LocationSearch";
import { SpecialtySearch } from "./SearchInput/SpecialtySearch";
import { FilterPanel } from "./FilterPanel/FilterPanel";
import { useSearch } from "./SearchProvider";

interface MigrationWrapperProps {
  specialties: {
    specialty_name: string;
    specialty_name_slug: string;
    specialty_id: string;
  }[];
  currentSpecialty?: string;
  citySlug: string;
  defaultSearchValue?: string;
  showFilters?: boolean;
}

/**
 * Internal component that uses the search context
 */
function MigrationContent({
  showFilters,
  specialties,
}: {
  showFilters: boolean;
  specialties: MigrationWrapperProps["specialties"];
}) {
  const { state, setYdernummer, setHandicapAccess, clearAllFilters } =
    useSearch();

  return (
    <div className="space-y-4">
      {/* Search Input Row */}
      <div className="flex flex-col sm:flex-row sm:gap-0 mb-4">
        <div className="flex-1 flex flex-col sm:flex-row border bg-white rounded-xl sm:border-0 overflow-hidden">
          {/* Location Search */}
          <div className="flex-1 relative flex">
            <LocationSearch className="flex-1" />
          </div>

          {/* Divider for mobile */}
          <div className="h-px bg-gray-200 sm:hidden" />

          {/* Specialty Search */}
          <div className="w-full sm:w-[260px]">
            <SpecialtySearch className="sm:rounded-l-none sm:rounded-r-full h-12 w-full" />
          </div>
        </div>
      </div>

      {/* Advanced Filters (only show on results pages) */}
      {showFilters && (
        <FilterPanel
          ydernummer={state.filters.ydernummer || false}
          handicapAccess={state.filters.handicap || false}
          onYdernummerChange={setYdernummer}
          onHandicapAccessChange={setHandicapAccess}
          onClearAllFilters={clearAllFilters}
        />
      )}
    </div>
  );
}

/**
 * Migration wrapper that provides new search functionality
 * while integrating with existing page structure
 */
export function MigrationWrapper({
  specialties,
  currentSpecialty,
  citySlug,
  defaultSearchValue,
  showFilters = false,
}: MigrationWrapperProps) {
  return (
    <SearchProvider>
      <MigrationContent showFilters={showFilters} specialties={specialties} />
    </SearchProvider>
  );
}
