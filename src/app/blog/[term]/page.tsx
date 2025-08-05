import { ContentEntry } from "@/components/features/blog-og-ordbog/ContentEntry";
import { getBlogPost, getBlogPosts } from "@/lib/blog";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { AuthorCard } from "@/components/features/blog-og-ordbog/AuthorCard";
import { TableOfContents } from "@/components/features/blog-og-ordbog/TableOfContents";
import { getAuthorForStructuredData } from "@/lib/authors";
import { calculateReadingTime, extractTableOfContents } from "@/lib/utils";
import { Metadata } from "next";
import { Calendar, Clock } from "lucide-react";

interface BlogPostStructuredDataProps {
  term: {
    title: string;
    description?: string;
    content: string;
    slug: string;
    datePublished: string;
    lastUpdated: string;
    author?: string;
  };
}

function BlogPostStructuredData({ term }: BlogPostStructuredDataProps) {
  const authorData = getAuthorForStructuredData(term.author);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["WebPage", "BlogPosting"],
    name: term.title,
    headline: term.title,
    description: term.description || term.title,
    datePublished: term.datePublished,
    dateModified: term.lastUpdated,
    author: authorData || {
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

function formatDanishDate(dateStr: string): string {
  const [day, month, year] = dateStr.split("-");
  const months = [
    "januar",
    "februar",
    "marts",
    "april",
    "maj",
    "juni",
    "juli",
    "august",
    "september",
    "oktober",
    "november",
    "december",
  ];
  return `${day}. ${months[parseInt(month) - 1]} ${year}`;
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    term: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ term: string }>;
}): Promise<Metadata> {
  const { term } = await params;
  const post = await getBlogPost(term);
  return {
    title: post.metaTitle || `${post.title} | FysFinder Blog`,
    description: post.description,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ term: string }>;
}) {
  const { term } = await params;
  const post = await getBlogPost(term);
  const headings = extractTableOfContents(post.content);
  const readingTime = calculateReadingTime(post.content);

  const breadcrumbItems = [
    { text: "Blog", link: "/blog" },
    { text: post.title },
  ];

  // Determine which date to show and the appropriate label
  const isUpdated = post.datePublished !== post.lastUpdated;
  const dateToShow = isUpdated ? post.lastUpdated : post.datePublished;
  const dateLabel = isUpdated ? "Sidst opdateret" : "Udgivet";

  return (
    <div className="container mx-auto px-4 py-8">
      <BlogPostStructuredData term={post} />
      <div className="flex flex-col lg:flex-row lg:gap-8">
        <TableOfContents headings={headings} />
        <div className="flex-1 max-w-2xl">
          <Breadcrumbs items={breadcrumbItems} />
          <div className="flex items-center gap-8 text-sm text-gray-500 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {dateLabel} {formatDanishDate(dateToShow)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{readingTime}</span>
            </div>
          </div>
          <AuthorCard authorSlug={post.author} />
          <ContentEntry
            term={post}
            backLink={{
              href: "/blog",
              text: "Tilbage til blog",
            }}
          />
        </div>
      </div>
    </div>
  );
}
