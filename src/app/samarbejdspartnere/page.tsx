import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ExternalLink } from "lucide-react";
import { Partner } from "../types";

export const metadata: Metadata = {
  title: "Vores Samarbejdspartnere | FysFinder",
  description:
    "Se vores samarbejdspartnere der hjælper med at sikre kvalitet og pålidelighed når du skal finde en fysioterapeut.",
};

export default function PartnersPage() {
  const partners: Partner[] = [
    {
      id: "faks",
      name: "Foreningen af kroniske smerteramte og pårørende (FAKS)",
      logo: "/images/samarbejdspartnere/FAKS-logo.webp",
      description: [
        "FAKS er en landsdækkende forening, som siden 1990 har arbejdet på at skabe synlighed omkring udfordringerne for de over 1.3 millioner danskere, som dagligt er berørt af kroniske smerter.",

        "Foreningens initiativer spænder lige fra at influere den politiske dagsorden, sikre tilbud til smerteramte (f.eks. offentlige og private tilbud), yde råd og vejledning og tilbyder muligheden for fællesskab og støtte til smerteramte og deres pårørende via lokalafdelinger rundt om i landet. Derudover tilbyder FAKS flere forskellige forløb med fokus på sygdoms- og smertemestring.",

        "FAKS er ikke partipolitisk eller diagnoseorienteret – de fokuserer på den invaliderende sygdom, som det er at have kroniske smerter.",

        <>
          Gennem deres gratis rådgivningslinje, SmerteLinjen, giver FAKS
          smerteramte mulighed for at få konstruktiv hjælp fra
          smertesygeplejersker, socialrådgivere, fysioterapeuter og psykologer –
          alle er frivillige. Du kan læse mere om dette tilbud på{" "}
          <Link
            href="https://smertelinjen.dk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-logo-blue hover:underline"
          >
            smertelinjen.dk
          </Link>
          .
        </>,
      ],
      website: "https://faks.dk",
    },
    {
      id: "hovedpine-foreningen",
      name: "Hovedpine Foreningen",
      logo: "/images/samarbejdspartnere/hovedpine-foreningen.png",
      description: [
        "Hovedpine Foreningen er en landsdækkende forening, der arbejder for at støtte og hjælpe mennesker med hovedpine og migræne. Foreningen har fokus på at skabe bedre forståelse og opmærksomhed omkring disse tilstande, samt at tilbyde vejledning og støtte til dem, der er berørt.",

        "Gennem vores samarbejde med Hovedpine Foreningen kan vi tilbyde brugere med hovedpine eller migræne nem adgang til at finde fysioterapeuter, der har specialiseret sig i behandling af disse tilstande.",

        "Samarbejdet indebærer ikke en faglig vurdering eller godkendelse af de nævnte klinikker.",
      ],
      website: "https://www.hovedpineforeningen.dk",
    },
  ];

  const breadcrumbItems = [
    { text: "Forside", link: "/" },
    { text: "Samarbejdspartnere" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} />

      <h1 className="text-3xl font-bold mb-6">Vores Samarbejdspartnere</h1>

      <p className="text-gray-600 mb-12 max-w-2xl">
        Vi samarbejder med førende organisationer inden for sundhedssektoren for
        at sikre, at vi kan tilbyde den bedste og mest pålidelige service til
        den danske befolkning.
      </p>

      <div className="space-y-16">
        {partners.map((partner) => (
          <div
            key={partner.id}
            className="flex flex-col md:flex-row gap-8 items-start border-b border-gray-200 pb-12"
          >
            <div className="w-full md:w-1/3 relative aspect-[3/2] bg-white rounded-lg">
              <Image
                src={partner.logo}
                alt={`${partner.name} logo`}
                fill
                className="object-contain p-6"
              />
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {partner.name}
              </h2>

              {partner.website && (
                <Link
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-logo-blue hover:opacity-80 inline-flex items-center gap-1 mb-4"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="text-sm">
                    {partner.website.replace("https://", "")}
                  </span>
                </Link>
              )}

              <div className="mt-4 space-y-4">
                {partner.description.map((paragraph, index) => (
                  <p key={index} className="text-gray-600 leading-relaxed">
                    {typeof paragraph === "string" ? paragraph : paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
