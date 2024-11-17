import { GlossaryList } from "@/components/GlossaryList";
import { getGlossaryTerms } from "@/lib/glossary";

interface ArticlesStructuredDataProps {
  terms: Array<{
    title: string;
    slug: string;
    description: string;
  }>;
}

function ArticlesStructuredData({ terms }: ArticlesStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["WebPage", "MedicalWebPage", "CollectionPage"],
    name: "Fysioterapeut Artikler",
    description:
      "En omfattende samling af fysioterapeutiske artikler og begreber",
    author: {
      "@type": "Person",
      name: "Joachim Bograd",
      jobTitle: "Fysioterapeut",
      description:
        "Uddannet Bachelor i fysioterapi fra Københavns Professionshøjskole",
      sameAs: [
        "https://www.linkedin.com/in/joachim-bograd-43b0a120a/", // Add actual LinkedIn URL
      ],
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
      url: `https://fysfinder.dk/fysioterapeut-artikler/${term.slug}`,
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
  title: "Fysioterapeut Artikler",
  description:
    "En omfattende samling af fysioterapeutiske artikler og begreber",
};

export default async function ArticlesPage() {
  const terms = await getGlossaryTerms();

  return (
    <div className="container mx-auto px-4 py-8">
      <ArticlesStructuredData terms={terms} />
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Fysioterapeut Artikler</h1>
        <p className="mb-8">
          Udforsk og forstå de mest populære og aktuelle fysioterapeutiske emner
          med vores komplette A-Å liste af artikler.
        </p>
        <GlossaryList terms={terms} />
      </div>
    </div>
  );
}
