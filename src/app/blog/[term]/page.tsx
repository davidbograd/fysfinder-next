import { ContentEntry } from "@/components/features/content/ContentEntry";
import { getGlossaryTerm, getGlossaryTerms } from "@/lib/glossary";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { AuthorCard } from "@/components/features/content/AuthorCard";
import { Metadata } from "next";

interface BlogPostStructuredDataProps {
  term: {
    title: string;
    description: string;
    content: string;
    slug: string;
  };
}

function BlogPostStructuredData({ term }: BlogPostStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["WebPage", "BlogPosting"],
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
      "@id": `https://fysfinder.dk/blog/${term.slug}`,
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
    title: `${term.title} | FysFinder Blog`,
    description: term.description,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { term: string };
}) {
  const term = await getGlossaryTerm(params.term);

  const breadcrumbItems = [
    { text: "Blog", link: "/blog" },
    { text: term.title },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <BlogPostStructuredData term={term} />
      <div className="max-w-2xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        <AuthorCard />
        <ContentEntry
          term={term}
          backLink={{
            href: "/blog",
            text: "Tilbage til blog",
          }}
        />
      </div>
    </div>
  );
}
