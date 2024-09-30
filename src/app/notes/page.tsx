import { createClient } from "@/app/utils/supabase/server";
import ClinicCard from "../components/ClinicCard";
import Link from "next/link";
import { slugify } from "../utils/slugify"; // Assuming you have this utility function

export default async function Notes() {
  const supabase = createClient();

  // Fetch clinics with lokation "Amager"
  const { data: clinics, error } = await supabase
    .from("clinics")
    .select("*")
    .eq("lokation", "Amager");

  if (error) {
    console.error("Error fetching clinics:", error);
    return <div>Error loading clinics</div>;
  }

  // Fetch total count of clinics with lokation "Amager"
  const { count } = await supabase
    .from("clinics")
    .select("*", { count: "exact", head: true })
    .eq("lokation", "Amager");

  // Fetch unique suburbs and their clinic counts
  const { data: suburbs, error: suburbsError } = await supabase
    .from("clinics")
    .select("lokation")
    .order("lokation")
    .then(({ data }) => {
      if (!data) return { data: [] };
      const suburbCounts = data.reduce((acc, { lokation }) => {
        acc[lokation] = (acc[lokation] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      return { data: Object.entries(suburbCounts) };
    });

  if (suburbsError) {
    console.error("Error fetching suburbs:", suburbsError);
  }

  return (
    <div className="container mx-auto px-4">
      <p className="text-2xl font-bold mb-6">
        Total clinics in Amager are {count ?? 0}.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {clinics.map((clinic) => (
          <ClinicCard
            key={clinic.id}
            klinikNavn={clinic.klinikNavn}
            antalBehandlere={clinic.antalBehandlere}
            ydernummer={clinic.ydernummer}
            avgRating={clinic.avgRating}
            ratingCount={clinic.ratingCount}
          />
        ))}
      </div>

      {/* New section for suburbs */}
      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-6">All Suburbs</h2>
        <ul className="space-y-4">
          {suburbs?.map(([suburb, count]) => (
            <li key={suburb}>
              <Link
                href={`/${slugify(suburb)}`}
                className="block bg-white border p-6 rounded-md hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xl sm:text-2xl font-bold text-slate-800">
                    {suburb}
                  </span>
                  <span className="text-slate-600">{count} klinikker</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
