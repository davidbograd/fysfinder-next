// Added: 2026-04-06 - Added split CTA section for free signup conversion.
import { Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const ctaBullets = [
  "Bliv vist øverst i din by",
  "Fuld kontrol over din profil og oplysninger",
  "Kontaktoplysninger og bookingsmuligheder",
  "Verificeret badge der skaber tillid",
];

export function SignupCtaSplitSection() {
  return (
    <section className="w-full bg-background py-16 md:py-20">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#0b5b43] p-6 md:p-8 lg:p-10">
          <div className="grid w-full gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
            <div className="mx-auto w-full max-w-[560px]">
              <div className="overflow-hidden rounded-2xl">
                <Image
                  src="/images/om-os/joachimbograd-fysfinder.png"
                  alt="Joachim Bograd, stifter af Fysfinder"
                  width={900}
                  height={900}
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-3 text-center text-sm font-medium text-emerald-100">
                Joachim Bograd, stifter og fysioterapeut
              </p>
            </div>

            <div className="flex h-full items-center">
              <div className="space-y-6">
                <div>
                  <h2 className="text-[2rem] font-semibold leading-tight text-white">
                    Bliv en del af Fysfinder og mærk forskellen
                  </h2>
                  <p className="mt-3 text-emerald-50">
                    Opret din profil og bliv synlig for tusindvis af danskere, der
                    aktivt søger hjælp fra en fysioterapeut. Du bestemmer selv dine
                    priser, specialer og hvad du tilbyder.
                  </p>
                </div>

                <ul className="space-y-3">
                  {ctaBullets.map((point) => (
                    <li key={point} className="flex items-center gap-2 text-emerald-50">
                      <Check className="h-4 w-4 shrink-0 text-emerald-200" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="bg-white text-emerald-800 hover:bg-emerald-50"
                  asChild
                >
                  <Link href="/auth/signup">Tilmeld din klinik gratis</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
