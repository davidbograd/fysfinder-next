// Open Graph image for city and city + specialty find pages, plus Danmark ?online / ?ydernummer.
// Added: 2026-10-11

import { NextRequest } from "next/server";
import { parseFilters } from "@/app/find/fysioterapeut/filter-utils";
import { getLocationOgText, hasGeneratedOgImage } from "@/lib/og/location-og-content";
import { renderLocationOgImage } from "@/lib/og/location-og-image";

/** Slugs are interpolated into Supabase REST URLs, so anything else is rejected. */
const SLUG_PATTERN = /^[a-z0-9_-]{1,80}$/;

const CACHE_CONTROL = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const location = searchParams.get("location") ?? "";
  const specialty = searchParams.get("specialty") ?? undefined;

  if (!SLUG_PATTERN.test(location) || (specialty && !SLUG_PATTERN.test(specialty))) {
    return new Response("Invalid location or specialty", { status: 400 });
  }

  const filters = parseFilters(Object.fromEntries(searchParams));
  if (!hasGeneratedOgImage(location, specialty, filters)) {
    return new Response("No generated image for this filter combination", { status: 404 });
  }

  const text = await getLocationOgText(location, specialty, filters);
  return renderLocationOgImage(text, { "Cache-Control": CACHE_CONTROL });
}
