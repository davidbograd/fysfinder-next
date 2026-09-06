// Updated: 2026-09-06 - Use server-provided specialties when present; fold Danish letters and submit the first match on Enter.
"use client";

import { useState, useEffect, useRef } from "react";
import { useSearch } from "../SearchProvider";
import { createClient } from "@/app/utils/supabase/client";
import { rankSearchItems } from "@/lib/search-matching";

interface Specialty {
  specialty_id: string;
  specialty_name: string;
  specialty_name_slug: string;
}

interface SpecialtySearchProps {
  placeholder?: string;
  className?: string;
  specialties?: Specialty[];
}

let specialtiesCache: Specialty[] | null = null;
let specialtiesPromise: Promise<Specialty[]> | null = null;

// Client-side Supabase client
const supabase = createClient();

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

async function getCachedSpecialties(): Promise<Specialty[]> {
  if (specialtiesCache) return specialtiesCache;
  if (specialtiesPromise) return specialtiesPromise;

  specialtiesPromise = fetchSpecialties()
    .then((results) => {
      specialtiesCache = results;
      return results;
    })
    .finally(() => {
      specialtiesPromise = null;
    });

  return specialtiesPromise;
}

export const SpecialtySearch: React.FC<SpecialtySearchProps> = ({
  placeholder = "Alle specialer",
  className = "",
  specialties: initialSpecialties,
}) => {
  const { state, dispatch, navigateToSearch } = useSearch();
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
  // Tracks the latest selected specialty to avoid stale closures in timeouts
  const latestSpecialtyRef = useRef(state.specialty);
  const latestSearchTermRef = useRef(searchTerm);

  useEffect(() => {
    latestSpecialtyRef.current = state.specialty;
  }, [state.specialty]);

  useEffect(() => {
    latestSearchTermRef.current = searchTerm;
  }, [searchTerm]);

  // Load specialties from the server list when provided; otherwise fetch once per session.
  useEffect(() => {
    if (initialSpecialties && initialSpecialties.length > 0) {
      specialtiesCache = initialSpecialties;
      setSpecialties(initialSpecialties);
      setFilteredSpecialties(initialSpecialties);
      setIsLoading(false);
      return;
    }

    const loadSpecialties = async () => {
      setIsLoading(true);
      try {
        const specialtiesData = await getCachedSpecialties();
        setSpecialties(specialtiesData);
        setFilteredSpecialties(specialtiesData);
      } catch (error) {
        console.error("Failed to load specialties:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSpecialties();
  }, [initialSpecialties?.length]);

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

    setFilteredSpecialties(
      rankSearchItems(
        specialties,
        searchTerm,
        (specialty) =>
          `${specialty.specialty_name} ${specialty.specialty_name_slug}`
      )
    );
  }, [searchTerm, specialties]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    dispatch({ type: "SET_SPECIALTY_DRAFT", payload: value });

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
      dispatch({ type: "SET_SPECIALTY_DRAFT", payload: specialty.specialty_name });
    } else {
      // "All specialties" selected
      dispatch({ type: "SET_SPECIALTY", payload: null });
      dispatch({ type: "SET_SPECIALTY_DRAFT", payload: "" });
      setSearchTerm("");
    }

    setShowDropdown(false);
    setSelectedIndex(-1);
    dispatch({ type: "SET_UNSEARCHED_CHANGES", payload: true });
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (searchTerm && filteredSpecialties.length > 0 && selectedIndex <= 0) {
        handleSpecialtySelect(filteredSpecialties[0]);
        void navigateToSearch({
          specialty: {
            name: filteredSpecialties[0].specialty_name,
            slug: filteredSpecialties[0].specialty_name_slug,
            id: filteredSpecialties[0].specialty_id,
          },
        });
        return;
      }
      if (showDropdown && selectedIndex >= 0) {
        const allOptions = [null, ...filteredSpecialties];
        if (selectedIndex < allOptions.length) {
          const selected = allOptions[selectedIndex];
          handleSpecialtySelect(selected);
          void navigateToSearch({
            specialty: selected
              ? {
                  name: selected.specialty_name,
                  slug: selected.specialty_name_slug,
                  id: selected.specialty_id,
                }
              : null,
          });
          return;
        }
      }
      void navigateToSearch();
      return;
    }

    if (!showDropdown) return;

    const allOptions = [null, ...filteredSpecialties];

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
      case "Escape":
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle input focus
  const handleFocus = () => {
    const moveCaretToEnd = () => {
      const el = inputRef.current;
      if (!el) return;
      const len = el.value.length;
      try {
        el.setSelectionRange(len, len);
      } catch {}
    };

    setShowDropdown(true);
    setSelectedIndex(-1);
    requestAnimationFrame(() => moveCaretToEnd());
    setTimeout(() => moveCaretToEnd(), 0);
  };

  // Handle input blur
  const handleBlur = () => {
    // Delay hiding dropdown to allow for clicks
    setTimeout(() => {
      setShowDropdown(false);
      setSelectedIndex(-1);

      // If a specialty is selected, restore its name in the input
      if (latestSpecialtyRef.current) {
        setSearchTerm(latestSpecialtyRef.current.name);
        return;
      }

      // If no specialty is selected and search term doesn't match any specialty exactly,
      // clear the search term
      if (!latestSpecialtyRef.current && latestSearchTermRef.current) {
        const rankedMatch = rankSearchItems(
          specialties,
          latestSearchTermRef.current,
          (specialty) =>
            `${specialty.specialty_name} ${specialty.specialty_name_slug}`
        )[0];
        if (rankedMatch) {
          handleSpecialtySelect(rankedMatch);
        } else {
          setSearchTerm("");
          dispatch({ type: "SET_SPECIALTY_DRAFT", payload: "" });
        }
      }
    }, 200);
  };

  // Handle clear button click
  const handleClear = () => {
    handleSpecialtySelect(null);
    inputRef.current?.focus();
  };

  const activeDescendantId =
    showDropdown && selectedIndex >= 0
      ? `specialty-option-${selectedIndex}`
      : undefined;

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
          aria-haspopup="listbox"
          aria-controls="specialty-dropdown"
          aria-activedescendant={activeDescendantId}
          aria-describedby="specialty-search-help"
          aria-busy={isLoading}
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
          id="specialty-dropdown"
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
            id="specialty-option-0"
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
                id={`specialty-option-${adjustedIndex}`}
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
              Ingen specialer fundet for &quot;{searchTerm}&quot;
            </div>
          )}
        </div>
      )}

      <div id="specialty-search-help" className="sr-only">
        Søg efter et speciale eller vælg &quot;Alle specialer&quot; for at søge
        uden filter
      </div>
    </div>
  );
};
