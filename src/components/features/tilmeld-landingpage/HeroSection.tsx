import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="w-full bg-white py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-start gap-12">
          <div className="flex-1 space-y-8">
            <div className="space-y-6">
              <p className="text-sm text-logo-blue font-medium">
                FYSIOTERAPEUTKLINIKKER
              </p>
              <h1 className="text-5xl font-bold tracking-tight leading-tight">
                Få flere patienter
                <br />
                og fyld din kalender
              </h1>
              <p className="text-xl text-gray-600">
                Få din klinik på FysFinder og bliv synlig for patienter, der
                søger fysioterapeuter i dit område.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                className="bg-logo-blue text-white hover:bg-logo-blue/90"
                asChild
              >
                <Link href="#clinic-search">Kom gratis i gang</Link>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-black" />
                <span>Gratis basis profil</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-black" />
                <span>Verificeret badge</span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <Image
              src="/images/tilmeld/fysioterapi-flere-patienter.jpg"
              alt="Fysioterapeut behandler patient"
              width={640}
              height={360}
              className="rounded-lg"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
