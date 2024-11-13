import { createClient } from "@/app/utils/supabase/server";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import Link from "next/link";
import { slugify } from "../utils/slugify";
import { Metadata } from "next";

interface SpecialtyWithCount {
  specialty_id: string;
  specialty_name: string;
  specialty_name_slug: string;
  clinic_count: number;
}

async function fetchSpecialtiesWithCounts(): Promise<SpecialtyWithCount[]> {
  const supabase = createClient();

  const { data, error } = await supabase.from("specialties").select(`
      specialty_id,
      specialty_name,
      specialty_name_slug,
      clinic_specialties(count)
    `);

  if (error) {
    console.error("Error fetching specialties:", error);
    throw new Error(`Failed to fetch specialties: ${error.message}`);
  }

  return data
    .map((specialty) => ({
      specialty_id: specialty.specialty_id,
      specialty_name: specialty.specialty_name,
      specialty_name_slug: specialty.specialty_name_slug,
      clinic_count: specialty.clinic_specialties[0]?.count || 0,
    }))
    .sort((a, b) => b.clinic_count - a.clinic_count);
}

export const metadata: Metadata = {
  title: "Find Fysioterapeut efter Speciale - FysFinder",
  description:
    "Se alle fysioterapi specialer og find den rette specialist til dine behov. FysFinder hjælper dig med at finde den bedste fysioterapeut.",
};

export default async function SpecialtiesPage() {
  try {
    const specialties = await fetchSpecialtiesWithCounts();

    const breadcrumbItems = [
      { text: "Forside", link: "/" },
      { text: "Specialer" },
    ];

    return (
      <div className="container mx-auto px-4">
        <Breadcrumbs items={breadcrumbItems} />

        <h1 className="text-3xl font-bold mb-4">
          Find fysioterapeut efter speciale
        </h1>

        <p className="text-gray-600 mb-8 max-w-[800px]">
          Vælg et speciale nedenfor for at finde fysioterapeuter med særlig
          ekspertise inden for det område, du søger behandling i.
        </p>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {specialties.map((specialty) =>
            specialty.clinic_count > 0 ? (
              <Link
                key={specialty.specialty_id}
                href={`/speciale/${specialty.specialty_name_slug}`}
                className="p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <h2 className="text-xl font-semibold mb-2">
                  {specialty.specialty_name}
                </h2>
                <p className="text-gray-600">
                  {specialty.clinic_count}{" "}
                  {specialty.clinic_count === 1 ? "klinik" : "klinikker"}
                </p>
              </Link>
            ) : (
              <div
                key={specialty.specialty_id}
                className="p-6 rounded-lg border border-gray-100 bg-gray-50 cursor-not-allowed"
              >
                <h2 className="text-xl font-semibold mb-2 text-gray-400">
                  {specialty.specialty_name}
                </h2>
                <p className="text-gray-400">Ingen klinikker endnu</p>
              </div>
            )
          )}
        </div>

        {/* SEO Content */}
        <div className="h-px bg-gray-200 my-16 max-w-[672px]" />
        <div className="max-w-[672px] space-y-12">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Specialiseret fysioterapi
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Fysioterapeuter kan specialisere sig inden for forskellige områder
              for at give den bedst mulige behandling til specifikke lidelser
              eller patientgrupper. Ved at vælge en fysioterapeut med det rette
              speciale, sikrer du dig at få behandling af en ekspert med særlig
              viden og erfaring inden for netop dit område.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Vælg det rette speciale
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Når du skal vælge en fysioterapeut, er det vigtigt at finde en,
              der har erfaring med netop din type skade eller lidelse. På
              FysFinder kan du nemt få overblik over fysioterapeuter med
              forskellige specialer og finde den rette behandler til dine behov.
            </p>
          </section>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return (
      <div className="text-red-500 font-bold text-center py-10">
        Error loading specialties: {(error as Error).message}
      </div>
    );
  }
}
