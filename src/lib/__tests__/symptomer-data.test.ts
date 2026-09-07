// Added: 2026-09-07 - Guards the symptom universe's relations: conditions, exercises, reviewers, in-page anchors and finder destinations must all resolve.

import { getAllExercisesList } from "@/lib/styrkeoevelser";
import {
  ALL_SECTION_IDS,
  SYMPTOMER_PATH,
  bodyAreaHref,
  conditionCardCtaLabel,
  conditionHref,
  findPhysioHref,
  getActiveBodyAreas,
  getActiveCondition,
  getActiveConditionParams,
  getActiveConditions,
  getBodyAreas,
  getConditionsBySlugs,
  getConditionsForBodyArea,
  getSymptomExercises,
  resolveReviewer,
  symptomsHub,
} from "@/lib/symptomer";
import { extractRichTextHrefs } from "@/lib/symptomer/rich-text";
import type {
  ContentBlock,
  FaqSection,
  RichText,
} from "@/lib/symptomer/types";

const activeConditions = getActiveConditions();
const activeBodyAreas = getActiveBodyAreas();

function blockRichText(blocks: ContentBlock[]): RichText[] {
  return blocks.flatMap((block) => {
    if (block.type === "paragraph") return [block.text];
    if (block.type === "list") return block.items;
    return [];
  });
}

function faqRichText(faq: FaqSection): RichText[] {
  return faq.items.flatMap((item) => item.answer);
}

/** Every rich-text string that ships with the symptom universe. */
function allRichText(): RichText[] {
  const fromHub = [
    ...blockRichText(symptomsHub.seoContent.blocks),
    symptomsHub.disclaimer,
  ];

  const fromBodyAreas = activeBodyAreas.flatMap((area) => [
    ...blockRichText(area.page.seoContent.blocks),
    ...faqRichText(area.page.faq),
    area.page.findPhysio.body,
  ]);

  const fromConditions = activeConditions.flatMap((condition) => [
    ...blockRichText(condition.introduction.blocks),
    ...blockRichText(condition.symptoms.blocks),
    ...blockRichText(condition.causes.blocks),
    ...blockRichText(condition.selfManagement.blocks),
    ...blockRichText(condition.whenToSeekHelp.blocks),
    ...blockRichText(condition.seoContent.blocks),
    ...faqRichText(condition.faq),
    condition.findPhysio.body,
  ]);

  return [...fromHub, ...fromBodyAreas, ...fromConditions];
}

