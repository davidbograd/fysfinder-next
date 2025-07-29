# Migration Plan: Integrating New Search into Existing Pages

## 🎯 **Objective**

Replace the current `SearchAndFilters` component with our new advanced search functionality while preserving all existing SEO, premium listings, and page structure optimizations.

## 📋 **What We Keep vs Replace**

### ✅ **Keep (Already Optimized)**

- **SEO & Meta**: `generateMetadata()`, structured data, canonical URLs
- **Page Structure**: Breadcrumbs, headers, layout components
- **Premium Logic**: Premium sorting, premium listings display
- **Business Features**: Nearby clinics, specialty filtering, content
- **Results Display**: `ClinicCard`, `ClinicsList`, existing styling
- **URL Structure**: `/find/fysioterapeut/[location]` routes

### 🔄 **Replace (New Search Functionality)**

- **Search Interface**: `SearchAndFilters` → `MigrationWrapper`
- **Advanced Filters**: Add Ydernummer & Handicap Access filters
- **Search Logic**: Enhanced search with instant filtering
- **URL Parameters**: Add filter persistence (`?ydernummer=true&handicap=true`)

## 🚀 **Migration Steps**

### **Step 1: Component Replacement**

#### **1.1 Replace Homepage Search**

**File:** `src/app/page.tsx`

**Before:**

```tsx
<SearchAndFilters
  specialties={specialties}
  defaultSearchValue=""
  citySlug="danmark"
/>
```

**After:**

```tsx
import { MigrationWrapper } from "@/components/search-v2/MigrationWrapper";

<MigrationWrapper
  specialties={specialties}
  defaultSearchValue=""
  citySlug="danmark"
  showFilters={false} // No filters on homepage
/>;
```

#### **1.2 Replace Location Page Search**

**File:** `src/app/find/fysioterapeut/[location]/page.tsx`

**Before:**

```tsx
<SearchAndFilters
  specialties={specialties}
  currentSpecialty={params.specialty}
  citySlug={params.location}
  defaultSearchValue={isOnline ? "Online" : data.city.bynavn}
/>
```

**After:**

```tsx
import { MigrationWrapper } from "@/components/search-v2/MigrationWrapper";

<MigrationWrapper
  specialties={specialties}
  currentSpecialty={params.specialty}
  citySlug={params.location}
  defaultSearchValue={isOnline ? "Online" : data.city.bynavn}
  showFilters={true} // Show filters on results pages
/>;
```

### **Step 2: Enhanced Data Integration**

#### **2.1 Add URL Parameter Handling**

**File:** `src/app/find/fysioterapeut/[location]/page.tsx`

Add search params handling:

```tsx
interface LocationPageProps {
  params: {
    location: string;
    specialty?: string;
  };
  searchParams: {
    ydernummer?: string;
    handicap?: string;
  };
}

export default async function LocationPage({
  params,
  searchParams,
}: LocationPageProps) {
  // Parse filters from URL
  const filters = {
    ydernummer: searchParams.ydernummer === "true",
    handicap: searchParams.handicap === "true",
  };

  // Pass filters to data fetching
  const data = await fetchLocationData(
    params.location,
    params.specialty,
    filters // New parameter
  );

  // ... rest of component
}
```

#### **2.2 Enhance Data Fetching**

**File:** `src/app/find/fysioterapeut/[location]/page.tsx`

Update `fetchLocationData` to support filters:

```tsx
export async function fetchLocationData(
  locationSlug: string,
  specialtySlug?: string,
  filters?: { ydernummer?: boolean; handicap?: boolean }
): Promise<LocationPageData> {
  // ... existing code ...

  // Apply filters to clinic queries
  if (filters?.ydernummer !== undefined) {
    clinicsUrl += `&ydernummer=eq.${filters.ydernummer}`;
  }

  if (filters?.handicap !== undefined) {
    clinicsUrl += `&handicapadgang=eq.${filters.handicap}`;
  }

  // ... rest of function
}
```

#### **2.3 Update Meta Generation**

Add filter context to meta tags:

```tsx
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { location: string; specialty?: string };
  searchParams: { ydernummer?: string; handicap?: string };
}): Promise<Metadata> {
  const data = await fetchLocationData(params.location);
  const cityName = data.city?.bynavn || deslugify(params.location);

  // Build filter context for title
  const filterContext = [];
  if (searchParams.ydernummer === "true") filterContext.push("med ydernummer");
  if (searchParams.handicap === "true")
    filterContext.push("med handicapadgang");
  const filterSuffix =
    filterContext.length > 0 ? ` ${filterContext.join(" og ")}` : "";

  return {
    title: `Fysioterapi klinikker ${cityName}${filterSuffix} | Find fysioterapeuter ›`,
    description: `Find og sammenlign ${cityName} fysioterapeuter${filterSuffix}. Se anbefalinger, fysioterapi specialer, priser, åbningstider og mere.`,
  };
}
```

