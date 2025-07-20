# Product Requirements Document: Enhanced Search & Filters

## Executive Summary

This PRD outlines the redesign of FysFinder's search functionality to create a more robust, SEO-friendly, and user-centric search experience. The current `SearchAndFilters.tsx` component will be completely rewritten to support advanced filtering while maintaining excellent SEO performance and avoiding duplicate content issues.

## Current State Analysis

### Existing Implementation Issues

- **Tightly coupled components**: Search logic mixed with UI rendering
- **Limited filtering**: Only location and specialty supported
- **Poor state management**: Multiple useState hooks without centralized state
- **SEO limitations**: Current URL structure `/find/{location}/{specialty}` is too restrictive
- **No filter persistence**: Filters reset on page navigation
- **Limited accessibility**: Missing ARIA labels and keyboard navigation
- **Instant search**: No control over when search executes, making it hard to set multiple parameters

### Current URL Structure

```
/find/fysioterapeut/{location}
/find/fysioterapeut/{location}/{specialty}
/find/fysioterapeut/danmark
/find/fysioterapeut/danmark/{specialty}
```

## Goals & Objectives

### Primary Goals

1. **Enhanced User Experience**: Provide intuitive, fast, and comprehensive search functionality with explicit search control
2. **SEO Optimization**: Maintain excellent search engine visibility while supporting complex filtering
3. **Scalability**: Architecture that easily accommodates new filter types
4. **Performance**: Fast search responses and minimal re-renders
5. **Accessibility**: WCAG 2.1 AA compliant search interface

### Success Metrics

- **SEO Performance**: Maintain current organic traffic while improving long-tail keyword rankings
- **Conversion Rate**: 15% improvement in clinic profile visits from search results
- **Page Load Speed**: Sub-200ms search response times

## Target Users

### Primary Users

- **Patients seeking physiotherapy**: Need location-based search with specific requirements
- **Patients with specific conditions**: Require specialty-based filtering
- **Patients with accessibility needs**: Need handicap access and other accommodation filters

### Secondary Users

- **SEO crawlers**: Need clean, indexable URLs and structured data
- **Mobile users**: Require touch-friendly, responsive search interface

## Functional Requirements

### 1. Two-Stage Search Architecture

Following the HotDoc model, search functionality is split into two distinct phases:

#### 1.1 Stage 1: Homepage Search (Simple)

- **Location-only search** on the main homepage
- **Optional specialty selection** via dropdown
- **Minimal interface** focusing on getting users to results quickly
- **Direct navigation** to search results page

#### 1.2 Stage 2: Search Results Page (Advanced)

- **Advanced filtering panel** available on search results page
- **Refinement capabilities** without losing initial search context
- **Filter persistence** in URL parameters
- **Progressive disclosure** of filter options

### 2. Homepage Search Capabilities

#### 2.1 Location Search

- **Autocomplete search** with debounced input (300ms)
- **Support multiple input types**:
  - City names (København, Aarhus)
  - Postal codes (2100, 8000) - automatically mapped to city names
- **Fuzzy matching** for typos and partial matches
- **URL normalization**: All URLs use city names, never postal codes

#### 2.2 Specialty Search (Optional)

- **Dropdown with search** functionality
- **Popular specialties** shown first
- **"All specialties" default option**

#### 2.3 Homepage Search Execution

- **Simple search button**: "Find Physiotherapists"
- **Required location**: Cannot search without location
- **Direct navigation**: Takes users to `/find/fysioterapeut/{location}` or `/find/fysioterapeut/{location}/{specialty}`

### 3. Search Results Page Capabilities

#### 3.1 Advanced Filters (Available only on results page)

- **Ydernummer** (Yes/No toggle)
- **Handicap Access** (Yes/No toggle)

#### 3.2 Search Refinement

- **Instant filtering**: Filters apply immediately (no search button needed)
- **URL updates**: All filters reflected in query parameters
- **Filter chips**: Show active filters with remove option
- **Clear all filters** option

