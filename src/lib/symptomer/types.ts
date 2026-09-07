// Added: 2026-09-07 - Content model for the symptom universe (/symptomer): body areas, conditions and the relations between them, exercises and specialties.

/**
 * Copy that may contain inline `[label](/href)` links and `**bold**` runs.
 * Parsed by `parseRichText` and rendered by the `RichText` component.
 */
export type RichText = string;

export type ContentBlock =
  | { type: "paragraph"; text: RichText }
  | { type: "list"; items: RichText[] }
  | { type: "subheading"; text: string };

export interface ContentSection {
  heading: string;
  blocks: ContentBlock[];
}

export interface QuickFact {
  label: string;
  value: string;
}

export interface FaqItem {
  question: string;
  /** One entry per rendered paragraph. */
  answer: RichText[];
}

export interface FaqSection {
  heading: string;
  items: FaqItem[];
}

/**
 * Content/navigation card used for pain locations and symptom contexts.
 * `conditionSlugs` may be empty, in which case the "Relevante problemstillinger"
 * list is left out entirely rather than rendered as an empty placeholder.
 */
export interface NavigationCard {
  id: string;
  title: string;
  description: string;
  conditionSlugs: string[];
}

export interface NavigationCardSection {
  heading: string;
  intro?: string;
  cards: NavigationCard[];
}

export interface ExerciseSection {
  heading: string;
  intro?: string;
  /**
   * Slugs of exercises in `src/content/styrkeoevelser/ovelser`. Exercise content
   * itself is never copied into the symptom universe — it is looked up.
   */
  exerciseSlugs: string[];
  ctaLabel: string;
  ctaHref: string;
}

export interface FindPhysioSection {
  heading: string;
  body: RichText;
  ctaLabel: string;
  /**
   * Specialty slugs from the `specialties` table, most specific first. The first
   * entry becomes `/find/fysioterapeut/danmark/{slug}`; an empty list falls back
   * to the general finder.
   */
  specialtySlugs: string[];
}

export interface MedicalReview {
  /** Slug in `src/lib/authors.ts`. */
  authorSlug: string;
  /** ISO date (YYYY-MM-DD). */
  reviewDate: string;
}

export interface RelatedConditionsSection {
  heading: string;
  intro?: string;
  conditionSlugs: string[];
}

/** Teaser for a body area on the `/symptomer` hub. */
export interface BodyAreaHubTeaser {
  /** H3 on the hub, e.g. "Knæsymptomer". */
  heading: string;
  description: string;
  ctaLabel: string;
  /** Conditions surfaced as plain links under the teaser. */
  popularConditionSlugs: string[];
}

/** Everything needed to render `/symptomer/{bodyArea}`. */
export interface BodyAreaPage {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  heroIntro: string;
  /** Conditions shown in the hero; the full list is repeated further down. */
  heroConditionLimit: number;
  painLocations: NavigationCardSection;
  symptomContexts: NavigationCardSection;
  conditionGrid: { heading: string; intro?: string };
  exercises: ExerciseSection;
  findPhysio: FindPhysioSection;
  seoContent: ContentSection;
  faq: FaqSection;
}

interface BodyAreaBase {
  slug: string;
  name: string;
  /** Short label used on the body-area grid. */
  description: string;
}

export interface ActiveBodyArea extends BodyAreaBase {
  isActive: true;
  hub: BodyAreaHubTeaser;
  page: BodyAreaPage;
}

export interface InactiveBodyArea extends BodyAreaBase {
  isActive: false;
}

/**
 * Only active body areas get indexable routes and navigation links. Inactive
 * ones exist as data so the grid can show the full body without linking to
 * pages that do not exist yet.
 */
export type BodyArea = ActiveBodyArea | InactiveBodyArea;

/** Everything needed to render `/symptomer/{bodyArea}/{condition}`. */
export interface Condition {
  slug: string;
  name: string;
  bodyAreaSlug: string;
  isActive: boolean;

  metaTitle: string;
  metaDescription: string;

  h1: string;
  heroIntro: string;
  /** 1–2 lines reused on every condition card across all three levels. */
  shortDescription: string;

  quickFacts: QuickFact[];
  reviewedBy: MedicalReview;

  introduction: ContentSection;
  symptoms: ContentSection;
  causes: ContentSection;
  selfManagement: ContentSection;
  exercises: ExerciseSection;
  whenToSeekHelp: ContentSection;
  findPhysio: FindPhysioSection;
  relatedConditions: RelatedConditionsSection;
  seoContent: ContentSection;
  faq: FaqSection;
}

export interface JourneyStep {
  title: string;
  description: string;
}

/** Everything needed to render the `/symptomer` hub. */
export interface SymptomsHubContent {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  heroIntro: string;
  bodyAreaGridHeading: string;
  journey: { heading: string; steps: JourneyStep[] };
  disclaimer: string;
  bodyAreaNavigation: { heading: string };
  popularConditions: { heading: string; conditionSlugs: string[] };
  seoContent: ContentSection;
}
