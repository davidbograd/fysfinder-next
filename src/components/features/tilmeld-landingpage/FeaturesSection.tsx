import {
  ChartNoAxesCombined,
  BadgeCheck,
  Eye,
  MessageSquare,
} from "lucide-react";

export function FeaturesSection() {
  return (
    <section id="features" className="w-full bg-background py-16 md:py-20">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8">
        <div className="mb-10 space-y-3">
          <h2 className="text-[2rem] font-semibold leading-tight text-[#1f2b28]">
            Få flere patienter - helt gratis
          </h2>
          <p className="max-w-3xl text-gray-600">
            Fysfinder gør din fysioterapeutklinik synlig, når patienter søger
            efter fysioterapi i dit område.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="rounded-2xl bg-[#f3f1ea] p-5 space-y-3">
            <Eye className="h-6 w-6 text-gray-500/80" />
            <h3 className="text-xl font-semibold text-[#1f2b28]">
              Bliv fundet først
            </h3>
            <p className="text-gray-600">
              Vær synlig når patienter søger efter fysioterapi i dit område -
              ikke gemt bag store kæder.
            </p>
          </div>
          <div className="rounded-2xl bg-[#f3f1ea] p-5 space-y-3">
            <BadgeCheck className="h-6 w-6 text-gray-500/80" />
            <h3 className="text-xl font-semibold text-[#1f2b28]">
              Skab tillid med det samme
            </h3>
            <p className="text-gray-600">
              En professionel profil og verificeret badge gør det nemt for
              patienter at vælge dig.
            </p>
          </div>
          <div className="rounded-2xl bg-[#f3f1ea] p-5 space-y-3">
            <ChartNoAxesCombined className="h-6 w-6 text-gray-500/80" />
            <h3 className="text-xl font-semibold text-[#1f2b28]">
              Vis hvad du tilbyder
            </h3>
            <p className="text-gray-600">
              Fremhæv dine ydelser, specialer og faciliteter, så patienter ved
              hvorfor de skal vælge netop dig.
            </p>
          </div>
          <div className="rounded-2xl bg-[#f3f1ea] p-5 space-y-3">
            <MessageSquare className="h-6 w-6 text-gray-500/80" />
            <h3 className="text-xl font-semibold text-[#1f2b28]">
              Få henvendelser direkte
            </h3>
            <p className="text-gray-600">
              Patienter kan kontakte dig eller booke direkte via din profil.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