### 4. URL Structure & SEO Strategy

#### 4.1 Primary URLs (Indexable)

```
/find/fysioterapeut/{location}                    # Location only
/find/fysioterapeut/{location}/{specialty}        # Location + Specialty
/find/fysioterapeut/danmark                       # All Denmark
/find/fysioterapeut/danmark/{specialty}           # Denmark + Specialty
```

#### 4.2 Filtered URLs (Selectively indexable with canonical strategy)

```
/find/fysioterapeut/{location}?ydernummer=true&handicap=true
/find/fysioterapeut/{location}/{specialty}?ydernummer=true&handicap=true
```

#### 4.3 Parameter Normalization Strategy

To prevent duplicate content issues, all URL parameters must be normalized:

**Parameter Order**: Always sort parameters alphabetically

- ✅ `?handicap=true&ydernummer=true` (canonical)
- ❌ `?ydernummer=true&handicap=true` (redirects to canonical)

**Implementation**:

```typescript
// Parameter normalization utility
export function normalizeSearchParams(params: URLSearchParams): string {
  const normalized = new URLSearchParams();
  const paramOrder = ["handicap", "ydernummer"]; // Alphabetical order

  paramOrder.forEach((key) => {
    const value = params.get(key);
    if (value !== null) normalized.set(key, value);
  });

  return normalized.toString();
}
```

**Middleware Redirect**: 301 redirect non-canonical parameter orders to canonical URLs

#### 4.4 SEO Strategy for Filtered Pages

```typescript
// SEO strategy based on filter complexity
const seoStrategy = {
  // Simple filters (1-2 parameters): indexable with canonical
  simpleFilters: {
    robots: "index, follow",
    canonical: "/find/fysioterapeut/{location}", // Points to base page
  },

  // Complex filters (3+ parameters): noindex with canonical
  complexFilters: {
    robots: "noindex, follow",
    canonical: "/find/fysioterapeut/{location}",
  },
};
```

Example URLs:

```
# Canonical URLs (indexable)
/find/fysioterapeut/kobenhavn?handicap=true&ydernummer=true

# Non-canonical URLs (301 redirect)
/find/fysioterapeut/kobenhavn?ydernummer=true&handicap=true → redirects to canonical
```

### 5. Component Architecture

#### 5.1 New Component Structure

```
SearchContainer/
├── SearchInput/
│   ├── LocationSearch.tsx
│   ├── SpecialtySearch.tsx
│   └── SearchSuggestions.tsx
├── FilterPanel/
│   ├── FilterToggle.tsx
│   ├── FilterDropdown.tsx
│   └── FilterChips.tsx
├── SearchButton/
│   └── SearchButton.tsx
├── SearchResults/
│   ├── ResultsList.tsx
│   └── ResultsPagination.tsx
└── SearchProvider.tsx (Context)
```

#### 5.2 State Management

```typescript
interface SearchState {
  // Search terms
  location: LocationQuery | null;
  specialty: SpecialtyQuery | null;

  // Filters
  filters: {
    ydernummer?: boolean;
    handicapAccess?: boolean;
  };

  // UI State
  isLoading: boolean;
  showFilters: boolean;
  hasUnsearchedChanges: boolean; // New: tracks if user has made changes but not searched
  results: SearchResults;
  pagination: PaginationState;
}
```

### 6. Search Logic & Performance

#### 6.1 Search Flow

1. **Parameter setting**: Users set location, specialty, and filters without triggering search
2. **Search button click**: Explicit user action to execute search
3. **URL update**: Update URL with human-readable query parameters
4. **API call**: Execute search with all parameters
5. **Results display**: Show results and update UI state

#### 6.2 Database Queries

