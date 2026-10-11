// Open Graph / Twitter text for find pages; the image itself comes from opengraph-image.tsx.
// Added: 2026-10-11

import type { Metadata } from "next";

export function buildFindPageSocialMetadata(
  title: string,
  description: string
): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      title,
      description,
      type: "website",
      locale: "da_DK",
      siteName: "Fysfinder",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
