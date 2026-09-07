// Added: 2026-09-07 - Level 1 of the symptom universe: /symptomer hub with body-area navigation, patient journey, popular conditions and SEO content.

import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { BodyAreaGrid } from "@/components/features/symptomer/BodyAreaGrid";
import { BodyAreaLinkSections } from "@/components/features/symptomer/BodyAreaLinkSections";
import { ConditionCardGrid } from "@/components/features/symptomer/ConditionCardGrid";
import { ContentBlocks } from "@/components/features/symptomer/ContentBlocks";
import {
  MedicalDisclaimer,
  PatientJourneySteps,
} from "@/components/features/symptomer/PatientJourneySteps";
import { SymptomJourneyAnalytics } from "@/components/features/symptomer/SymptomJourneyAnalytics";
import { SymptomSection } from "@/components/features/symptomer/SymptomSection";
import { SymptomsHero } from "@/components/features/symptomer/SymptomHeroes";
import { SymptomsHubStructuredData } from "@/components/features/symptomer/SymptomerStructuredData";
import {
  SYMPTOMER_PATH,
  SYMPTOMS_HUB_SECTION_IDS,
  getActiveBodyAreas,
  getBodyAreas,
  getConditionsBySlugs,
  symptomsHub,
} from "@/lib/symptomer";
import { buildSymptomerMetadata } from "@/lib/symptomer/metadata";

export const metadata: Metadata = buildSymptomerMetadata({
  title: symptomsHub.metaTitle,
  description: symptomsHub.metaDescription,
  path: SYMPTOMER_PATH,
});

export default function SymptomerPage() {
  const bodyAreas = getBodyAreas();
  const activeBodyAreas = getActiveBodyAreas();
  const popularConditions = getConditionsBySlugs(
    symptomsHub.popularConditions.conditionSlugs
  );

  return (
    <div className="mx-auto w-full max-w-[1120px] py-8">
      <SymptomsHubStructuredData
        name={symptomsHub.h1}
        description={symptomsHub.metaDescription}
        bodyAreas={activeBodyAreas}
      />
      <SymptomJourneyAnalytics />

      <Breadcrumbs items={[{ text: "Forside", link: "/" }, { text: "Symptomer" }]} />

      <SymptomsHero h1={symptomsHub.h1} intro={symptomsHub.heroIntro}>
        <div className="mt-8">
          <h2
            id={SYMPTOMS_HUB_SECTION_IDS.bodyAreas}
            className="text-[20px] font-medium text-[#1f2b28]"
          >
            {symptomsHub.bodyAreaGridHeading}
          </h2>
          <div className="mt-4">
            <BodyAreaGrid
              bodyAreas={bodyAreas}
              headingId={SYMPTOMS_HUB_SECTION_IDS.bodyAreas}
            />
          </div>
        </div>
      </SymptomsHero>

      <SymptomSection
        id={SYMPTOMS_HUB_SECTION_IDS.journey}
        heading={symptomsHub.journey.heading}
      >
        <PatientJourneySteps steps={symptomsHub.journey.steps} />
        <MedicalDisclaimer text={symptomsHub.disclaimer} />
      </SymptomSection>

      <SymptomSection
        id={SYMPTOMS_HUB_SECTION_IDS.bodyAreaNavigation}
        heading={symptomsHub.bodyAreaNavigation.heading}
      >
        <BodyAreaLinkSections bodyAreas={activeBodyAreas} />
      </SymptomSection>

      <SymptomSection
        id={SYMPTOMS_HUB_SECTION_IDS.popularConditions}
        heading={symptomsHub.popularConditions.heading}
      >
        <ConditionCardGrid conditions={popularConditions} className="mt-8" />
      </SymptomSection>

      <SymptomSection
        id={SYMPTOMS_HUB_SECTION_IDS.seoContent}
        heading={symptomsHub.seoContent.heading}
      >
        <ContentBlocks blocks={symptomsHub.seoContent.blocks} />
      </SymptomSection>
    </div>
  );
}
