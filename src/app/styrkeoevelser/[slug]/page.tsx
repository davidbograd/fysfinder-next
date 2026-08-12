import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TableOfContents } from "@/components/features/blog-og-ordbog/TableOfContents";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ExerciseCardsForBodyPart } from "@/components/features/styrkeoevelser/ExerciseCardsForBodyPart";
import { ExerciseHowToSteps } from "@/components/features/styrkeoevelser/ExerciseHowToSteps";
import { ExerciseVideoSection } from "@/components/features/styrkeoevelser/ExerciseVideoSection";
import {
  StyrkeoevelserAuthorBlock,
  StyrkeoevelserUsps,
} from "@/components/features/styrkeoevelser/StyrkeoevelserAssurance";
import { RelatedExercises } from "@/components/features/styrkeoevelser/RelatedExercises";
import {
  StyrkeoevelserBodyPartStructuredData,
  StyrkeoevelserExerciseStructuredData,
} from "@/components/features/styrkeoevelser/StyrkeoevelserStructuredData";
import { StyrkeoevelserMdxBody } from "@/components/features/styrkeoevelser/StyrkeoevelserMdxBody";
import { RelatedContentSection } from "@/components/features/blog-og-ordbog/RelatedContentSection";
import { resolveRelatedLinks } from "@/lib/related-content";
import {
  STYRKEOEVELSER_PATH,
  STYRKEOEVELSER_SITE_URL,
  BODY_PART_HERO_IMAGES,
  getBodyPart,
  getBodyPartSlugs,
  getBodyPartTitleBySlug,
  getExercise,
  getExerciseSlugs,
  getExercisesForBodyPart,
  getRelatedExercises,
  parseExerciseHowTo,
  splitLeadParagraph,
} from "@/lib/styrkeoevelser";
import { extractTableOfContents } from "@/lib/utils";

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
    const title = ex.metaTitle ?? `${ex.title} styrkeøvelse | Sådan gør du →`;
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
      ...(ex.unlisted
        ? { robots: { index: false, follow: false, nocache: true } }
        : {}),
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
            width: ex.previewImage ? 1024 : 1200,
            height: ex.previewImage ? 1024 : 630,
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
    const { lead, rest } = splitLeadParagraph(bp.content);
    const headings = extractTableOfContents(rest);
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

        {/* 1. Hero: text left, image right */}
        <section className="grid items-start gap-8 rounded-3xl bg-brand-beige p-6 sm:p-10 lg:grid-cols-[3fr_2fr]">
          <div>
            <h1 className="mb-4 text-4xl font-bold text-gray-800">
              {bp.h1 ?? bp.title}
            </h1>
            {lead ? (
              <p className="mb-6 text-lg leading-relaxed text-gray-600">
                {lead}
              </p>
            ) : null}
            <StyrkeoevelserAuthorBlock />
            <StyrkeoevelserUsps />
          </div>
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-100">
            <Image
              src={
                BODY_PART_HERO_IMAGES[slug] ??
                "/images/styrkeoevelser/placeholder-card.png"
              }
              alt={`${bp.title} – styrkeøvelser`}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>
        </section>

        <div className="mt-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* 2. All exercises for this body part, full width */}
        <section className="mt-10" aria-labelledby="bp-exercises-heading">
          <h2
            id="bp-exercises-heading"
            className="mb-6 border-b-2 border-gray-200 pb-2 text-2xl font-semibold text-gray-800"
          >
            Øvelser
          </h2>
          <ExerciseCardsForBodyPart
            exercises={exercises}
            currentBodyPartSlug={slug}
          />
          <div className="mt-8">
            <Link
              href={STYRKEOEVELSER_PATH}
              className="text-logo-blue hover:underline"
            >
              ← Tilbage til styrkeøvelser
            </Link>
          </div>
        </section>

        {/* 3. SEO text with table of contents */}
        <div className="mt-16 flex flex-col lg:flex-row lg:gap-8">
          <TableOfContents headings={headings} />
          <div className="flex-1 max-w-2xl">
            <StyrkeoevelserMdxBody source={rest} currentPagePath={currentPath} />
            <RelatedContentSection
              links={resolveRelatedLinks(bp.related, currentPath)}
            />
          </div>
        </div>
      </div>
    );
  }

  if (isExerciseSlug(slug)) {
    const ex = getExercise(slug);
    const { lead, howTo, rest } = parseExerciseHowTo(ex.content);
    const headings = extractTableOfContents(rest);
    const related = getRelatedExercises(slug, ex.bodyParts, 12);
    const currentPath = `${STYRKEOEVELSER_PATH}/${slug}`;

    const breadcrumbItems = [
      { text: "Styrkeøvelser", link: STYRKEOEVELSER_PATH },
      { text: ex.title },
    ];

    return (
      <div className="container mx-auto py-8">
        <StyrkeoevelserExerciseStructuredData exercise={ex} />

        {/* 1. Hero: text left, image right */}
        <section className="grid items-start gap-8 rounded-3xl bg-brand-beige p-6 sm:p-10 lg:grid-cols-[3fr_2fr]">
          <div>
            {ex.bodyParts.length > 0 ? (
              <div className="mb-3 flex flex-wrap gap-2">
                {ex.bodyParts.map((bpSlug) => (
                  <Link
                    key={bpSlug}
                    href={`${STYRKEOEVELSER_PATH}/${bpSlug}`}
                    className="inline-flex rounded-full border border-gray-200 bg-white/60 px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-white"
                  >
                    {getBodyPartTitleBySlug(bpSlug)}
                  </Link>
                ))}
              </div>
            ) : null}
            <h1 className="mb-4 text-4xl font-bold text-gray-800">
              {ex.title}
            </h1>
            {lead ? (
              <p className="mb-6 text-lg leading-relaxed text-gray-600">
                {lead}
              </p>
            ) : null}
            <StyrkeoevelserAuthorBlock authorSlug={ex.author} />
            <StyrkeoevelserUsps />
          </div>
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-100">
            <Image
              src={
                ex.previewImage ??
                "/images/styrkeoevelser/ovelser/placeholder-styrkeoevelse.jpg"
              }
              alt={ex.previewImageAlt ?? `${ex.title} – styrkeøvelse`}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>
        </section>

        <div className="mt-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* 2. How-to steps, sharing their heading with the demo video */}
        {howTo ? (
          <ExerciseHowToSteps
            howTo={howTo}
            media={
              ex.videoUrl ? (
                <ExerciseVideoSection
                  videoUrl={ex.videoUrl}
                  title={ex.videoName ?? ex.title}
                  posterUrl={ex.videoThumbnailUrl}
                  attribution={ex.videoAttribution}
                  attributionLogo={ex.videoAttributionLogo}
                  className="lg:sticky lg:top-24"
                />
              ) : undefined
            }
          />
        ) : ex.videoUrl ? (
          <ExerciseVideoSection
            videoUrl={ex.videoUrl}
            title={ex.videoName ?? ex.title}
            posterUrl={ex.videoThumbnailUrl}
            attribution={ex.videoAttribution}
            attributionLogo={ex.videoAttributionLogo}
            className="mt-16"
          />
        ) : null}

        {/* 3. Related exercises */}
        <RelatedExercises exercises={related} />

        {/* 4. SEO text with table of contents */}
        <div className="mt-16 flex flex-col lg:flex-row lg:gap-8">
          <TableOfContents headings={headings} />
          <div className="flex-1 max-w-2xl">
            <StyrkeoevelserMdxBody source={rest} currentPagePath={currentPath} />
          </div>
        </div>

        <div className="mt-10">
          <Link
            href={STYRKEOEVELSER_PATH}
            className="text-logo-blue hover:underline"
          >
            ← Tilbage til styrkeøvelser
          </Link>
        </div>
      </div>
    );
  }

  notFound();
}
