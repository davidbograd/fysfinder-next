// Updated: 2026-09-29 - Use the page photo as the Open Graph image, same as the older calculators.
import { Metadata } from "next";
import { ToolPageLayout } from "@/components/features/tools/ToolPageLayout";
import { KonditalCalculator } from "./components/KonditalCalculator";

export const revalidate = 86400; // 24 hours ISR (must be a literal for Next.js segment config)

const title = "Kondital-beregner: Beregn nemt dit kondital (VO2 max) →";
const description =
  "Beregn dit kondital med Fysfinders gratis beregner. Brug din hvilepuls eller en Cooper-test, og se hvordan dit kondital ligger for din alder og dit køn.";
const image = {
  url: "/images/vaerktoejer/kondital-beregner.jpg",
  alt: "Løber på en atletikbane i solnedgang",
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

export default function KonditalBeregnerPage() {
  return (
    <ToolPageLayout
      slug="kondital-beregner"
      heading="Kondital beregner: Beregn nemt dit kondital (VO2 max) ud fra hvilepuls eller løb"
      structuredDataDescription="Beregn dit kondital (VO2-max) ud fra din hvilepuls eller en Cooper-test"
      image={{ src: image.url, alt: image.alt }}
      intro={
        <>
          <p className="text-gray-600 text-sm sm:text-base text-pretty">
            Dit kondital fortæller, hvor meget ilt din krop kan optage og bruge
            pr. kilo kropsvægt i minuttet. Det er et af de bedste enkeltmål for
            din kondition – og et af de mål, der hænger tættest sammen med
            helbred og udholdenhed.
          </p>
          <p className="text-gray-600 text-sm sm:text-base text-pretty">
            Du kan beregne dit kondital på to måder her: med din hvilepuls, som
            ikke kræver nogen test, eller med en Cooper-test, hvor du løber så
            langt du kan på 12 minutter.
          </p>
        </>
      }
      note={
        <>
          <strong>OBS</strong>:{" "}
          <em>
            Et beregnet kondital er et estimat. Den eneste helt præcise måling
            sker i et testlaboratorium med måling af iltoptagelse. Er du i tvivl
            om, hvorvidt du kan gennemføre en hård løbetest, så tal med din læge
            først.
          </em>
        </>
      }
      renderCalculator={(rating) => <KonditalCalculator rating={rating} />}
    />
  );
}
