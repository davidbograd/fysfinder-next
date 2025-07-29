"use client";

import { useRouter } from "next/navigation";
import { useSearch } from "./SearchProvider";

interface TestSearchButtonProps {
  text?: string;
  className?: string;
}

export const TestSearchButton: React.FC<TestSearchButtonProps> = ({
  text = "Find Physiotherapists",
  className = "",
}) => {
  const { state } = useSearch();
  const router = useRouter();

  const handleClick = async () => {
    if (!state.location || state.isLoading) {
      alert("Please select a location first!");
      return;
    }

    // For testing: Show what we're about to search for
    const searchDetails = `
Location: ${state.location.name} (${state.location.slug})
Specialty: ${state.specialty?.name || "All specialties"}
Filters: ${JSON.stringify(state.filters)}
    `.trim();

    console.log("Search button clicked:", searchDetails);
    alert(
      `Search Details:\n${searchDetails}\n\nWould navigate to existing page...`
    );

    // Navigate to the existing URL structure
    const specialtyPart = state.specialty?.slug
      ? `/${state.specialty.slug}`
      : "";
    const targetUrl = `/find/fysioterapeut/${state.location.slug}${specialtyPart}`;

    console.log("Navigating to:", targetUrl);
    router.push(targetUrl);
  };

  const isDisabled = !state.location || state.isLoading;

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
