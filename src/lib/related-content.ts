export type RelatedContentType =
  | "ordbog"
  | "blog"
  | "styrkeoevelser"
  /** Absolute site path for hubs/tools (e.g. /vaerktoejer, /mr-scanning). */
  | "page";

export type RelatedContentItem = {
  type: RelatedContentType;
  /**
   * Content slug for ordbog/blog/styrkeoevelser, or an absolute path for type "page"
   * (must start with "/").
   */
  slug: string;
  /** Display title; required in frontmatter for curated "Se også" links. */
  title: string;
};

export type ResolvedRelatedLink = {
  href: string;
  title: string;
};

const RELATED_TYPES = new Set<RelatedContentType>([
  "ordbog",
  "blog",
  "styrkeoevelser",
  "page",
]);

function hrefForRelatedItem(item: RelatedContentItem): string | null {
  switch (item.type) {
    case "ordbog":
      return `/ordbog/${item.slug}`;
    case "blog":
      return `/blog/${item.slug}`;
    case "styrkeoevelser":
      return `/styrkeoevelser/${item.slug}`;
    case "page":
      return item.slug.startsWith("/") ? item.slug : null;
  }
}

/**
 * Parses `related` frontmatter into typed items. Invalid entries are skipped.
 */
export function parseRelatedFrontmatter(data: unknown): RelatedContentItem[] {
  if (!data || typeof data !== "object") {
    return [];
  }

  const related = (data as { related?: unknown }).related;
  if (!Array.isArray(related)) {
    return [];
  }

  const items: RelatedContentItem[] = [];
  for (const entry of related) {
    if (!entry || typeof entry !== "object") {
      continue;
    }
    const { type, slug, title } = entry as Record<string, unknown>;
    if (
      typeof type !== "string" ||
      !RELATED_TYPES.has(type as RelatedContentType) ||
      typeof slug !== "string" ||
      !slug.trim() ||
      typeof title !== "string" ||
      !title.trim()
    ) {
      continue;
    }
    items.push({
      type: type as RelatedContentType,
      slug: slug.trim(),
      title: title.trim(),
    });
  }
  return items;
}

/**
 * Resolves related items to href/title pairs, dropping self-links and duplicates.
 */
export function resolveRelatedLinks(
  items: RelatedContentItem[],
  currentPagePath: string
): ResolvedRelatedLink[] {
  const seen = new Set<string>();
  const links: ResolvedRelatedLink[] = [];

  for (const item of items) {
    const href = hrefForRelatedItem(item);
    if (!href || href === currentPagePath || seen.has(href)) {
      continue;
    }
    seen.add(href);
    links.push({ href, title: item.title });
  }

  return links;
}
