import { GlossaryEntry } from "@/components/GlossaryEntry";
import { getGlossaryTerm, getGlossaryTerms } from "@/lib/glossary";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { AuthorCard } from "@/components/AuthorCard";
import { Metadata } from "next";

interface ArticleStructuredDataProps {
  term: {
    title: string;
    description: string;
    content: string;
    slug: string;
  };
}

function ArticleStructuredData({ term }: ArticleStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["WebPage", "MedicalWebPage", "Article"],
    name: term.title,
    headline: term.title,
    description: term.description,
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
    articleBody: term.content,
    publisher: {
      "@type": "Organization",
      name: "FysFinder",
      url: "https://fysfinder.dk",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://fysfinder.dk/fysioterapeut-artikler/${term.slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export async function generateStaticParams() {
  const terms = await getGlossaryTerms();
  return terms.map((term) => ({
    term: term.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { term: string };
}): Promise<Metadata> {
  const term = await getGlossaryTerm(params.term);
  return {
    title: `${term.title}`,
    description: term.description,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: { term: string };
}) {
  const term = await getGlossaryTerm(params.term);

  const breadcrumbItems = [
    { text: "Artikler", link: "/fysioterapeut-artikler" },
    { text: term.title },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <ArticleStructuredData term={term} />
      <div className="max-w-2xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        <AuthorCard />
        <GlossaryEntry term={term} />
      </div>
    </div>
  );
}
