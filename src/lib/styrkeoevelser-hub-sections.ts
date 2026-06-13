/** Hub page sections: jumplink id, filter label, heading, intro, and body-part slugs used to pick exercises. */
export type StyrkeoevelserHubBodySection = {
  id: string;
  jumpLabel: string;
  heading: string;
  intro: string;
  /** Exercises with any of these slugs in `bodyParts` are shown (up to perSectionLimit). */
  matchSlugs: string[];
};

/** Unique `matchSlugs` that exist as kropsdel pages (first-occurrence order). */
export const resolveHubSectionBodyPartLinkSlugs = (
  matchSlugs: readonly string[],
  validBodyPartSlugs: readonly string[]
): string[] => {
  const valid = new Set(validBodyPartSlugs);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const slug of matchSlugs) {
    if (!valid.has(slug) || seen.has(slug)) {
      continue;
    }
    seen.add(slug);
    out.push(slug);
  }
  return out;
};

export const STYRKEOEVELSER_HUB_BODY_SECTIONS: StyrkeoevelserHubBodySection[] = [
  {
    id: "hub-arme",
    jumpLabel: "Arme",
    heading: "Træningsøvelser til arme",
    intro:
      "Styrkeøvelser til arme fokuserer typisk på biceps, triceps og underarme.",
    matchSlugs: ["arme"],
  },
  {
    id: "hub-skuldre",
    jumpLabel: "Skuldre",
    heading: "Træningsøvelser til skuldre",
    intro:
      "Stærke skuldre er essentielle for at opretholde en god kropsholdning og stabilitet. Se vores træningsøvelser der styrker både for-, side- og bagskulder.",
    matchSlugs: ["skulder"],
  },
  {
    id: "hub-bryst",
    jumpLabel: "Bryst",
    heading: "Træningsøvelser til bryst",
    intro:
      "Brystmusklerne er afgørende for mange daglige bevægelser og aktiviteter. Se eksempler på brystøvelser.",
    matchSlugs: ["bryst"],
  },
  {
    id: "hub-ryg-laend",
    jumpLabel: "Ryg og lænd",
    heading: "Træningsøvelser til ryg og lænd",
    intro:
      "Rygtræning styrker både den øvre og nedre ryg samt lænden, hvilket forbedrer kropsholdning og reducerer risikoen for skader. Se vores øvelser til træning af ryg og lænd.",
    matchSlugs: ["ryg", "laend", "bagl"],
  },
  {
    id: "hub-ben-hofte-knae",
    jumpLabel: "Ben, hofte og knæ",
    heading: "Træningsøvelser til ben, hofte og knæ",
    intro:
      "Styrkelse af dine ben, hofte og knæ er vigtigt for både stabilitet, balance og mobilitet. Se vores ben, knæ og hofte styrkeøvelser, der hjælper med at forebygge skader og forbedre din præstation i andre aktiviteter.",
    matchSlugs: ["ben", "hofte", "knae", "balde"],
  },
  {
    id: "hub-mave-core",
    jumpLabel: "Mave og core",
    heading: "Træningsøvelser til mave og core",
    intro:
      "En stærk core er alpha og omega for god kropskontrol, balance og styrke i hele kroppen. Se vores træningsøvelser til mave og core.",
    matchSlugs: ["mave", "core"],
  },
  {
    id: "hub-fod-ankel",
    jumpLabel: "Fod og ankel",
    heading: "Træningsøvelser til fod og ankel",
    intro:
      "Træning af dine fødder og ankler giver dig bedre balance, styrker musklerne, forbedrer din fleksibilitet og kan forebygge skader. Se vores træningsøvelser til fødder og ankler.",
    matchSlugs: ["fod", "ankel"],
  },
  {
    id: "hub-haandled-albue",
    jumpLabel: "Håndled og albue",
    heading: "Træningsøvelser til håndled og albue",
    intro:
      "Håndled og albuer udsættes ofte for belastninger, især ved gentagne bevægelser eller sportsaktiviteter. Styrkeøvelser til håndled og albue kan forbedre din fleksibilitet, øge din styrke og mindske risikoen for overbelastningsskader. Se vores øvelser til håndled og albue.",
    matchSlugs: ["haandled", "albue"],
  },
  {
    id: "hub-nakke",
    jumpLabel: "Nakke",
    heading: "Træningsøvelser til nakke",
    intro:
      "Nakken er et følsomt område, som ofte bliver overbelastet ved dårlig holdning eller stillesiddende arbejde. Træningsøvelser til nakken kan reducere spændinger, forbedre fleksibiliteten og styrke muskulaturen. Se vores øvelser til nakken.",
    matchSlugs: ["nakke"],
  },
];

export const STYRKEOEVELSER_HUB_ALLE_ANCHOR_ID = "alle-ovelser";
