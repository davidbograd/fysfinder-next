import { Metadata } from "next";
import { ToolPageLayout } from "@/components/features/tools/ToolPageLayout";
import { DueDateCalculator } from "./components/DueDateCalculator";

export const revalidate = 86400; // 24 hours ISR (must be a literal for Next.js segment config)

const title = "Terminsberegner | Beregn din terminsdato og graviditetsuge →";
const description =
  "Beregn din terminsdato med Fysfinders gratis terminsberegner. Se hvornår du har termin, hvilken graviditetsuge du er i, og hvornår dine scanninger ligger.";
const image = {
  url: "/images/vaerktoejer/terminsberegner-mor-holder-nyfoedt-baby.jpg",
  alt: "Mor holder sin nyfødte baby – beregn din terminsdato",
};

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    images: [{ url: image.url, width: 1400, height: 933, alt: image.alt }],
    type: "website",
  },
};

export default function TerminsberegnerPage() {
  return (
    <ToolPageLayout
      slug="terminsberegner"
      heading="Terminsberegner: Beregn din termin og se hvor langt du er henne"
      structuredDataDescription="Beregn din terminsdato og se hvilken graviditetsuge du er i"
      image={{ src: image.url, alt: image.alt }}
      intro={
        <>
          <p className="text-gray-600 text-sm sm:text-base">
            Terminen er den dag, dit barn forventes at blive født – 40 uger
            efter første dag i din sidste menstruation. Kun få føder præcis på
            terminsdatoen, men den bruges til at følge graviditeten og planlægge
            dine scanninger.
          </p>
          <p className="text-gray-600 text-sm sm:text-base">
            Vælg datoen for din sidste menstruation eller undfangelse, og se din
            terminsdato, din graviditetsuge og de vigtigste datoer frem mod
            fødslen.
          </p>
        </>
      }
      note={
        <>
          <strong>OBS</strong>:{" "}
          <em>
            Terminsberegneren giver et estimat. Din endelige termin fastsættes
            ved nakkefoldsscanningen omkring uge 12, hvor barnet bliver målt.
          </em>
        </>
      }
      renderCalculator={(rating) => <DueDateCalculator rating={rating} />}
    />
  );
}
