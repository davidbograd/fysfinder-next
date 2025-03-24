import {
  ChartNoAxesCombined,
  BadgeCheck,
  Wand2,
  CalendarArrowUp,
} from "lucide-react";

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
              Alt-i-en platform
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Sådan får du flere patienter med FysFinder
            </h2>
            <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              FysFinder giver dig smarte værktøjer til nemt at tiltrække flere
              patienter.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
          <div className="flex gap-4">
            <ChartNoAxesCombined className="h-8 w-8 text-logo-blue" />
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Øget synlighed</h3>
              <p className="text-gray-600">
                Vær blandt de første i søgeresultaterne, når patienter leder
                efter fysioterapi i dit område.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <BadgeCheck className="h-8 w-8 text-logo-blue" />
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Verificeret badge</h3>
              <p className="text-gray-600">
                Skil dig ud med et verificeret badge, der viser patienter, at
                din klinik er legitim og pålidelig.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Wand2 className="h-8 w-8 text-logo-blue" />
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Profiltilpasning</h3>
              <p className="text-gray-600">
                Fremvis dine ydelser, personale, faciliteter og specialer med en
                fuldt tilpasselig profil.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <CalendarArrowUp className="h-8 w-8 text-logo-blue" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">Direkte booking</h3>
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-medium">
                  Premium
                </span>
              </div>
              <p className="text-gray-600">
                Lad patienter booke tider gennem din profil med link direkte til
                dit bookingsystem.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
