/**
 * Profile completeness for owned clinics (dashboard checklist).
 * Contact: at least one of e-mail, phone, or website counts as complete.
 */

export type ClinicProfileChecklistKey =
  | "contact"
  | "about"
  | "openingHours"
  | "specialties"
  | "team"
  | "pricing"
  | "insurances";

export type ClinicProfileCompleteness = {
  completedCount: number;
  totalCount: number;
  percent: number;
  missingKeys: ClinicProfileChecklistKey[];
};

const CHECKLIST_KEYS: ClinicProfileChecklistKey[] = [
  "contact",
  "about",
  "openingHours",
  "specialties",
  "team",
  "pricing",
  "insurances",
];

/**
 * Order for recommending what to add next (dashboard nudge + tooltip list).
 * Not the same as CHECKLIST_KEYS (evaluation order is irrelevant for scoring).
 */
export const CLINIC_PROFILE_RECOMMENDATION_ORDER: ClinicProfileChecklistKey[] = [
  "contact",
  "pricing",
  "specialties",
  "about",
  "openingHours",
  "team",
  "insurances",
];

const recommendationPriority = Object.fromEntries(
  CLINIC_PROFILE_RECOMMENDATION_ORDER.map((key, index) => [key, index])
) as Record<ClinicProfileChecklistKey, number>;

export const sortMissingKeysByRecommendation = (
  keys: ClinicProfileChecklistKey[]
): ClinicProfileChecklistKey[] =>
  [...keys].sort((a, b) => recommendationPriority[a] - recommendationPriority[b]);

/** Shown on the dashboard when the clinic has no usable contact channel. */
export const CLINIC_PROFILE_CONTACT_NO_INFO_WARNING_DA =
  "Din klinik har ingen kontaktoplysninger. Patienter har ingen mulighed for at kontakte dig.";

/** CTA under the contact warning; links to the clinic editor (contact fields). */
export const CLINIC_PROFILE_CONTACT_ADD_INFO_CTA_DA = "Tilføj oplysninger";

export const clinicProfileChecklistDetailLabelsDa: Record<
  ClinicProfileChecklistKey,
  string
> = {
  contact: "Mindst én kontaktoplysning (e-mail, telefon eller website)",
  about: "Beskrivelse under ”Om os”",
  openingHours: "Åbningstider",
  specialties: "Mindst ét speciale",
  team: "Mindst ét teammedlem",
  pricing:
    "Med ydernummer: intet mere. Uden ydernummer: udfyld Pris, første konsultation og Pris, opfølgning.",
  insurances: "Mindst én accepteret forsikring (vælg ”Ja til alle” eller gem et udvalg)",
};

/** Short section titles for the clinic editor sidebar (same order as CLINIC_PROFILE_RECOMMENDATION_ORDER). */
export const clinicProfileEditSidebarLabelsDa: Record<
  ClinicProfileChecklistKey,
  string
> = {
  contact: "Kontaktoplysninger",
  pricing: "Priser og ydernummer",
  specialties: "Specialer",
  about: "Om os",
  openingHours: "Åbningstider",
  team: "Team",
  insurances: "Forsikringer",
};

const clinicProfileChecklistShortHintsDa: Record<
  ClinicProfileChecklistKey,
  string
> = {
  contact: "kontaktoplysninger",
  about: "Om os-beskrivelse",
  openingHours: "åbningstider",
  specialties: "specialer",
  team: "team",
  pricing: "priser og ydernummer",
  insurances: "forsikringer",
};

export type ClinicProfileCompletenessInput = {
  email?: string | null;
  tlf?: string | null;
  website?: string | null;
  om_os?: string | null;
  mandag?: string | null;
  tirsdag?: string | null;
  onsdag?: string | null;
  torsdag?: string | null;
  fredag?: string | null;
  lørdag?: string | null;
  søndag?: string | null;
  førsteKons?: string | null;
  opfølgning?: string | null;
  /**
   * true = ydernummer (offentlige takster); pricing step is complete without DKK fields.
   * false or null = need both førsteKons and opfølgning (matches editor: prices only when “nej” til ydernummer).
   */
  ydernummer?: boolean | null;
  specialtyCount: number;
  teamMemberCount: number;
  /** Antal forsikringer klinikken accepterer (efter undtagelser hvis ”nej til alle”). */
  acceptedInsuranceCount: number;
  /** Antal forsikringstyper i systemet; 0 = intet at konfigurere (trinet tæller som opfyldt). */
  totalInsuranceTypesCount: number;
};

