"use client";

import { useRouter, usePathname } from "next/navigation";
import { useSearch } from "../SearchProvider";
import { buildSearchV2Url } from "@/utils/parameter-normalization";

interface SearchButtonProps {
  text?: string;
  className?: string;
  disabled?: boolean;
}

export const SearchButton: React.FC<SearchButtonProps> = ({
  text = "Find Physiotherapists",
  className = "",
  disabled = false,
}) => {
  const { state, executeSearch } = useSearch();
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = async () => {
    if (state.isLoading) return;

    // Check if we're on the homepage (/search-v2)
    const isHomepage = pathname === "/search-v2";

    if (isHomepage) {
      // On homepage: Navigate to results page
      const locationSlug =
        state.location?.slug || (state.specialty ? "danmark" : "");
      if (!locationSlug) return;

      const targetUrl = buildSearchV2Url(
        locationSlug,
        state.specialty?.slug,
        state.filters
      );
      router.push(targetUrl);
    } else {
      // On results page: Execute search only if we have a concrete location
      if (state.location) {
        await executeSearch();
      } else if (state.specialty) {
        // Navigate to country-wide specialty in V2 dev space
        const targetUrl = buildSearchV2Url(
          "danmark",
          state.specialty.slug,
          state.filters
        );
        router.push(targetUrl);
      }
    }
  };

  const isDisabled =
    disabled || (!state.location && !state.specialty) || state.isLoading;

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
      aria-label={state.isLoading ? "Searching..." : text}
    >
      {state.isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Searching...</span>
        </div>
      ) : (
        text
      )}
    </button>
  );
};