```sql
-- Base query with location
SELECT c.*, cs.specialty_name,
       ST_Distance(c.coordinates, $location) as distance
FROM clinics c
LEFT JOIN clinic_specialties cs ON c.id = cs.clinic_id
WHERE ST_DWithin(c.coordinates, $location, $radius)

-- With filters
AND ($ydernummer IS NULL OR c.ydernummer = $ydernummer)
AND ($handicap IS NULL OR c.handicap_access = $handicap)

ORDER BY
  CASE WHEN c.premium_listing IS NOT NULL THEN 0 ELSE 1 END,
  c.avg_rating DESC,
  distance ASC
```

## Technical Requirements

### 1. Performance Requirements

- **Search response time**: < 200ms for cached results, < 500ms for new queries
- **Bundle size**: New search components < 50KB gzipped
- **Memory usage**: < 10MB for search state and cache
- **Mobile performance**: 60fps scrolling on search results

### 2. SEO Requirements

- **Structured data**: Enhanced LocalBusiness and MedicalBusiness schemas
- **Meta tags**: Dynamic titles and descriptions for all URL combinations
- **Canonical URLs**: Proper canonicalization for filtered pages
- **XML Sitemaps**: Auto-generated sitemaps for primary URLs only
- **Internal linking**: Smart cross-linking between related searches

### 3. Accessibility Requirements

- **Keyboard navigation**: Full keyboard support for all interactions
- **Screen readers**: Proper ARIA labels and live regions
- **Focus management**: Logical focus flow and visible focus indicators
- **Mobile accessibility**: Touch targets ≥ 44px

### 4. Browser Support

- **Modern browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Progressive enhancement**: Basic functionality without JavaScript

## User Experience Design

### 1. Search Interface Layout

```
┌─────────────────────────────────────────────────┐
│ [Location Input] [Specialty Dropdown]           │
│ ┌─ Filters (collapsible) ──────────────────────┐ │
│ │ [Ydernummer] [Handicap Access]               │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─ Active Filters ─────────────────────────────┐ │
│ │ [København ×] [Sportsskader ×] [Ydernummer ×]│ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ [🔍 SEARCH] ← Explicit search button            │
└─────────────────────────────────────────────────┘
```

### 2. Mobile-First Design

- **Collapsible filters**: Hidden by default on mobile
- **Touch-friendly**: Large tap targets and spacing
- **Prominent search button**: Easy to find and tap

### 3. Loading States

- **Skeleton screens** for search results
- **Progressive disclosure** of filter options
- **Search button loading state** during API calls

### 4. Search Button Behavior

- **Disabled state**: When no location is selected
- **Enabled state**: When at least location is selected
- **Loading state**: During search execution
- **Visual feedback**: Clear indication when parameters have changed but search hasn't been executed

## Implementation Strategy

### Isolated Development Approach

To ensure zero risk to the current user experience, we'll build the new search functionality completely isolated from the existing implementation:

#### Isolated Routes Structure

```
/search-v2                           # New homepage search testing
/search-v2/find/{location}           # New location results page
/search-v2/find/{location}/{specialty} # New location + specialty results
```

#### Isolated Components Structure

```
src/components/search-v2/
├── SearchContainer/
├── SearchInput/
├── FilterPanel/
├── SearchResults/
└── SearchProvider.tsx

src/app/search-v2/
├── page.tsx                        # New homepage search
├── find/
│   └── [location]/
│       ├── page.tsx                # New location results
│       └── [specialty]/
│           └── page.tsx            # New location + specialty results
```

### Migration Strategy

1. **Isolated Development**: Build completely separate from existing search
2. **Internal Testing**: Team can test new functionality without affecting users
3. **A/B Testing**: Gradual rollout to subset of users (optional)
4. **Full Migration**: Replace existing search when confident in new implementation

## 🚀 Implementation Checklist

### 📊 Progress Overview

- **Phase 1**: ✅ **11/11 tasks completed** (DONE)
- **Phase 2**: ✅ **16/16 tasks completed** (DONE)
- **Phase 3**: ✅ **15/15 tasks completed** (DONE)
- **Phase 4**: 🔄 **0/8 tasks completed** (IN PROGRESS)
- **Phase 5**: 0/10 tasks completed
- **Phase 6**: 0/8 tasks completed
- **Total Progress**: **42/68 tasks completed (62%)**

