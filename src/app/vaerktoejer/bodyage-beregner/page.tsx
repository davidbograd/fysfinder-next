import { Metadata } from "next";
import { ToolPageLayout } from "@/components/features/tools/ToolPageLayout";
import { BodyAgeCalculator } from "./components/BodyAgeCalculator";

export const revalidate = 86400; // 24 hours ISR (must be a literal for Next.js segment config)

const title = "Bodyage beregner | Find din biologiske alder →";
const description =
  "Hvor gammel er din krop? Find din biologiske alder med Fysfinders gratis bodyage beregner – ud fra din kondition, dit taljemål og din hvilepuls.";
const image = {
  url: "/images/vaerktoejer/bodyage-beregner-placeholder.png",
  alt: "Bodyage beregner – find din biologiske alder",
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

export default function BodyageBeregnerPage() {
  return (
    <ToolPageLayout
      slug="bodyage-beregner"
      heading="Bodyage beregner: Find din biologiske alder"
      structuredDataDescription="Find din biologiske alder ud fra din kondition, dit taljemål og din hvilepuls"
      image={{ src: image.url, alt: image.alt }}
      intro={
        <>
          <p className="text-gray-600 text-sm sm:text-base">
            Hvor gammel er din krop egentlig? Din kondition er et af de
            stærkeste mål for, hvor godt din krop har det – og den kan sige
            mere end tallet i dit pas.
          </p>
          <p className="text-gray-600 text-sm sm:text-base">
            Svar på et par spørgsmål om din krop og din træning, og se din
            kropsalder – og hvad der kan gøre den yngre.
          </p>
        </>
      }
      note={
        <>
          <strong>OBS</strong>:{" "}
          <em>
            Kropsalderen er et estimat af din kondition, ikke en
            helbredsundersøgelse. Har du hjertesygdom eller tager du medicin,
            der påvirker pulsen, bliver resultatet mindre præcist.
          </em>
        </>
      }
      renderCalculator={(rating) => <BodyAgeCalculator rating={rating} />}
    />
  );
}
