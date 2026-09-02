// Admin-only page for managing which clinics have premium.
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/app/utils/supabase/server";
import { AdminPremiumSection } from "@/components/dashboard/AdminPremiumSection";
import { isAdminEmail } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Premium-abonnementer",
};

export default async function AdminPremiumPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  return (
    <div className="w-full py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Premium-abonnementer
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Se alle klinikker med premium, og tilføj eller fjern adgang manuelt.
        </p>
      </div>

      <AdminPremiumSection />
    </div>
  );
}
