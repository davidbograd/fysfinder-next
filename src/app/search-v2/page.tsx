import React from "react";
import { Metadata } from "next";
import {
  SearchContainer,
  LocationSearch,
  SpecialtySearch,
  SearchButton,
} from "@/components/search-v2";

export const metadata: Metadata = {
  title: "Enhanced Search V2 | FysFinder",
  description: "Testing new search functionality - isolated development",
  robots: "noindex, nofollow", // Prevent indexing during development
};

export default function SearchV2Homepage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Development Banner */}
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-8">
            <p className="font-semibold">🚧 Development Mode - Search V2</p>
            <p className="text-sm">
              This is the isolated search development environment. Not visible
              to users.
            </p>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Find den perfekte fysioterapeut
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Søg blandt Danmarks største database af fysioterapeuter. Se
              anmeldelser, specialer og book tid online.
            </p>
          </div>

          {/* Search Interface - Enhanced with validation */}
          <SearchContainer>
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Søg efter fysioterapeuter
                </h2>
                <p className="text-gray-600">
                  Indtast din by eller postnummer for at komme i gang
                </p>
              </div>

              {/* Search Components with proper validation */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Location Search */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lokation <span className="text-red-500">*</span>
                    </label>
                    <LocationSearch placeholder="Enter city or postal code" />
                    <p className="text-xs text-gray-500 mt-1">
                      Required. Try "København", "Aarhus", or "2100"
                    </p>
                  </div>

                  {/* Specialty Search */}
                  <div className="sm:w-64">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Speciale (valgfrit)
                    </label>
                    <SpecialtySearch placeholder="Select specialty (optional)" />
                    <p className="text-xs text-gray-500 mt-1">
                      Optional. Leave blank for all specialties
                    </p>
                  </div>
                </div>

                {/* Search Button with enhanced styling */}
                <div className="flex justify-center pt-4">
                  <SearchButton
                    text="🔍 Find Physiotherapists"
                    className="px-8 py-3 text-lg font-semibold"
                  />
                </div>

                {/* Validation Help Text */}
                <div className="text-center text-sm text-gray-500 mt-4">
                  <p>
                    <span className="text-red-500">*</span> Location is required
                    to search
                  </p>
                </div>
              </div>
            </div>
          </SearchContainer>

          {/* Feature Highlights */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              New Search Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Smart Autocomplete
                </h4>
                <p className="text-sm text-gray-600">
                  Fast city and postal code search with 300ms debouncing
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Form Validation
                </h4>
                <p className="text-sm text-gray-600">
                  Clear validation with required location and optional specialty
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">
                  URL Normalization
                </h4>
                <p className="text-sm text-gray-600">
                  SEO-friendly URLs with proper parameter canonicalization
                </p>
              </div>
            </div>
          </div>

          {/* Component Architecture Preview */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Component Architecture Preview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Search Components
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• SearchContainer (wrapper)</li>
                  <li>• LocationSearch (autocomplete with debouncing)</li>
                  <li>• SpecialtySearch (dropdown with search)</li>
                  <li>• SearchButton (execution with validation)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  State Management
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• SearchProvider (React Context)</li>
                  <li>• Location state with validation</li>
                  <li>• Specialty state (optional)</li>
                  <li>• Loading states</li>
                  <li>• Unsearched changes tracking</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Development Navigation */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 mb-4">Development Navigation:</p>
            <div className="flex justify-center gap-4">
              <a
                href="/search-v2/find/kobenhavn"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Test Location Page
              </a>
              <a
                href="/search-v2/find/kobenhavn/sportsskader"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Test Specialty Page
              </a>
              <a
                href="/search-v2/test-filters"
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 transition-colors"
              >
                🧪 Test Filter Panel
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
