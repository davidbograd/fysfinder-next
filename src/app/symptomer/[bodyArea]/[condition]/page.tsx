// Added: 2026-09-07 - Level 3 of the symptom universe: one generic ConditionPage template that renders every problemstilling from Condition data.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ConditionCardGrid } from "@/components/features/symptomer/ConditionCardGrid";
import {
  ConditionQuickFacts,
  MedicalReviewer,
} from "@/components/features/symptomer/ConditionQuickFacts";
import { ContentBlocks } from "@/components/features/symptomer/ContentBlocks";
import { FindPhysioCTA } from "@/components/features/symptomer/FindPhysioCTA";
import { SymptomExerciseGrid } from "@/components/features/symptomer/SymptomExerciseGrid";
import { SymptomFaq } from "@/components/features/symptomer/SymptomFaq";
import { SymptomJourneyAnalytics } from "@/components/features/symptomer/SymptomJourneyAnalytics";
import { SymptomSection } from "@/components/features/symptomer/SymptomSection";
import { ConditionHero } from "@/components/features/symptomer/SymptomHeroes";
import { ConditionStructuredData } from "@/components/features/symptomer/SymptomerStructuredData";
import {
  CONDITION_SECTION_IDS,
  SYMPTOMER_PATH,
  bodyAreaHref,
  conditionHref,
  getActiveBodyArea,
  getActiveCondition,
  getActiveConditionParams,
  getConditionsBySlugs,
} from "@/lib/symptomer";
import { buildSymptomerMetadata } from "@/lib/symptomer/metadata";

export function generateStaticParams() {
  return getActiveConditionParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bodyArea: string; condition: string }>;
}): Promise<Metadata> {
  const { bodyArea, condition: conditionSlug } = await params;
  const condition = getActiveCondition(bodyArea, conditionSlug);

  if (!condition) {
    return { title: "Ikke fundet" };
  }

  return buildSymptomerMetadata({
    title: condition.metaTitle,
    description: condition.metaDescription,
    path: conditionHref(condition),
    imageAlt: `Fysfinder – ${condition.name.toLocaleLowerCase("da-DK")}`,
  });
}

export default async function ConditionPage({
  params,
}: {
  params: Promise<{ bodyArea: string; condition: string }>;
}) {
  const { bodyArea: bodyAreaSlug, condition: conditionSlug } = await params;
  const bodyArea = getActiveBodyArea(bodyAreaSlug);
  const condition = getActiveCondition(bodyAreaSlug, conditionSlug);

  if (!bodyArea || !condition) {
    notFound();
  }

  const relatedConditions = getConditionsBySlugs(
    condition.relatedConditions.conditionSlugs
  );

  return (
    <div className="mx-auto w-full max-w-[1120px] py-8">
      <ConditionStructuredData condition={condition} bodyArea={bodyArea} />
      <SymptomJourneyAnalytics />

      <Breadcrumbs
        items={[
          { text: "Forside", link: "/" },
          { text: "Symptomer", link: SYMPTOMER_PATH },
          { text: bodyArea.name, link: bodyAreaHref(bodyArea.slug) },
          { text: condition.name },
        ]}
      />

      <ConditionHero h1={condition.h1} intro={condition.heroIntro}>
        <ConditionQuickFacts quickFacts={condition.quickFacts} />
        <MedicalReviewer review={condition.reviewedBy} />
      </ConditionHero>

      <SymptomSection
        id={CONDITION_SECTION_IDS.introduction}
        heading={condition.introduction.heading}
      >
        <ContentBlocks blocks={condition.introduction.blocks} />
      </SymptomSection>

      <SymptomSection
        id={CONDITION_SECTION_IDS.symptoms}
        heading={condition.symptoms.heading}
      >
        <ContentBlocks blocks={condition.symptoms.blocks} />
      </SymptomSection>

      <SymptomSection
        id={CONDITION_SECTION_IDS.causes}
        heading={condition.causes.heading}
      >
        <ContentBlocks blocks={condition.causes.blocks} />
      </SymptomSection>

      <SymptomSection
        id={CONDITION_SECTION_IDS.selfManagement}
        heading={condition.selfManagement.heading}
      >
        <ContentBlocks blocks={condition.selfManagement.blocks} />
      </SymptomSection>

      <SymptomSection
        id={CONDITION_SECTION_IDS.exercises}
        heading={condition.exercises.heading}
        intro={condition.exercises.intro}
      >
        <SymptomExerciseGrid
          section={condition.exercises}
          highlightBodyPartSlug={bodyArea.slug}
        />
      </SymptomSection>

      <SymptomSection
        id={CONDITION_SECTION_IDS.whenToSeekHelp}
        heading={condition.whenToSeekHelp.heading}
      >
        <ContentBlocks blocks={condition.whenToSeekHelp.blocks} />
      </SymptomSection>

      <SymptomSection
        id={CONDITION_SECTION_IDS.findPhysio}
        heading={condition.findPhysio.heading}
      >
        <FindPhysioCTA
          section={condition.findPhysio}
          bodyAreaSlug={bodyArea.slug}
          conditionSlug={condition.slug}
        />
      </SymptomSection>

      {relatedConditions.length > 0 ? (
        <SymptomSection
          id={CONDITION_SECTION_IDS.relatedConditions}
          heading={condition.relatedConditions.heading}
          intro={condition.relatedConditions.intro}
        >
          <ConditionCardGrid conditions={relatedConditions} className="mt-8" />
        </SymptomSection>
      ) : null}

      <SymptomSection
        id={CONDITION_SECTION_IDS.seoContent}
        heading={condition.seoContent.heading}
      >
        <ContentBlocks blocks={condition.seoContent.blocks} />
      </SymptomSection>

      <SymptomSection
        id={CONDITION_SECTION_IDS.faq}
        heading={condition.faq.heading}
      >
        <SymptomFaq section={condition.faq} />
      </SymptomSection>

      <div className="mt-12">
        <Link
          href={bodyAreaHref(bodyArea.slug)}
          className="text-[16px] text-brand-primary hover:underline"
        >
          ← Tilbage til alle {bodyArea.hub.heading.toLocaleLowerCase("da-DK")}
        </Link>
      </div>
    </div>
  );
}
