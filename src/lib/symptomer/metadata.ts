// Added: 2026-09-07 - Shared metadata builder for symptom pages: self-referencing canonical plus OG/Twitter, following the styrkeoevelser pattern.

import type { Metadata } from "next";
import { DEFAULT_SYMPTOMER_OG_IMAGE, SYMPTOMER_SITE_URL } from "./constants";

interface SymptomerMetadataInput {
  title: string;
  description: string;
  /** Site-relative path, e.g. `/symptomer/knae`. */
  path: string;
  imageAlt?: string;
}

export function buildSymptomerMetadata({
  title,
  description,
  path,
  imageAlt = "Fysfinder – symptomer og smerter",
}: SymptomerMetadataInput): Metadata {
  const canonical = `${SYMPTOMER_SITE_URL}${path}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      siteName: "Fysfinder",
      locale: "da_DK",
      images: [
        {
          url: DEFAULT_SYMPTOMER_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_SYMPTOMER_OG_IMAGE],
    },
  };
}
