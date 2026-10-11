// Per-specialty Open Graph image: clinic count, specialty, city and Fysfinder branding.
// Added: 2026-10-11

import { getLocationOgContent } from "@/lib/og/location-og-content";
import { LOCATION_OG_SIZE, renderLocationOgImage } from "@/lib/og/location-og-image";

export const revalidate = 86400;
export const alt = "Sammenlign fysioterapiklinikker på Fysfinder";
export const size = LOCATION_OG_SIZE;
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ location: string; specialty: string }>;
}) {
  const { location, specialty } = await params;
  const { text } = await getLocationOgContent(location, specialty);
  return renderLocationOgImage(text);
}
