/**
 * Pure helpers for monthly clinic summary emails: grouping, skip rules, copy, and CTAs.
 */

import { wasOwnedDuringPeriod } from "@/lib/calendar-month";
import type { ClinicProfileChecklistKey } from "@/lib/clinic-profile-completeness";
import {
  CLINIC_PROFILE_CONTACT_NO_INFO_WARNING_DA,
  CLINIC_PROFILE_RECOMMENDATION_ORDER,
  getClinicProfileCompletenessNudgeDa,
  sortMissingKeysByRecommendation,
} from "@/lib/clinic-profile-completeness";
import type { ClinicStats } from "@/lib/clinic-stats";

export type MonthlySummarySkipReason =
  | "no_clinics_in_period"
  | "no_email"
  | "already_sent"
  | "unsubscribed";

/** Optional month-over-month context. Leave unset until the job populates it. */
export interface MonthlySummaryMonthOverMonth {
  viewsChangePercent?: number | null;
  previousMonthLabelDa?: string;
}

export interface MonthlySummaryClinicView {
  clinicId: string;
  clinicName: string;
  clinicSlug?: string;
  missingKeys: ClinicProfileChecklistKey[];
  stats: ClinicStats;
  hasLogo?: boolean;
  hasWebsite?: boolean;
  hasPhone?: boolean;
  hasEmail?: boolean;
  comparison?: MonthlySummaryMonthOverMonth;
}

export interface MonthlySummaryOwnerTotals {
  clicks: number;
  views: number;
}

export interface MonthlySummaryProfileCta {
  label: string;
  clinicId: string;
}

const PROFILE_CTA_LABELS: Record<ClinicProfileChecklistKey, string> = {
  contact: "Tilføj kontaktoplysninger",
  about: "Tilføj en beskrivelse",
  openingHours: "Tilføj åbningstider",
  specialties: "Tilføj specialer",
  team: "Tilføj dit team",
  pricing: "Tilføj priser",
  insurances: "Tilføj forsikringer",
};

export function clinicViewCount(clinic: MonthlySummaryClinicView): number {
  return clinic.stats.profileViews + clinic.stats.listImpressions;
}

export function sumOwnerMonthlySummary(
  clinics: MonthlySummaryClinicView[]
): MonthlySummaryOwnerTotals {
  return clinics.reduce(
    (totals, clinic) => ({
      clicks: totals.clicks + clinic.stats.totalContactClicks,
      views: totals.views + clinicViewCount(clinic),
    }),
    { clicks: 0, views: 0 }
  );
}

export function formatMonthOverMonthChange(
  changePercent: number | null | undefined,
  previousMonthLabelDa?: string
): string {
  if (
    changePercent == null ||
    !Number.isFinite(changePercent) ||
    !previousMonthLabelDa
  ) {
    return "";
  }

  const rounded = Math.round(changePercent);
  if (rounded === 0) {
    return `uændret fra ${previousMonthLabelDa}`;
  }

  const arrow = rounded > 0 ? "↑" : "↓";
  return `${arrow} ${Math.abs(rounded)}% fra ${previousMonthLabelDa}`;
}

function ownerClinicPhrase(multiClinic: boolean, capitalized: boolean): string {
  if (multiClinic) {
    return capitalized ? "Dine klinikker" : "dine klinikker";
  }
  return capitalized ? "Din klinik" : "din klinik";
}

export function buildMonthlySummarySubject(
  clinics: MonthlySummaryClinicView[],
  monthLabelDa: string
): string {
  const whose = ownerClinicPhrase(clinics.length > 1, false);
  return `Sådan klarede ${whose} sig på Fysfinder i ${monthLabelDa}`;
}

export function buildMonthlySummaryOpeningLine(
  clinics: MonthlySummaryClinicView[],
  monthLabelDa: string
): string {
  const { clicks, views } = sumOwnerMonthlySummary(clinics);
  const whose = ownerClinicPhrase(clinics.length > 1, false);
  const times = views === 1 ? "1 gang" : `${views.toLocaleString("da-DK")} gange`;
  const patients =
    clicks === 1
      ? "1 patient"
      : `${clicks.toLocaleString("da-DK")} patienter`;

  return `I ${monthLabelDa} blev ${whose} set ${times}, og ${patients} tog næste skridt ved at klikke videre.`;
}

