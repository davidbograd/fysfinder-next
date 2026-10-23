import { Metadata } from "next";
import { ToolPageLayout } from "@/components/features/tools/ToolPageLayout";
import { FtpCalculator } from "./components/FtpCalculator";

export const revalidate = 86400; // 24 hours ISR (must be a literal for Next.js segment config)

const title = "FTP beregner | Beregn nemt din FTP og træningszoner →";
const description =
  "Beregn din FTP med Fysfinders gratis FTP-beregner. Brug en 20-minutterstest eller en ramptest, og få dine syv wattzoner til cykeltræning.";
const image = {
  url: "/images/vaerktoejer/ftp-beregner-landevejsrytter-i-fart.jpg",
  alt: "Landevejsrytter i fart på cyklen – beregn din FTP og dine wattzoner",
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

export default function FtpBeregnerPage() {
  return (
    <ToolPageLayout
      slug="ftp-beregner"
      heading="FTP beregner - Beregn din FTP og træningszoner til cykling"
      structuredDataDescription="Beregn din FTP ud fra en 20-minutterstest eller en ramptest, og få dine wattzoner til cykeltræning"
      image={{ src: image.url, alt: image.alt }}
      intro={
        <>
          <p className="text-gray-600 text-sm sm:text-base">
            FTP (Functional Threshold Power) er den effekt i watt, du kan holde over en længere, hård
            indsats på cyklen. Den er udgangspunktet for at træne efter
            wattzoner med wattmåler eller smarttrainer.
          </p>
          <p className="text-gray-600 text-sm sm:text-base">
            Indtast resultatet af en 20-minutterstest eller ramptest, og få
            din estimerede FTP og dine syv wattzoner.
          </p>
        </>
      }
      note={
        <>
          <strong>OBS</strong>:{" "}
          <em>
            FTP fra en test er et estimat, og wattzonerne er vejledende.
            Dagsform, søvn og restitution påvirker, hvor hårdt en given effekt
            føles.
          </em>
        </>
      }
      renderCalculator={(rating) => <FtpCalculator rating={rating} />}
    />
  );
}
