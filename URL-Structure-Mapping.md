# FysFinder Search URLs - SEO Structure Mapping

## Overview

This document outlines the complete URL structure for FysFinder's enhanced search functionality. The system uses a two-stage approach similar to HotDoc.com.au with clean, SEO-friendly URLs for primary content and filtered URLs with noindex directives.

## 🎯 Primary URLs (Indexable, SEO-optimized)

### Location-Only URLs

```
/find/fysioterapeut/{location}
```

**Examples:**

- `/find/fysioterapeut/kobenhavn`
- `/find/fysioterapeut/aarhus`
- `/find/fysioterapeut/odense`
- `/find/fysioterapeut/aalborg`
- `/find/fysioterapeut/frederiksberg`

**Note:** Postal codes (e.g., 2100, 8000) are automatically mapped to city names in URLs for SEO optimization.

### Location + Specialty URLs

```
/find/fysioterapeut/{location}/{specialty}
```

**Examples:**

- `/find/fysioterapeut/kobenhavn/sportsskader`
- `/find/fysioterapeut/aarhus/rygbehandling`
- `/find/fysioterapeut/odense/nakke-og-skulder`
- `/find/fysioterapeut/aalborg/manuel-terapi`
- `/find/fysioterapeut/frederiksberg/pilates`

### National URLs

```
/find/fysioterapeut/danmark
/find/fysioterapeut/danmark/{specialty}
```

**Examples:**

- `/find/fysioterapeut/danmark`
- `/find/fysioterapeut/danmark/sportsskader`
- `/find/fysioterapeut/danmark/rygbehandling`
- `/find/fysioterapeut/danmark/nakke-og-skulder`

## 🔍 Filtered URLs (Non-indexable, with noindex directive)

### Location + Filters

```
/find/fysioterapeut/{location}?ydernummer=true&handicap=true
```

**Examples:**

- `/find/fysioterapeut/kobenhavn?ydernummer=true`
- `/find/fysioterapeut/aarhus?handicap=true`
- `/find/fysioterapeut/odense?ydernummer=true&handicap=true`

### Location + Specialty + Filters

```
/find/fysioterapeut/{location}/{specialty}?ydernummer=true&handicap=true
```

**Examples:**

- `/find/fysioterapeut/kobenhavn/sportsskader?ydernummer=true`
- `/find/fysioterapeut/aarhus/rygbehandling?handicap=true`
- `/find/fysioterapeut/odense/nakke-og-skulder?ydernummer=true&handicap=true`

### National + Filters

```
/find/fysioterapeut/danmark?ydernummer=true&handicap=true
/find/fysioterapeut/danmark/{specialty}?ydernummer=true&handicap=true
```

**Examples:**

- `/find/fysioterapeut/danmark?ydernummer=true`
- `/find/fysioterapeut/danmark/sportsskader?handicap=true`

## 🔧 Development URLs (Temporary, during build phase)

During development, all URLs will be prefixed with `/search-v2` for isolated testing:

```
/search-v2                                    # Test homepage
/search-v2/find/{location}                    # Test location results
/search-v2/find/{location}/{specialty}        # Test specialty results
```

**Note:** These will be removed after migration to production.

## 📋 Filter Parameters

### Available Filters

- `ydernummer=true` - Clinics that accept public health insurance
- `handicap=true` - Clinics with handicap accessibility

### Filter Behavior

- **Instant application**: Filters apply immediately without search button
- **URL persistence**: All filters reflected in query parameters
- **Human-readable**: Clear, descriptive parameter names

## 📍 Postal Code Mapping

### Location Input Handling

Users can search using either city names or postal codes, but URLs always use city names for SEO optimization:

**User Input → URL Mapping:**

- `"København"` → `/find/fysioterapeut/kobenhavn`
- `"2100"` (Østerbro) → `/find/fysioterapeut/kobenhavn`
- `"Aarhus"` → `/find/fysioterapeut/aarhus`
- `"8000"` (Aarhus C) → `/find/fysioterapeut/aarhus`

### Database Structure (Supabase cities table)

The `cities` table contains the complete mapping:

```sql
cities (
  id uuid,
  bynavn text,           -- "Østerbro", "Aarhus C", "København K"
  bynavn_slug text,      -- "oesterbro", "aarhus-c", "koebenhavn-k"
  postal_codes text[],   -- ["2100"], ["8000"], ["1050","1051"...]
  latitude float8,
  longitude float8
)
```

### Mapping Strategy

- **Search accepts**: City names (`"Østerbro"`), postal codes (`"2100"`), and partial matches
- **URLs always use**: Slugified city names (`"oesterbro"`) from `bynavn_slug` column
- **Database lookup**: Query `WHERE postal_code = ANY(postal_codes)` to find city
- **SEO benefit**: Consistent, readable URLs with city names
- **User benefit**: Can search with familiar postal codes

### Implementation Examples

