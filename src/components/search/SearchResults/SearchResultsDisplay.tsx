"use client";

import React from "react";
import { useSearch } from "@/components/search";
import {
  LocationSearch,
  SpecialtySearch,
} from "@/components/search/SearchInput";
import { ResultsList } from "./ResultsList";

export const SearchResultsDisplay: React.FC = () => {
  const { state, executeSearch } = useSearch();

  return (
    <div>
      {/* Search Inputs Section */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Refiner din søgning
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Location Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lokation
            </label>
            <LocationSearch />
          </div>

          {/* Specialty Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialitet
            </label>
            <SpecialtySearch />
          </div>
        </div>

        {/* Search Button */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={executeSearch}
            disabled={!state.location || state.isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {state.isLoading ? "Søger..." : "Søg"}
          </button>
        </div>
      </div>

      {/* Results Section */}
      <ResultsList
        results={state.results.clinics}
        isLoading={state.isLoading}
        totalCount={state.results.totalCount}
        currentFilters={state.filters}
      />

      {/* Development Info */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">Development Info:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <strong>Location:</strong> {state.location?.name || "Not set"}
          </p>
          <p>
            <strong>Specialty:</strong>{" "}
            {state.specialty?.name || "All specialties"}
          </p>
          <p>
            <strong>Filters:</strong>
          </p>
          <ul className="ml-4 list-disc">
            <li>
              Ydernummer: {state.filters.ydernummer ? "Active" : "Inactive"}
            </li>
            <li>
              Handicapadgang: {state.filters.handicap ? "Active" : "Inactive"}
            </li>
          </ul>
          <p>
            <strong>Loading:</strong> {state.isLoading ? "Yes" : "No"}
          </p>
          <p>
            <strong>Total Results:</strong> {state.results.totalCount}
          </p>
        </div>
      </div>
    </div>
  );
};
