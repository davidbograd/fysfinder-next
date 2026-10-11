// Open Graph / Twitter metadata for find pages; the image comes from resolveFindOgImage.
// Updated: 2026-10-11 - Carries the per-page image so filtered URLs no longer share one image.

import type { Metadata } from "next";
import { OG_IMAGE_SIZE } from "@/lib/og/og-image-size";

export interface FindPageOgImage {
  url: string;
  alt: string;
}

export function buildFindPageSocialMetadata(
  title: string,
  description: string,
  image: FindPageOgImage
): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      title,
      description,
      type: "website",
      locale: "da_DK",
      siteName: "Fysfinder",
      images: [{ ...image, ...OG_IMAGE_SIZE }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
