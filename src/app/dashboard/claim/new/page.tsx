import { redirect } from "next/navigation";
import { createClient } from "@/app/utils/supabase/server";
import { CreateClinicRequestPage } from "@/components/dashboard/CreateClinicRequestPage";

interface CreateClaimNewPageProps {
  searchParams: Promise<{
    cityId?: string;
    cityName?: string;
    citySlug?: string;
    postalCode?: string;
  }>;
}

export default async function CreateClaimNewPage({
  searchParams,
}: CreateClaimNewPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  const mergedProfile = {
    full_name: profile?.full_name || "",
    email: profile?.email || user.email || "",
  };

  const initialCity =
    params.cityId && params.cityName && params.citySlug
      ? {
          id: params.cityId,
          name: params.cityName,
          slug: params.citySlug,
          postalCode: params.postalCode,
        }
      : null;

  return <CreateClinicRequestPage userProfile={mergedProfile} initialCity={initialCity} />;
}
