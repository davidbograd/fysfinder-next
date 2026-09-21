import { Metadata } from "next";
import { ToolPageLayout } from "@/components/features/tools/ToolPageLayout";
import { ProteinCalculator } from "./components/ProteinCalculator";

export const revalidate = 86400; // 24 hours ISR (must be a literal for Next.js segment config)

export const metadata: Metadata = {
  title: "Proteinberegner → Beregn dit daglige proteinbehov ✅",
  description:
    "Beregn hvor meget protein du har brug for om dagen med Fysfinders gratis proteinberegner. Få dit behov i gram – både i alt og pr. måltid.",
};

export default function ProteinberegnerPage() {
  return (
    <ToolPageLayout
      slug="proteinberegner"
      heading="Proteinberegner – hvor meget protein har du brug for?"
      structuredDataDescription="Beregn dit daglige proteinbehov ud fra vægt, mål og aktivitetsniveau"
      image={{
        src: "/images/vaerktoejer/proteinberegner-placeholder.png",
        alt: "Proteinberegner illustration",
      }}
      intro={
        <>
          <p className="text-gray-600 text-sm sm:text-base text-pretty">
            Protein er det byggemateriale, kroppen bruger til at reparere og
            opbygge muskler. Hvor meget du har brug for afhænger af din vægt, om
            du træner, og om du er i gang med at tabe dig, holde vægten eller
            bygge muskel.
          </p>
          <p className="text-gray-600 text-sm sm:text-base text-pretty">
            Indtast dine oplysninger og få dit daglige proteinbehov – både som
            samlet mål og fordelt på dine måltider.
          </p>
        </>
      }
      note={
        <>
          <strong>OBS</strong>:{" "}
          <em>
            Anbefalingerne gælder raske voksne. Har du nyresygdom, er gravid
            eller følger en særlig diæt, så tal med din læge eller en klinisk
            diætist, før du ændrer dit proteinindtag markant.
          </em>
        </>
      }
      renderCalculator={(rating) => <ProteinCalculator rating={rating} />}
    />
  );
}
