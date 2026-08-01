/**
 * Body-part slugs that exist in both ordbog and styrkeøvelser.
 * Auto-linker keeps head-term links inside the current content universe;
 * cross-universe bridges should be curated (e.g. "Se også"), not keyword collisions.
 */
export const BODY_PART_OVERLAP_SLUGS = [
  "albue",
  "ankel",
  "arm",
  "ben",
  "bryst",
  "fod",
  "haandled",
  "hofte",
  "knae",
  "laend",
  "mave",
  "nakke",
  "ryg",
  "skulder",
] as const;

export type BodyPartOverlapSlug = (typeof BODY_PART_OVERLAP_SLUGS)[number];

/** Danish head-term inflections for overlapping body parts (same concept → one destination family). */
export const BODY_PART_HEAD_KEYWORDS: Record<BodyPartOverlapSlug, string[]> = {
  albue: ["Albue", "Albuen", "Albuer", "Albuerne"],
  ankel: ["Ankel", "Anklen", "Ankler", "Anklerne"],
  arm: ["Arm", "Armen", "Arme", "Armene"],
  ben: ["Ben", "Benet", "Benene"],
  bryst: ["Bryst", "Brystet", "Bryster", "Brysterne"],
  fod: ["Fod", "Foden", "Fødder", "Fødderne"],
  haandled: ["Håndled", "Håndleddet", "Håndleddene"],
  hofte: ["Hofte", "Hoften", "Hofter", "Hofterne"],
  knae: ["Knæ", "Knæet", "Knæene"],
  laend: ["Lænd", "Lænden"],
  mave: ["Mave", "Maven", "Maver", "Maverne"],
  nakke: ["Nakke", "Nakken", "Nakker", "Nakkerne"],
  ryg: ["Ryg", "Ryggen", "Rygge"],
  skulder: ["Skulder", "Skulderen", "Skuldre", "Skuldrene"],
};

const ORDBOG_BODY_PART_DESTINATIONS = new Set(
  BODY_PART_OVERLAP_SLUGS.map((slug) => `/ordbog/${slug}`)
);

const STYRKEOEVELSER_BODY_PART_DESTINATIONS = new Set(
  BODY_PART_OVERLAP_SLUGS.map((slug) => `/styrkeoevelser/${slug}`)
);

export function isOrdbogBodyPartDestination(destination: string): boolean {
  return ORDBOG_BODY_PART_DESTINATIONS.has(destination);
}

export function isStyrkeoevelserBodyPartDestination(
  destination: string
): boolean {
  return STYRKEOEVELSER_BODY_PART_DESTINATIONS.has(destination);
}

export function ordbogBodyPartSlugFromDestination(
  destination: string
): BodyPartOverlapSlug | null {
  if (!isOrdbogBodyPartDestination(destination)) {
    return null;
  }
  return destination.replace("/ordbog/", "") as BodyPartOverlapSlug;
}

export function styrkeoevelserBodyPartSlugFromDestination(
  destination: string
): BodyPartOverlapSlug | null {
  if (!isStyrkeoevelserBodyPartDestination(destination)) {
    return null;
  }
  return destination.replace(
    "/styrkeoevelser/",
    ""
  ) as BodyPartOverlapSlug;
}
