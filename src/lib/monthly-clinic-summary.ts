/**
 * Pure helpers for monthly clinic summary emails: grouping, skip rules, and attention copy.
 */

import { wasOwnedDuringPeriod } from "@/lib/calendar-month";
import type { ClinicProfileChecklistKey } from "@/lib/clinic-profile-completeness";
import {
  CLINIC_PROFILE_CONTACT_NO_INFO_WARNING_DA,
  getClinicProfileCompletenessNudgeDa,
} from "@/lib/clinic-profile-completeness";
import type { ClinicStats } from "@/lib/clinic-stats";

export type MonthlySummarySkipReason =
  | "no_clinics_in_period"
  | "no_email"
  | "already_sent"
  | "unsubscribed";

export interface MonthlySummaryClinicView {
  clinicId: string;
  clinicName: string;
  missingKeys: ClinicProfileChecklistKey[];
  stats: ClinicStats;
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
        `${names}: patienter har ingen kontaktoplysninger og kan derfor ikke tage fat i jer.`
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
      "Jeres profil er udfyldt. Tjek at specialer og by matcher det, patienter søger efter — så er I nemmere at finde.",
    ];
  }

  if (noLeads) {
    return [
      "Patienter ser jer. Gør det endnu tydeligere, hvordan de booker eller ringer, så visninger bliver til henvendelser.",
    ];
  }

  return [
    "Godt gået. En opdateret profil hjælper patienter med at vælge jer næste måned også.",
  ];
}
