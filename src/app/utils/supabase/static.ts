// Static Supabase client for use in statically-rendered pages (ISR/SSG)
// Updated: 2025-02-14 - Created to avoid cookies() usage in static pages
// This client does NOT use cookies, so it won't force routes into dynamic rendering.
// Only suitable for anonymous/public data fetching (no user auth context).

import { createClient } from "@supabase/supabase-js";

export const createStaticClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
