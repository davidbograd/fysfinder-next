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
}

async function fetchSpecialtyAndClinics(specialtySlug: string): Promise<{
  specialty: Specialty | null;
  clinics: Clinic[];
}> {
  const supabase = createClient();

  // First get the specialty
  const { data: specialty, error: specialtyError } = await supabase
    .from("specialties")
    .select("*")
    .eq("specialty_name", deslugify(specialtySlug))
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
      { text: `Speciale i ${specialtyName}` },
    ];

    return (
      <div className="container mx-auto px-4">
        <Breadcrumbs items={breadcrumbItems} />

        <h1 className="text-3xl font-bold mb-4">
          {clinics.length} fysioterapeuter med speciale i {specialtyName}
        </h1>

        <p className="text-gray-600 mb-8 max-w-[800px]">
          Fysfinder hjælper dig med at finde en fysioterapeut, der er
          specialiseret i {specialtyName.toLowerCase()}. Se anmeldelser, priser
          og find den rette specialist til dine behov.
        </p>

        {/* Clinics list */}
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
          <div className="py-8 text-gray-600">
            <p>Vi arbejder på at tilføje fysioterapeuter med dette speciale.</p>
          </div>
        )}

        {/* SEO Content */}
        <div className="h-px bg-gray-200 my-16 max-w-[672px]" />
        <div className="max-w-[672px] space-y-12">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Hvad er {specialtyName.toLowerCase()}?
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Dette speciale fokuserer på behandling og forebyggelse gennem
              specialiserede teknikker og metoder. En fysioterapeut med speciale
              i {specialtyName.toLowerCase()} har særlig ekspertise og erfaring
              inden for dette område.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Hvorfor vælge en specialist i {specialtyName.toLowerCase()}?
            </h2>
            <p className="text-gray-600 leading-relaxed">
              At vælge en fysioterapeut med speciale i{" "}
              {specialtyName.toLowerCase()} kan give dig adgang til mere
              målrettet og effektiv behandling. Specialister har typisk
              gennemgået ekstra uddannelse og har omfattende erfaring inden for
              deres felt.
            </p>
          </section>
        </div>
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