---

### 🏗️ Phase 1: Isolated Foundation (Week 1-2) ✅ **COMPLETED**

#### Route Structure Setup

- [x] Create `src/app/search-v2/page.tsx` (new homepage search)
- [x] Create `src/app/search-v2/find/[location]/page.tsx` (location results)
- [x] Create `src/app/search-v2/find/[location]/[specialty]/page.tsx` (location + specialty results)
- [x] Add basic page layouts and routing tests
- [x] Verify isolated routes work independently

#### Component Architecture

- [x] Create `src/components/search-v2/` folder structure
- [x] Create `SearchProvider.tsx` with React Context
- [x] Create `SearchContainer/index.tsx` wrapper component
- [x] Create `SearchInput/LocationSearch.tsx` component
- [x] Create `SearchInput/SpecialtySearch.tsx` component
- [x] Create `SearchButton/SearchButton.tsx` component

**Phase 1 Completion**: ✅ **11/11 completed**

---

### 🔍 Phase 2: Isolated Core Search (Week 3-4) ✅ **COMPLETED**

#### Search Input Components

- [x] Implement location autocomplete with debounced input (300ms)
- [x] Add support for city names and postal codes in location search
- [x] Implement postal code to city name mapping using cities table lookup
- [x] Implement fuzzy matching for location input
- [x] Build specialty dropdown with search functionality
- [x] Add "All specialties" default option to specialty dropdown
- [x] Create search suggestions UI component

#### Search State Management

- [x] Implement SearchState interface in context
- [x] Add location and specialty state management
- [x] Add hasUnsearchedChanges tracking
- [x] Create search execution logic
- [x] Add URL parameter encoding/decoding utility functions
- [x] Implement parameter normalization utility to prevent duplicate content
- [x] Create middleware for 301 redirects of non-canonical parameter orders
- [x] Implement location slug normalization (postal codes → city names)
- [x] Create database utility functions for postal code/city lookup

#### Homepage Implementation

- [x] Build isolated homepage UI at `/search-v2`
- [x] Implement "Find Physiotherapists" search button
- [x] Add form validation (require location)
- [x] Test navigation to results pages

**Phase 2 Completion**: ✅ **16/16 completed**

---

### 🎛️ Phase 3: Isolated Advanced Filters (Week 5-6) ✅ **COMPLETED**

#### Filter Components

- [x] Create `FilterPanel/FilterToggle.tsx` component
- [x] Create `FilterPanel/FilterChips.tsx` component
- [x] Create `FilterPanel/FilterPanel.tsx` main panel
- [x] Implement Ydernummer toggle filter
- [x] Implement Handicap Access toggle filter

#### Filter State Management

- [x] Add filter state to SearchProvider context
- [x] Implement instant filter application (no search button needed)
- [x] Add filter persistence in URL query parameters
- [x] Create "Clear all filters" functionality
- [x] Add active filter chips with remove options

#### Search Results Pages

- [x] Build location results page UI
- [x] Build location + specialty results page UI
- [x] Implement results list component
- [x] Add filter panel to results pages
- [x] Create "No results found" state

#### Database Integration

- [x] Update search API to support new filters
- [x] Optimize database queries for filter combinations
- [x] ~~Add pagination support~~ Removed pagination - show all results
- [x] Test filter performance with large datasets
- [x] Add loading states for search results

**Phase 3 Completion**: ✅ **15/15 completed**

---

### 🎨 Phase 4: SEO & Performance (Week 7-8)

#### SEO Implementation

- [ ] Add dynamic meta titles for isolated routes
- [ ] Add dynamic meta descriptions for isolated routes
- [ ] Implement structured data for LocalBusiness
- [ ] Add canonical URLs for filtered pages (pointing to base pages)
- [ ] Implement selective indexing strategy for filtered pages
- [ ] Add filter context to meta titles/descriptions for better UX

