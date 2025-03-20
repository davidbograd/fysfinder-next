import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-logo-blue">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter text-white md:text-4xl/tight">
              Er du klar til at få flere patienter?
            </h2>
            <p className="max-w-[900px] text-gray-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Bliv en del af de fysioterapeuter, der får nye patienter gennem
              Fysfinder.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Button
              size="lg"
              className="bg-white text-logo-blue hover:bg-white/90"
              asChild
            >
              <Link href="#clinic-search">Tilmeld Din Klinik</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent text-white border-white hover:bg-white/10"
              asChild
            >
              <Link href="/om-os#kontakt">Kontakt Os</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
