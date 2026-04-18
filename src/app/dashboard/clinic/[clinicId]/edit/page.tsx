import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/app/utils/supabase/server";
import { getClinicForEdit, getAllSpecialties, getAllInsurances, getClinicTeamMembers } from "@/app/actions/clinic-management";
import { EditClinicForm } from "@/components/dashboard/EditClinicForm";
import { EditClinicHeaderActions } from "@/components/dashboard/EditClinicHeaderActions";

interface EditClinicPageProps {
  params: Promise<{ clinicId: string }>;
}

export default async function EditClinicPage({ params }: EditClinicPageProps) {
  const { clinicId } = await params;
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // Get clinic data
  const clinicResult = await getClinicForEdit(clinicId);
  if (clinicResult.error || !clinicResult.clinic) {
    redirect("/dashboard");
  }

  const clinic = clinicResult.clinic as any;

  // Get specialties, insurances, and team members for the form
  const specialtiesResult = await getAllSpecialties();
  const insurancesResult = await getAllInsurances();
  const teamMembersResult = await getClinicTeamMembers(clinicId);

  const specialties = specialtiesResult.specialties || [];
  const insurances = insurancesResult.insurances || [];
  const teamMembers = teamMembersResult.teamMembers || [];

  return (
    <div className="py-8 w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          Tilbage til dashboard
        </Link>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Rediger din klinik
          </h1>
          <EditClinicHeaderActions clinicId={clinicId} clinicName={clinic.klinikNavn} />
        </div>
      </div>

      <EditClinicForm
        clinic={clinic}
        specialties={specialties}
        insurances={insurances}
        teamMembers={teamMembers}
      />
    </div>
  );
}

