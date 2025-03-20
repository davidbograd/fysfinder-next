import { MapPin, Award, Shield, CheckCircle } from "lucide-react";

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="w-full py-12 md:py-24 lg:py-32 bg-gray-50"
    >
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-logo-blue px-3 py-1 text-sm text-white">
              Funktioner
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Alt hvad du behøver for at udvikle din praksis
            </h2>
            <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Vores platform giver dig alle de værktøjer, du har brug for til at
              tiltrække flere patienter og administrere din online
              tilstedeværelse effektivt.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
          <div className="flex gap-4">
            <MapPin className="h-8 w-8 text-logo-blue" />
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Øget Synlighed</h3>
              <p className="text-gray-600">
                Vær blandt de første i søgeresultaterne, når patienter leder
                efter fysioterapi i dit område.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Award className="h-8 w-8 text-logo-blue" />
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Verificeret Badge</h3>
              <p className="text-gray-600">
                Skil dig ud med et verificeret badge, der viser patienter, at
                din klinik er legitim og pålidelig.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Shield className="h-8 w-8 text-logo-blue" />
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Profiltilpasning</h3>
              <p className="text-gray-600">
                Fremvis dine ydelser, personale, faciliteter og specialer med en
                fuldt tilpasselig profil.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <CheckCircle className="h-8 w-8 text-logo-blue" />
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Direkte Booking</h3>
              <p className="text-gray-600">
                Lad patienter booke tider direkte gennem din profil med vores
                integrerede bookingsystem.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
