// Download-billede af resultatet fra værktøjerne i src/lib/og/tool-share.ts.

import { NextRequest } from "next/server";
import { parseToolShareParams } from "@/lib/og/tool-share";
import { renderToolShareImage } from "@/lib/og/tool-share-image";

const CACHE_CONTROL = "public, max-age=86400, s-maxage=604800, immutable";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tool: string }> }
) {
  const { tool } = await params;
  const card = parseToolShareParams(tool, request.nextUrl.searchParams);
  if (!card) {
    return new Response("Invalid result", { status: 400 });
  }

  return renderToolShareImage(card, { "Cache-Control": CACHE_CONTROL });
}
