import { Metadata } from "next";
import { TranslatorForm } from "./components/TranslatorForm";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Shield, Clock } from "lucide-react";
import Image from "next/image";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import WebAppStructuredData from "@/components/seo/VaerktoejerStructuredData";

export const metadata: Metadata = {
  title: "Komplet DEXA-scanning guide | Få svar på dine spørgsmål ✅",
  description: "Oversæt din DEXA-scanning rapport til letforståeligt dansk.",
};

export default function DEXAScanPage() {
  const breadcrumbItems = [
    { text: "Værktøjer", link: "/vaerktoejer" },
    { text: "DEXA-scanning Oversætter" },
  ];

  return (
    <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-3xl">
      <WebAppStructuredData
        type="tool"
        name="DEXA-scanning Oversætter"
        description="Oversæt din DEXA-scanning rapport til letforståeligt dansk"
        breadcrumbs={breadcrumbItems}
      />
      <div className="space-y-6 sm:space-y-8">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Hvad betyder din DEXA-scanning? Prøv vores DEXA-scanningsrapport
            oversætter
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Få din DEXA-scanning rapport oversat til letforståeligt dansk.
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
                Indsæt din tekst fra din DEXA-scanning. Du kan som regel finde
                den på sundhed.dk eller MinSundhed appen.
              </li>
              <li>
                Lad vores værktøj analysere dit resultat og give dig et svar på
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
              src="/images/dexa-scanning/dexa-scanning.jpeg"
              alt="Moderne DEXA-scanner (Dual-Energy X-ray Absorptiometry) i et lyst, professionelt hospitalsmiljø"
              fill
              className="object-cover rounded-xl"
              priority
            />
          </div>

          {/* Remove or update the MR-specific content below */}
          {/* I am commenting out the MR-specific tables and content sections */}
          {/* Tabel afsnit
          <div className="overflow-x-auto">
            <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-2">
              Oversættelse af latinske ord på MR scanningsrapport
            </h2>
            <table className="w-full border-collapse mt-4">
              <thead>
                <tr className="bg-logo-blue text-white">
                  <th className="px-4 py-2 text-left border">
                    Latinsk udtryk på MR-rapporten
                  </th>
                  <th className="px-4 py-2 text-left border">
                    Betydning på almindeligt dansk
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">Abscess</td>
                  <td className="px-4 py-2 border">Byld (pusansamling)</td>
                </tr>
                // ... many more table rows ...
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">Tumor</td>
                  <td className="px-4 py-2 border">Svulst eller knude</td>
                </tr>
              </tbody>
            </table>
          </div>
          */}

          {/* Content afsnit
          <div className="overflow-x-auto">
            <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-2">
              Hvad er en MR scanning?
            </h2>
            <p>
              En MR-scanning (magnetisk resonans-scanning) er en avanceret
              // ... rest of MR content ...
              del i dit eget behandlingsforløb.
            </p>
          </div>
           */}
        </div>
      </div>
    </main>
  );
}
