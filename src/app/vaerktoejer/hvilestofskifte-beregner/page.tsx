// Updated: 2026-10-11 - Final SEO title, H1 and page image.
import { Metadata } from "next";
import { ToolPageLayout } from "@/components/features/tools/ToolPageLayout";
import { RestingMetabolicRateCalculator } from "./components/RestingMetabolicRateCalculator";

export const revalidate = 86400; // 24 hours ISR (must be a literal for Next.js segment config)

const title = "Hvilestofskifte beregner | Beregn dit hvilestofskifte →";
const description =
  "Udregn dit hvilestofskifte med Fysfinders gratis beregner. Se hvor mange kalorier din krop bruger i hvile – beregnet med Mifflin-St Jeor-ligningen.";
const image = {
  url: "/images/vaerktoejer/hvilestofskifte-beregner-kvinde-hviler-sofa.jpg",
  alt: "Kvinde der hviler på sofaen – hvilestofskiftet er den energi, kroppen forbrænder i hvile",
};

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    images: [{ url: image.url, width: 2752, height: 1536, alt: image.alt }],
    type: "website",
  },
};

export default function HvilestofskifteBeregnerPage() {
  return (
    <ToolPageLayout
      slug="hvilestofskifte-beregner"
      heading="Hvilestofskifte beregner: Beregn dit hvilestofskifte"
      structuredDataDescription="Udregn dit hvilestofskifte – antallet af kalorier kroppen bruger i hvile"
      image={{ src: image.url, alt: image.alt }}
      intro={
        <>
          <p className="text-gray-600 text-sm sm:text-base">
            Dit hvilestofskifte er den energi, din krop bruger bare på at holde
            dig i live: vejrtrækning, hjerteslag, kropstemperatur og organernes
            arbejde. Det er langt den største del af dit daglige
            kalorieforbrug – også selvom du træner.
          </p>
          <p className="text-gray-600 text-sm sm:text-base">
            Beregneren bruger Mifflin-St Jeor-ligningen, som i dag er den bedst
            validerede formel til hvilestofskifte hos raske voksne.
          </p>
        </>
      }
      note={
        <>
          <strong>OBS</strong>:{" "}
          <em>
            Tallet er et estimat. Muskelmasse, stofskiftesygdom, medicin og
            tidligere slankekure kan flytte dit reelle hvilestofskifte en del.
            Brug tallet som pejlemærke – ikke som facit.
          </em>
        </>
      }
      renderCalculator={(rating) => (
        <RestingMetabolicRateCalculator rating={rating} />
      )}
    />
  );
}
