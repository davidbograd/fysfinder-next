// Text for ordbog Open Graph images.
// Added: 2026-10-11

import type { BrandOgImageContent } from "@/lib/og/brand-og-image";

/** Short terms ("Knæ") read better large; long titles drop a size to stay within three lines. */
const SHORT_TITLE_LENGTH = 28;

export function ordbogOgContent(title: string): BrandOgImageContent {
  return {
    label: "Ordbog",
    lines: [title],
    fontSize: title.length <= SHORT_TITLE_LENGTH ? 72 : 60,
  };
}
