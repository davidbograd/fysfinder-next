// Delbart story-billede af terminen fra terminsberegneren.

import { NextRequest } from "next/server";
import { parseDueDateShareParams } from "@/lib/og/due-date-share";
import { renderDueDateShareImage } from "@/lib/og/due-date-share-image";

const CACHE_CONTROL = "public, max-age=86400, s-maxage=604800, immutable";

export async function GET(request: NextRequest) {
  const content = parseDueDateShareParams(request.nextUrl.searchParams);
  if (!content) {
    return new Response("Invalid due date", { status: 400 });
  }

  return renderDueDateShareImage(content, { "Cache-Control": CACHE_CONTROL });
}
