"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  buildSearchV2Url,
  parseFiltersFromURL,
} from "@/utils/parameter-normalization";

// Types for search state
export interface LocationQuery {
  name: string;
  slug: string;
  postalCodes?: string[];
}

export interface SpecialtyQuery {
  name: string;
  slug: string;
  id: string;
}

export interface SearchFilters {
  ydernummer?: boolean;
  handicap?: boolean;
}

export interface SearchResults {
  clinics: ClinicSearchResult[];
  totalCount: number;
  hasMore: boolean;
}

export interface ClinicSearchResult {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone?: string;
  email?: string;
  website?: string;
  ydernummer: boolean;
  handicapAccess: boolean;
  rating?: number;
  specialties: string[];
  distance?: number;
  isPremium: boolean;
  bookingLink?: string;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export interface SearchState {
  // Search terms
  location: LocationQuery | null;
  specialty: SpecialtyQuery | null;

  // Filters
  filters: SearchFilters;

  // UI State
  isLoading: boolean;
  showFilters: boolean;
  hasUnsearchedChanges: boolean; // Tracks if user has made changes but not searched

  // Results
  results: SearchResults;
  pagination: PaginationState;
}

// Action types
export type SearchAction =
  | { type: "SET_LOCATION"; payload: LocationQuery | null }
  | { type: "SET_SPECIALTY"; payload: SpecialtyQuery | null }
  | { type: "SET_FILTERS"; payload: SearchFilters }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_SHOW_FILTERS"; payload: boolean }
  | { type: "SET_UNSEARCHED_CHANGES"; payload: boolean }
  | { type: "SET_RESULTS"; payload: SearchResults }
  | { type: "SET_PAGINATION"; payload: PaginationState }
  | { type: "RESET_STATE" };

// Initial state
const initialState: SearchState = {
  location: null,
  specialty: null,
  filters: {},
  isLoading: false,
  showFilters: false,
  hasUnsearchedChanges: false,
  results: {
    clinics: [],
    totalCount: 0,
    hasMore: false,
  },
  pagination: {
    currentPage: 1,
    pageSize: 20,
    totalPages: 0,
  },
};

// Reducer
function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case "SET_LOCATION":
      return {
        ...state,
        location: action.payload,
      };
    case "SET_SPECIALTY":
      return {
        ...state,
        specialty: action.payload,
      };
    case "SET_FILTERS":
      return {
        ...state,
        filters: action.payload,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "SET_SHOW_FILTERS":
      return {
        ...state,
        showFilters: action.payload,
      };
    case "SET_UNSEARCHED_CHANGES":
      return {
        ...state,
        hasUnsearchedChanges: action.payload,
      };
    case "SET_RESULTS":
      return {
        ...state,
        results: action.payload,
      };
    case "SET_PAGINATION":
      return {
        ...state,
        pagination: action.payload,
      };
    case "RESET_STATE":
      return initialState;
    default:
      return state;
  }
}

// Context type
export interface SearchContextType {
  state: SearchState;
  dispatch: React.Dispatch<SearchAction>;

  // Action helpers
  setLocation: (location: LocationQuery | null) => void;
  setSpecialty: (specialty: SpecialtyQuery | null) => void;
  setFilters: (filters: SearchFilters) => void;
  setLoading: (loading: boolean) => void;
  setShowFilters: (show: boolean) => void;
  setUnsearchedChanges: (hasChanges: boolean) => void;
  setResults: (results: SearchResults) => void;
  setPagination: (pagination: PaginationState) => void;
  resetState: () => void;

  // Individual filter helpers
  setYdernummer: (value: boolean) => void;
  setHandicapAccess: (value: boolean) => void;
  clearAllFilters: () => void;

  // Search execution
  executeSearch: () => Promise<void>;

  // URL management
  updateURL: () => void;
}

// Create context
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Provider component props
interface SearchProviderProps {
  children: ReactNode;
  initialLocation?: LocationQuery | null;
  initialSpecialty?: SpecialtyQuery | null;
  initialFilters?: SearchFilters;
}

