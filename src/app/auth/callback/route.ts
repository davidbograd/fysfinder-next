import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Successful verification - redirect to dashboard or specified page
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If there's an error or no code, redirect to an error page or signin
  return NextResponse.redirect(`${origin}/auth/signin?error=callback_error`);
}

