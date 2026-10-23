import { Metadata } from "next";
import { ToolPageLayout } from "@/components/features/tools/ToolPageLayout";
import { WattPerKgCalculator } from "./components/WattPerKgCalculator";

export const revalidate = 86400; // 24 hours ISR (must be a literal for Next.js segment config)

const title = "Watt pr. kg beregner | Beregn nemt din W/kg på cykel →";
const description =
  "Beregn din watt pr. kg med Fysfinders gratis beregner. Indtast din FTP eller et testresultat og din vægt, og se hvilket niveau du ligger på som cykelrytter.";
const image = {
  url: "/images/vaerktoejer/watt-pr-kg-beregner-cykelryttere-ved-kysten.jpg",
  alt: "To cykelryttere på landevejscykler ved kysten – beregn din watt pr. kg",
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

export default function WattPrKgBeregnerPage() {
  return (
    <ToolPageLayout
      slug="watt-pr-kg-beregner"
      heading="Watt pr. kg beregner - Beregn din W/kg og se dit niveau"
      structuredDataDescription="Beregn din watt pr. kg ud fra FTP og vægt, og se dit niveau som cykelrytter"
      image={{ src: image.url, alt: image.alt }}
      intro={
        <>
          <p className="text-gray-600 text-sm sm:text-base">
            Watt pr. kg er det tal, cykelryttere bruger til at sammenligne sig
            med hinanden. Det fortæller, hvor meget effekt du kan levere i
            forhold til din vægt – og dermed hvor hurtigt du kommer op ad
            bakke.
          </p>
          <p className="text-gray-600 text-sm sm:text-base">
            Indtast din FTP eller resultatet af en test sammen med din vægt, og
            se din watt pr. kg og dit niveau.
          </p>
        </>
      }
      renderCalculator={(rating) => <WattPerKgCalculator rating={rating} />}
    />
  );
}