const hasNonEmptyTrimmed = (value: string | null | undefined): boolean =>
  Boolean(value && String(value).trim().length > 0);

const hasContact = (input: ClinicProfileCompletenessInput): boolean =>
  hasNonEmptyTrimmed(input.email) ||
  hasNonEmptyTrimmed(input.tlf) ||
  hasNonEmptyTrimmed(input.website);

/** Strip basic HTML if present (legacy/import data); then any real text counts. */
const aboutPlainText = (om_os: string | null | undefined): string => {
  const raw = om_os?.trim() ?? "";
  return raw.replace(/<[^>]*>/g, "").trim();
};

const hasAbout = (input: ClinicProfileCompletenessInput): boolean =>
  aboutPlainText(input.om_os).length > 0;

const hasOpeningHours = (input: ClinicProfileCompletenessInput): boolean => {
  const days = [
    input.mandag,
    input.tirsdag,
    input.onsdag,
    input.torsdag,
    input.fredag,
    input.lørdag,
    input.søndag,
  ];
  return days.some(hasNonEmptyTrimmed);
};

const hasSpecialties = (input: ClinicProfileCompletenessInput): boolean =>
  input.specialtyCount >= 1;

const hasTeam = (input: ClinicProfileCompletenessInput): boolean =>
  input.teamMemberCount >= 1;

const hasPricing = (input: ClinicProfileCompletenessInput): boolean => {
  // ydernummer = ja: ingen krav til Pris, første konsultation / Pris, opfølgning
  if (input.ydernummer === true) {
    return true;
  }
  // ydernummer = nej (eller ukendt/legacy): begge prisfelter skal være udfyldt
  return (
    hasNonEmptyTrimmed(input.førsteKons) &&
    hasNonEmptyTrimmed(input.opfølgning)
  );
};

const hasInsurances = (input: ClinicProfileCompletenessInput): boolean => {
  if (input.totalInsuranceTypesCount <= 0) {
    return true;
  }
  return input.acceptedInsuranceCount >= 1;
};

const evaluators: Record<
  ClinicProfileChecklistKey,
  (input: ClinicProfileCompletenessInput) => boolean
> = {
  contact: hasContact,
  about: hasAbout,
  openingHours: hasOpeningHours,
  specialties: hasSpecialties,
  team: hasTeam,
  pricing: hasPricing,
  insurances: hasInsurances,
};

export const computeClinicProfileCompleteness = (
  input: ClinicProfileCompletenessInput
): ClinicProfileCompleteness => {
  const missingUnsorted = CHECKLIST_KEYS.filter(
    (key) => !evaluators[key](input)
  );
  const missingKeys = sortMissingKeysByRecommendation(missingUnsorted);
  const completedCount = CHECKLIST_KEYS.length - missingKeys.length;
  const totalCount = CHECKLIST_KEYS.length;
  const percent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    completedCount,
    totalCount,
    percent,
    missingKeys,
  };
};

/**
 * Soft nudge for missing profile parts (Danish).
 * Contact is excluded: the dashboard shows CLINIC_PROFILE_CONTACT_NO_INFO_WARNING_DA instead when contact is missing.
 */
export const getClinicProfileCompletenessNudgeDa = (
  missingKeys: ClinicProfileChecklistKey[],
  maxHints = 2
): string => {
  const keys = missingKeys.filter((key) => key !== "contact");
  if (keys.length === 0) return "";

  const hints = keys
    .slice(0, maxHints)
    .map((key) => clinicProfileChecklistShortHintsDa[key]);

  if (hints.length === 1) {
    return `Tilføj f.eks. ${hints[0]}.`;
  }

  return `Tilføj f.eks. ${hints[0]} og ${hints[1]}.`;
};

/** Accessible summary for aria-valuetext. */
export const getClinicProfileCompletenessAriaDa = (
  result: ClinicProfileCompleteness
): string =>
  `${result.completedCount} af ${result.totalCount} trin fuldført på klinikprofilen`;
