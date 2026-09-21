import { Metadata } from "next";
import { ToolPageLayout } from "@/components/features/tools/ToolPageLayout";
import { KonditalCalculator } from "./components/KonditalCalculator";

export const revalidate = 86400; // 24 hours ISR (must be a literal for Next.js segment config)

export const metadata: Metadata = {
  title: "Kondital beregner → Beregn dit kondital (VO2-max) ✅",
  description:
    "Beregn dit kondital med Fysfinders gratis beregner. Brug din hvilepuls eller en Cooper-test, og se hvordan dit kondital ligger for din alder og dit køn.",
};

export default function KonditalBeregnerPage() {
  return (
    <ToolPageLayout
      slug="kondital-beregner"
      heading="Kondital beregner – hvordan beregner man kondital?"
      structuredDataDescription="Beregn dit kondital (VO2-max) ud fra din hvilepuls eller en Cooper-test"
      image={{
        src: "/images/vaerktoejer/kondital-beregner-placeholder.png",
        alt: "Kondital beregner illustration",
      }}
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
