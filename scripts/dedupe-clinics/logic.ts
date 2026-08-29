// One-time clinic duplicate classification: name/address similarity, keeper priority, and merge field fill.
// Updated: hard never-merge for Hjernerystelsesfyssen; high-confidence requires same city plus similar name or street.

export interface ClinicCandidate {
  clinics_id: string;
  klinikNavn: string;
  klinikNavnSlug: string;
  lokation: string | null;
  adresse: string | null;
  tlf: string | null;
  email: string | null;
  website: string | null;
  om_os: string | null;
  logo_url: string | null;
  google_place_id: string | null;
  verified_klinik: boolean;
  created_at: string;
  owners: number;
  premium: number;
  team: number;
  specialties: number;
  events: number;
  mandag?: string | null;
  tirsdag?: string | null;
  onsdag?: string | null;
  torsdag?: string | null;
  fredag?: string | null;
  lørdag?: string | null;
  søndag?: string | null;
}

export type GroupDecision = "high_confidence" | "needs_review" | "always_keep";

export interface DuplicateGroup {
  google_place_id: string;
  decision: GroupDecision;
  reason: string;
  keeper: ClinicCandidate | null;
  drops: ClinicCandidate[];
  clinics: ClinicCandidate[];
}

export const HJERNERYSTELSESFYSSEN_MARKER = "hjernerystelsesfyssen";

const MIN_NAME_CONTAINS_LEN = 4;
const MIN_CITY_PREFIX_LEN = 5;

export const FILLABLE_FIELDS = [
  "tlf",
  "email",
  "website",
  "om_os",
  "logo_url",
  "mandag",
  "tirsdag",
  "onsdag",
  "torsdag",
  "fredag",
  "lørdag",
  "søndag",
] as const;

export type FillableField = (typeof FILLABLE_FIELDS)[number];

