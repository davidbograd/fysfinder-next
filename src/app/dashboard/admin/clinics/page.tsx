import { redirect } from "next/navigation";
import { createClient } from "@/app/utils/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { VerifiedClinicsList } from "@/components/dashboard/VerifiedClinicsList";

export default async function AdminClinicsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // Check if user is admin
  const isAdmin = isAdminEmail(user.email);

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="py-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Verificerede klinikker
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Alle verificerede klinikker i systemet
        </p>
      </div>

      <VerifiedClinicsList />
    </div>
  );
}

