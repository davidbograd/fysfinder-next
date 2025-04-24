import { ContentList } from "@/components/features/content/ContentList";
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
    "@type": ["WebPage", "Blog", "CollectionPage"],
    name: "FysFinder Blog",
    description: "Læs de seneste blogindlæg om fysioterapi, sundhed og velvære",
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
      "@type": "BlogPosting",
      name: term.title,
      description: term.description,
      url: `https://fysfinder.dk/blog/${term.slug}`,
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
  title: "FysFinder Blog",
  description: "Læs de seneste blogindlæg om fysioterapi, sundhed og velvære",
};

export default async function BlogPage() {
  const terms = await getGlossaryTerms();

  return (
    <div className="container mx-auto px-4 py-8">
      <ArticlesStructuredData terms={terms} />
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">FysFinder Blog</h1>
        <p className="mb-8">
          Velkommen til FysFinder's blog! Her finder du spændende artikler og
          indlæg om fysioterapi, sundhed og velvære. Bliv klogere på din krop og
          hvordan du bedst tager vare på den.
        </p>
        <ContentList terms={terms} baseUrl="/blog" />
      </div>
    </div>
  );
}