**Database Query for Postal Code Lookup:**

```sql
SELECT bynavn, bynavn_slug, postal_codes
FROM cities
WHERE '2100' = ANY(postal_codes);
-- Returns: {"bynavn": "Østerbro", "bynavn_slug": "oesterbro"}
```

**URL Generation Logic:**

```typescript
// User searches for "2100"
const city = await findCityByPostalCode("2100");
// Returns: {bynavn: "Østerbro", bynavn_slug: "oesterbro"}

// Generate URL using bynavn_slug
const url = `/find/fysioterapeut/${city.bynavn_slug}`;
// Result: /find/fysioterapeut/oesterbro
```

## 🎯 SEO Strategy

### Indexable URLs (Primary Content)

- **Meta robots**: `index, follow`
- **Canonical**: Self-referencing canonical URLs
- **Structured data**: LocalBusiness and MedicalBusiness schemas
- **Dynamic titles**: Location and specialty-specific titles
- **Dynamic descriptions**: Optimized meta descriptions

### Non-indexable URLs (Filtered Content)

- **Meta robots**: `noindex, follow`
- **Canonical**: Points to primary URL without filters
- **No structured data**: Prevents duplicate content issues

### Example Meta Tags

#### Location Only

```html
<title>Fysioterapeuter i København | Find og sammenlign | FysFinder</title>
<meta
  name="description"
  content="Find de bedste fysioterapeuter i København. Se anmeldelser, specialer og book tid online. 247 klinikker fundet."
/>
<meta name="robots" content="index, follow" />
<link
  rel="canonical"
  href="https://fysfinder.dk/find/fysioterapeut/kobenhavn"
/>
```

#### Location + Specialty

```html
<title>
  Sportsskader fysioterapi i København | Find fysioterapeuter | FysFinder
</title>
<meta
  name="description"
  content="Find sportsskader fysioterapeuter i København. Se anmeldelser, priser og book tid online. Specialiserede behandlere."
/>
<meta name="robots" content="index, follow" />
<link
  rel="canonical"
  href="https://fysfinder.dk/find/fysioterapeut/kobenhavn/sportsskader"
/>
```

#### Filtered Page (Non-indexable)

```html
<title>Fysioterapeuter med ydernummer i København | FysFinder</title>
<meta
  name="description"
  content="Find fysioterapeuter med ydernummer i København. Filtrede resultater."
/>
<meta name="robots" content="noindex, follow" />
<link
  rel="canonical"
  href="https://fysfinder.dk/find/fysioterapeut/kobenhavn"
/>
```

## 🗺️ URL Migration Plan

### Phase 1: Isolated Development

- Build all functionality under `/search-v2` prefix
- Test URL structure and SEO elements
- Verify canonical URLs and meta tags

### Phase 2: Production Migration

- Replace existing search functionality
- Maintain existing URL structure
- Set up 301 redirects if needed
- Remove `/search-v2` development URLs

### Existing URLs (Will Continue to Work)

```
/find/fysioterapeut/{location}           # ✅ Already exists
/find/fysioterapeut/{location}/{specialty} # ✅ Already exists
/find/fysioterapeut/danmark              # ✅ Already exists
/find/fysioterapeut/danmark/{specialty}  # ✅ Already exists
```

## 📊 Expected URL Volume

### Primary URLs (Indexable)

- **Location URLs**: ~100-200 URLs (major cities + postal codes)
- **Location + Specialty URLs**: ~2,000-5,000 URLs (locations × specialties)
- **National URLs**: ~50-100 URLs (national + specialty combinations)
- **Total Indexable**: ~2,150-5,300 URLs

### Filtered URLs (Non-indexable)

- **Infinite combinations**: Any primary URL + filter combinations
- **Not counted in sitemap**: Excluded from XML sitemaps
- **No SEO impact**: Proper canonical and noindex handling

## 🔗 Internal Linking Strategy

### Breadcrumbs

```
Home > Find Fysioterapeuter > København > Sportsskader
```

### Related Links

- Cross-link between related specialties in same location
- Link to nearby locations for same specialty
- Link from filtered results to primary pages

### Sitemap Generation

- **Include**: All primary URLs (indexable)
- **Exclude**: All filtered URLs (non-indexable)
- **Auto-generate**: Dynamic sitemap based on available locations and specialties

## ⚠️ Important Notes for SEO

1. **No Duplicate Content**: Filtered URLs use canonical to primary URLs
2. **Clean Parameter Handling**: Human-readable query parameters
3. **Progressive Enhancement**: Works without JavaScript
4. **Mobile-First**: Responsive design and mobile-optimized URLs
5. **Fast Loading**: Optimized for Core Web Vitals

## 🚀 Next Steps

1. **Review URL structure** with development team
2. **Validate specialty slugs** for Danish language optimization
3. **Confirm location coverage** for target cities
4. **Set up monitoring** for URL performance post-launch
