import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  console.log("🔥 MIDDLEWARE EXECUTED for:", request.nextUrl.pathname);

  // Only handle search-v2 find routes
  if (!request.nextUrl.pathname.startsWith("/search-v2/find/")) {
    console.log("❌ Not a search-v2 route, skipping");
    return NextResponse.next();
  }

  console.log("✅ Processing search-v2 route");

  const searchParams = request.nextUrl.searchParams;

  // Only process if we have both parameters
  const handicap = searchParams.get("handicap");
  const ydernummer = searchParams.get("ydernummer");

  console.log("Parameters:", { handicap, ydernummer });

  if (!handicap && !ydernummer) {
    console.log("❌ No parameters to process");
    return NextResponse.next();
  }

  // Build canonical parameter string
  const canonicalParams = new URLSearchParams();

  // Add in alphabetical order
  if (handicap) {
    canonicalParams.set("handicap", handicap);
  }
  if (ydernummer) {
    canonicalParams.set("ydernummer", ydernummer);
  }

  const currentParamString = searchParams.toString();
  const canonicalParamString = canonicalParams.toString();

  console.log("Current params:", currentParamString);
  console.log("Canonical params:", canonicalParamString);

  // Check if redirect is needed
  if (currentParamString !== canonicalParamString) {
    const redirectUrl = new URL(request.url);
    redirectUrl.search = canonicalParamString;

    console.log(`🔄 Redirecting: ${request.url} → ${redirectUrl.toString()}`);

    return NextResponse.redirect(redirectUrl, 301);
  }

  console.log("✅ Parameters already canonical");
  return NextResponse.next();
}

export const config = {
  matcher: "/search-v2/find/:path*",
};
