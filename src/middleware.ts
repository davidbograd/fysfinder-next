import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // Handle Supabase auth session refresh for all routes
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

  // Refresh session if expired
  await supabase.auth.getUser();

  // Handle search-v2 find routes (existing logic)
  if (request.nextUrl.pathname.startsWith("/search-v2/find/")) {
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

  // Protect dashboard route - require authentication
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const redirectUrl = new URL("/auth/signin", request.url);
      redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Redirect authenticated users away from auth pages
  if (
    request.nextUrl.pathname.startsWith("/auth/signin") ||
    request.nextUrl.pathname.startsWith("/auth/signup")
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

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
