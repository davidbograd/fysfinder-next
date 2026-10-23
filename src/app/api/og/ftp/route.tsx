// Delbart story-billede af FTP og wattzoner fra FTP-beregneren.

import { NextRequest } from "next/server";
import { parseFtpShareParams } from "@/lib/og/cycling-share";
import { renderFtpShareImage } from "@/lib/og/cycling-share-image";

const CACHE_CONTROL = "public, max-age=86400, s-maxage=604800, immutable";

export async function GET(request: NextRequest) {
  const content = parseFtpShareParams(request.nextUrl.searchParams);
  if (!content) {
    return new Response("Invalid FTP", { status: 400 });
  }

  return renderFtpShareImage(content, { "Cache-Control": CACHE_CONTROL });
}
