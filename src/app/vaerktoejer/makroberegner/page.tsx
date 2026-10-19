import { Metadata } from "next";
import { ToolPageLayout } from "@/components/features/tools/ToolPageLayout";
import { MacroCalculator } from "./components/MacroCalculator";

export const revalidate = 86400; // 24 hours ISR (must be a literal for Next.js segment config)

const title = "Makroberegner | Sådan udregner du dine makroer →";
const description =
  "Udregn dine makroer med Fysfinders gratis makroberegner. Få dit dagsbehov for protein, kulhydrat og fedt i gram – ud fra dit mål og dit kaloriebehov.";
const image = {
  url: "/images/vaerktoejer/makroberegner-placeholder.png",
  alt: "Makroberegner – fordeling af protein, kulhydrat og fedt",
};

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    images: [{ url: image.url, width: 1200, height: 630, alt: image.alt }],
    type: "website",
  },
};

export default function MakroberegnerPage() {
  return (
    <ToolPageLayout
      slug="makroberegner"
      heading="Makroberegner: Sådan udregner du dine makroer"
      structuredDataDescription="Udregn dit daglige behov for protein, kulhydrat og fedt i gram"
      image={{ src: image.url, alt: image.alt }}
      intro={
        <>
          <p className="text-gray-600 text-sm sm:text-base">
            Makroer er de tre næringsstoffer, al mad består af: protein,
            kulhydrat og fedt. Når du kender dit kaloriebehov, fortæller
            makroerne dig, hvordan kalorierne skal fordeles.
          </p>
          <p className="text-gray-600 text-sm sm:text-base">
            Indtast dine oplysninger, vælg en fordeling og få dine makroer i
            gram – både for hele dagen og pr. måltid.
          </p>
        </>
      }
      note={
        <>
          <strong>OBS</strong>:{" "}
          <em>
            Makroerne er et udgangspunkt for raske voksne. Har du diabetes,
            nyresygdom eller en spiseforstyrrelse, så lav din kostplan sammen
            med din læge eller en klinisk diætist.
          </em>
        </>
      }
      renderCalculator={(rating) => <MacroCalculator rating={rating} />}
    />
  );
}
