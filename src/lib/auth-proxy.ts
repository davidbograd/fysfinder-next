// Decides when the Next.js proxy should refresh a Supabase auth session.
// Updated: 2026-09-06 - Skip session refresh on anonymous public HTML requests.

const AUTH_ENTRY_PATHS = ["/auth/signin", "/auth/signup"];

export function shouldRefreshAuthSession(
  pathname: string,
  cookies: Array<{ name: string }>
): boolean {
  if (pathname.startsWith("/dashboard")) return true;
  if (AUTH_ENTRY_PATHS.some((path) => pathname.startsWith(path))) return true;
  return cookies.some((cookie) => cookie.name.includes("auth-token"));
}
