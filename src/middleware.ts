import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const { pathname } = request.nextUrl;

  // Check if the path starts with /fysioterapeut-artikler
  if (pathname.startsWith("/fysioterapeut-artikler")) {
    // Create the new URL by replacing the old path with the new one
    const newUrl = request.nextUrl.clone();
    newUrl.pathname = pathname.replace("/fysioterapeut-artikler", "/ordbog");

    // Return a 301 permanent redirect
    return NextResponse.redirect(newUrl, {
      status: 301,
    });
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: "/fysioterapeut-artikler/:path*",
};
