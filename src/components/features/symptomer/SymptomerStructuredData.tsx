// Added: 2026-09-07 - JSON-LD for the three symptom levels: BreadcrumbList, WebPage/MedicalWebPage, ItemList, FAQPage and the reviewing Person.

import { getAuthorForStructuredData } from "@/lib/authors";
import {
  SYMPTOMER_PATH,
  SYMPTOMER_SITE_URL,
  absoluteSymptomerUrl,
  bodyAreaHref,
  conditionHref,
  resolveReviewer,
  richTextToPlainText,
} from "@/lib/symptomer";
import type {
  ActiveBodyArea,
  Condition,
  FaqSection,
} from "@/lib/symptomer/types";

const publisher = {
  "@type": "Organization" as const,
  name: "Fysfinder",
  url: SYMPTOMER_SITE_URL,
};

const hubUrl = absoluteSymptomerUrl(SYMPTOMER_PATH);

function breadcrumbSchema(
  items: Array<{ text: string; link?: string }>
): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        ...(item.link ? { "@id": absoluteSymptomerUrl(item.link) } : {}),
        name: item.text,
      },
    })),
  };
}

/** Only emitted when the questions and answers are visible on the page. */
function faqSchema(faq: FaqSection): Record<string, unknown> {
  return {
    "@type": "FAQPage",
    mainEntity: faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer.map(richTextToPlainText).join(" "),
      },
    })),
  };
}

function JsonLd({ graph }: { graph: Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": graph,
        }),
      }}
    />
  );
}

interface HubStructuredDataProps {
  name: string;
  description: string;
  bodyAreas: ActiveBodyArea[];
}

export function SymptomsHubStructuredData({
  name,
  description,
  bodyAreas,
}: HubStructuredDataProps) {
  return (
    <JsonLd
      graph={[
        breadcrumbSchema([
          { text: "Forside", link: "/" },
          { text: "Symptomer", link: SYMPTOMER_PATH },
        ]),
        {
          "@type": ["WebPage", "CollectionPage"],
          "@id": `${hubUrl}#webpage`,
          url: hubUrl,
          name,
          description,
          publisher,
          about: { "@type": "MedicalSpecialty", name: "Fysioterapi" },
        },
        {
          "@type": "ItemList",
          name: "Kropsområder",
          numberOfItems: bodyAreas.length,
          itemListElement: bodyAreas.map((area, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: area.name,
            item: absoluteSymptomerUrl(bodyAreaHref(area.slug)),
          })),
        },
      ]}
    />
  );
}

interface BodyAreaStructuredDataProps {
  bodyArea: ActiveBodyArea;
  conditions: Condition[];
}

export function BodyAreaStructuredData({
  bodyArea,
  conditions,
}: BodyAreaStructuredDataProps) {
  const pageUrl = absoluteSymptomerUrl(bodyAreaHref(bodyArea.slug));

  return (
    <JsonLd
      graph={[
        breadcrumbSchema([
          { text: "Forside", link: "/" },
          { text: "Symptomer", link: SYMPTOMER_PATH },
          { text: bodyArea.name },
        ]),
        {
          "@type": ["WebPage", "MedicalWebPage", "CollectionPage"],
          "@id": `${pageUrl}#webpage`,
          url: pageUrl,
          name: bodyArea.page.h1,
          description: bodyArea.page.metaDescription,
          publisher,
          isPartOf: { "@id": `${hubUrl}#webpage` },
          specialty: "Fysioterapi",
          medicalAudience: "Patienter og sundhedsinteresserede",
        },
        {
          "@type": "ItemList",
          name: bodyArea.page.conditionGrid.heading,
          numberOfItems: conditions.length,
          itemListElement: conditions.map((condition, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: condition.name,
            item: absoluteSymptomerUrl(conditionHref(condition)),
          })),
        },
        faqSchema(bodyArea.page.faq),
      ]}
    />
  );
}

interface ConditionStructuredDataProps {
  condition: Condition;
  bodyArea: ActiveBodyArea;
}

export function ConditionStructuredData({
  condition,
  bodyArea,
}: ConditionStructuredDataProps) {
  const pageUrl = absoluteSymptomerUrl(conditionHref(condition));
  const reviewer = resolveReviewer(condition.reviewedBy);
  const reviewerSchema = getAuthorForStructuredData(
    condition.reviewedBy.authorSlug
  );

  const webPage: Record<string, unknown> = {
    "@type": ["WebPage", "MedicalWebPage"],
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: condition.h1,
    headline: condition.h1,
    description: condition.metaDescription,
    publisher,
    isPartOf: {
      "@id": `${absoluteSymptomerUrl(bodyAreaHref(bodyArea.slug))}#webpage`,
    },
    specialty: "Fysioterapi",
    medicalAudience: "Patienter og sundhedsinteresserede",
    about: { "@type": "MedicalCondition", name: condition.name },
    mainEntityOfPage: { "@id": `${pageUrl}#webpage` },
  };

  if (reviewer) {
    webPage.dateModified = reviewer.reviewDate;
    webPage.lastReviewed = reviewer.reviewDate;
  }

  if (reviewerSchema) {
    webPage.reviewedBy = reviewerSchema;
    webPage.author = reviewerSchema;
  }

  return (
    <JsonLd
      graph={[
        breadcrumbSchema([
          { text: "Forside", link: "/" },
          { text: "Symptomer", link: SYMPTOMER_PATH },
          { text: bodyArea.name, link: bodyAreaHref(bodyArea.slug) },
          { text: condition.name },
        ]),
        webPage,
        faqSchema(condition.faq),
      ]}
    />
  );
}
