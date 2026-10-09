// Updated: 2026-10-09 - Set the SEO meta title, H1 and page image from the finished protein article.
import { Metadata } from "next";
import { ToolPageLayout } from "@/components/features/tools/ToolPageLayout";
import { ProteinCalculator } from "./components/ProteinCalculator";

export const revalidate = 86400; // 24 hours ISR (must be a literal for Next.js segment config)

const title = "Proteinberegner | Beregn nemt dit daglige proteinbehov →";
const description =
  "Beregn hvor meget protein du har brug for om dagen med Fysfinders gratis proteinberegner. Få dit behov i gram – både i alt og pr. måltid.";
const image = {
  url: "/images/vaerktoejer/proteinberegner-proteinrig-mad.jpg",
  alt: "Tallerken med proteinrig mad: kylling, laks, oksekød, æg, tofu, kikærter og quinoa",
};

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    images: [{ url: image.url, width: 1024, height: 571, alt: image.alt }],
    type: "website",
  },
};

export default function ProteinberegnerPage() {
  return (
    <ToolPageLayout
      slug="proteinberegner"
      heading="Proteinberegner: Beregn hvor meget protein du skal have om dagen"
      structuredDataDescription="Beregn dit daglige proteinbehov ud fra vægt, mål og aktivitetsniveau"
      image={{ src: image.url, alt: image.alt }}
      intro={
        <>
          <p className="text-gray-600 text-sm sm:text-base">
            Protein er det byggemateriale, kroppen bruger til at reparere og
            opbygge muskler. Hvor meget du har brug for afhænger af din vægt, om
            du træner, og om du er i gang med at tabe dig, holde vægten eller
            bygge muskel.
          </p>
          <p className="text-gray-600 text-sm sm:text-base">
            Indtast dine oplysninger og få dit daglige proteinbehov – både som
            samlet mål og fordelt på dine måltider.
          </p>
        </>
      }
      note={
        <>
          <strong>OBS</strong>:{" "}
          <em>
            Anbefalingerne gælder raske voksne. Har du nyresygdom eller følger
            en særlig diæt, så tal med din læge eller en klinisk diætist, før
            du ændrer dit proteinindtag markant.
          </em>
        </>
      }
      renderCalculator={(rating) => <ProteinCalculator rating={rating} />}
    />
  );
}
