import { GlossaryList } from "@/components/GlossaryList";
import { getDictionaryTerms } from "@/lib/dictionary";

interface DictionaryStructuredDataProps {
  terms: Array<{
    title: string;
    slug: string;
    description: string;
  }>;
}

function DictionaryStructuredData({ terms }: DictionaryStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["WebPage", "MedicalWebPage", "CollectionPage"],
    name: "FysFinder ordbogen",
    description: "Forklaringer om krop, sundhed og træning",
    author: {
      "@type": "Person",
      name: "Joachim Bograd",
      jobTitle: "Fysioterapeut",
      description:
        "Uddannet Bachelor i fysioterapi fra Københavns Professionshøjskole",
      sameAs: ["https://www.linkedin.com/in/joachim-bograd-43b0a120a/"],
      affiliation: {
        "@type": "MedicalOrganization",
        name: "FysFinder",
        url: "https://fysfinder.dk",
      },
    },
    about: {
      "@type": "MedicalSpecialty",
      name: "Fysioterapi",
      relevantSpecialty: {
        "@type": "MedicalSpecialty",
        name: "Physical Therapy",
      },
    },
    specialty: "Fysioterapi",
    medicalAudience: "Patienter og sundhedsprofessionelle",
    hasPart: terms.map((term) => ({
      "@type": "MedicalWebPage",
      name: term.title,
      description: term.description,
      url: `https://fysfinder.dk/ordbog/${term.slug}`,
      author: {
        "@type": "Person",
        name: "Joachim Bograd",
        jobTitle: "Fysioterapeut",
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export const metadata = {
  title: "FysFinder ordbogen – Forklaringer om krop, sundhed og træning",
  description:
    "Vi har samlet forklaringer og viden om alt inden for krop, sundhed og træning og gjort det lidt mere spiseligt for dig for den almindelige borger.",
};

export default async function DictionaryPage() {
  const terms = await getDictionaryTerms();

  return (
    <div className="container mx-auto px-4 py-8">
      <DictionaryStructuredData terms={terms} />
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          FysFinder ordbogen – Forklaringer om krop, sundhed og træning
        </h1>
        <p className="mb-8">
          Vi har samlet forklaringer og viden om alt inden for krop, sundhed og
          træning og gjort det lidt mere spiseligt for dig for den almindelige
          borger.
        </p>
        <GlossaryList terms={terms} />
      </div>
    </div>
  );
}