### **Step 3: Testing & Validation**

#### **3.1 Test Checklist**

- [x] **Homepage search works with new interface** - Side-by-side testing confirms working
- [x] **Location page search maintains existing functionality** - Original still works perfectly
- [x] **Basic search components work** - Location autocomplete + specialty dropdown functional
- [x] **Navigation logic works** - TestSearchButton confirms proper URL building and navigation
- [ ] **Advanced filters work and persist in URL** - Need to add filters back to testing interface
- [ ] **SEO meta tags update with filter context** - Need to implement
- [ ] **Premium listings still display correctly** - Original pages still working (need to verify on new search)
- [ ] **Nearby clinics functionality preserved** - Original pages still working
- [x] **Mobile responsiveness maintained** - Testing interface is responsive
- [x] **All existing URLs continue to work** - Original search components still in place

#### **3.2 Rollback Plan**

If issues arise, simple rollback:

```tsx
// Revert to old component
import { SearchAndFilters } from "@/components/features/search/SearchAndFilters";

// Replace MigrationWrapper with SearchAndFilters
<SearchAndFilters
  specialties={specialties}
  currentSpecialty={params.specialty}
  citySlug={params.location}
  defaultSearchValue={defaultSearchValue}
/>;
```

## 📊 **Benefits of This Approach**

### ✅ **Risk Mitigation**

- **Zero SEO Risk**: All existing meta tags, structured data, and content preserved
- **Business Continuity**: Premium listings, nearby clinics, and core features maintained
- **Easy Rollback**: Simple component swap if issues arise

### 🚀 **Enhanced Functionality**

- **Advanced Filters**: Ydernummer and Handicap Access with instant application
- **Better UX**: Real-time filtering without page reloads
- **URL Persistence**: Filters saved in URL for sharing and bookmarking
- **Mobile-First**: Improved mobile search experience

### 🔧 **Technical Benefits**

- **Clean Architecture**: New search logic isolated in separate components
- **Maintainable**: Clear separation between search logic and page logic
- **Testable**: New search functionality can be tested independently
- **Scalable**: Easy to add more filters in the future

## 📅 **Implementation Timeline**

## 📋 **Current Progress Tracker**

### **✅ COMPLETED: Basic Migration Setup**

- [x] **Create MigrationWrapper component** - Working basic search interface
- [x] **Set up side-by-side testing** - Original + new search visible on all pages
- [x] **Fix dropdown visibility** - Location autocomplete dropdown working
- [x] **Add TestSearchButton** - Button confirms location/specialty selection works
- [x] **Verify basic search flow** - Location + specialty selection + navigation working

### **✅ COMPLETED: Enhanced Functionality**

- [x] **Add advanced filters to testing interface** - Working filter toggles with chips and clear functionality
- [x] **Replace TestSearchButton with real search** - RealSearchButton executes actual search with page reload
- [x] **Add URL parameter handling** - Full support for `?ydernummer=true&handicap=true` on existing pages
- [x] **Enhance data fetching with filters** - fetchLocationData applies filters to all clinic queries (Danmark, Online, Cities)
- [x] **Update meta generation** - Page titles include filter context (e.g., "med ydernummer og handicapadgang")

### **⏳ PENDING: Final Migration**

- [ ] **Remove side-by-side testing** - Replace original SearchAndFilters with MigrationWrapper
- [ ] **Comprehensive testing** - Test all functionality on actual pages
- [ ] **Cross-browser testing** - Ensure compatibility
- [ ] **Performance validation** - Confirm search response times
- [ ] **Production deployment** - Go live with new search

## 🔍 **Example URLs After Migration**

```
# Existing URLs (preserved)
/find/fysioterapeut/kobenhavn
/find/fysioterapeut/kobenhavn/sportsskader

# New Filtered URLs (enhanced)
/find/fysioterapeut/kobenhavn?ydernummer=true
/find/fysioterapeut/kobenhavn?handicap=true
/find/fysioterapeut/kobenhavn/sportsskader?ydernummer=true&handicap=true

# Homepage (enhanced interface)
/ (with new search component)
```

## ✅ **Success Criteria**

1. **Functionality**: All existing features work exactly as before
2. **SEO**: No loss of search rankings or organic traffic
3. **Performance**: Search response times under 500ms
4. **UX**: Improved user experience with advanced filtering
5. **Business**: Premium listings and conversion rates maintained or improved

This migration plan provides a low-risk, high-reward approach to upgrading the search functionality while preserving all existing optimizations!