export function getMonthlySummaryProfileCta(
  clinics: MonthlySummaryClinicView[]
): MonthlySummaryProfileCta {
  let best: { clinic: MonthlySummaryClinicView; key: ClinicProfileChecklistKey } | null =
    null;

  for (const clinic of clinics) {
    const first = sortMissingKeysByRecommendation(clinic.missingKeys)[0];
    if (!first) {
      continue;
    }
    if (
      !best ||
      CLINIC_PROFILE_RECOMMENDATION_ORDER.indexOf(first) <
        CLINIC_PROFILE_RECOMMENDATION_ORDER.indexOf(best.key)
    ) {
      best = { clinic, key: first };
    }
  }

  if (best) {
    return {
      label: `${PROFILE_CTA_LABELS[best.key]} →`,
      clinicId: best.clinic.clinicId,
    };
  }

  const withoutLogo = clinics.find((clinic) => clinic.hasLogo === false);
  if (withoutLogo) {
    return { label: "Tilføj billeder →", clinicId: withoutLogo.clinicId };
  }

  return {
    label: "Se din profil →",
    clinicId: clinics[0]?.clinicId ?? "",
  };
}

export function resolveOwnerEmail(input: {
  profileEmail?: string | null;
  authEmail?: string | null;
  verifiedEmails?: Array<string | null | undefined>;
}): string | null {
  const candidates = [
    input.profileEmail,
    input.authEmail,
    ...(input.verifiedEmails ?? []),
  ];

  for (const raw of candidates) {
    const email = raw?.trim().toLowerCase();
    if (email && email.includes("@")) {
      return email;
    }
  }

  return null;
}

export function groupRowsByOwner<T extends { ownerUserId: string }>(
  rows: T[]
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const row of rows) {
    const existing = grouped.get(row.ownerUserId) ?? [];
    existing.push(row);
    grouped.set(row.ownerUserId, existing);
  }
  return grouped;
}

export function filterClinicsOwnedInPeriod<T extends { ownedAt: string }>(
  clinics: T[],
  periodEndIso: string
): T[] {
  return clinics.filter((clinic) =>
    wasOwnedDuringPeriod(clinic.ownedAt, periodEndIso)
  );
}

export function decideMonthlySummaryAction(input: {
  clinicCountInPeriod: number;
  email: string | null;
  alreadySent: boolean;
  unsubscribed: boolean;
}): { action: "send" } | { action: "skip"; reason: MonthlySummarySkipReason } {
  if (input.clinicCountInPeriod === 0) {
    return { action: "skip", reason: "no_clinics_in_period" };
  }
  if (!input.email) {
    return { action: "skip", reason: "no_email" };
  }
  if (input.alreadySent) {
    return { action: "skip", reason: "already_sent" };
  }
  if (input.unsubscribed) {
    return { action: "skip", reason: "unsubscribed" };
  }
  return { action: "send" };
}

export function buildMonthlySummaryAttentionParagraphs(
  clinics: MonthlySummaryClinicView[]
): string[] {
  const paragraphs: string[] = [];
  const multiClinic = clinics.length > 1;

  const missingContact = clinics.filter((clinic) =>
    clinic.missingKeys.includes("contact")
  );
  if (missingContact.length > 0) {
    if (!multiClinic) {
      paragraphs.push(CLINIC_PROFILE_CONTACT_NO_INFO_WARNING_DA);
    } else {
      const names = missingContact.map((clinic) => clinic.clinicName).join(", ");
      paragraphs.push(
        `${names}: patienter har ingen kontaktoplysninger og kan derfor ikke tage fat i dig.`
      );
    }
  }

  const incompleteWithoutContactOnly = clinics.filter((clinic) =>
    clinic.missingKeys.some((key) => key !== "contact")
  );
  for (const clinic of incompleteWithoutContactOnly) {
    const nudge = getClinicProfileCompletenessNudgeDa(clinic.missingKeys);
    if (!nudge) {
      continue;
    }
    paragraphs.push(
      multiClinic ? `${clinic.clinicName}: ${nudge}` : nudge
    );
  }

  if (paragraphs.length > 0) {
    return paragraphs;
  }

  const allQuiet = clinics.every(
    (clinic) =>
      clinic.stats.totalContactClicks === 0 &&
      clinic.stats.profileViews + clinic.stats.listImpressions === 0
  );
  const noLeads = clinics.every((clinic) => clinic.stats.totalContactClicks === 0);

  if (allQuiet) {
    return [
      "Din profil er udfyldt. Tjek at specialer og by matcher det, patienter søger efter — så er du nemmere at finde.",
    ];
  }

  if (noLeads) {
    return [
      "Patienter ser din klinik. Gør det endnu tydeligere, hvordan de booker eller ringer, så visninger bliver til henvendelser.",
    ];
  }

  return [
    "Godt gået. En opdateret profil hjælper patienter med at vælge din klinik næste måned også.",
  ];
}
