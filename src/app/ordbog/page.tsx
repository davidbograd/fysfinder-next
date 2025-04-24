import { ContentList } from "@/components/features/content/ContentList";
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
  title: "FysFinder ordbogen | Alt om krop, sundhed og træning",
  description:
    "Vi har samlet forklaringer og viden inden for anatomi, sundhed og træning til dig, der ønsker at leve et sundere liv og forstå kroppen bedre.",
};

export default async function DictionaryPage() {
  const terms = await getDictionaryTerms();

  return (
    <div className="container mx-auto px-4 py-8">
      <DictionaryStructuredData terms={terms} />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          FysFinder ordbogen – Forklaringer om krop, sundhed og træning
        </h1>
        <p className="mb-8">
          Vi har samlet forklaringer og viden inden for anatomi, sundhed og
          træning til dig, der ønsker at leve et sundere liv og forstå kroppen
          bedre.
        </p>
        <ContentList terms={terms} baseUrl="/ordbog" />
      </div>
    </div>
  );
}
