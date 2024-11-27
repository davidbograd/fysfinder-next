import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "../components/Breadcrumbs";
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
        "FAKS er en landsdækkende patientforening for mennesker med kroniske smerter og deres pårørende. Foreningen arbejder for at forbedre vilkårene for mennesker med kroniske smerter gennem oplysning, rådgivning og politisk arbejde.",
        "Gennem vores samarbejde med FAKS kan vi bedre forstå og imødekomme behovene hos personer med kroniske smerter, der søger fysioterapi. Dette partnerskab hjælper os med at sikre, at vores platform er tilgængelig og nyttig for alle, uanset deres smertetilstand.",
      ],
      website: "https://faks.dk",
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
        vores brugere.
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
                    {paragraph}
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
