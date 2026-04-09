// Added: 2026-04-06 - Added premium upsell section with non-functional placeholder button.
import { Crown, MapPinned, MousePointerClick, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const premiumBenefits = [
  {
    icon: MapPinned,
    title: "Få patienter fra op til 3 byer",
    description:
      "Bliv synlig i din egen by + 2 nærliggende byer - og nå patienter, der ellers ikke ville finde dig.",
  },
  {
    icon: Sparkles,
    title: "Bliv valgt for andre klinikker",
    description:
      "Din profil fremhæves i listen, så patienter lægger mærke til dig først - og vælger dig.",
  },
  {
    icon: MousePointerClick,
    title: "Få flere klik til din klinikprofil",
    description:
      "Når flere ser dig, får du flere klik - og flere patienter der lærer din klinik at kende.",
  },
  {
    icon: TrendingUp,
    title: "Flere patienter - samme indsats",
    description:
      "Du får flere henvendelser, uden at bruge tid på marketing. Patienterne kommer til dig.",
  },
];

export function PremiumUpsellSection() {
  return (
    <section className="w-full bg-background py-16 md:py-20">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gray-950 px-6 py-10 text-white sm:px-8 md:px-10 md:py-12">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-200">
              <Crown className="h-3.5 w-3.5" />
              Kun med Premium
            </p>
            <h2 className="text-[2rem] font-semibold leading-tight">
              Bliv vist øverst i 3 byer - og få endnu flere patienter
            </h2>
            <p className="mt-3 text-gray-300">
              Udvid din synlighed til nærliggende byer og få patienter fra flere
              områder med en profil, der skiller sig ud.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {premiumBenefits.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-2xl border border-white/15 bg-white/5 p-6"
                >
                  <div className="mb-3 inline-flex rounded-full bg-white/10 p-2 text-amber-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                  <p className="text-gray-300">{item.description}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Button
              type="button"
              size="lg"
              className="cursor-not-allowed bg-white/20 text-white hover:bg-white/20"
              disabled
              aria-disabled="true"
            >
              Opgrader til Premium (kommer snart)
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
