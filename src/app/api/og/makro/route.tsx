// Delbart story-billede af kaloriemål og makroer fra makroberegneren.

import { NextRequest } from "next/server";
import { parseMacroShareParams } from "@/lib/og/macro-share";
import { renderMacroShareImage } from "@/lib/og/macro-share-image";

const CACHE_CONTROL = "public, max-age=86400, s-maxage=604800, immutable";

export async function GET(request: NextRequest) {
  const content = parseMacroShareParams(request.nextUrl.searchParams);
  if (!content) {
    return new Response("Invalid macros", { status: 400 });
  }

  return renderMacroShareImage(content, { "Cache-Control": CACHE_CONTROL });
}
