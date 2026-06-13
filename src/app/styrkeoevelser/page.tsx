import { Metadata } from "next";
import Link from "next/link";
import { ExerciseGridCard } from "@/components/features/styrkeoevelser/ExerciseGridCard";
import { StyrkeoevelserHubJumpLinks } from "@/components/features/styrkeoevelser/StyrkeoevelserHubJumpLinks";
import { StyrkeoevelserHubStructuredData } from "@/components/features/styrkeoevelser/StyrkeoevelserStructuredData";
import { StyrkeoevelserMdxBody } from "@/components/features/styrkeoevelser/StyrkeoevelserMdxBody";
import {
  STYRKEOEVELSER_HUB_ALLE_ANCHOR_ID,
  STYRKEOEVELSER_HUB_BODY_SECTIONS,
  resolveHubSectionBodyPartLinkSlugs,
} from "@/lib/styrkeoevelser-hub-sections";
import {
  STYRKEOEVELSER_PATH,
  STYRKEOEVELSER_SITE_URL,
  STYRKEOEVELSER_INDEX_EXERCISE_COUNT_TOKEN,
  bodyPartPhraseInSentence,
  getAllBodyPartsList,
  getAllExercisesList,
  getBodyPartSlugs,
  getBodyPartTitleBySlug,
  getStyrkeoevelserHubFooterContent,
  getStyrkeoevelserHubGuideContent,
  getStyrkeoevelserIndexContent,
  pickExercisesForHubSection,
} from "@/lib/styrkeoevelser";

const STYRKEOEVELSER_DEFAULT_OG_IMAGE = "/opengraph-fysfinder.jpg";

export function generateMetadata(): Metadata {
  const index = getStyrkeoevelserIndexContent();
  const title =
    index?.metaTitle ??
    (index?.title
      ? `${index.title} | Fysfinder`
      : "Styrkeøvelser – oversigt | Fysfinder");
  const description =
    index?.description ??
    "Find styrkeøvelser efter kropsdel eller alfabetisk på Fysfinder.";
  const canonical = `${STYRKEOEVELSER_SITE_URL}${STYRKEOEVELSER_PATH}`;
  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      locale: "da_DK",
      siteName: "Fysfinder",
      images: [
        {
          url: STYRKEOEVELSER_DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: "Fysfinder – styrkeøvelser",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [STYRKEOEVELSER_DEFAULT_OG_IMAGE],
    },
  };
}

export default function StyrkeoevelserHubPage() {
  const index = getStyrkeoevelserIndexContent();
  const bodyParts = getAllBodyPartsList();
  const bodyPartSlugs = getBodyPartSlugs();
  const exercises = getAllExercisesList();
  const hubGuide = getStyrkeoevelserHubGuideContent();
  const hubFooter = getStyrkeoevelserHubFooterContent();

  const definedTerms = [
    ...bodyParts.map((bp) => ({
      name: bp.title,
      url: `${STYRKEOEVELSER_SITE_URL}${STYRKEOEVELSER_PATH}/${bp.slug}`,
      description: bp.description,
    })),
    ...exercises.map((ex) => ({
      name: ex.title,
      url: `${STYRKEOEVELSER_SITE_URL}${STYRKEOEVELSER_PATH}/${ex.slug}`,
      description: ex.description,
    })),
  ];

  const hubName = index?.title ?? "Styrkeøvelser";
  const hubDescription =
    index?.description ??
    "Oversigt over styrkeøvelser og kropsdele på Fysfinder.";

  const indexMdxSource =
    index?.content.replaceAll(
      STYRKEOEVELSER_INDEX_EXERCISE_COUNT_TOKEN,
      String(exercises.length)
    ) ?? "";

  return (
    <div className="container mx-auto py-8">
      <StyrkeoevelserHubStructuredData
        name={hubName}
        description={hubDescription}
        definedTerms={definedTerms}
      />
      <h1 className="md:text-4xl text-3xl font-bold mb-4">{hubName}</h1>
      {index ? (
        <StyrkeoevelserMdxBody
          source={indexMdxSource}
          currentPagePath={STYRKEOEVELSER_PATH}
        />
      ) : (
        <p className="text-xl text-gray-600 mb-8">
          Styrkeøvelser på Fysfinder er under opbygning.
        </p>
      )}
      <StyrkeoevelserHubJumpLinks />

      <div className="mt-12 space-y-16">
        {STYRKEOEVELSER_HUB_BODY_SECTIONS.map((sec) => {
          const sectionExercises = pickExercisesForHubSection(sec.matchSlugs);
          const linkSlugs = resolveHubSectionBodyPartLinkSlugs(
            sec.matchSlugs,
            bodyPartSlugs
          );
          return (
            <section
              key={sec.id}
              id={sec.id}
              className="scroll-mt-32"
              aria-labelledby={`${sec.id}-heading`}
            >
              <div className="mb-2 flex flex-col gap-3 border-b border-gray-200 pb-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                <h2
                  id={`${sec.id}-heading`}
                  className="min-w-0 shrink text-2xl font-semibold text-gray-900"
                >
                  {sec.heading}
                </h2>
                {linkSlugs.length > 0 ? (
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 text-sm sm:shrink-0 sm:justify-end">
                    {linkSlugs.map((bpSlug) => {
                      const label = bodyPartPhraseInSentence(
                        getBodyPartTitleBySlug(bpSlug)
                      );
                      return (
                        <Link
                          key={bpSlug}
                          href={`${STYRKEOEVELSER_PATH}/${bpSlug}`}
                          className="text-logo-blue underline-offset-2 hover:underline"
                        >
                          Se alle {label} øvelser
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
              <p className="text-gray-600 mb-6 max-w-3xl">{sec.intro}</p>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sectionExercises.map((ex) => (
                  <li key={ex.slug} className="h-full">
                    <ExerciseGridCard exercise={ex} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {hubGuide ? (
        <div className="mt-16 prose prose-gray max-w-none">
          <StyrkeoevelserMdxBody
            source={hubGuide}
            currentPagePath={STYRKEOEVELSER_PATH}
          />
        </div>
      ) : null}

      <section
        id={STYRKEOEVELSER_HUB_ALLE_ANCHOR_ID}
        className="mt-16 scroll-mt-32"
        aria-labelledby="all-exercises-heading"
      >
        <h2
          id="all-exercises-heading"
          className="text-2xl font-semibold mb-4 border-b border-gray-200 pb-2"
        >
          Alle øvelser (A–Å)
        </h2>
        <p className="text-gray-600 mb-6 max-w-2xl text-sm">
          Sorteret alfabetisk. Vælg en øvelse for at læse om teknik og
          kropsdele.
        </p>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {exercises.map((ex) => (
            <li key={ex.slug} className="h-full">
              <ExerciseGridCard exercise={ex} />
            </li>
          ))}
        </ul>
      </section>

      {hubFooter ? (
        <div className="mt-16 prose prose-gray max-w-none">
          <StyrkeoevelserMdxBody
            source={hubFooter}
            currentPagePath={STYRKEOEVELSER_PATH}
          />
        </div>
      ) : null}

      <p className="mt-10 text-sm text-gray-500">
        <Link href="/" className="text-logo-blue hover:underline">
          Tilbage til forsiden
        </Link>
      </p>
    </div>
  );
}
