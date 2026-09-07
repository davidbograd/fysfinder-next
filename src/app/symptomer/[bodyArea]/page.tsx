// Added: 2026-09-07 - Level 2 of the symptom universe: generic body-area page (/symptomer/knae) driven entirely by BodyArea + Condition data.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ConditionCardGrid } from "@/components/features/symptomer/ConditionCardGrid";
import { ContentBlocks } from "@/components/features/symptomer/ContentBlocks";
import { FindPhysioCTA } from "@/components/features/symptomer/FindPhysioCTA";
import { NavigationCardGrid } from "@/components/features/symptomer/NavigationCardGrid";
import { SymptomExerciseGrid } from "@/components/features/symptomer/SymptomExerciseGrid";
import { SymptomFaq } from "@/components/features/symptomer/SymptomFaq";
import { SymptomJourneyAnalytics } from "@/components/features/symptomer/SymptomJourneyAnalytics";
import { SymptomSection } from "@/components/features/symptomer/SymptomSection";
import { BodyPartSymptomsHero } from "@/components/features/symptomer/SymptomHeroes";
import { BodyAreaStructuredData } from "@/components/features/symptomer/SymptomerStructuredData";
import {
  BODY_AREA_SECTION_IDS,
  SYMPTOMER_PATH,
  bodyAreaHref,
  getActiveBodyArea,
  getActiveBodyAreaSlugs,
  getConditionsForBodyArea,
} from "@/lib/symptomer";
import { buildSymptomerMetadata } from "@/lib/symptomer/metadata";

export function generateStaticParams() {
  return getActiveBodyAreaSlugs().map((bodyArea) => ({ bodyArea }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bodyArea: string }>;
}): Promise<Metadata> {
  const { bodyArea: bodyAreaSlug } = await params;
  const bodyArea = getActiveBodyArea(bodyAreaSlug);

  if (!bodyArea) {
    return { title: "Ikke fundet" };
  }

  return buildSymptomerMetadata({
    title: bodyArea.page.metaTitle,
    description: bodyArea.page.metaDescription,
    path: bodyAreaHref(bodyArea.slug),
    imageAlt: `Fysfinder – symptomer og smerter i ${bodyArea.name.toLocaleLowerCase("da-DK")}`,
  });
}

export default async function BodyPartSymptomsPage({
  params,
}: {
  params: Promise<{ bodyArea: string }>;
}) {
  const { bodyArea: bodyAreaSlug } = await params;
  const bodyArea = getActiveBodyArea(bodyAreaSlug);

  if (!bodyArea) {
    notFound();
  }

  const { page } = bodyArea;
  const conditions = getConditionsForBodyArea(bodyArea.slug);
  const heroConditions = conditions.slice(0, page.heroConditionLimit);

  return (
    <div className="mx-auto w-full max-w-[1120px] py-8">
      <BodyAreaStructuredData bodyArea={bodyArea} conditions={conditions} />
      <SymptomJourneyAnalytics />

      <Breadcrumbs
        items={[
          { text: "Forside", link: "/" },
          { text: "Symptomer", link: SYMPTOMER_PATH },
          { text: bodyArea.name },
        ]}
      />

      <BodyPartSymptomsHero h1={page.h1} intro={page.heroIntro}>
        <ConditionCardGrid conditions={heroConditions} className="mt-8" />
      </BodyPartSymptomsHero>

      <SymptomSection
        id={BODY_AREA_SECTION_IDS.painLocations}
        heading={page.painLocations.heading}
        intro={page.painLocations.intro}
      >
        <NavigationCardGrid
          cards={page.painLocations.cards}
          bodyAreaSlug={bodyArea.slug}
        />
      </SymptomSection>

      <SymptomSection
        id={BODY_AREA_SECTION_IDS.symptomContexts}
        heading={page.symptomContexts.heading}
        intro={page.symptomContexts.intro}
      >
        <NavigationCardGrid
          cards={page.symptomContexts.cards}
          bodyAreaSlug={bodyArea.slug}
        />
      </SymptomSection>

      <SymptomSection
        id={BODY_AREA_SECTION_IDS.conditions}
        heading={page.conditionGrid.heading}
        intro={page.conditionGrid.intro}
      >
        <ConditionCardGrid conditions={conditions} className="mt-8" />
      </SymptomSection>

      <SymptomSection
        id={BODY_AREA_SECTION_IDS.exercises}
        heading={page.exercises.heading}
        intro={page.exercises.intro}
      >
        <SymptomExerciseGrid
          section={page.exercises}
          highlightBodyPartSlug={bodyArea.slug}
        />
      </SymptomSection>

      <SymptomSection
        id={BODY_AREA_SECTION_IDS.findPhysio}
        heading={page.findPhysio.heading}
      >
        <FindPhysioCTA
          section={page.findPhysio}
          bodyAreaSlug={bodyArea.slug}
        />
      </SymptomSection>

      <SymptomSection
        id={BODY_AREA_SECTION_IDS.seoContent}
        heading={page.seoContent.heading}
      >
        <ContentBlocks blocks={page.seoContent.blocks} />
      </SymptomSection>

      <SymptomSection id={BODY_AREA_SECTION_IDS.faq} heading={page.faq.heading}>
        <SymptomFaq section={page.faq} />
      </SymptomSection>
    </div>
  );
}
