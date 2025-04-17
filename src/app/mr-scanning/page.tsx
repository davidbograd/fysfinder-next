import { Metadata } from "next";
import { TranslatorForm } from "./components/TranslatorForm";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Shield, Clock } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Komplet guide om MR-scanning | Få svar på alle dine spørgsmål",
  description:
    "Oversæt din MR-scanning rapport til letforståeligt dansk sprog.",
};

export default function MRScanPage() {
  return (
    <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-3xl">
      <div className="space-y-6 sm:space-y-8">
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Hvad betyder din MR-scanning? Prøv vores MR-scanningsrapport
            oversætter
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Indtast teksten fra din MR-scanning rapport nedenfor, og få den
            oversat til letforståeligt dansk.
          </p>
        </div>

        <div className="pb-8">
          <ErrorBoundary>
            <TranslatorForm />
          </ErrorBoundary>
        </div>

        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold">
              Hvordan det virker
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>
                Indsæt din tekst fra din MR-scanning. Du kan som regel finde den
                på sundhed.dk eller MinSundhed appen.
              </li>
              <li>
                Lad vores værktøj analyserer dit resultat og give dig et svar på
                under 30 sekunder.
              </li>
            </ol>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-logo-blue flex-shrink-0" />
              <div>
                <h3 className="font-medium">100% anonymt</h3>
                <p className="text-sm text-gray-600">
                  Du giver ingen personlig data og vi gemmer intet.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="w-6 h-6 text-logo-blue flex-shrink-0" />
              <div>
                <h3 className="font-medium">Gratis og hurtigt</h3>
                <p className="text-sm text-gray-600">
                  Du får svar på under 30 sekunder - helt gratis!
                </p>
              </div>
            </div>
          </div>

          <div className="relative w-full aspect-[16/10] mt-8">
            <Image
              src="/images/mr-scanning/mr-scanning.png"
              alt="Moderne MR-scanner (Magnetic Resonance Imaging) i et lyst, professionelt hospitalsmiljø"
              fill
              className="object-cover rounded-xl"
              priority
            />
          </div>
        </div>
      </div>
    </main>
  );
}
