import { GlossaryEntry } from "@/components/features/content/GlossaryEntry";
import { getDictionaryTerm, getDictionaryTerms } from "@/lib/dictionary";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { AuthorCard } from "@/components/features/content/AuthorCard";
import { TableOfContents } from "@/components/features/content/TableOfContents";
import {
  calculateReadingTime,
  extractTableOfContents,
  formatDanishDate,
} from "@/lib/utils";
import { Metadata } from "next";
import { Calendar, Clock } from "lucide-react";

interface DictionaryTermStructuredDataProps {
  term: {
    title: string;
    description: string;
    content: string;
    slug: string;
    lastUpdated: string;
    datePublished: string;
  };
}

function DictionaryTermStructuredData({
  term,
}: DictionaryTermStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["WebPage", "MedicalWebPage", "Article"],
    name: term.title,
    headline: term.title,
    description: term.description,
    dateModified: term.lastUpdated,
    datePublished: term.datePublished,
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
      "@id": `https://fysfinder.dk/ordbog/${term.slug}`,
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
  const terms = await getDictionaryTerms();
  return terms.map((term) => ({
    term: term.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { term: string };
}): Promise<Metadata> {
  const term = await getDictionaryTerm(params.term);
  return {
    title:
      term.metaTitle || `${term.title} - hvad er ${term.title.toLowerCase()}?`,
    description: `Lær alt om ${term.title.toLowerCase()} - årsager, symptomer og behandlingsmuligheder.`,
  };
}

export default async function DictionaryTermPage({
  params,
}: {
  params: { term: string };
}) {
  const term = await getDictionaryTerm(params.term);
  const headings = extractTableOfContents(term.content);
  const readingTime = calculateReadingTime(term.content);
  const lastUpdated = term.lastUpdated;

  const breadcrumbItems = [
    { text: "Ordbog", link: "/ordbog" },
    { text: term.title },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <DictionaryTermStructuredData term={term} />
      <div className="flex flex-col lg:flex-row lg:gap-8">
        <TableOfContents headings={headings} />
        <div className="flex-1 max-w-2xl">
          <Breadcrumbs items={breadcrumbItems} />
          <div className="flex items-center gap-8 text-sm text-gray-500 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Sidst opdateret {lastUpdated}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{readingTime}</span>
            </div>
          </div>
          <AuthorCard />
          <GlossaryEntry term={term} />
        </div>
      </div>
    </div>
  );
}
