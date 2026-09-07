// Added: 2026-09-07 - Public lookup API for the symptom universe: body-area/condition resolution, relation lookups, URL builders and exercise/reviewer joins.

import {
  BODY_PART_HERO_IMAGES,
  getAllExercisesList,
  type StyrkeoevelserDifficulty,
} from "@/lib/styrkeoevelser";
import { getAuthor, type Author } from "@/lib/authors";
import { bodyAreas } from "./body-areas";
import { conditions } from "./conditions";
import { FINDER_PATH, SYMPTOMER_PATH, SYMPTOMER_SITE_URL } from "./constants";
import type {
  ActiveBodyArea,
  BodyArea,
  Condition,
  MedicalReview,
} from "./types";

export * from "./constants";
export * from "./types";
export { parseRichText, richTextToPlainText } from "./rich-text";
export { symptomsHub } from "./symptoms-hub";

/* -------------------------------------------------------------------------- */
/* Body areas                                                                  */
/* -------------------------------------------------------------------------- */

export function getBodyAreas(): BodyArea[] {
  return bodyAreas;
}

export function getActiveBodyAreas(): ActiveBodyArea[] {
  return bodyAreas.filter((area): area is ActiveBodyArea => area.isActive);
}

export function getActiveBodyAreaSlugs(): string[] {
  return getActiveBodyAreas().map((area) => area.slug);
}

/** Returns the body area only if it is active, so routes stay in sync with navigation. */
export function getActiveBodyArea(slug: string): ActiveBodyArea | undefined {
  return getActiveBodyAreas().find((area) => area.slug === slug);
}

/**
 * Body-area slugs whose illustration lives under a different key in
 * `BODY_PART_HERO_IMAGES`. Only needed where the two universes disagree on
 * naming — matching slugs resolve automatically.
 */
const BODY_AREA_IMAGE_OVERRIDES: Record<string, string> = {};

/**
 * The anatomical illustration for a body area, reusing the `/styrkeoevelser`
 * body-part artwork so the two universes stay visually consistent and we do not
 * ship a second copy of the same images. Returns `undefined` when no
 * illustration exists for the area rather than substituting a different body
 * part, since a wrong illustration is worse than none on a health page.
 */
export function getBodyAreaImage(bodyAreaSlug: string): string | undefined {
  return (
    BODY_AREA_IMAGE_OVERRIDES[bodyAreaSlug] ??
    BODY_PART_HERO_IMAGES[bodyAreaSlug]
  );
}

/* -------------------------------------------------------------------------- */
/* Conditions                                                                  */
/* -------------------------------------------------------------------------- */

export function getActiveConditions(): Condition[] {
  return conditions.filter((condition) => condition.isActive);
}

export function getActiveCondition(
  bodyAreaSlug: string,
  conditionSlug: string
): Condition | undefined {
  return getActiveConditions().find(
    (condition) =>
      condition.bodyAreaSlug === bodyAreaSlug &&
      condition.slug === conditionSlug
  );
}

/** Complete level-3 navigation for a body area, in registry order. */
export function getConditionsForBodyArea(bodyAreaSlug: string): Condition[] {
  return getActiveConditions().filter(
    (condition) => condition.bodyAreaSlug === bodyAreaSlug
  );
}

/**
 * Resolves a list of condition slugs to active conditions, preserving the order
 * of the relation. Unknown or inactive slugs are dropped so an empty relation
 * simply renders nothing.
 */
export function getConditionsBySlugs(slugs: string[]): Condition[] {
  const active = getActiveConditions();
  return slugs
    .map((slug) => active.find((condition) => condition.slug === slug))
    .filter((condition): condition is Condition => Boolean(condition));
}

/** Every `{ bodyArea, condition }` pair that should get a route. */
export function getActiveConditionParams(): Array<{
  bodyArea: string;
  condition: string;
}> {
  const activeSlugs = new Set(getActiveBodyAreaSlugs());
  return getActiveConditions()
    .filter((condition) => activeSlugs.has(condition.bodyAreaSlug))
    .map((condition) => ({
      bodyArea: condition.bodyAreaSlug,
      condition: condition.slug,
    }));
}

/* -------------------------------------------------------------------------- */
/* URLs                                                                        */
/* -------------------------------------------------------------------------- */

export function bodyAreaHref(bodyAreaSlug: string): string {
  return `${SYMPTOMER_PATH}/${bodyAreaSlug}`;
}

export function conditionHref(condition: Condition): string {
  return `${SYMPTOMER_PATH}/${condition.bodyAreaSlug}/${condition.slug}`;
}

export function absoluteSymptomerUrl(path: string): string {
  return `${SYMPTOMER_SITE_URL}${path}`;
}

/**
 * The finder destination for a condition or body area. Falls back to the general
 * finder when no specialty is given; an unknown specialty slug is redirected to
 * the location page by the finder route itself, so links never 404.
 */
export function findPhysioHref(specialtySlugs: string[]): string {
  const [specialty] = specialtySlugs;
  return specialty ? `${FINDER_PATH}/${specialty}` : FINDER_PATH;
}

/** "Læs om løberknæ →" — derived so card CTAs never drift from the name. */
export function conditionCardCtaLabel(condition: Condition): string {
  return `Læs om ${condition.name.toLocaleLowerCase("da-DK")} →`;
}

/* -------------------------------------------------------------------------- */
/* Joins into the existing exercise universe and author profiles               */
/* -------------------------------------------------------------------------- */

export interface SymptomExerciseCard {
  slug: string;
  title: string;
  description: string;
  bodyParts: string[];
  previewImage?: string;
  previewImageAlt?: string;
  equipment?: string;
  difficulty?: StyrkeoevelserDifficulty;
}

/**
 * Looks up exercises in the existing `/styrkeoevelser` content, preserving the
 * order declared on the condition. Exercise content is never duplicated here.
 */
export function getSymptomExercises(slugs: string[]): SymptomExerciseCard[] {
  const all = getAllExercisesList();
  return slugs
    .map((slug) => all.find((exercise) => exercise.slug === slug))
    .filter((exercise): exercise is SymptomExerciseCard => Boolean(exercise));
}

export interface ResolvedReviewer {
  author: Author;
  /** Danish long-form date, e.g. "7. september 2026". */
  reviewDateLabel: string;
  reviewDate: string;
  profileHref: string;
}

export function resolveReviewer(
  review: MedicalReview
): ResolvedReviewer | undefined {
  const author = getAuthor(review.authorSlug);
  if (!author) return undefined;

  return {
    author,
    reviewDate: review.reviewDate,
    reviewDateLabel: new Date(review.reviewDate).toLocaleDateString("da-DK", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    profileHref: `/forfatter/${author.slug}`,
  };
}
