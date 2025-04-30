# Internal Linking Tool PRD - MVP Version

## Overview

The Internal Linking Tool is a lightweight, automated system for managing internal links across specified sections of fysfinder.dk. It aims to improve site navigation, SEO, and user experience by automatically inserting relevant internal links based on predefined keywords and their corresponding destinations. This document describes the **Minimum Viable Product (MVP)** version.

## Goals

- Improve site navigation and user experience
- Enhance SEO through strategic internal linking
- Reduce manual effort in maintaining internal links
- Establish a foundation for future linking enhancements

## Scope

### In Scope (MVP)

- Automated link insertion in specified page paths during build time:
  - /ordbog/\*
  - /blog/\*
  - /mr-scanning
- Processing content within `<p>` tags only.
- Basic configuration system for keywords and their destinations (e.g., JSON file or hardcoded object).
- Case-insensitive keyword matching.
- Link insertion for the _first_ occurrence of each unique keyword found on a page.
- Avoidance of inserting links within existing `<a>` tags.

### Out of Scope (for MVP, potential future enhancements)

- Link insertion in headlines or other HTML elements besides `<p>`.
- Real-time link insertion (MVP is build-time only).
- Admin UI for managing keywords.
- Configurable maximum links per page.
- Prevention of multiple links pointing to the _same destination_ from _different keywords_ on a single page.
- Keyword priority handling.
- Advanced word boundary detection (MVP uses simple string matching).
- Development mode hot reloading for configuration.
- Extensive error handling and warnings (MVP will have basic build failure on critical errors).
- Comprehensive unit/integration testing (MVP will have minimal checks).
- Detailed documentation (MVP will have basic setup info).
- Analytics tracking.
- Link validation.
- Advanced performance optimizations (e.g., keyword tries).

## Technical Requirements

### Implementation Strategy

The system will be implemented as a build-time HTML transformation utility that processes content during the Next.js build phase.

- Simple, focused implementation.
- Pure function transformation.
- Optimal performance with no runtime overhead (links are in static HTML).
- Framework-agnostic core logic.
- Transformer processes content within `<p>` tags during `next build`.

### Link Configuration (MVP)

The system will use a simple configuration source (e.g., JSON file or hardcoded object) defining keyword-to-destination mappings.

Example Structure:

```json
{
  "linkMappings": {
    "anatomy": [
      {
        "keywords": ["rygsøjle", "columna"],
        "destination": "/ordbog/rygsoejle"
      }
    ],
    "conditions": [
      {
        "keywords": ["diskusprolaps", "prolaps"],
        "destination": "/ordbog/diskusprolaps"
      }
    ]
  }
  // No "settings" object in MVP
  // No "priority" field in MVP
}
```

### Link Processing Rules (MVP)

1.  **Path Matching**: Only process pages matching specified paths (`/ordbog/*`, `/blog/*`, `/mr-scanning`).
2.  **Content Processing**:
    - Only scan and modify content within `<p>` tags.
    - Preserve existing HTML structure where possible.
    - Skip processing content within existing `<a>` tags.
3.  **Link Insertion**:
    - Link the _first occurrence_ of each unique keyword found.
    - Case-insensitive keyword matching (simple string comparison).
    - No configurable limit on total links (determined by unique first occurrences).
    - No prevention of duplicate _destinations_ if triggered by different keywords.

### Build Process Integration

- The core transformation function integrates into the `next build` process.
- Links are generated and inserted into the static HTML output.
- Configuration is loaded at build time.
- Build fails if essential configuration is invalid or missing.

### Performance Considerations (MVP)

- Build-time processing avoids runtime overhead.
- Simple string matching is sufficient for initial keyword sets.
- Monitor build times as part of general maintenance.

## Implementation Approach (MVP)

Focus on delivering the core functionality rapidly.

#### Core MVP Tasks

- [x] Set up basic project structure (e.g., `lib/internal-linking`).
- [x] Define basic TypeScript types for configuration (`keywords`, `destination`).
- [ ] Implement configuration loading (from file or hardcoded).
- [ ] Create the core transformation function:
  - [ ] Basic HTML content identification (find `<p>` tags, avoid `<a>` tags).
  - [ ] Simple, case-insensitive keyword matching.
  - [ ] Logic to insert `<a>` tags for the first unique keyword occurrences.
- [ ] Integrate the transformation function into the Next.js build process for target paths.
- [ ] Perform basic manual testing to verify functionality on target pages.

## Technical Constraints

- Must integrate with Next.js build process.
- Will be implemented directly within the fysfinder-next project.
- Must work with Vercel deployment.

## Success Metrics (MVP)

- Successful insertion of links for configured keywords on target pages.
- Build completes successfully.
- Basic verification shows links are correctly formed and placed.

## Risks and Mitigations (MVP)

| Risk                 | Mitigation                                     |
| -------------------- | ---------------------------------------------- |
| Build time impact    | Keep MVP logic simple; monitor build times.    |
| Incorrect linking    | Basic manual testing; simple matching logic.   |
| Invalid HTML output  | Minimal transformation; check output manually. |
| Configuration errors | Fail build on load error; keep config simple.  |

## Dependencies

- Access to HTML content at build time (via Next.js build process).
- Simple configuration source.

## Maintenance (MVP)

- Update keyword mappings as needed.
- Monitor build process for failures.
