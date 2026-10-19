import { Metadata } from "next";
import { ToolPageLayout } from "@/components/features/tools/ToolPageLayout";
import { OvulationCalculator } from "./components/OvulationCalculator";

export const revalidate = 86400; // 24 hours ISR (must be a literal for Next.js segment config)

const title = "Ægløsningsberegner | Tjek hvornår du nemmest bliver gravid →";
const description =
  "Find din ægløsning og dine frugtbare dage med Fysfinders gratis ægløsningsberegner. Se hvornår du nemmest kan blive gravid – for de næste tre cyklusser.";
const image = {
  url: "/images/vaerktoejer/aegloesningsberegner-placeholder.png",
  alt: "Ægløsningsberegner – find dine frugtbare dage",
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

export default function AegloesningsberegnerPage() {
  return (
    <ToolPageLayout
      slug="aegloesningsberegner"
      heading="Ægløsningsberegner: Tjek hvornår du nemmest kan blive gravid"
      structuredDataDescription="Find din ægløsning og dine mest frugtbare dage ud fra din cyklus"
      image={{ src: image.url, alt: image.alt }}
      intro={
        <>
          <p className="text-gray-600 text-sm sm:text-base">
            Du kan kun blive gravid omkring seks dage i hver cyklus: de fem dage
            før ægløsningen og selve ægløsningsdagen. Ved du, hvornår de dage
            ligger, kan du øge chancen for at blive gravid.
          </p>
          <p className="text-gray-600 text-sm sm:text-base">
            Indtast første dag i din seneste menstruation og længden på din
            cyklus, og se din ægløsning og dine frugtbare dage.
          </p>
        </>
      }
      note={
        <>
          <strong>OBS</strong>:{" "}
          <em>
            Beregneren er et estimat og kan ikke bruges som prævention.
            Ægløsningen kan flytte sig fra cyklus til cyklus. Har I prøvet i et
            år uden at blive gravide – eller et halvt år, hvis du er over 35 –
            så tal med jeres læge.
          </em>
        </>
      }
      renderCalculator={(rating) => <OvulationCalculator rating={rating} />}
    />
  );
}
