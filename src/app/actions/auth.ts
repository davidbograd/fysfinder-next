"use server";

import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/app/utils/supabase/server";

export const createUserProfile = async (data: {
  id: string;
  email: string;
  full_name: string;
}) => {
  try {
    // Use service role key to bypass RLS for initial profile creation
    // This is safe because we only call this right after signup with the user's own ID
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from("user_profiles").insert({
      id: data.id,
      email: data.email,
      full_name: data.full_name,
    });

    if (error) {
      console.error("Error creating user profile:", error);
      return { error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error in createUserProfile:", err);
    return { error: "Failed to create profile" };
  }
};

/**
 * Resend verification email to the current user
 */
export const resendVerificationEmail = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Ikke logget ind" };
  }

  if (user.email_confirmed_at) {
    return { error: "Email er allerede verificeret" };
  }

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: user.email!,
  });

  if (error) {
    return { error: "Kunne ikke sende verificeringsmail. Prøv igen senere." };
  }

  return { success: true };
};

