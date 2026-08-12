import {
  getAllExercisesList,
  getExercise,
  getExerciseSlugs,
  getExercisesForBodyPart,
  getListedExerciseSlugs,
  getRelatedExercises,
  getStyrkeoevelserLinkMappings,
  pickExercisesForHubSection,
} from "@/lib/styrkeoevelser";

const UNLISTED_SLUG = "squat-physitrack-test";

describe("unlisted styrkeøvelser", () => {
  it("keeps the unlisted exercise routable so its page still builds", () => {
    expect(getExerciseSlugs()).toContain(UNLISTED_SLUG);

    const ex = getExercise(UNLISTED_SLUG);
    expect(ex.unlisted).toBe(true);
    expect(ex.videoUrl).toBeTruthy();
    expect(ex.videoAttribution).toMatch(/Physitrack/);
  });

  it("excludes it from the listed slugs used by listings and the sitemap", () => {
    expect(getListedExerciseSlugs()).not.toContain(UNLISTED_SLUG);
  });

  it("excludes it from the full exercise list and hub sections", () => {
    expect(getAllExercisesList().map((ex) => ex.slug)).not.toContain(
      UNLISTED_SLUG
    );
    expect(
      pickExercisesForHubSection(["ben", "knae"]).map((ex) => ex.slug)
    ).not.toContain(UNLISTED_SLUG);
  });

  it("excludes it from the body-part pages it is tagged with", () => {
    const ex = getExercise(UNLISTED_SLUG);
    expect(ex.bodyParts).toEqual(expect.arrayContaining(["ben", "knae"]));

    for (const bodyPart of ex.bodyParts) {
      expect(
        getExercisesForBodyPart(bodyPart).map((item) => item.slug)
      ).not.toContain(UNLISTED_SLUG);
    }
  });

  it("excludes it from the related-exercises grid on sibling pages", () => {
    const related = getRelatedExercises("squat", ["ben", "knae"], 100);
    expect(related.map((ex) => ex.slug)).not.toContain(UNLISTED_SLUG);
  });

  it("excludes it from auto internal-link mappings", () => {
    const destinations = getStyrkeoevelserLinkMappings().map(
      (mapping) => mapping.destination
    );
    expect(destinations).not.toContain(`/styrkeoevelser/${UNLISTED_SLUG}`);
    expect(destinations).toContain("/styrkeoevelser/squat");
  });
});
