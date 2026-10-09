// Updated: 2026-09-29 - Use the page image as the Open Graph image, same as the older calculators.
import { Metadata } from "next";
import { ToolPageLayout } from "@/components/features/tools/ToolPageLayout";
import { MuscleMassCalculator } from "./components/MuscleMassCalculator";

export const revalidate = 86400; // 24 hours ISR (must be a literal for Next.js segment config)

const title = "Muskelmasse beregner → Beregn din muskelmasse i kg ✅";
const description =
  "Beregn din muskelmasse med Fysfinders gratis beregner. Brug målebånd for det mest præcise estimat – eller bare højde, vægt, alder og køn.";
const image = {
  url: "/images/vaerktoejer/muskelmasse-beregner-placeholder.png",
  alt: "Muskelmasse beregner illustration",
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

export default function MuskelmasseBeregnerPage() {
  return (
    <ToolPageLayout
      slug="muskelmasse-beregner"
      heading="Muskelmasse beregner – beregn din muskelmasse"
      structuredDataDescription="Estimer din muskelmasse ud fra målebånd eller højde, vægt, alder og køn"
      image={{ src: image.url, alt: image.alt }}
      intro={
        <>
          <p className="text-gray-600 text-sm sm:text-base text-pretty">
            Muskelmasse er den del af kroppen, der arbejder, når du løfter,
            løber og rejser dig fra en stol. Den fylder meget for både styrke,
            stofskifte og funktion – ikke mindst med alderen, hvor vi taber
            muskel, hvis vi ikke bruger den.
          </p>
          <p className="text-gray-600 text-sm sm:text-base text-pretty">
            Her kan du estimere din muskelmasse på to måder: uden målebånd,
            hvis du bare vil have et hurtigt tal, eller med målebånd, som giver
            det mest præcise resultat.
          </p>
        </>
      }
      note={
        <>
          <strong>OBS</strong>:{" "}
          <em>
            Beregningen er et estimat baseret på anerkendte formler. Den kan
            ikke erstatte en DEXA-scanning eller en professionel
            kropssammensætningsmåling, men den er god til at følge din egen
            udvikling over tid.
          </em>
        </>
      }
      renderCalculator={(rating) => <MuscleMassCalculator rating={rating} />}
    />
  );
}
