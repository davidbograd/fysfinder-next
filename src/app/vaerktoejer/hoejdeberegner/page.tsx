// Updated: 2026-09-29 - Use the page image as the Open Graph image, same as the older calculators.
import { Metadata } from "next";
import { ToolPageLayout } from "@/components/features/tools/ToolPageLayout";
import { AdultHeightCalculator } from "./components/AdultHeightCalculator";

export const revalidate = 86400; // 24 hours ISR (must be a literal for Next.js segment config)

const title = "Højdeberegner → Beregn sluthøjde ud fra forældrenes højde ✅";
const description =
  "Beregn dit barns forventede sluthøjde ud fra mors og fars højde. Fysfinders gratis højdeberegner viser både det forventede tal og det interval, de fleste børn ender i.";
const image = {
  url: "/images/vaerktoejer/hoejdeberegner-placeholder.png",
  alt: "Højdeberegner illustration",
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

export default function HoejdeberegnerPage() {
  return (
    <ToolPageLayout
      slug="hoejdeberegner"
      heading="Højdeberegner – beregn sluthøjde ud fra forældrenes højde"
      structuredDataDescription="Beregn et barns forventede sluthøjde ud fra forældrenes højde"
      image={{ src: image.url, alt: image.alt }}
      intro={
        <>
          <p className="text-gray-600 text-sm sm:text-base">
            Højde er i høj grad arveligt, og derfor kan man komme forbavsende
            tæt på et barns sluthøjde alene ud fra forældrenes højde. Indtast
            mors og fars højde, og få det forventede resultat med det samme.
          </p>
          <p className="text-gray-600 text-sm sm:text-base">
            Beregneren viser både et enkelt tal og det interval, de fleste børn
            lander inden for.
          </p>
        </>
      }
      note={
        <>
          <strong>OBS</strong>:{" "}
          <em>
            Beregningen er et estimat, ikke en forudsigelse. Er du bekymret for
            dit barns vækst – fx hvis barnet vokser meget langsommere eller
            hurtigere end jævnaldrende – så kontakt din læge eller
            sundhedsplejerske.
          </em>
        </>
      }
      renderCalculator={(rating) => <AdultHeightCalculator rating={rating} />}
    />
  );
}
