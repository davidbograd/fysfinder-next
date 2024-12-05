import { createClient } from "@/app/utils/supabase/server";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { deslugify } from "@/app/utils/slugify";
import { Metadata } from "next";
import Link from "next/link";
import ClinicCard from "@/app/components/ClinicCard";
import { Clinic } from "@/app/types";

interface Specialty {
  specialty_id: string;
  specialty_name: string;
  specialty_seo_text: Array<{
    headline: string;
    paragraph: string;
  }>;
}

async function fetchSpecialtyAndClinics(specialtySlug: string): Promise<{
  specialty: Specialty | null;
  clinics: Clinic[];
}> {
  const supabase = createClient();

  // First get the specialty
  const { data: specialty, error: specialtyError } = await supabase
    .from("specialties")
    .select("specialty_id, specialty_name, specialty_seo_text")
    .eq("specialty_name_slug", specialtySlug)
    .single();

  if (specialtyError) {
    console.error("Error fetching specialty:", specialtyError);
    throw new Error(`Failed to fetch specialty: ${specialtyError.message}`);
  }

  if (!specialty) {
    return { specialty: null, clinics: [] };
  }

  // Then get clinics with this specialty
  const { data: clinics, error: clinicsError } = await supabase
    .from("clinics")
    .select(
      `
      *,
      clinic_specialties!inner(specialty_id)
    `
    )
    .eq("clinic_specialties.specialty_id", specialty.specialty_id);

  if (clinicsError) {
    console.error("Error fetching clinics:", clinicsError);
    throw new Error(`Failed to fetch clinics: ${clinicsError.message}`);
  }

  return {
    specialty,
    clinics: clinics || [],
  };
}

export async function generateMetadata({
  params,
}: {
  params: { specialtyName: string };
}): Promise<Metadata> {
  const { specialty } = await fetchSpecialtyAndClinics(params.specialtyName);
  const specialtyName =
    specialty?.specialty_name || deslugify(params.specialtyName);

  return {
    title: `Find Fysioterapeut med speciale i ${specialtyName} - FysFinder`,
    description: `Find fysioterapeuter der er specialiseret i ${specialtyName}. FysFinder hjælper dig med at finde den rette specialist til dine behov.`,
  };
}

export default async function SpecialtyPage({
  params,
}: {
  params: { specialtyName: string };
}) {
  try {
    const { specialty, clinics } = await fetchSpecialtyAndClinics(
      params.specialtyName
    );
    const specialtyName =
      specialty?.specialty_name || deslugify(params.specialtyName);

    const breadcrumbItems = [
      { text: "Forside", link: "/" },
      { text: "Specialer", link: "/specialer" },
      { text: specialtyName },
    ];

    return (
      <div className="container mx-auto px-4">
        <Breadcrumbs items={breadcrumbItems} />

        <h1 className="text-3xl font-bold mb-4">
          Fysioterapeuter med speciale i {specialtyName}
        </h1>

        <p className="text-gray-600 mb-8 max-w-[800px]">
          Fysfinder hjælper dig med at finde en fysioterapeut, der er
          specialiseret i {specialtyName.toLowerCase()}. Se anmeldelser, priser
          og find den rette specialist til dine behov.
        </p>

        {clinics.length > 0 && (
          <h3 className="text-sm text-gray-500 mb-4">
            {clinics.length} fysioterapi klinikker fundet
          </h3>
        )}

        {clinics.length > 0 ? (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {clinics.map((clinic) => (
              <Link
                key={clinic.clinics_id}
                href={`/${clinic.lokationSlug}/${clinic.klinikNavnSlug}`}
              >
                <ClinicCard
                  klinikNavn={clinic.klinikNavn}
                  ydernummer={clinic.ydernummer}
                  avgRating={clinic.avgRating}
                  ratingCount={clinic.ratingCount}
                  adresse={clinic.adresse}
                  postnummer={clinic.postnummer}
                  lokation={clinic.lokation}
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-8">
            <p className="text-gray-600">
              Vi har i øjeblikket ingen fysioterapeuter registreret med speciale
              i {specialtyName.toLowerCase()}.
            </p>
            <p className="text-gray-600 mt-2">
              <Link href="/specialer" className="text-blue-600 hover:underline">
                Gå tilbage til oversigten over specialer
              </Link>
            </p>
          </div>
        )}

        {/* SEO Content Section */}
        {specialty?.specialty_seo_text &&
          specialty.specialty_seo_text.length > 0 && (
            <>
              <div className="h-px bg-gray-200 my-16 max-w-[672px]" />
              <section className="max-w-[672px]">
                {specialty.specialty_seo_text.map((section, index) => (
                  <div key={index} className="mb-12">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      {section.headline}
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      {section.paragraph}
                    </p>
                  </div>
                ))}
              </section>
            </>
          )}
      </div>
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return (
      <div className="text-red-500 font-bold text-center py-10">
        Error loading specialty: {(error as Error).message}
      </div>
    );
  }
}