export function SearchProvider({
  children,
  initialLocation = null,
  initialSpecialty = null,
  initialFilters = {},
}: SearchProviderProps) {
  // Create initial state with provided values
  const initState: SearchState = {
    ...initialState,
    location: initialLocation,
    specialty: initialSpecialty,
    filters: initialFilters,
  };

  const [state, dispatch] = useReducer(searchReducer, initState);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Action helpers
  const setLocation = (location: LocationQuery | null) => {
    dispatch({ type: "SET_LOCATION", payload: location });
  };

  const setSpecialty = (specialty: SpecialtyQuery | null) => {
    dispatch({ type: "SET_SPECIALTY", payload: specialty });
  };

  const setFilters = (filters: SearchFilters) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  };

  const setShowFilters = (show: boolean) => {
    dispatch({ type: "SET_SHOW_FILTERS", payload: show });
  };

  const setUnsearchedChanges = (hasChanges: boolean) => {
    dispatch({ type: "SET_UNSEARCHED_CHANGES", payload: hasChanges });
  };

  const setResults = (results: SearchResults) => {
    dispatch({ type: "SET_RESULTS", payload: results });
  };

  const setPagination = (pagination: PaginationState) => {
    dispatch({ type: "SET_PAGINATION", payload: pagination });
  };

  const resetState = () => {
    dispatch({ type: "RESET_STATE" });
  };

  // Individual filter helpers
  const setYdernummer = (value: boolean) => {
    const newFilters = { ...state.filters };
    if (value) {
      newFilters.ydernummer = true;
    } else {
      // Remove the filter entirely when toggled off
      delete newFilters.ydernummer;
    }
    setFilters(newFilters);
    setUnsearchedChanges(true);
  };

  const setHandicapAccess = (value: boolean) => {
    const newFilters = { ...state.filters };
    if (value) {
      newFilters.handicap = true;
    } else {
      // Remove the filter entirely when toggled off
      delete newFilters.handicap;
    }
    setFilters(newFilters);
    setUnsearchedChanges(true);
  };

  const clearAllFilters = () => {
    setFilters({});
    setUnsearchedChanges(true);
  };

  // Search execution
  const executeSearch = useCallback(async () => {
    if (!state.location) return;

    // Prevent multiple simultaneous search executions
    if (state.isLoading) return;

    setLoading(true);
    setUnsearchedChanges(false);

    try {
      // Import search service dynamically to avoid server-side issues
      const { searchService } = await import("@/lib/search-service");

      // Execute real search
      const searchResults = await searchService.searchClinics({
        location: state.location.slug,
        specialty: state.specialty?.slug,
        filters: state.filters,
        // Remove pagination - get all clinics
      });

      // Convert to expected format
      console.log("SearchProvider received results:", {
        count: searchResults.clinics.length,
        totalCount: searchResults.totalCount,
        firstClinic: searchResults.clinics[0]?.name,
      });

      setResults({
        clinics: searchResults.clinics,
        totalCount: searchResults.totalCount,
        hasMore: searchResults.hasMore,
      });
    } catch (error) {
      console.error("Search error:", error);
      // Set empty results on error
      setResults({
        clinics: [],
        totalCount: 0,
        hasMore: false,
      });
    } finally {
      setLoading(false);
    }
  }, [
    state.location?.slug,
    state.specialty?.slug,
    JSON.stringify(state.filters),
  ]); // Use stable dependencies

  // URL management with parameter normalization
  const updateURL = useCallback(() => {
    if (!state.location) return;

    try {
      const targetUrl = buildSearchV2Url(
        state.location.slug,
        state.specialty?.slug,
        state.filters
      );

      // Only update URL if it's different from current URL
      const currentUrl = window.location.pathname + window.location.search;
      if (targetUrl !== currentUrl) {
        router.push(targetUrl);
      }
    } catch (error) {
      console.error("URL update error:", error);
    }
  }, [
    state.location?.slug,
    state.specialty?.slug,
    JSON.stringify(state.filters),
    router,
  ]); // Use stable dependencies

  const contextValue: SearchContextType = {
    state,
    dispatch,
    setLocation,
    setSpecialty,
    setFilters,
    setLoading,
    setShowFilters,
    setUnsearchedChanges,
    setResults,
    setPagination,
    resetState,
    setYdernummer,
    setHandicapAccess,
    clearAllFilters,
    executeSearch,
    updateURL,
  };

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
}

// Custom hook to use search context
export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}

// Export for debugging
export { SearchContext };
