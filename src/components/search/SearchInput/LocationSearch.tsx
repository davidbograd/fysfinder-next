"use client";

import { useState, useEffect, useRef } from "react";
import { useSearch } from "../SearchProvider";
import { searchCities } from "@/app/actions/search-cities";
import { City, SearchResult } from "@/app/types";

interface LocationSearchProps {
  placeholder?: string;
  className?: string;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  placeholder = "By eller postnummer",
  className = "",
}) => {
  const { state, dispatch } = useSearch();
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Utility: place caret at end of input
  const moveCaretToEnd = () => {
    const el = inputRef.current;
    if (!el) return;
    const len = el.value.length;
    try {
      el.setSelectionRange(len, len);
    } catch {}
  };

  // Initialize input value from state
  useEffect(() => {
    if (state.location) {
      setInputValue(state.location.name);
    }
  }, [state.location]);

  // Debounced search function
  const debouncedSearch = async (query: string) => {
    if (query.length < 2) {
      setSuggestions(null);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);

    try {
      const results = await searchCities(query);
      setSuggestions(results);
      setShowDropdown(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Location search failed:", error);
      setSuggestions(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // If a location is currently selected and the user edits the input to a different value,
    // clear the selected location to allow specialty-only searches (e.g., Danmark pages)
    if (state.location && value !== state.location.name) {
      dispatch({ type: "SET_LOCATION", payload: null });
      dispatch({ type: "SET_UNSEARCHED_CHANGES", payload: true });
    }

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout for debounced search
    debounceRef.current = setTimeout(() => {
      debouncedSearch(value);
    }, 300);
  };

  // Handle location selection
  const handleLocationSelect = (city: City) => {
    const locationQuery = {
      name: city.bynavn,
      slug: city.bynavn_slug,
      postalCodes: city.postal_codes,
    };

    dispatch({
      type: "SET_LOCATION",
      payload: locationQuery,
    });

    setInputValue(city.bynavn);
    setShowDropdown(false);
    setSuggestions(null);
    setSelectedIndex(-1);

    // Mark that user has made changes
    dispatch({ type: "SET_UNSEARCHED_CHANGES", payload: true });
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || !suggestions) return;

    const allSuggestions = [
      ...(suggestions.exact_match ? [suggestions.exact_match] : []),
      ...suggestions.nearby_cities,
    ];

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < allSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && allSuggestions[selectedIndex]) {
          handleLocationSelect(allSuggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle input blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Delay hiding dropdown to allow for clicks
    setTimeout(() => {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }, 200);
  };

  // Handle input focus
  const handleFocus = () => {
    // Ensure caret starts at end on focus
    requestAnimationFrame(() => moveCaretToEnd());
    setTimeout(() => moveCaretToEnd(), 0);

    if (suggestions && inputValue.length >= 2) {
      setShowDropdown(true);
    }
  };

  // Format suggestion display text
  const formatSuggestionText = (city: City, isExactMatch: boolean) => {
    const postalCodesText =
      city.postal_codes.length > 0
        ? `${city.postal_codes.slice(0, 3).join(", ")}${
            city.postal_codes.length > 3 ? "..." : ""
          }`
        : "";

    return (
      <div className="flex flex-col">
        <span className="font-medium">{city.bynavn}</span>
        {postalCodesText && (
          <span className="text-xs text-gray-500">{postalCodesText}</span>
        )}
      </div>
    );
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`w-full py-4 pr-10 bg-transparent outline-none text-gray-900 placeholder-gray-500 ${className}`}
          aria-label="Search for location"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls="location-dropdown"
          aria-describedby="location-search-help"
          role="combobox"
        />

        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}

        {!isLoading &&
          (state.location || (inputValue && inputValue.length > 0)) && (
            <button
              type="button"
              onClick={() => {
                // Clear selected location and input
                if (state.location) {
                  dispatch({ type: "SET_LOCATION", payload: null });
                }
                setInputValue("");
                setSuggestions(null);
                setShowDropdown(false);
                setSelectedIndex(-1);
                dispatch({ type: "SET_UNSEARCHED_CHANGES", payload: true });
                // Refocus input for quick re-entry
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear location selection"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
      </div>

      {showDropdown && suggestions && (
        <div
          ref={dropdownRef}
          id="location-dropdown"
          className="absolute z-[9999] mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
          style={{
            position: "absolute",
            top: "100%",
            left: "-1rem", // Align with the icon (pl-4)
            right: 0,
            width: "calc(100% + 1rem)", // Extend to match the full input area
            zIndex: 9999,
          }}
          role="listbox"
        >
          {suggestions.exact_match && (
            <button
              type="button"
              onClick={() => handleLocationSelect(suggestions.exact_match!)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:bg-gray-50 focus:outline-none ${
                selectedIndex === 0 ? "bg-blue-50" : ""
              }`}
              role="option"
              aria-selected={selectedIndex === 0}
            >
              {formatSuggestionText(suggestions.exact_match, true)}
            </button>
          )}

          {suggestions.nearby_cities.map((city, index) => {
            const adjustedIndex = suggestions.exact_match ? index + 1 : index;

            return (
              <button
                key={city.id}
                type="button"
                onClick={() => handleLocationSelect(city)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${
                  selectedIndex === adjustedIndex ? "bg-blue-50" : ""
                }`}
                role="option"
                aria-selected={selectedIndex === adjustedIndex}
              >
                {formatSuggestionText(city, false)}
                {city.distance > 0 && (
                  <span className="text-xs text-gray-400 ml-2">
                    {city.distance.toFixed(1)} km away
                  </span>
                )}
              </button>
            );
          })}

          {suggestions.exact_match === null &&
            suggestions.nearby_cities.length === 0 && (
              <div className="px-4 py-3 text-gray-500 text-sm">
                {suggestions.prompt_message || "Ingen resultater fundet"}
              </div>
            )}
        </div>
      )}

      <div id="location-search-help" className="sr-only">
        Start typing to search for cities by name or postal code
      </div>
    </div>
  );
};
