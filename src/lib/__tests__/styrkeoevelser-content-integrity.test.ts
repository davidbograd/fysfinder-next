import {
  getBodyPartSlugs,
  getExerciseSlugs,
  getExercise,
} from "@/lib/styrkeoevelser";
import { STYRKEOEVELSER_HUB_BODY_SECTIONS } from "@/lib/styrkeoevelser-hub-sections";

describe("styrkeøvelser content integrity", () => {
  const bodyPartSlugs = getBodyPartSlugs();
  const exerciseSlugs = getExerciseSlugs();

  it("has the expected number of body parts and exercises", () => {
    expect(bodyPartSlugs.length).toBe(14);
    expect(exerciseSlugs.length).toBeGreaterThanOrEqual(110);
  });

  it("tags every exercise with body parts that resolve to a body-part page", () => {
    const valid = new Set(bodyPartSlugs);
    const offenders: string[] = [];
    for (const slug of exerciseSlugs) {
      const ex = getExercise(slug);
      expect(ex.bodyParts.length).toBeGreaterThan(0);
      for (const bp of ex.bodyParts) {
        if (!valid.has(bp)) {
          offenders.push(`${slug} -> ${bp}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("references only valid body-part slugs in hub section matchSlugs", () => {
    const valid = new Set(bodyPartSlugs);
    const offenders: string[] = [];
    for (const section of STYRKEOEVELSER_HUB_BODY_SECTIONS) {
      for (const slug of section.matchSlugs) {
        if (!valid.has(slug)) {
          offenders.push(`${section.id} -> ${slug}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("does not leak the CSV 'same as h1' instruction into exercise meta titles", () => {
    const offenders = exerciseSlugs.filter((slug) => {
      const meta = getExercise(slug).metaTitle?.toLowerCase();
      return meta === "same as h1";
    });
    expect(offenders).toEqual([]);
  });
});
