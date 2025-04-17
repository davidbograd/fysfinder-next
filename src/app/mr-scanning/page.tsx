import { Metadata } from "next";
import { TranslatorForm } from "./components/TranslatorForm";
import { ErrorBoundary } from "./components/ErrorBoundary";

export const metadata: Metadata = {
  title: "Komplet guide om MR-scanning | Få svar på alle dine spørgsmål",
  description:
    "Oversæt din MR-scanning rapport til letforståeligt dansk sprog.",
};

export default function MRScanPage() {
  return (
    <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-3xl">
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Hvad betyder din MR-scanning? Prøv vores MR-scanningsrapport
          oversætter
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Indtast teksten fra din MR-scanning rapport nedenfor, og få den
          oversat til letforståeligt dansk.
        </p>

        <ErrorBoundary>
          <TranslatorForm />
        </ErrorBoundary>
      </div>
    </main>
  );
}
