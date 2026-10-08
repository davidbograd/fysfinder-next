// Updated: 2026-10-08 - Trimmed to the location/specialty/filter state the live search uses.
"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { resolveSearchTarget } from "./resolveSearchTarget";

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

export interface SearchState {
  location: LocationQuery | null;
  locationDraft: string;
  specialty: SpecialtyQuery | null;
  specialtyDraft: string;
  filters: SearchFilters;
}

export type SearchAction =
  | { type: "SET_LOCATION"; payload: LocationQuery | null }
  | { type: "SET_LOCATION_DRAFT"; payload: string }
  | { type: "SET_SPECIALTY"; payload: SpecialtyQuery | null }
  | { type: "SET_SPECIALTY_DRAFT"; payload: string }
  | { type: "SET_FILTERS"; payload: SearchFilters };

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case "SET_LOCATION":
      return {
        ...state,
        location: action.payload,
        locationDraft: action.payload?.name ?? state.locationDraft,
      };
    case "SET_LOCATION_DRAFT":
      return { ...state, locationDraft: action.payload };
    case "SET_SPECIALTY":
      return {
        ...state,
        specialty: action.payload,
        specialtyDraft: action.payload?.name ?? state.specialtyDraft,
      };
    case "SET_SPECIALTY_DRAFT":
      return { ...state, specialtyDraft: action.payload };
    case "SET_FILTERS":
      return { ...state, filters: action.payload };
    default:
      return state;
  }
}

export interface SearchContextType {
  state: SearchState;
  dispatch: React.Dispatch<SearchAction>;
  setFilters: (filters: SearchFilters) => void;
  navigateToSearch: (overrides?: {
    location?: LocationQuery | null;
    specialty?: SpecialtyQuery | null;
    filters?: SearchFilters;
  }) => Promise<boolean>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
  initialLocation?: LocationQuery | null;
  initialSpecialty?: SpecialtyQuery | null;
  initialFilters?: SearchFilters;
  specialties?: {
    specialty_id: string;
    specialty_name: string;
    specialty_name_slug: string;
  }[];
}

export function SearchProvider({
  children,
  initialLocation = null,
  initialSpecialty = null,
  initialFilters = {},
  specialties = [],
}: SearchProviderProps) {
  const [state, dispatch] = useReducer(searchReducer, {
    location: initialLocation,
    locationDraft: initialLocation?.name ?? "",
    specialty: initialSpecialty,
    specialtyDraft: initialSpecialty?.name ?? "",
    filters: initialFilters,
  });
  const router = useRouter();

  const setFilters = (filters: SearchFilters) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  };

  const navigateToSearch = useCallback(
    async (overrides?: {
      location?: LocationQuery | null;
      specialty?: SpecialtyQuery | null;
      filters?: SearchFilters;
    }) => {
      const resolved = await resolveSearchTarget({
        location:
          overrides && "location" in overrides
            ? overrides.location ?? null
            : state.location,
        locationDraft: state.locationDraft,
        specialty:
          overrides && "specialty" in overrides
            ? overrides.specialty ?? null
            : state.specialty,
        specialtyDraft: state.specialtyDraft,
        filters:
          overrides && "filters" in overrides
            ? overrides.filters ?? {}
            : state.filters,
        specialties,
      });

      if (!resolved.ok) return false;

      if (resolved.location && resolved.location.slug !== state.location?.slug) {
        dispatch({ type: "SET_LOCATION", payload: resolved.location });
      }
      if (resolved.specialty && resolved.specialty.slug !== state.specialty?.slug) {
        dispatch({ type: "SET_SPECIALTY", payload: resolved.specialty });
      }

      router.push(resolved.url);
      return true;
    },
    [
      router,
      state.filters,
      state.location,
      state.locationDraft,
      state.specialty,
      state.specialtyDraft,
      specialties,
    ]
  );

  return (
    <SearchContext.Provider value={{ state, dispatch, setFilters, navigateToSearch }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
