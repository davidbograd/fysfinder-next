// Delbart story-billede af watt pr. kg og niveauet fra watt pr. kg-beregneren.

import { NextRequest } from "next/server";
import { parseWattPerKgShareParams } from "@/lib/og/cycling-share";
import { renderWattPerKgShareImage } from "@/lib/og/cycling-share-image";

const CACHE_CONTROL = "public, max-age=86400, s-maxage=604800, immutable";

export async function GET(request: NextRequest) {
  const content = parseWattPerKgShareParams(request.nextUrl.searchParams);
  if (!content) {
    return new Response("Invalid watt per kg", { status: 400 });
  }

  return renderWattPerKgShareImage(content, { "Cache-Control": CACHE_CONTROL });
}
