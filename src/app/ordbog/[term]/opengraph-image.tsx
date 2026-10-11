// Per-article Open Graph image for the ordbog: "Ordbog" label plus the article title.
// Added: 2026-10-11

import { notFound } from "next/navigation";
import { getDictionaryTerm } from "@/lib/dictionary";
import { renderBrandOgImage } from "@/lib/og/brand-og-image";
import { OG_IMAGE_SIZE } from "@/lib/og/og-image-size";
import { ordbogOgContent } from "@/lib/og/ordbog-og-content";

export const alt = "Artikel fra Fysfinders ordbog";
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

/** The slug becomes a file path in getDictionaryTerm, so only plain slugs are read. */
const SLUG_PATTERN = /^[a-z0-9-]{1,100}$/;

/** Without this Next serves the image with max-age=0, so every crawler hit re-renders it. */
const CACHE_CONTROL = "public, max-age=3600, s-maxage=604800, stale-while-revalidate=2592000";

export default async function Image({
  params,
}: {
  params: Promise<{ term: string }>;
}) {
  const { term: slug } = await params;
  if (!SLUG_PATTERN.test(slug)) notFound();

  const term = await getDictionaryTerm(slug).catch(() => null);
  if (!term) notFound();

  return renderBrandOgImage(ordbogOgContent(term.title), {
    "Cache-Control": CACHE_CONTROL,
  });
}