#### Performance Optimization

- [ ] Optimize bundle size for new components
- [ ] Implement code splitting for search components
- [ ] Add search response caching
- [ ] Optimize database query performance

**Phase 4 Completion**: 0/8 ✅

---

### 🧪 Phase 5: Testing & Polish (Week 9-10)

#### Accessibility Testing

- [ ] Add ARIA labels to all search components
- [ ] Implement keyboard navigation for search interface
- [ ] Test with screen readers
- [ ] Ensure focus management works correctly
- [ ] Verify 44px+ touch targets on mobile

#### Performance Testing

- [ ] Test search response times (<500ms requirement)
- [ ] Test mobile performance (60fps scrolling)
- [ ] Run Lighthouse accessibility audit (>90 score target)
- [ ] Test memory usage (<10MB requirement)

#### Cross-browser Testing

- [ ] Test in Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- [ ] Test mobile browsers (iOS Safari 14+, Chrome Mobile 90+)
- [ ] Test progressive enhancement without JavaScript

#### User Testing

- [ ] Internal team testing on `/search-v2` routes
- [ ] Document any bugs or UX issues found
- [ ] User acceptance testing with stakeholders

**Phase 5 Completion**: 0/10 ✅

---

### 🚀 Phase 6: Migration (Week 11-12)

#### Frontend Migration

- [ ] Replace homepage search component with new version
- [ ] Update existing location pages to use new search results components
- [ ] Ensure all existing URLs continue to work
- [ ] Set up redirects if URL structure changes

#### Cleanup & Monitoring

- [ ] Remove old search components
- [ ] Remove isolated `/search-v2` routes
- [ ] Set up monitoring for new search performance
- [ ] Monitor user behavior and conversion rates post-migration

**Phase 6 Completion**: 0/8 ✅

---

## 📝 Development Notes

**Current Status**: ✅ **Phases 1-3 Complete** (62% done)  
**Started Date**: January 2025  
**Current Phase**: Phase 4 - SEO & Performance  
**Blockers**: None  
**Next Steps**: Implement dynamic meta tags and structured data

### 🐛 Issues Log

✅ **Resolved Issues:**

1. **Build Error**: Server-side imports in client components → Fixed with client-side Supabase instance
2. **Toggle Clicks**: Not updating URL → Fixed with useEffect watching filter changes
3. **React Keys**: Duplicate key warnings → Fixed with null filtering and fallback keys
4. **Infinite Loops**: useEffect dependencies → Fixed by removing `state.isLoading` dependency
5. **Data Mapping**: Search service query errors → Fixed with proper PostgREST syntax
6. **Homepage Navigation**: Search button not working → Fixed with router.push navigation
7. **Pagination**: 20 clinic limit → Removed to show all results

### 💡 Ideas & Improvements

**✅ Implemented:**

- Search input refinement on results pages for better UX
- Real-time filter application without search button clicks
- Console.log cleanup for cleaner development experience
- URL parameter handling with false value omission

**💡 Future Considerations:**

- A/B testing framework for gradual rollout
- Search analytics and performance monitoring
- Advanced filters (rating, distance, price range)
- Search result sorting options

### 📋 Testing Checklist

**✅ Completed Tests:**

- [x] Location autocomplete with various Danish cities
- [x] Postal code to city name mapping (2100 → København)
- [x] Filter combinations (Ydernummer + Handicap Access)
- [x] URL parameter persistence and canonical redirects
- [x] Mobile responsiveness on iPhone/Android
- [x] Error handling for invalid cities
- [x] Loading states and skeleton animations
- [x] Filter chip removal functionality
- [x] "Clear all filters" functionality
- [x] Homepage to results page navigation

**🔄 Pending Tests:**

