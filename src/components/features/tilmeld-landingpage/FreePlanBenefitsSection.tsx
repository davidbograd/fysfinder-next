// Added: 2026-04-06 - Added "gratis" USP section for free plan value communication.
import { BadgeCheck, ChartNoAxesCombined, Eye, MessageSquare } from "lucide-react";

const freeBenefits = [
  {
    icon: Eye,
    title: "Bliv fundet først",
    description:
      "Vær synlig når patienter søger efter fysioterapi i dit område - ikke gemt bag store kæder.",
  },
  {
    icon: BadgeCheck,
    title: "Skab tillid med det samme",
    description:
      "En professionel profil og verificeret badge gør det nemt for patienter at vælge dig.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Vis hvad du tilbyder",
    description:
      "Fremhæv dine ydelser, specialer og faciliteter, så patienter ved hvorfor de skal vælge netop dig.",
  },
  {
    icon: MessageSquare,
    title: "Få henvendelser direkte",
    description:
      "Patienter kan kontakte dig eller booke direkte via din profil.",
  },
];

export function FreePlanBenefitsSection() {
  return (
    <section className="w-full bg-background py-16 md:py-20">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="text-[2rem] font-semibold leading-tight text-[#1f2b28]">
            Sådan får du flere patienter - helt gratis
          </h2>
          <p className="mt-3 text-gray-600">
            Fysfinder gør din fysioterapeutklinik synlig, når patienter søger
            efter fysioterapi i dit område.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {freeBenefits.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="rounded-2xl border border-gray-200 bg-white p-6"
              >
                <div className="mb-3 inline-flex rounded-full bg-logo-blue/10 p-2 text-logo-blue">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
