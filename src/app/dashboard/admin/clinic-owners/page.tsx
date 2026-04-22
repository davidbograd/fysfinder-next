// Admin-only page that hosts the clinic ownership management tool.
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/app/utils/supabase/server";
import { AdminClinicOwnershipSection } from "@/components/dashboard/AdminClinicOwnershipSection";
import { isAdminEmail } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Klinik-ejerskab",
};

export default async function AdminClinicOwnersPage() {
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
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Klinik-ejerskab</h1>
        <p className="mt-2 text-sm text-gray-600">
          Tildel eller overdrag ejerskab, så hver klinik har præcis én ejer.
        </p>
      </div>

      <AdminClinicOwnershipSection />
    </div>
  );
}
