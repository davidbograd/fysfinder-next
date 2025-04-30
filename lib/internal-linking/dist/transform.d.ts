import type { LinkConfig } from "./types.js";
/**
 * Processes the HTML content to insert internal links based on the configuration.
 * MVP Implementation: Uses Regex for basic <p> tag targeting and avoids existing <a> tags.
 * Links only the first occurrence of each unique keyword found.
 */
export declare function processInternalLinks(html: string, config: LinkConfig): string;
//# sourceMappingURL=transform.d.ts.map