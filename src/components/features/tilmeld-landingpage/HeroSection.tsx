import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="w-full bg-white py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-start gap-12">
          <div className="flex-1 space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl font-bold tracking-tight leading-tight">
                Få flere patienter
                <br />
                til din fysioterapi klinik
              </h1>
              <p className="text-xl text-gray-600">
                Få din klinik på Fysfinder og bliv synlig for patienter, der
                søger kvalificeret fysioterapi i dit område.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button className="bg-black text-white hover:bg-black/90" asChild>
                <Link href="#clinic-search">Kom i gang i dag</Link>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-black" />
                <span>Gratis Basis Profil</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-black" />
                <span>Verificeret Badge</span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            {/* Placeholder for hero image */}
            <div className="w-[640px] aspect-video bg-gray-100 rounded-lg" />
          </div>
        </div>
      </div>
    </section>
  );
}
