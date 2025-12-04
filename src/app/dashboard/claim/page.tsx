import { redirect } from "next/navigation";
import { createClient } from "@/app/utils/supabase/server";
import { ClaimClinicPage } from "@/components/dashboard/ClaimClinicPage";

export default async function ClaimPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // Get user profile for pre-filling form
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  return <ClaimClinicPage userProfile={profile} />;
}

