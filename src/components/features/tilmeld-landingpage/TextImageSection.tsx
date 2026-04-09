// Added: 2026-04-06 - Added text-plus-image section to position Fysfinder value proposition.
import { ChartNoAxesCombined, CheckCircle2, Eye, MessageSquare, XCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const withoutFysfinderPoints = [
  "Dyre annoncer på Google og sociale medier",
  "Tid brugt på SEO, opslag og opfølgning",
  "Usikker effekt og svingende patientflow",
  "Svært at blive fundet lokalt",
];

const withFysfinderPoints = [
  "Synlig når patienter søger i dit område",
  "Flere relevante patienthenvendelser",
  "Ingen marketing eller løbende arbejde",
  "Stabilt flow - færre huller i kalenderen",
];

const founderHighlights = [
  {
    icon: Eye,
    title: "Få patienter der allerede leder",
    description:
      "Patienter leder hver dag efter en fysioterapeut i dit lokalområde. Vi sørger for, at din klinik bliver fundet, når de aktivt søger i dit område.",
  },
  {
    icon: MessageSquare,
    title: "Slip for bøvl og marketing",
    description:
      "Du behøver ikke tænke på SEO, annoncer eller sociale medier. Tilmeld din klinik - og få flere henvendelser fra måned 1.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Flere bookinger uden at betale dyrt",
    description:
      "Vi kender fysioterapeutbranchen personligt og byggede Fysfinder, fordi der manglede en nem måde at få nye patienter på. Uden det skal koste en formue.",
  },
];

export function TextImageSection() {
  return (
    <section className="w-full bg-background py-16 md:py-20">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12">
          <div className="max-w-2xl space-y-6">
            <h2 className="text-[2rem] font-semibold leading-tight text-[#1f2b28]">
              Skabt af en fysioterapeut, til fysioterapeuter
            </h2>

            <div className="space-y-4">
              {founderHighlights.map((item) => {
                const Icon = item.icon;
                return (
                <div key={item.title} className="flex gap-3">
                  <Icon className="mt-1 h-5 w-5 shrink-0 text-logo-blue" />
                  <p className="max-w-xl text-base leading-relaxed text-gray-700">
                    <strong>{item.title}</strong>
                    <br />
                    {item.description}
                  </p>
                </div>
                );
              })}
            </div>

            <Button
              className="h-auto bg-logo-blue px-7 py-3 text-base text-white hover:bg-logo-blue/90"
              asChild
            >
              <Link href="/auth/signup">Kom gratis i gang</Link>
            </Button>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
            <div className="overflow-hidden rounded-t-3xl">
              <Image
                src="/images/om-os/joachimbograd-fysfinder.png"
                alt="Joachim Bograd, stifter af Fysfinder"
                width={900}
                height={1200}
                className="h-80 w-full object-cover object-top sm:h-96 lg:h-[28rem]"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 rounded-b-3xl bg-[#f3f1ea]/75 px-4 py-3 backdrop-blur-sm">
              <p className="text-sm font-semibold text-[#1f2b28]">Joachim Bograd</p>
              <p className="text-sm text-gray-600">Stifter og fysioterapeut</p>
            </div>
          </div>
        </div>

        <div className="mt-20 md:mt-24">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <h2 className="text-[2rem] font-semibold leading-tight text-[#1f2b28]">
              Flere patienter - uden marketingbøvl
            </h2>
            <p className="mt-3 text-gray-600">
              Vi skaffer patienter. Du behandler.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)]">
            <div className="h-[5px] w-full bg-rose-700" />
              <div className="p-6">
                <h3 className="mb-4 text-2xl font-semibold text-[#1f2b28]">
                  Selv skaffe patienter
                </h3>
                <div className="space-y-4">
                  {withoutFysfinderPoints.map((point) => (
                    <div key={point} className="flex gap-3">
                      <XCircle className="mt-1 h-5 w-5 shrink-0 text-rose-700" />
                      <p className="text-base text-gray-700">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)]">
              <div className="h-[5px] w-full bg-[#0b5b43]" />
              <div className="p-6">
                <h3 className="mb-4 text-2xl font-semibold text-[#1f2b28]">
                  Med Fysfinder
                </h3>
                <div className="space-y-4">
                  {withFysfinderPoints.map((point) => (
                    <div key={point} className="flex gap-3">
                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#0b5b43]" />
                      <p className="text-base text-gray-700">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
