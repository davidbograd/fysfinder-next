# Internal Linking Feature

This document provides a brief overview of the automated internal linking feature implemented in the codebase.

## Goal

The primary goal is to automatically insert relevant internal links into specific content pages (`/ordbog/*` and `/blog/*`) to improve site navigation and SEO without manual intervention.

## Implementation Method (Current)

The internal linking is implemented using a **custom Rehype plugin** that runs during the server-side rendering build process when Markdown/MDX content is compiled to HTML.

- **Build-Time Integration:** Links are inserted as part of the MDX processing pipeline (specifically via `next-mdx-remote/rsc`).
- **No Runtime Overhead:** Links are part of the static HTML served to the client.
- **No Hydration Issues:** Because links are inserted _before_ React hydration, this method avoids client-side rendering mismatches.

This approach replaced a previous method that used a post-build script to modify HTML files, which caused hydration issues.

## Key Files Involved

1.  **`lib/internal-linking/config.ts`**:
    - **Purpose:** Defines and loads the master configuration for internal links. Contains the mapping of keywords to their target destination URLs. This is where you update keywords or add new links.
2.  **`lib/internal-linking/types.ts`**:
    - **Purpose:** Defines the TypeScript interfaces (`LinkConfig`, `LinkMapping`) used for structuring the configuration data loaded by `config.ts` and used by the plugin.
3.  **`lib/internal-linking/rehype-internal-links.ts`**:
    - **Purpose:** Contains the core logic implemented as a Rehype plugin. This plugin traverses the HTML Abstract Syntax Tree (HAST) generated from MDX content.
    - **Functionality:** It identifies text within `<p>` tags, matches keywords based on the configuration (whole-word, case-insensitive), checks against linking rules (max 15 links per page, unique destination URLs per page, no self-links), and modifies the HAST to insert `<a>` tags where appropriate.
4.  **`src/components/features/blog-og-ordbog/ContentEntry.tsx`**:
    - **Purpose:** The React component responsible for rendering MDX content for blog and ordbog entries using `<MDXRemote />`.
    - **Integration Point:** This component imports `rehype-internal-links` and `loadLinkConfig` and passes the plugin (with the config and current page path) to the `options.mdxOptions.rehypePlugins` prop of `<MDXRemote />`.

## Scope

- **Affected Pages:** The internal linking currently runs only on pages rendered using the `ContentEntry.tsx` component, which includes:
  - `/ordbog/*`
  - `/blog/*`
- **Excluded Pages:** Pages not using this MDX rendering pipeline (e.g., `/mr-scanning/page.tsx`) are **not** processed by this internal linking plugin.
- **Content Target:** The plugin specifically targets text content within `<p>` tags.

## Configuration & Maintenance

- To add, remove, or modify internal links, edit the `linkMappings` object within the `loadLinkConfig` function in `lib/internal-linking/config.ts`.
- The linking logic (rules like max links, unique destinations) is controlled within `lib/internal-linking/rehype-internal-links.ts`.
