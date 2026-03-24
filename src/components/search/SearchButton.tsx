"use client";
// Updated: 2026-03-24 - Switched to centralized canonical search URL builder

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "./SearchProvider";
import { Search } from "lucide-react";
import { buildSearchTargetUrlFromState } from "./buildSearchTargetUrl";

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
      const targetUrl = buildSearchTargetUrlFromState(state);

      console.log("Executing search:", {
        location: state.location,
        specialty: state.specialty,
        filters: state.filters,
        targetUrl: targetUrl,
      });

      router.push(targetUrl);
    } catch (error) {
      console.error("Search error:", error);
      alert("Search failed. Please try again.");
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
        px-6 py-3 rounded-lg font-medium transition-all duration-200
        ${
          isDisabled
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-[#0b5b43] text-white hover:bg-[#084c39] active:bg-[#074534] shadow-sm hover:shadow-md"
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
        <span className="inline-flex items-center gap-2">
          <Search className="h-5 w-5" />
          <span>{text}</span>
        </span>
      )}
    </button>
  );
};
