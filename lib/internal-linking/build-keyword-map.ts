import type { LinkConfig, LinkMapping } from "./types";
import {
  ordbogBodyPartSlugFromDestination,
  styrkeoevelserBodyPartSlugFromDestination,
} from "./body-part-overlap";

/**
 * Builds the keyword → mapping lookup used by rehypeInternalLinks.
 *
 * Category order (last write wins):
 * - On /styrkeoevelser/*: ordbog/blog/location/misc first, then styrkeoevelser
 * - Elsewhere: styrkeoevelser first, then ordbog/blog/location/misc
 *
 * Silo pass for overlapping body-part head terms:
 * - On /styrkeoevelser/*: remap /ordbog/{bodyPart} → /styrkeoevelser/{bodyPart}
 * - Elsewhere: remap /styrkeoevelser/{bodyPart} → /ordbog/{bodyPart}
 *
 * Specific non-overlap terms (e.g. skuldersmerter, kropsholdning, named exercises)
 * are left unchanged so intentional cross-universe links still work.
 */
export function buildKeywordMap(
  linkConfig: LinkConfig,
  currentPagePath: string
): Map<string, LinkMapping> {
  const keywordMap = new Map<string, LinkMapping>();
  const onStyrkeoevelser = currentPagePath.startsWith("/styrkeoevelser");
  const categoryOrder: string[] = onStyrkeoevelser
    ? ["ordbog", "blog", "location", "misc", "styrkeoevelser"]
    : ["styrkeoevelser", "ordbog", "blog", "location", "misc"];

  for (const category of categoryOrder) {
    const mappings = linkConfig.linkMappings[category];
    if (!mappings) {
      continue;
    }
    for (const mapping of mappings) {
      for (const keyword of mapping.keywords) {
        keywordMap.set(keyword.toLowerCase(), mapping);
      }
    }
  }

  applyBodyPartSilo(keywordMap, onStyrkeoevelser);
  return keywordMap;
}

function applyBodyPartSilo(
  keywordMap: Map<string, LinkMapping>,
  onStyrkeoevelser: boolean
): void {
  for (const [keyword, mapping] of keywordMap) {
    if (onStyrkeoevelser) {
      const slug = ordbogBodyPartSlugFromDestination(mapping.destination);
      if (slug) {
        keywordMap.set(keyword, {
          keywords: mapping.keywords,
          destination: `/styrkeoevelser/${slug}`,
        });
      }
      continue;
    }

    const slug = styrkeoevelserBodyPartSlugFromDestination(
      mapping.destination
    );
    if (slug) {
      keywordMap.set(keyword, {
        keywords: mapping.keywords,
        destination: `/ordbog/${slug}`,
      });
    }
  }
}