- [ ] Cross-browser compatibility (Safari, Firefox, Edge)
- [ ] Lighthouse performance audit
- [ ] Screen reader accessibility
- [ ] Keyboard navigation
- [ ] Search response time benchmarks

## Risk Assessment

### High Risk

- **SEO Impact**: Changes to URL structure could affect rankings
- **Performance Degradation**: Complex filtering could slow down searches

## Success Criteria

### Launch Criteria

- [ ] All primary URLs return 200 status codes
- [ ] Search response times < 500ms (95th percentile)
- [ ] Lighthouse accessibility score > 90
- [ ] Zero critical console errors
- [ ] Mobile usability score > 95

### Post-Launch Metrics (30 days)

- [ ] Search usage increased by 20%
- [ ] Average session duration increased by 15%
- [ ] Bounce rate decreased by 10%
- [ ] Organic traffic maintained or improved
- [ ] User satisfaction score > 4.0/5.0

## 📈 Current Status & Achievements

### ✅ **Completed Phases (62% Complete)**

**🎯 Major Accomplishments:**

- **Isolated Development Environment**: Complete `/search-v2` route structure working independently
- **Advanced Search Functionality**: Location + specialty search with autocomplete and debounced input
- **Real-time Filtering**: Instant filters (Ydernummer, Handicap Access) with URL persistence
- **Full Database Integration**: Real Supabase data with optimized queries and city_id filtering
- **Mobile-First UI**: Responsive design with collapsible filters and touch-friendly interface
- **SEO-Ready URLs**: Parameter normalization and canonical URL structure implemented

### 🔧 **Key Technical Achievements**

#### **Search Architecture**

- ✅ React Context state management with `SearchProvider`
- ✅ Debounced location autocomplete (300ms) with postal code support
- ✅ Specialty dropdown with search functionality
- ✅ URL parameter normalization for SEO consistency
- ✅ Middleware for 301 redirects (canonical URLs)

#### **Database & Performance**

- ✅ Optimized Supabase queries with `city_id` filtering
- ✅ Real-time filter application without pagination limits
- ✅ Complex JOIN queries for specialty filtering
- ✅ Error handling and loading states

#### **User Experience**

- ✅ Filter chips with remove functionality
- ✅ "Clear all filters" option
- ✅ Search input refinement on results pages
- ✅ Skeleton loading states and error handling
- ✅ Navigation between homepage and results pages

### 🔄 **Current Status**

**✅ Working Features:**

- Location search: `http://localhost:3000/search-v2/find/gentofte`
- Homepage search: `http://localhost:3000/search-v2`
- Filter functionality with URL persistence
- Real clinic data display (all clinics, no 20-limit)
- Mobile-responsive interface

**🎯 Next Phase: SEO & Performance Optimization**

- Dynamic meta tags for filtered pages
- LocalBusiness structured data
- Bundle size optimization
- Performance testing

### 🐛 **Issues Resolved**

1. **Build Errors**: Fixed server-side imports in client components
2. **Toggle Functionality**: Fixed filter state management and URL updates
3. **Infinite Loops**: Resolved React useEffect dependencies
4. **Data Integration**: Fixed city_id filtering and query optimization
5. **React Key Warnings**: Added proper key handling for dynamic lists
6. **Navigation Issues**: Fixed homepage search button routing
7. **Pagination Limit**: Removed 20 clinic limit - now shows all results

### 📋 **Testing Status**

**✅ Tested:**

- Location search with various Danish cities
- Filter combinations (Ydernummer + Handicap Access)
- URL parameter persistence and normalization
- Mobile responsiveness
- Error states and loading indicators

**🔄 Pending:**

- Cross-browser testing
- Performance benchmarking
- Accessibility audit
- SEO validation

## Appendix

### A. Current Database Schema (Relevant Tables)

```sql
-- Clinics table
clinics (
  id, klinikNavn, lokationSlug, city_id,
  ydernummer, handicap_access, avg_rating, coordinates
)

-- Specialties table
specialties (
  specialty_id, specialty_name, specialty_name_slug
)

-- Junction table
clinic_specialties (
  clinic_id, specialty_id
)
```

