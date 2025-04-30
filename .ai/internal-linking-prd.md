# Internal Linking Tool PRD

## Overview

The Internal Linking Tool is a lightweight, automated system for managing internal links across specified sections of fysfinder.dk. It aims to improve site navigation, SEO, and user experience by automatically inserting relevant internal links based on predefined keywords and their corresponding destinations.

## Goals

- Improve site navigation and user experience
- Enhance SEO through strategic internal linking
- Reduce manual effort in maintaining internal links
- Ensure consistent linking across content
- Maintain content readability by avoiding over-linking

## Scope

### In Scope

- Automated link insertion in specified page paths:
  - /ordbog/\*
  - /blog/\*
  - /mr-scanning
- Processing content within `<p>` tags only
- Configurable maximum links per page
- Prevention of duplicate links to the same destination on a single page
- Simple configuration system for keywords and their destinations

### Out of Scope

- Link insertion in headlines or other HTML elements
- Real-time link insertion
- Admin UI for managing keywords (first version)
- Analytics tracking
- Link validation

## Technical Requirements

### Implementation Strategy

The system will be implemented as a build-time HTML transformation utility that processes content during the Next.js build phase. This approach offers several advantages:

- Simple, focused implementation without React component overhead
- Pure function transformation that's easy to test and debug
- Optimal performance with no runtime overhead
- Content is processed and links are inserted during build
- Static HTML output with pre-processed links
- Framework-agnostic design that could be used with other systems

The transformer will process content within `<p>` tags during the build phase, ensuring that all internal links are generated before the page is served to the client. This build-time approach means:

- No client-side JavaScript overhead
- No React component complexity
- Improved Core Web Vitals
- Better SEO performance
- Consistent link generation across builds

### Link Configuration

The system will use a JSON configuration file with the following structure:

```json
{
  "linkMappings": {
    "anatomy": [
      {
        "keywords": ["rygsøjle", "columna"],
        "destination": "/ordbog/rygsoejle",
        "priority": 1
      }
    ],
    "conditions": [
      {
        "keywords": ["diskusprolaps", "prolaps"],
        "destination": "/ordbog/diskusprolaps",
        "priority": 1
      }
    ]
  },
  "settings": {
    "maxLinksPerPage": 5,
    "targetPaths": ["/ordbog/", "/blog/", "/mr-scanning"],
    "enabled": true,
    "debug": false
  }
}
```

### Link Processing Rules

1. **Path Matching**

   - Only process pages matching specified paths
   - Use exact match for single pages (e.g., /mr-scanning)
   - Use prefix matching for directory paths (e.g., /ordbog/\*)

2. **Content Processing**

   - Only scan and modify content within `<p>` tags
   - Preserve existing HTML attributes and structure
   - Skip processing of existing links (`<a>` tags)

3. **Link Insertion**
   - Maximum N links per page (configurable)
   - No duplicate destinations per page
   - Case-insensitive keyword matching
   - Respect word boundaries (avoid partial word matches)
   - First occurrence of keyword gets priority

### Build Process Integration

The internal linking system will integrate with Next.js's build process in the following ways:

1. **Transform Function**

   ```typescript
   // Core transformation function
   function processInternalLinks(content: string, config: LinkConfig): string {
     // Process content and return transformed HTML
   }

   // Build pipeline integration
   export async function processPage(html: string) {
     return processInternalLinks(html, loadConfig());
   }
   ```

2. **Build-time Processing**

   - Transformer executes during `next build`
   - Links are generated and inserted into the static HTML
   - No additional JavaScript is sent to the client
   - Configuration is loaded and validated at build time

3. **Caching and Optimization**

   - Processed content becomes part of the static build output
   - Rebuilds required when link configurations change
   - Development mode supports configuration hot reloading

4. **Error Handling**
   - Build fails if configuration is invalid
   - Warnings for potential issues (e.g., conflicting keywords)
   - Detailed error messages for debugging
   - Easy to trace transformation issues without component stack traces

### Performance Considerations

- Process pages at build time through Next.js build pipeline
- Optimize keyword matching algorithm for build performance
- Cache processed content as static HTML
- No runtime JavaScript overhead
- Monitor and optimize build times as configuration grows
- Implement efficient keyword trie/tree structure for large keyword sets
- Simple string manipulation instead of DOM operations where possible

## Implementation Approach

### Phase 1: Core Implementation

#### 1. Project Setup

- [x] Create project structure in `lib/internal-linking`
- [x] Set up basic TypeScript types
- [x] Create simple build pipeline integration

#### 2. Core Transform

- [x] Implement basic HTML parsing
- [x] Create content transformation logic
- [x] Implement simple keyword matching

#### 3. Configuration

- [x] Create configuration types
- [x] Implement basic config loader
- [x] Create initial keyword mappings

#### 4. Link Processing

- [x] Implement keyword matching
  - [x] Case-insensitive matching
  - [x] Basic word boundary detection
- [x] Create link insertion logic
  - [x] Max links per page limit
  - [x] Duplicate prevention

#### 5. Basic Testing

- [x] Write unit tests for core functions
- [x] Create simple integration test

### Phase 2: Integration

#### 1. Build Integration

- [x] Create Next.js build hook
- [x] Add basic path matching
- [x] Test in Vercel environment

#### 2. Documentation

- [x] Write basic usage documentation
- [x] Add configuration examples

## Technical Constraints

- Must integrate with Next.js build process
- Will be implemented directly within the fysfinder-next project
- Must work with Vercel deployment

## Success Metrics

- Successful link insertion rate
- Zero broken links introduced
- Improved internal linking structure

## Risks and Mitigations

| Risk                 | Mitigation                         |
| -------------------- | ---------------------------------- |
| Build time impact    | Efficient algorithms and caching   |
| Over-linking content | Configurable limits and validation |
| Invalid HTML output  | Basic HTML validation              |
| Configuration errors | Simple schema validation           |

## Dependencies

- Access to HTML content at build time
- Configuration file management
- Basic HTML parsing capability

## Maintenance

- Regular configuration updates
- Basic error logging
- Periodic link validation
