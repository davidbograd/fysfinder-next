// Next.js proxy: session refresh, dashboard protection, and auth-page redirects.
// Updated: 2026-09-06 - Skip Supabase getUser on anonymous public HTML requests.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { shouldRefreshAuthSession } from "@/lib/auth-proxy";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // DEV-ONLY: handle isolated search-v2 find route canonicalization.
  if (pathname.startsWith("/search-v2/find/")) {
    const searchParams = request.nextUrl.searchParams;
    const handicap = searchParams.get("handicap");
    const ydernummer = searchParams.get("ydernummer");

    if (handicap || ydernummer) {
      const canonicalParams = new URLSearchParams();
      if (handicap) {
        canonicalParams.set("handicap", handicap);
      }
      if (ydernummer) {
        canonicalParams.set("ydernummer", ydernummer);
      }

      const currentParamString = searchParams.toString();
      const canonicalParamString = canonicalParams.toString();

      if (currentParamString !== canonicalParamString) {
        const redirectUrl = new URL(request.url);
        redirectUrl.search = canonicalParamString;
        return NextResponse.redirect(redirectUrl, 301);
      }
    }
  }

  if (!shouldRefreshAuthSession(pathname, request.cookies.getAll())) {
    return NextResponse.next();
  }

  // Handle Supabase auth session refresh for dashboard, auth pages, and signed-in users.
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect dashboard route - require authentication
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const redirectUrl = new URL("/auth/signin", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Redirect authenticated users away from auth pages
  if (pathname.startsWith("/auth/signin") || pathname.startsWith("/auth/signup")) {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
