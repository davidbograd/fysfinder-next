"use client";

import React from "react";
import { SearchProvider, useSearch, FilterPanel } from "@/components/search-v2";

function TestFiltersContent() {
  const {
    state,
    setYdernummer,
    setHandicapAccess,
    clearAllFilters,
    updateURL,
  } = useSearch();

  const handleYdernummerChange = (value: boolean) => {
    setYdernummer(value);
    updateURL(); // Update URL with new filter
  };

  const handleHandicapAccessChange = (value: boolean) => {
    setHandicapAccess(value);
    updateURL(); // Update URL with new filter
  };

  const handleClearAllFilters = () => {
    clearAllFilters();
    updateURL(); // Update URL with cleared filters
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Filter Panel Test</h1>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
            Development Test Page
          </h2>
          <p className="text-yellow-700">
            This page is for testing the FilterPanel component. Test the toggle
            switches and observe URL parameter changes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filter Panel */}
          <div className="lg:col-span-1">
            <FilterPanel
              ydernummer={state.filters.ydernummer || false}
              handicapAccess={state.filters.handicap || false}
              onYdernummerChange={handleYdernummerChange}
              onHandicapAccessChange={handleHandicapAccessChange}
              onClearAllFilters={handleClearAllFilters}
            />
          </div>

          {/* State Display */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Current State</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700">Filters:</h4>
                  <pre className="mt-2 bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(state.filters, null, 2)}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">
                    Has Unsearched Changes:
                  </h4>
                  <span
                    className={`inline-block px-2 py-1 rounded text-sm ${
                      state.hasUnsearchedChanges
                        ? "bg-orange-100 text-orange-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {state.hasUnsearchedChanges ? "Yes" : "No"}
                  </span>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">URL Parameters:</h4>
                  <p className="mt-2 text-sm text-gray-600">
                    Check the browser URL to see parameter updates
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Test Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>
              Toggle the "Ydernummer" switch and observe URL parameter changes
            </li>
            <li>
              Toggle the "Handicap Access" switch and observe URL parameter
              changes
            </li>
            <li>Try both switches together</li>
            <li>Use "Clear all" to reset filters</li>
            <li>
              Verify that filter chips appear and can be removed individually
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default function TestFiltersPage() {
  return (
    <SearchProvider>
      <TestFiltersContent />
    </SearchProvider>
  );
}
