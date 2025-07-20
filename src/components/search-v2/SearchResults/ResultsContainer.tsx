"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchProvider, useSearch, FilterPanel } from "@/components/search-v2";
import { parseFiltersFromURL } from "@/utils/parameter-normalization";

interface ResultsContainerProps {
  location: string;
  specialty?: string;
  children?: React.ReactNode;
}

function ResultsContent({
  location,
  specialty,
  children,
}: ResultsContainerProps) {
  const {
    state,
    setLocation,
    setSpecialty,
    setFilters,
    setYdernummer,
    setHandicapAccess,
    clearAllFilters,
    executeSearch,
    updateURL,
  } = useSearch();

  const searchParams = useSearchParams();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize search state from URL parameters - ONLY run once on mount
  useEffect(() => {
    if (isInitialized) return;

    // Set location
    setLocation({
      name: location.charAt(0).toUpperCase() + location.slice(1),
      slug: location,
      postalCodes: [], // Will be populated from actual city data
    });

    // Set specialty if provided
    if (specialty) {
      setSpecialty({
        name: specialty
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        slug: specialty,
        id: specialty, // Using slug as ID for now
      });
    }

    // Parse and set filters from URL
    const filters = searchParams ? parseFiltersFromURL(searchParams) : {};
    setFilters(filters);

    setIsInitialized(true);
  }, [
    location,
    specialty,
    setLocation,
    setSpecialty,
    setFilters,
    isInitialized,
  ]);

  // Execute search when initialized (only once)
  useEffect(() => {
    if (isInitialized) {
      executeSearch();
    }
  }, [isInitialized, executeSearch]);

  // Auto-update URL and re-execute search when filters change (after initialization)
  useEffect(() => {
    if (isInitialized && state.location && !state.isLoading) {
      updateURL();
      executeSearch();
    }
  }, [state.filters, isInitialized, state.location, updateURL, executeSearch]); // Removed state.isLoading from dependencies to prevent infinite loop

  // Handle filter changes with instant application
  const handleYdernummerChange = (value: boolean) => {
    setYdernummer(value);
  };

  const handleHandicapAccessChange = (value: boolean) => {
    setHandicapAccess(value);
  };

  const handleClearAllFilters = () => {
    clearAllFilters();
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading search results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Development Banner */}
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
            <p className="font-semibold">
              🚧 Development Mode - Search V2 Results with FilterPanel
            </p>
            <p className="text-sm">
              Testing integrated search results with instant filter application
            </p>
          </div>

          {/* Search Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {specialty ? (
                    <>
                      {state.specialty?.name} fysioterapeuter i{" "}
                      {state.location?.name}
                    </>
                  ) : (
                    <>Fysioterapeuter i {state.location?.name}</>
                  )}
                </h1>
                <p className="text-gray-600 mt-1">
                  {state.results.totalCount} klinikker fundet
                  {state.filters.ydernummer && " • Kun ydernummer"}
                  {state.filters.handicap && " • Handicaptilgængeligt"}
                </p>
              </div>

              {/* Back to Search */}
              <a
                href="/search-v2"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Ny søgning
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filter Panel */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <FilterPanel
                ydernummer={state.filters.ydernummer || false}
                handicapAccess={state.filters.handicap || false}
                onYdernummerChange={handleYdernummerChange}
                onHandicapAccessChange={handleHandicapAccessChange}
                onClearAllFilters={handleClearAllFilters}
              />
            </div>

            {/* Results Content */}
            <div className="lg:col-span-3 order-1 lg:order-2">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ResultsContainer: React.FC<ResultsContainerProps> = ({
  location,
  specialty,
  children,
}) => {
  return (
    <SearchProvider>
      <ResultsContent location={location} specialty={specialty}>
        {children}
      </ResultsContent>
    </SearchProvider>
  );
};
