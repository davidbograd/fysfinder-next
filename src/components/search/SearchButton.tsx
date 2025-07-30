"use client";

import React, { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "./SearchProvider";

interface SearchButtonProps {
  text?: string;
  className?: string;
  onSearchExecuted?: (results: any) => void;
}

export const SearchButton: React.FC<SearchButtonProps> = ({
  text = "Find Physiotherapists",
  className = "",
  onSearchExecuted,
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  // Get search state from context (includes filters!)
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
      } else {
        // No location selected - just apply filters to current page
        const currentUrl = window.location.pathname;
        targetUrl = queryString ? `${currentUrl}?${queryString}` : currentUrl;
      }

      console.log("Executing search:", {
        location: state.location,
        specialty: state.specialty,
        filters: state.filters,
        targetUrl: targetUrl,
      });

      // Navigate to the target URL
      router.push(targetUrl);
    } catch (error) {
      console.error("Search error:", error);
      alert("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Button is disabled if no location is selected
  const isDisabled = !state.location || isSearching;

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        px-6 py-3 rounded-lg font-medium transition-all duration-200
        ${
          isDisabled
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow-md"
        }
        ${className}
      `}
      aria-label={isSearching ? "Søger..." : text}
    >
      {isSearching ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Søger...</span>
        </div>
      ) : (
        text
      )}
    </button>
  );
};
