import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";
import { createUserProfile } from "@/app/actions/auth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Get user's email and metadata
      const userEmail = data.user.email;
      const userName = data.user.user_metadata?.full_name;

      // Check if profile exists, if not create it (this handles email verification flow)
      if (userEmail) {
        const { data: existingProfile } = await supabase
          .from("user_profiles")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle();

        // If no profile exists, create it (this will trigger the email notification)
        if (!existingProfile) {
          await createUserProfile({
            id: data.user.id,
            email: userEmail,
            full_name: userName || userEmail.split("@")[0], // Fallback to email username if no name
          }).catch((err) => {
            console.error("Error creating profile in callback:", err);
          });
        }
      }

      // Successful verification - redirect to dashboard or specified page
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If there's an error or no code, redirect to an error page or signin
  return NextResponse.redirect(`${origin}/auth/signin?error=callback_error`);
}

