import { fetchCitiesWithCounts } from "@/app/utils/cityUtils";

export async function StatsSection() {
  const cities = await fetchCitiesWithCounts();
  const totalClinics = cities.reduce((sum, city) => sum + city.clinic_count, 0);

  return (
    <section className="w-full bg-white">
      <div className="container px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <h3 className="text-4xl font-bold">2.000+</h3>
            <p className="text-gray-600">månedlige besøgende</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-4xl font-bold">{totalClinics}</h3>
            <p className="text-gray-600">Registrerede klinikker</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-4xl font-bold">700+</h3>
            <p className="text-gray-600">månedlige patienthenvendelser</p>
          </div>
        </div>
      </div>
    </section>
  );
}
