import type { LinkConfig, LinkMapping } from "./types.js";

/**
 * Creates a mapping of all keywords (lowercase) to their LinkMapping object.
 */
function prepareKeywordMap(config: LinkConfig): Map<string, LinkMapping> {
  const keywordMap = new Map<string, LinkMapping>();
  for (const category in config.linkMappings) {
    for (const mapping of config.linkMappings[category]) {
      for (const keyword of mapping.keywords) {
        // Store lowercase keyword for case-insensitive matching
        keywordMap.set(keyword.toLowerCase(), mapping);
      }
    }
  }
  return keywordMap;
}

/**
 * Processes the HTML content to insert internal links based on the configuration.
 * MVP Implementation: Uses Regex for basic <p> tag targeting and avoids existing <a> tags.
 * Links only the first occurrence of each unique keyword found.
 */
export function processInternalLinks(html: string, config: LinkConfig): string {
  const keywordMap = prepareKeywordMap(config);
  const linkedKeywords = new Set<string>(); // Track keywords already linked on this page
  let processedHtml = html;

  // Regex to find content within <p>...</p> tags
  // It captures the attributes of the <p> tag and its content separately.
  // Using [\s\S]*? for non-greedy matching of any character including newlines.
  const pTagRegex = /(<p\b[^>]*>)([\s\S]*?)(<\/p>)/gi;

  processedHtml = processedHtml.replace(
    pTagRegex,
    (match, openingTag, pContent, closingTag) => {
      let processedPContent = pContent;
      let currentPos = 0;

      // Prepare a sorted list of keywords for efficient checking (longer first to avoid partial matches)
      const sortedKeywords = Array.from(keywordMap.keys()).sort(
        (a, b) => b.length - a.length
      );

      while (currentPos < processedPContent.length) {
        // Find the next potential keyword match in the remaining content
        let bestMatch = null;
        let earliestMatchPos = processedPContent.length;

        for (const keyword of sortedKeywords) {
          const keywordRegex = new RegExp(`\\b${keyword}\\b`, "i"); // Match whole word, case-insensitive
          const matchResult = processedPContent
            .substring(currentPos)
            .match(keywordRegex);

          if (matchResult && matchResult.index !== undefined) {
            const matchPos = currentPos + matchResult.index;
            // Ensure the match is not inside an existing <a> tag
            // Basic check: look for opening <a> before the match and closing </a> after it, without another intervening <a>
            const contentBeforeMatch = processedPContent.substring(0, matchPos);
            const lastOpenAnchor = contentBeforeMatch.lastIndexOf("<a");
            const lastCloseAnchor = contentBeforeMatch.lastIndexOf("</a>");

            const isInsideAnchor = lastOpenAnchor > lastCloseAnchor;

            if (!isInsideAnchor && matchPos < earliestMatchPos) {
              earliestMatchPos = matchPos;
              bestMatch = {
                keyword: keyword, // The lowercase keyword from the map
                originalText: matchResult[0], // The actual text matched (could have different casing)
                length: matchResult[0].length,
                position: matchPos,
              };
            }
          }
        }

        if (bestMatch) {
          const { keyword, originalText, length, position } = bestMatch;
          const lowerCaseKeyword = keyword.toLowerCase(); // Ensure we use lowercase for map/set checks

          // Only link if this keyword hasn't been linked yet on this page
          if (!linkedKeywords.has(lowerCaseKeyword)) {
            const mapping = keywordMap.get(lowerCaseKeyword);
            if (mapping) {
              const link = `<a href="${mapping.destination}">${originalText}</a>`;
              processedPContent =
                processedPContent.substring(0, position) +
                link +
                processedPContent.substring(position + length);

              linkedKeywords.add(lowerCaseKeyword); // Mark as linked
              // Adjust currentPos to continue searching after the inserted link
              currentPos = position + link.length;
              continue; // Restart search from the new position
            }
          }
          // If keyword already linked or no mapping found (shouldn't happen with prepareKeywordMap),
          // or if match was inside an anchor, just advance position past this match
          currentPos = position + length;
        } else {
          // No more keyword matches found in the rest of the content
          break;
        }
      }

      // Reconstruct the <p> tag with processed content
      return `${openingTag}${processedPContent}${closingTag}`;
    }
  );

  return processedHtml;
}
