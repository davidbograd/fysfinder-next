// Added: 2026-09-07 - Paths, canonical base URL and stable section anchor ids for the symptom universe.

export const SYMPTOMER_PATH = "/symptomer";
export const SYMPTOMER_SITE_URL = "https://www.fysfinder.dk";

/** Fallback destination when a condition has no matching finder specialty. */
export const FINDER_PATH = "/find/fysioterapeut/danmark";

export const DEFAULT_SYMPTOMER_OG_IMAGE = "/opengraph-fysfinder.jpg";

/**
 * Stable anchor ids for condition-page sections. Kept as fixed ASCII constants
 * rather than derived from heading text so in-content links (e.g. `#oevelser`)
 * keep working when copy is rewritten.
 */
export const CONDITION_SECTION_IDS = {
  quickFacts: "kort-fortalt",
  introduction: "hvad-er-det",
  symptoms: "symptomer",
  causes: "aarsager",
  selfManagement: "hvad-kan-du-goere",
  exercises: "oevelser",
  whenToSeekHelp: "hvornaar-boer-du-soege-hjaelp",
  findPhysio: "find-fysioterapeut",
  relatedConditions: "relaterede-problemstillinger",
  seoContent: "mere-om-problemstillingen",
  faq: "faq",
} as const;

/** Stable anchor ids for body-area page sections. */
export const BODY_AREA_SECTION_IDS = {
  painLocations: "hvor-har-du-ondt",
  symptomContexts: "hvornaar-oplever-du-smerter",
  conditions: "problemstillinger",
  exercises: "oevelser",
  findPhysio: "find-fysioterapeut",
  seoContent: "mere-om-symptomerne",
  faq: "faq",
} as const;

/** Stable anchor ids for the `/symptomer` hub sections. */
export const SYMPTOMS_HUB_SECTION_IDS = {
  bodyAreas: "kropsomraader",
  journey: "saadan-kommer-du-i-gang",
  bodyAreaNavigation: "udforsk-efter-kropsomraade",
  popularConditions: "typiske-problemstillinger",
  seoContent: "mere-om-smerter-og-symptomer",
} as const;

/** Every in-page anchor that content data is allowed to link to. */
export const ALL_SECTION_IDS: string[] = [
  ...Object.values(CONDITION_SECTION_IDS),
  ...Object.values(BODY_AREA_SECTION_IDS),
  ...Object.values(SYMPTOMS_HUB_SECTION_IDS),
];
