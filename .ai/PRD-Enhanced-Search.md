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

- **User Engagement**: 25% increase in search interactions
- **SEO Performance**: Maintain current organic traffic while improving long-tail keyword rankings
- **Conversion Rate**: 15% improvement in clinic profile visits from search results
- **Page Load Speed**: Sub-200ms search response times
- **Accessibility Score**: 95+ Lighthouse accessibility score

## Target Users

### Primary Users

- **Patients seeking physiotherapy**: Need location-based search with specific requirements
- **Patients with specific conditions**: Require specialty-based filtering
- **Patients with accessibility needs**: Need handicap access and other accommodation filters

### Secondary Users

- **SEO crawlers**: Need clean, indexable URLs and structured data
- **Mobile users**: Require touch-friendly, responsive search interface

## Functional Requirements

### 1. Search Capabilities

#### 1.1 Location Search

- **Autocomplete search** with debounced input (300ms)
- **Support multiple input types**:
  - City names (København, Aarhus)
  - Postal codes (2100, 8000)
  - "Near me" geolocation
- **Fuzzy matching** for typos and partial matches
- **Search suggestions** with distance indicators

#### 1.2 Specialty Search

- **Dropdown with search** functionality
- **Popular specialties** shown first

#### 1.3 Advanced Filters

- **Ydernummer** (Yes/No toggle)
- **Handicap Access** (Yes/No toggle)
- **Online Consultation** (Yes/No toggle)
- **Parking Available** (Yes/No toggle)
- **Distance radius** (5km, 10km, 25km, 50km)

#### 1.4 Search Execution

- **Explicit search button**: Users must click "SEARCH" to execute the search
- **Parameter setting**: Users can set multiple parameters before searching
- **Search state indication**: Clear visual feedback when parameters are set but search hasn't been executed
- **Search button states**: Disabled when no parameters set, enabled when parameters are ready

### 2. URL Structure & SEO Strategy

#### 2.1 Primary URLs (Indexable)

```
/find/fysioterapeut/{location}                    # Location only
/find/fysioterapeut/{location}/{specialty}        # Location + Specialty
/find/fysioterapeut/danmark                       # All Denmark
/find/fysioterapeut/danmark/{specialty}           # Denmark + Specialty
```

#### 2.2 Filtered URLs (Non-indexable, with noindex)

```
/find/fysioterapeut/{location}?ydernummer=true&handicap=true&distance=25
/find/fysioterapeut/{location}/{specialty}?online=true&parking=true
```

#### 2.3 Filter Encoding Strategy

- **Human-readable query params** for all filters (prioritized approach)
- **Canonical URLs** pointing to primary URLs without filters

Example:

```
# All filters use human-readable params
/find/fysioterapeut/kobenhavn?ydernummer=true&handicap=true&distance=25&online=true&parking=true

# Specialty + filters
/find/fysioterapeut/kobenhavn/sportsskader?ydernummer=true&handicap=true
```

### 3. Component Architecture

#### 3.1 New Component Structure

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

#### 3.2 State Management

```typescript
interface SearchState {
  // Search terms
  location: LocationQuery | null;
  specialty: SpecialtyQuery | null;

  // Filters
  filters: {
    ydernummer?: boolean;
    handicapAccess?: boolean;
    onlineConsultation?: boolean;
    parking?: boolean;
    maxDistance?: number;
  };

  // UI State
  isLoading: boolean;
  showFilters: boolean;
  hasUnsearchedChanges: boolean; // New: tracks if user has made changes but not searched
  results: SearchResults;
  pagination: PaginationState;
}
```

### 4. Search Logic & Performance

#### 4.1 Search Flow

1. **Parameter setting**: Users set location, specialty, and filters without triggering search
2. **Search button click**: Explicit user action to execute search
3. **URL update**: Update URL with human-readable query parameters
4. **API call**: Execute search with all parameters
5. **Results display**: Show results and update UI state

#### 4.2 Database Queries

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
AND ($online IS NULL OR c.online_consultation = $online)
AND ($parking IS NULL OR c.parking_available = $parking)

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
│ │ [Ydernummer] [Handicap] [Online] [Parking]   │ │
│ │ [Distance: ●────○ 25km]                      │ │
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

## Implementation Plan

### Phase 1: Foundation (Week 1-2)

- [ ] Create new component architecture
- [ ] Implement SearchProvider context
- [ ] Build basic LocationSearch component
- [ ] Set up URL parameter handling with human-readable params

### Phase 2: Core Search (Week 3-4)

- [ ] Implement SpecialtySearch component
- [ ] Build search suggestions system
- [ ] Create SearchButton component with proper state management
- [ ] Add explicit search execution flow

### Phase 3: Advanced Filters (Week 5-6)

- [ ] Implement all filter types (ydernummer, handicap, online, parking, distance)
- [ ] Add filter persistence in URL
- [ ] Build filter chips UI
- [ ] Optimize database queries

### Phase 4: SEO & Performance (Week 7-8)

- [ ] Implement human-readable URL encoding/decoding
- [ ] Add canonical URLs and meta tags
- [ ] Optimize bundle size
- [ ] Add structured data

### Phase 5: Testing & Polish (Week 9-10)

- [ ] Accessibility testing and fixes
- [ ] Performance optimization
- [ ] Cross-browser testing
- [ ] User acceptance testing

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

## Appendix

### A. Current Database Schema (Relevant Tables)

```sql
-- Clinics table
clinics (
  id, klinikNavn, lokationSlug, city_id,
  ydernummer, handicap_access, online_consultation,
  parking_available, avg_rating, coordinates
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
  online: "true", // ?online=true
  parking: "true", // ?parking=true
  distance: "25", // ?distance=25
};

// Example URLs
// /find/fysioterapeut/kobenhavn?ydernummer=true&handicap=true&distance=25
// /find/fysioterapeut/aarhus/sportsskader?online=true&parking=true
```

### C. SEO Meta Template

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

<!-- Filtered pages (noindex) -->
<meta name="robots" content="noindex, follow" />
<link rel="canonical" href="/find/fysioterapeut/{location}" />
```