function foldDanish(value: string): string {
  return value
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/ü/g, "u")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function normalizeName(name: string): string {
  return foldDanish(name)
    .replace(/\b(aps|a\/s|i\/s|ivs)\b/g, " ")
    .replace(/\bv\/\s*/g, " ")
    .replace(/\bved\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeCity(lokation: string | null): string {
  return foldDanish(lokation ?? "").replace(/[^a-z0-9]+/g, "");
}

export function isAlwaysKeepName(name: string): boolean {
  return normalizeName(name).includes(HJERNERYSTELSESFYSSEN_MARKER);
}

export function namesAreSimilar(a: string, b: string): boolean {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.length >= MIN_NAME_CONTAINS_LEN && nb.includes(na)) return true;
  if (nb.length >= MIN_NAME_CONTAINS_LEN && na.includes(nb)) return true;
  return false;
}

export function normalizeAddress(adresse: string | null): string {
  if (!adresse) return "";
  let value = foldDanish(adresse);
  value = value
    .replace(/\b(\d+\.?\s*)?(sal|th|tv|mf|kl)\b/g, " ")
    .replace(/\bst\.?\b/g, " ")
    .replace(/\b(stuen|kaelder|kælder)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  value = value.replace(/^\d+\s+/, "");
  value = value.replace(/\b(\d+)\s+([a-z])\b/g, "$1$2");
  return value;
}

export function addressStem(adresse: string | null): {
  street: string;
  num: string;
} | null {
  const normalized = normalizeAddress(adresse);
  if (!normalized) return null;
  const match = normalized.match(/^([a-z]+(?:\s+[a-z]+)*)\s+(\d+[a-z]?)/);
  if (!match) return null;
  return {
    street: match[1].replace(/\s+/g, ""),
    num: match[2],
  };
}

export function addressesAreSimilar(
  a: string | null,
  b: string | null
): boolean {
  const stemA = addressStem(a);
  const stemB = addressStem(b);
  if (!stemA || !stemB) return false;
  if (stemA.street !== stemB.street) return false;
  if (stemA.num === stemB.num) return true;
  const digitsA = stemA.num.replace(/[a-z]/g, "");
  const digitsB = stemB.num.replace(/[a-z]/g, "");
  return digitsA.length > 0 && digitsA === digitsB;
}

export function citiesAreSame(
  a: string | null,
  b: string | null
): boolean {
  const na = normalizeCity(a);
  const nb = normalizeCity(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.length >= MIN_CITY_PREFIX_LEN && nb.startsWith(na)) return true;
  if (nb.length >= MIN_CITY_PREFIX_LEN && na.startsWith(nb)) return true;
  return false;
}

export function pairIsSimilar(
  a: ClinicCandidate,
  b: ClinicCandidate
): boolean {
  return (
    namesAreSimilar(a.klinikNavn, b.klinikNavn) ||
    addressesAreSimilar(a.adresse, b.adresse)
  );
}

export function allSameCity(clinics: ClinicCandidate[]): boolean {
  if (clinics.length < 2) return true;
  return clinics.every((clinic) => citiesAreSame(clinic.lokation, clinics[0].lokation));
}

export function everyPairSimilar(clinics: ClinicCandidate[]): boolean {
  for (let i = 0; i < clinics.length; i += 1) {
    for (let j = i + 1; j < clinics.length; j += 1) {
      if (!pairIsSimilar(clinics[i], clinics[j])) return false;
    }
  }
  return true;
}

export function compareKeeperPriority(
  a: ClinicCandidate,
  b: ClinicCandidate
): number {
  if (Number(a.owners > 0) !== Number(b.owners > 0)) {
    return a.owners > 0 ? -1 : 1;
  }
  if (Number(a.premium > 0) !== Number(b.premium > 0)) {
    return a.premium > 0 ? -1 : 1;
  }
  if (Number(a.verified_klinik) !== Number(b.verified_klinik)) {
    return a.verified_klinik ? -1 : 1;
  }
  if (Number(a.team > 0) !== Number(b.team > 0)) {
    return a.team > 0 ? -1 : 1;
  }
  if (a.specialties !== b.specialties) return b.specialties - a.specialties;
  const aNormLen = normalizeName(a.klinikNavn).length;
  const bNormLen = normalizeName(b.klinikNavn).length;
  if (aNormLen !== bNormLen) return aNormLen - bNormLen;
  if (a.klinikNavn.length !== b.klinikNavn.length) {
    return a.klinikNavn.length - b.klinikNavn.length;
  }
  if (a.events !== b.events) return b.events - a.events;
  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
}

export function pickKeeper(clinics: ClinicCandidate[]): ClinicCandidate {
  if (clinics.length === 0) {
    throw new Error("Cannot pick a keeper from an empty group");
  }
  return [...clinics].sort(compareKeeperPriority)[0];
}

function withProposedKeeper(clinics: ClinicCandidate[]): {
  keeper: ClinicCandidate;
  drops: ClinicCandidate[];
} {
  const keeper = pickKeeper(clinics);
  return {
    keeper,
    drops: clinics.filter((clinic) => clinic.clinics_id !== keeper.clinics_id),
  };
}

export function classifyGroup(clinics: ClinicCandidate[]): DuplicateGroup {
  const google_place_id = clinics[0]?.google_place_id ?? "";

  if (clinics.some((clinic) => isAlwaysKeepName(clinic.klinikNavn))) {
    return {
      google_place_id,
      decision: "always_keep",
      reason: "hjernerystelsesfyssen_hard_keep",
      keeper: null,
      drops: [],
      clinics,
    };
  }

  const ownerCount = clinics.filter((clinic) => clinic.owners > 0).length;
  if (ownerCount > 1) {
    return {
      google_place_id,
      decision: "needs_review",
      reason: "multiple_owners",
      ...withProposedKeeper(clinics),
      clinics,
    };
  }

  const premiumCount = clinics.filter((clinic) => clinic.premium > 0).length;
  if (premiumCount > 1) {
    return {
      google_place_id,
      decision: "needs_review",
      reason: "multiple_premium",
      ...withProposedKeeper(clinics),
      clinics,
    };
  }

  if (!allSameCity(clinics)) {
    return {
      google_place_id,
      decision: "needs_review",
      reason: "different_city",
      ...withProposedKeeper(clinics),
      clinics,
    };
  }

  if (!everyPairSimilar(clinics)) {
    return {
      google_place_id,
      decision: "needs_review",
      reason: "dissimilar_name_or_address",
      ...withProposedKeeper(clinics),
      clinics,
    };
  }

  return {
    google_place_id,
    decision: "high_confidence",
    reason: "same_city_and_similar_name_or_address",
    ...withProposedKeeper(clinics),
    clinics,
  };
}

export function classifyGroups(
  clinics: ClinicCandidate[]
): DuplicateGroup[] {
  const byPlace = new Map<string, ClinicCandidate[]>();

  for (const clinic of clinics) {
    const placeId = clinic.google_place_id?.trim();
    if (!placeId) continue;
    const existing = byPlace.get(placeId) ?? [];
    existing.push(clinic);
    byPlace.set(placeId, existing);
  }

  return [...byPlace.values()]
    .filter((group) => group.length > 1)
    .map(classifyGroup)
    .sort((a, b) => {
      const order = { high_confidence: 0, needs_review: 1, always_keep: 2 };
      if (order[a.decision] !== order[b.decision]) {
        return order[a.decision] - order[b.decision];
      }
      const aName = a.keeper?.klinikNavn ?? a.clinics[0]?.klinikNavn ?? "";
      const bName = b.keeper?.klinikNavn ?? b.clinics[0]?.klinikNavn ?? "";
      return aName.localeCompare(bName, "da");
    });
}

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === "";
}

export function mergeFillableFields(
  keeper: Pick<ClinicCandidate, FillableField>,
  loser: Pick<ClinicCandidate, FillableField>
): Partial<Pick<ClinicCandidate, FillableField>> {
  const updates: Partial<Pick<ClinicCandidate, FillableField>> = {};
  for (const field of FILLABLE_FIELDS) {
    if (isEmpty(keeper[field]) && !isEmpty(loser[field])) {
      updates[field] = loser[field];
    }
  }
  return updates;
}
