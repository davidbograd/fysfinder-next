import {
  ChartNoAxesCombined,
  BadgeCheck,
  Eye,
  MessageSquare,
} from "lucide-react";

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="w-full bg-background py-16 md:py-20"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="space-y-3">
            <h2 className="text-[2rem] font-semibold leading-tight text-[#1f2b28]">
              Sådan får du flere patienter - helt gratis
            </h2>
            <p className="max-w-3xl text-gray-600">
              Fysfinder gør din fysioterapeutklinik synlig, når patienter søger
              efter fysioterapi i dit område.
            </p>
          </div>
        </div>
        <div className="grid max-w-5xl items-center gap-6 lg:grid-cols-2 lg:gap-12">
          <div className="flex gap-4">
            <Eye className="h-8 w-8 text-logo-blue" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-[#1f2b28]">
                Bliv fundet først
              </h3>
              <p className="text-gray-600">
                Vær synlig når patienter søger efter fysioterapi i dit område -
                ikke gemt bag store kæder.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <BadgeCheck className="h-8 w-8 text-logo-blue" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-[#1f2b28]">
                Skab tillid med det samme
              </h3>
              <p className="text-gray-600">
                En professionel profil og verificeret badge gør det nemt for
                patienter at vælge dig.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <ChartNoAxesCombined className="h-8 w-8 text-logo-blue" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-[#1f2b28]">
                Vis hvad du tilbyder
              </h3>
              <p className="text-gray-600">
                Fremhæv dine ydelser, specialer og faciliteter, så patienter ved
                hvorfor de skal vælge netop dig.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <MessageSquare className="h-8 w-8 text-logo-blue" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-[#1f2b28]">
                Få henvendelser direkte
              </h3>
              <p className="text-gray-600">
                Patienter kan kontakte dig eller booke direkte via din profil.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