### B. Human-Readable Query Parameters

```javascript
// All filters use descriptive parameter names
const filterParams = {
  ydernummer: "true", // ?ydernummer=true
  handicap: "true", // ?handicap=true
};

// Example URLs
// /find/fysioterapeut/kobenhavn?ydernummer=true&handicap=true
// /find/fysioterapeut/aarhus/sportsskader?ydernummer=true
```

### C. Database Schema Integration

#### Cities Table Structure

```sql
-- Supabase cities table schema
cities (
  id uuid PRIMARY KEY,
  bynavn text NOT NULL,           -- "Østerbro", "Aarhus C", "København K"
  bynavn_slug text,               -- "oesterbro", "aarhus-c", "koebenhavn-k"
  postal_codes text[] NOT NULL,   -- ["2100"], ["8000"], ["1050","1051"...]
  latitude float8 NOT NULL,
  longitude float8 NOT NULL,
  location_point geography,
  betegnelse text,
  seo_tekst text,
  updated_at timestamptz DEFAULT now()
)
```

#### Key Implementation Functions

```typescript
// Postal code to city mapping
async function findCityByPostalCode(postalCode: string) {
  const { data } = await supabase
    .from("cities")
    .select("bynavn, bynavn_slug, postal_codes")
    .contains("postal_codes", [postalCode])
    .single();

  return data;
}

// City name search with fuzzy matching
async function findCitiesByName(searchTerm: string) {
  const { data } = await supabase
    .from("cities")
    .select("bynavn, bynavn_slug")
    .ilike("bynavn", `%${searchTerm}%`)
    .limit(10);

  return data;
}
```

#### Statistics

- **604 cities** with single postal code (most municipalities)
- **3 major cities** with 50+ postal codes (København K: 232, Vesterbro: 150, Frederiksberg C: 105)
- **100% coverage** of all Danish postal codes

### D. SEO Meta Template

```html
<!-- Location only -->
<title>Fysioterapeuter i {location} | Find og sammenlign | FysFinder</title>
<meta
  name="description"
  content="Find de bedste fysioterapeuter i {location}. Se anmeldelser, specialer og book tid online. {count} klinikker fundet."
/>

<!-- Location + Specialty -->
<title>
  {specialty} fysioterapi i {location} | Find fysioterapeuter | FysFinder
</title>
<meta
  name="description"
  content="Find {specialty} fysioterapeuter i {location}. Se anmeldelser, priser og book tid online. Specialiserede behandlere."
/>

<!-- Filtered pages (selective indexing) -->
<title>
  Fysioterapeuter i {location} {filterContext} | Find fysioterapeuter |
  FysFinder
</title>
<meta name="robots" content="index, follow" />
<link rel="canonical" href="/find/fysioterapeut/{location}" />
```

### E. Parameter Normalization Examples

```typescript
// Canonical parameter order (alphabetical)
const CANONICAL_PARAM_ORDER = ["handicap", "ydernummer"];

// URL normalization examples
const examples = {
  // Input URLs (various orders)
  input: [
    "?ydernummer=true&handicap=true",
    "?handicap=true&ydernummer=true",
    "?ydernummer=true",
    "?handicap=true",
  ],

  // Canonical output (normalized)
  canonical: [
    "?handicap=true&ydernummer=true",
    "?handicap=true&ydernummer=true", // Already canonical
    "?ydernummer=true",
    "?handicap=true",
  ],

  // SEO strategy per URL
  seo: {
    "?handicap=true&ydernummer=true": { robots: "index, follow" },
    "?handicap=true": { robots: "index, follow" },
    "?ydernummer=true": { robots: "index, follow" },
  },
};

// Filter context for meta tags
const filterContextMap = {
  handicap: "med handicapadgang",
  ydernummer: "med ydernummer",
};
```
