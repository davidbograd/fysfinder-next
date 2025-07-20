// Main exports for search-v2 components
export { SearchProvider, useSearch } from "./SearchProvider";
export { SearchContainer } from "./SearchContainer";
export { LocationSearch, SpecialtySearch } from "./SearchInput";
export { SearchButton } from "./SearchButton/SearchButton";
export { FilterPanel, FilterToggle, FilterChips } from "./FilterPanel";
export {
  ResultsContainer,
  ResultsList,
  SearchResultsDisplay,
} from "./SearchResults";

// Types
export type {
  SearchState,
  SearchAction,
  SearchContextType,
  LocationQuery,
  SpecialtyQuery,
  SearchFilters,
  SearchResults,
  PaginationState,
} from "./SearchProvider";

// All components use named exports
