import type { Root, Element, Text } from "hast";
import type { Plugin } from "unified";
import { visit, EXIT, CONTINUE } from "unist-util-visit";
import type { LinkConfig, LinkMapping } from "./types.js"; // Assuming types.ts is compatible
import { toString } from "hast-util-to-string";
import { h } from "hastscript";

interface RehypeInternalLinksOptions {
  linkConfig: LinkConfig;
  currentPagePath: string;
}

// Helper to check if a node is an Element
function isElement(node: any): node is Element {
  return node && node.type === "element";
}

// Helper to check if a node is Text
function isText(node: any): node is Text {
  return node && node.type === "text";
}

const rehypeInternalLinks: Plugin<[RehypeInternalLinksOptions], Root> = (
  options
) => {
  if (!options) {
    console.error("RehypeInternalLinks: Missing options");
    return undefined;
  }

  const { linkConfig, currentPagePath } = options;

  if (!linkConfig || !linkConfig.linkMappings) {
    console.error("RehypeInternalLinks: Invalid linkConfig provided.");
    return undefined;
  }

  // Prepare keyword map (similar to the old script)
  const keywordMap = new Map<string, LinkMapping>();
  for (const category in linkConfig.linkMappings) {
    for (const mapping of linkConfig.linkMappings[category]) {
      for (const keyword of mapping.keywords) {
        keywordMap.set(keyword.toLowerCase(), mapping);
      }
    }
  }

  // Sort keywords for matching (longer first)
  const sortedKeywords = Array.from(keywordMap.keys()).sort(
    (a, b) => b.length - a.length
  );

  // Keep track of keywords linked on this page (per Rehype instance)
  const linkedKeywordsSet = new Set<string>();
  const linkedDestinationsSet = new Set<string>();
  let linksAddedCount = 0;
  const MAX_LINKS_PER_PAGE = 15;

  return (tree: Root) => {
    // Visit paragraph elements first
    visit(tree, "element", (pNode: Element) => {
      if (pNode.tagName !== "p") {
        return CONTINUE; // Skip non-p elements
      }

      // Process children of the paragraph
      const newChildren: (Element | Text)[] = [];
      let buffer: Text[] = []; // Buffer for consecutive text nodes

      // Helper function to process the buffered text nodes
      const processBuffer = () => {
        if (buffer.length === 0) return;

        const combinedText = buffer.map((t) => t.value).join("");
        let currentPos = 0;
        const processedNodes: (Text | Element)[] = [];

        while (currentPos < combinedText.length) {
          let bestMatch: {
            keyword: string;
            originalText: string;
            index: number;
            length: number;
          } | null = null;

          for (const keyword of sortedKeywords) {
            // Use regex for whole word, case-insensitive matching within the combined text
            // Using negative lookarounds for more robust word boundary checking
            const escapedKeyword = keyword.replace(
              /[-\/\\^$*+?.()|[\]{}]/g,
              "\\$&"
            ); // Escape regex chars
            const keywordRegex = new RegExp(
              `(?<!\\w)${escapedKeyword}(?!\\w)`,
              "i"
            );
            const matchResult = combinedText
              .substring(currentPos)
              .match(keywordRegex);

            if (matchResult && matchResult.index !== undefined) {
              const matchIndex = currentPos + matchResult.index;
              // Only consider this match if it's the earliest one found so far
              if (bestMatch === null || matchIndex < bestMatch.index) {
                bestMatch = {
                  keyword: keyword.toLowerCase(), // Use lowercase for map/set
                  originalText: matchResult[0],
                  index: matchIndex,
                  length: matchResult[0].length,
                };
              }
            }
          }

          if (bestMatch) {
            const { keyword, originalText, index, length } = bestMatch;
            const mapping = keywordMap.get(keyword);

            // Add text before the match (if any)
            if (index > currentPos) {
              processedNodes.push({
                type: "text",
                value: combinedText.substring(currentPos, index),
              });
            }

            // Check:
            // 1. Have we already reached max links?
            // 2. Is there a valid mapping?
            // 3. Is it a self-link?
            // 4. Have we already linked to this *destination*?
            if (
              linksAddedCount < MAX_LINKS_PER_PAGE &&
              mapping &&
              mapping.destination !== currentPagePath &&
              !linkedDestinationsSet.has(mapping.destination) &&
              !linkedKeywordsSet.has(keyword)
            ) {
              // Create the link element using hastscript
              const linkNode = h(
                "a",
                { href: mapping.destination },
                originalText
              );
              processedNodes.push(linkNode);
              linkedKeywordsSet.add(keyword);
              linkedDestinationsSet.add(mapping.destination);
              linksAddedCount++;
            } else {
              // Add the matched text as plain text (max links reached, already linked destination, self-link, or no mapping)
              processedNodes.push({ type: "text", value: originalText });
            }
            currentPos = index + length; // Move past the match
          } else {
            // No more matches in the rest of the text
            if (currentPos < combinedText.length) {
              processedNodes.push({
                type: "text",
                value: combinedText.substring(currentPos),
              });
            }
            break; // Exit the while loop
          }
        }
        newChildren.push(...processedNodes);
        buffer = []; // Clear the buffer
      };

      // Iterate through children of the paragraph
      for (const child of pNode.children) {
        if (isText(child)) {
          // Add text nodes to the buffer
          buffer.push(child);
        } else if (isElement(child)) {
          // If we encounter a non-text element (like <a>, <strong>, etc.)
          // first process any text collected in the buffer
          processBuffer();

          // If it's an existing link, we don't want to link inside it.
          // We just add the element as is.
          // For more complex cases (linking inside <strong> etc.), further logic would be needed.
          newChildren.push(child);

          // Prevent linking keywords that span across element boundaries
          // by ensuring the buffer is processed before adding the element.
        } else {
          // Handle other node types if necessary (e.g., comments)
          processBuffer(); // Process buffer before adding unknown node
          // Only add text or element nodes back, effectively filtering out comments etc.
          // newChildren.push(child as Text | Element); // Remove or comment out this line
        }
      }

      // Process any remaining text in the buffer after the loop
      processBuffer();

      // Replace the paragraph's children with the new processed children
      pNode.children = newChildren;

      return CONTINUE; // Continue visiting other paragraphs
    });
  };
};

export default rehypeInternalLinks;
