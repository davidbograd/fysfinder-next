"use client";

import { useState, useEffect, useRef } from "react";
import { useSearch } from "../SearchProvider";
import { createClient } from "@supabase/supabase-js";

interface Specialty {
  specialty_id: string;
  specialty_name: string;
  specialty_name_slug: string;
}

interface SpecialtySearchProps {
  placeholder?: string;
  className?: string;
}

// Client-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Client-side specialty fetcher
async function fetchSpecialties(): Promise<Specialty[]> {
  const { data, error } = await supabase
    .from("specialties")
    .select("specialty_id, specialty_name, specialty_name_slug")
    .order("specialty_name", { ascending: true });

  if (error) {
    console.error("Failed to fetch specialties:", error);
    throw new Error(`Failed to fetch specialties: ${error.message}`);
  }

  return data || [];
}

export const SpecialtySearch: React.FC<SpecialtySearchProps> = ({
  placeholder = "Alle specialer",
  className = "",
}) => {
  const { state, dispatch } = useSearch();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [filteredSpecialties, setFilteredSpecialties] = useState<Specialty[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load specialties on component mount
  useEffect(() => {
    const loadSpecialties = async () => {
      setIsLoading(true);
      try {
        const specialtiesData = await fetchSpecialties();
        setSpecialties(specialtiesData);
        setFilteredSpecialties(specialtiesData);
      } catch (error) {
        console.error("Failed to load specialties:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSpecialties();
  }, []);

  // Initialize display value from state
  useEffect(() => {
    if (state.specialty) {
      setSearchTerm(state.specialty.name);
    } else {
      setSearchTerm("");
    }
  }, [state.specialty]);

  // Filter specialties based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredSpecialties(specialties);
      return;
    }

    const filtered = specialties.filter((specialty) =>
      specialty.specialty_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSpecialties(filtered);
  }, [searchTerm, specialties]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Clear current specialty if user is typing something new
    if (state.specialty && value !== state.specialty.name) {
      dispatch({ type: "SET_SPECIALTY", payload: null });
      dispatch({ type: "SET_UNSEARCHED_CHANGES", payload: true });
    }

    // Mark unsearched changes when user starts typing and no specialty is selected
    if (!state.specialty) {
      dispatch({ type: "SET_UNSEARCHED_CHANGES", payload: true });
    }

    setShowDropdown(true);
    setSelectedIndex(-1);
  };

  // Handle specialty selection
  const handleSpecialtySelect = (specialty: Specialty | null) => {
    if (specialty) {
      const specialtyQuery = {
        name: specialty.specialty_name,
        slug: specialty.specialty_name_slug,
        id: specialty.specialty_id,
      };

      dispatch({ type: "SET_SPECIALTY", payload: specialtyQuery });
      setSearchTerm(specialty.specialty_name);
    } else {
      // "All specialties" selected
      dispatch({ type: "SET_SPECIALTY", payload: null });
      setSearchTerm("");
    }

    setShowDropdown(false);
    setSelectedIndex(-1);
    dispatch({ type: "SET_UNSEARCHED_CHANGES", payload: true });
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;

    // Include "All specialties" option in navigation
    const allOptions = [null, ...filteredSpecialties]; // null represents "All specialties"

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < allOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < allOptions.length) {
          handleSpecialtySelect(allOptions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle input focus
  const handleFocus = () => {
    setShowDropdown(true);
    setSelectedIndex(-1);
  };

  // Handle input blur
  const handleBlur = () => {
    // Delay hiding dropdown to allow for clicks
    setTimeout(() => {
      setShowDropdown(false);
      setSelectedIndex(-1);

      // If no specialty is selected and search term doesn't match any specialty exactly,
      // clear the search term
      if (!state.specialty && searchTerm) {
        const exactMatch = specialties.find(
          (s) => s.specialty_name.toLowerCase() === searchTerm.toLowerCase()
        );
        if (!exactMatch) {
          setSearchTerm("");
        }
      }
    }, 200);
  };

  // Handle clear button click
  const handleClear = () => {
    handleSpecialtySelect(null);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full py-4 pr-10 bg-transparent outline-none text-gray-900 placeholder-gray-500 ${className}`}
          aria-label="Search for specialty"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-describedby="specialty-search-help"
          role="combobox"
        />

        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}

        {!isLoading &&
          (state.specialty || (searchTerm && searchTerm.length > 0)) && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear specialty selection"
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

        {!isLoading &&
          !state.specialty &&
          (!searchTerm || searchTerm.length === 0) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
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
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          )}
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
        >
          {/* "All specialties" option */}
          <button
            type="button"
            onClick={() => handleSpecialtySelect(null)}
            className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:bg-gray-50 focus:outline-none ${
              selectedIndex === 0 ? "bg-blue-50" : ""
            }`}
            role="option"
            aria-selected={selectedIndex === 0}
          >
            <div className="flex items-center">
              <span className="font-medium text-gray-900">Alle specialer</span>
              <span className="ml-2 text-xs text-gray-500">(ingen filter)</span>
            </div>
          </button>

          {/* Specialty options */}
          {filteredSpecialties.map((specialty, index) => {
            const adjustedIndex = index + 1; // +1 because "All specialties" is at index 0

            return (
              <button
                key={specialty.specialty_id}
                type="button"
                onClick={() => handleSpecialtySelect(specialty)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${
                  selectedIndex === adjustedIndex ? "bg-blue-50" : ""
                }`}
                role="option"
                aria-selected={selectedIndex === adjustedIndex}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">
                    {specialty.specialty_name}
                  </span>
                </div>
              </button>
            );
          })}

          {filteredSpecialties.length === 0 && searchTerm && (
            <div className="px-4 py-3 text-gray-500 text-sm">
              Ingen specialer fundet for "{searchTerm}"
            </div>
          )}
        </div>
      )}

      <div id="specialty-search-help" className="sr-only">
        Søg efter et speciale eller vælg "Alle specialer" for at søge uden
        filter
      </div>
    </div>
  );
};
