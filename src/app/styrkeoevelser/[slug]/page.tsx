import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentEntry } from "@/components/features/blog-og-ordbog/ContentEntry";
import { AuthorCard } from "@/components/features/blog-og-ordbog/AuthorCard";
import { TableOfContents } from "@/components/features/blog-og-ordbog/TableOfContents";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ExerciseCardsForBodyPart } from "@/components/features/styrkeoevelser/ExerciseCardsForBodyPart";
import { ExerciseVideoSection } from "@/components/features/styrkeoevelser/ExerciseVideoSection";
import { RelatedExercises } from "@/components/features/styrkeoevelser/RelatedExercises";
import {
  StyrkeoevelserBodyPartStructuredData,
  StyrkeoevelserExerciseStructuredData,
} from "@/components/features/styrkeoevelser/StyrkeoevelserStructuredData";
import { StyrkeoevelserMdxBody } from "@/components/features/styrkeoevelser/StyrkeoevelserMdxBody";
import {
  STYRKEOEVELSER_PATH,
  STYRKEOEVELSER_SITE_URL,
  getBodyPart,
  getBodyPartSlugs,
  getExercise,
  getExerciseSlugs,
  getExercisesForBodyPart,
  getRelatedExercises,
} from "@/lib/styrkeoevelser";
import {
  calculateReadingTime,
  extractTableOfContents,
} from "@/lib/utils";
import { Calendar, Clock } from "lucide-react";

const DEFAULT_OG_IMAGE = "/opengraph-fysfinder.jpg";

export async function generateStaticParams() {
  const slugs = [
    ...getBodyPartSlugs().map((slug) => ({ slug })),
    ...getExerciseSlugs().map((slug) => ({ slug })),
  ];
  return slugs;
}

function isBodyPartSlug(slug: string): boolean {
  return getBodyPartSlugs().includes(slug);
}

function isExerciseSlug(slug: string): boolean {
  return getExerciseSlugs().includes(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  if (isBodyPartSlug(slug)) {
    const bp = getBodyPart(slug);
    const title = bp.metaTitle ?? `${bp.title} – styrkeøvelser | Fysfinder`;
    const canonical = `${STYRKEOEVELSER_SITE_URL}${STYRKEOEVELSER_PATH}/${slug}`;
    return {
      title,
      description: bp.description,
      alternates: {
        canonical,
      },
      openGraph: {
        title,
        description: bp.description,
        url: canonical,
        type: "website",
        siteName: "Fysfinder",
        locale: "da_DK",
        images: [
          {
            url: DEFAULT_OG_IMAGE,
            width: 1200,
            height: 630,
            alt: `Fysfinder – ${bp.title}`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: bp.description,
        images: [DEFAULT_OG_IMAGE],
      },
    };
  }

  if (isExerciseSlug(slug)) {
    const ex = getExercise(slug);
    const title = ex.metaTitle ?? `${ex.title} – styrkeøvelse | Fysfinder`;
    const canonical = `${STYRKEOEVELSER_SITE_URL}${STYRKEOEVELSER_PATH}/${slug}`;
    const ogImagePath = ex.previewImage ?? DEFAULT_OG_IMAGE;
    const ogImageAlt = ex.previewImage
      ? (ex.previewImageAlt ?? ex.title)
      : "Fysfinder – styrkeøvelser";

    return {
      title,
      description: ex.description,
      alternates: {
        canonical,
      },
      openGraph: {
        title,
        description: ex.description,
        url: canonical,
        type: "article",
        siteName: "Fysfinder",
        locale: "da_DK",
        images: [
          {
            url: ogImagePath,
            width: ex.previewImage ? 1200 : 1200,
            height: ex.previewImage ? 800 : 630,
            alt: ogImageAlt,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: ex.description,
        images: [ogImagePath],
      },
    };
  }

  return { title: "Ikke fundet" };
}

export default async function StyrkeoevelserSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (isBodyPartSlug(slug)) {
    const bp = getBodyPart(slug);
    const exercises = getExercisesForBodyPart(slug);
    const headings = extractTableOfContents(bp.content);
    const currentPath = `${STYRKEOEVELSER_PATH}/${slug}`;

    const exerciseUrls = exercises.map((ex) => ({
      name: ex.title,
      url: `${STYRKEOEVELSER_SITE_URL}${STYRKEOEVELSER_PATH}/${ex.slug}`,
      description: ex.description,
    }));

    const breadcrumbItems = [
      { text: "Styrkeøvelser", link: STYRKEOEVELSER_PATH },
      { text: bp.title },
    ];

    return (
      <div className="container mx-auto py-8">
        <StyrkeoevelserBodyPartStructuredData
          title={bp.title}
          description={bp.description}
          slug={slug}
          exerciseUrls={exerciseUrls}
        />
        <div className="flex flex-col lg:flex-row lg:gap-8">
          <TableOfContents headings={headings} />
          <div className="flex-1 max-w-2xl">
            <Breadcrumbs items={breadcrumbItems} />
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Calendar className="h-4 w-4" />
              <span>Sidst opdateret {bp.lastUpdated}</span>
            </div>
            <h1 className="text-4xl font-bold mb-6 text-gray-800">
              {bp.title}
            </h1>
            <StyrkeoevelserMdxBody
              source={bp.content}
              currentPagePath={currentPath}
            />
            <section className="mt-12" aria-labelledby="bp-exercises-heading">
              <h2
                id="bp-exercises-heading"
                className="text-2xl font-semibold mb-6 text-gray-800 border-b-2 border-gray-200 pb-2"
              >
                Øvelser
              </h2>
              <ExerciseCardsForBodyPart
                exercises={exercises}
                currentBodyPartSlug={slug}
              />
            </section>
            <div className="mt-10">
              <Link
                href={STYRKEOEVELSER_PATH}
                className="text-logo-blue hover:underline"
              >
                ← Tilbage til styrkeøvelser
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isExerciseSlug(slug)) {
    const ex = getExercise(slug);
    const headings = extractTableOfContents(ex.content);
    const readingTime = calculateReadingTime(ex.content);
    const related = getRelatedExercises(slug, ex.bodyParts, 6);

    const breadcrumbItems = [
      { text: "Styrkeøvelser", link: STYRKEOEVELSER_PATH },
      { text: ex.title },
    ];

    return (
      <div className="container mx-auto py-8">
        <StyrkeoevelserExerciseStructuredData exercise={ex} />
        <div className="flex flex-col lg:flex-row lg:gap-8">
          <TableOfContents headings={headings} />
          <div className="flex-1 max-w-2xl">
            <Breadcrumbs items={breadcrumbItems} />
            <div className="flex items-center gap-8 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Sidst opdateret {ex.lastUpdated}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{readingTime}</span>
              </div>
            </div>
            <AuthorCard authorSlug={ex.author} />
            <ContentEntry
              term={{ slug: ex.slug, title: ex.title, content: ex.content }}
              backLink={{
                href: STYRKEOEVELSER_PATH,
                text: "Tilbage til styrkeøvelser",
              }}
              showBackLink={false}
            />
            {ex.videoUrl ? (
              <ExerciseVideoSection
                videoUrl={ex.videoUrl}
                title={ex.videoName ?? ex.title}
              />
            ) : null}
            <RelatedExercises exercises={related} />
            <div className="mt-10">
              <Link
                href={STYRKEOEVELSER_PATH}
                className="text-logo-blue hover:underline"
              >
                ← Tilbage til styrkeøvelser
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  notFound();
}
