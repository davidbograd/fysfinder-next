import type { LinkConfig } from "./types.js";
/**
 * Represents the result of processing internal links.
 */
export interface ProcessResult {
    processedHtml: string;
    linkedKeywords: string[];
}
/**
 * Processes the HTML content to insert internal links based on the configuration.
 * MVP Implementation: Uses Regex for basic <p> tag targeting and avoids existing <a> tags.
 * Links only the first occurrence of each unique keyword found.
 */
export declare function processInternalLinks(html: string, config: LinkConfig, currentPagePath: string): ProcessResult;
//# sourceMappingURL=transform.d.ts.map