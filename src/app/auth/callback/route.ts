import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";
import { createUserProfile } from "@/app/actions/auth";

export async function GET(request: Request) {
  const isDev = process.env.NODE_ENV === "development";
  const t0 = isDev ? performance.now() : 0;

  const logTiming = (label: string) => {
    if (!isDev) return;
    console.log(
      `[auth/callback] ${label}: +${(performance.now() - t0).toFixed(0)}ms (total)`
    );
  };

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/auth/verify";
  const oauthError = searchParams.get("error");
  const oauthErrorCode = searchParams.get("error_code");

  if (isDev) {
    console.log("[auth/callback] hit", {
      origin,
      hasCode: Boolean(code),
      next,
      oauthError,
      oauthErrorCode,
    });
  }

  // Second request after a successful exchange, or email scanners hitting the link:
  // Supabase returns error=access_denied&error_code=otp_expired (link already used / expired).
  if (!code && (oauthError || oauthErrorCode)) {
    const verifyParams = new URLSearchParams();
    verifyParams.set(
      "callbackError",
      oauthErrorCode || oauthError || "unknown"
    );
    if (isDev) {
      console.warn(
        "[auth/callback] OAuth-style error from Supabase (often harmless if login already succeeded):",
        oauthErrorCode || oauthError
      );
    }
    return NextResponse.redirect(
      `${origin}/auth/verify?${verifyParams.toString()}`
    );
  }

  if (code) {
    const supabase = await createClient();
    logTiming("after createClient");

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    logTiming("after exchangeCodeForSession");

    if (error && isDev) {
      console.error("[auth/callback] exchangeCodeForSession error:", error.message);
    }

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
        logTiming("after user_profiles lookup");

        // If no profile exists, create it (this will trigger the email notification)
        if (!existingProfile) {
          await createUserProfile({
            id: data.user.id,
            email: userEmail,
            full_name: userName || userEmail.split("@")[0], // Fallback to email username if no name
          }).catch((err) => {
            console.error("Error creating profile in callback:", err);
          });
          logTiming("after createUserProfile (includes admin email if configured)");
        }
      }

      // Successful verification - redirect to dashboard or specified page
      logTiming("before redirect");
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  if (isDev) {
    console.warn("[auth/callback] falling through to signin (no valid code/session)", {
      hasCode: Boolean(code),
    });
  }

  return NextResponse.redirect(`${origin}/auth/signin?error=callback_error`);
}