describe("body areas", () => {
  it("only exposes Knæ as active in the MVP", () => {
    expect(activeBodyAreas.map((area) => area.slug)).toEqual(["knae"]);
  });

  it("keeps inactive body areas in the grid data without page content", () => {
    const inactive = getBodyAreas().filter((area) => !area.isActive);

    expect(inactive.length).toBeGreaterThan(0);
    for (const area of inactive) {
      expect(area).not.toHaveProperty("page");
    }
  });

  it("uses unique slugs", () => {
    const slugs = getBodyAreas().map((area) => area.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("conditions", () => {
  it("registers all five MVP knee conditions", () => {
    expect(getConditionsForBodyArea("knae").map((c) => c.slug)).toEqual([
      "loeberknae",
      "springerknae",
      "patellofemorale-smerter",
      "meniskskade",
      "artrose",
    ]);
  });

  it("uses unique slugs and belongs to an active body area", () => {
    const slugs = activeConditions.map((condition) => condition.slug);
    expect(new Set(slugs).size).toBe(slugs.length);

    const activeAreaSlugs = activeBodyAreas.map((area) => area.slug);
    for (const condition of activeConditions) {
      expect(activeAreaSlugs).toContain(condition.bodyAreaSlug);
    }
  });

  it("generates one route per active condition", () => {
    expect(getActiveConditionParams()).toHaveLength(activeConditions.length);
    expect(getActiveCondition("knae", "loeberknae")?.name).toBe("Løberknæ");
  });

  it("does not resolve conditions under the wrong body area", () => {
    expect(getActiveCondition("nakke", "loeberknae")).toBeUndefined();
  });

  it("builds hierarchical URLs", () => {
    const loeberknae = getActiveCondition("knae", "loeberknae")!;

    expect(bodyAreaHref("knae")).toBe(`${SYMPTOMER_PATH}/knae`);
    expect(conditionHref(loeberknae)).toBe(`${SYMPTOMER_PATH}/knae/loeberknae`);
    expect(conditionCardCtaLabel(loeberknae)).toBe("Læs om løberknæ →");
  });
});

describe("relations", () => {
  it("resolves every related-condition slug to an active condition", () => {
    for (const condition of activeConditions) {
      const slugs = condition.relatedConditions.conditionSlugs;
      expect(getConditionsBySlugs(slugs)).toHaveLength(slugs.length);
      expect(slugs).not.toContain(condition.slug);
    }
  });

  it("resolves every navigation-card condition slug", () => {
    for (const area of activeBodyAreas) {
      const cards = [
        ...area.page.painLocations.cards,
        ...area.page.symptomContexts.cards,
      ];

      for (const card of cards) {
        expect(getConditionsBySlugs(card.conditionSlugs)).toHaveLength(
          card.conditionSlugs.length
        );
      }
    }
  });

  it("keeps at least one navigation card with no relations, so empty states stay covered", () => {
    const cards = activeBodyAreas.flatMap((area) => [
      ...area.page.painLocations.cards,
      ...area.page.symptomContexts.cards,
    ]);

    expect(cards.some((card) => card.conditionSlugs.length === 0)).toBe(true);
  });

  it("drops unknown condition slugs instead of throwing", () => {
    expect(getConditionsBySlugs(["findes-ikke", "loeberknae"])).toHaveLength(1);
  });

  it("resolves popular hub conditions", () => {
    expect(
      getConditionsBySlugs(symptomsHub.popularConditions.conditionSlugs)
    ).toHaveLength(symptomsHub.popularConditions.conditionSlugs.length);
  });
});

describe("exercise relations", () => {
  const exerciseSlugs = new Set(
    getAllExercisesList().map((exercise) => exercise.slug)
  );

  it("references exercises that exist in the styrkeoevelser universe", () => {
    const sections = [
      ...activeBodyAreas.map((area) => area.page.exercises),
      ...activeConditions.map((condition) => condition.exercises),
    ];

    for (const section of sections) {
      for (const slug of section.exerciseSlugs) {
        expect(exerciseSlugs.has(slug)).toBe(true);
      }
      expect(getSymptomExercises(section.exerciseSlugs)).toHaveLength(
        section.exerciseSlugs.length
      );
    }
  });

  it("preserves the declared exercise order", () => {
    const slugs = ["step-ups", "split-squat"];
    expect(getSymptomExercises(slugs).map((e) => e.slug)).toEqual(slugs);
  });
});

describe("medical reviewers", () => {
  it("resolves a reviewer and a Danish review date for every condition", () => {
    for (const condition of activeConditions) {
      const reviewer = resolveReviewer(condition.reviewedBy);

      expect(reviewer).toBeDefined();
      expect(reviewer!.profileHref).toBe(
        `/forfatter/${condition.reviewedBy.authorSlug}`
      );
      expect(reviewer!.reviewDateLabel).not.toBe("Invalid Date");
    }
  });

  it("returns undefined for an unknown author instead of throwing", () => {
    expect(
      resolveReviewer({ authorSlug: "findes-ikke", reviewDate: "2026-01-01" })
    ).toBeUndefined();
  });
});

describe("find physiotherapist destinations", () => {
  it("uses the most specific specialty and falls back to the general finder", () => {
    expect(findPhysioHref(["loeberknae", "knae"])).toBe(
      "/find/fysioterapeut/danmark/loeberknae"
    );
    expect(findPhysioHref([])).toBe("/find/fysioterapeut/danmark");
  });
});

describe("in-page anchors in content data", () => {
  it("only links to section ids that actually exist", () => {
    const anchors = allRichText()
      .flatMap(extractRichTextHrefs)
      .filter((href) => href.startsWith("#"))
      .map((href) => href.slice(1));

    expect(anchors.length).toBeGreaterThan(0);
    for (const anchor of anchors) {
      expect(ALL_SECTION_IDS).toContain(anchor);
    }
  });

  it("keeps every other content link site-relative", () => {
    const hrefs = allRichText()
      .flatMap(extractRichTextHrefs)
      .filter((href) => !href.startsWith("#"));

    for (const href of hrefs) {
      expect(href.startsWith("/")).toBe(true);
    }
  });
});

describe("SEO fields", () => {
  it("gives every indexable page a meta title, description and single H1", () => {
    const pages = [
      {
        metaTitle: symptomsHub.metaTitle,
        metaDescription: symptomsHub.metaDescription,
        h1: symptomsHub.h1,
      },
      ...activeBodyAreas.map((area) => area.page),
      ...activeConditions,
    ];

    for (const page of pages) {
      expect(page.metaTitle.length).toBeGreaterThan(10);
      expect(page.metaDescription.length).toBeGreaterThan(50);
      expect(page.h1.length).toBeGreaterThan(10);
    }
  });

  it("gives every condition a FAQ and quick facts", () => {
    for (const condition of activeConditions) {
      expect(condition.faq.items.length).toBeGreaterThan(0);
      expect(condition.quickFacts.length).toBeGreaterThanOrEqual(3);
    }
  });
});
