// Shared types and duration math for the admin premium tool.
// Kept out of the "use server" action module so the client UI can import the
// row shape and the period presets without pulling in server-only code.

export const PREMIUM_GRANT_PRESET_MONTHS = [1, 3, 6, 12] as const;

export type PremiumGrantPresetMonths = (typeof PREMIUM_GRANT_PRESET_MONTHS)[number];

const MAX_GRANT_YEARS = 5;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface AdminPremiumListing {
  listingId: string;
  clinicId: string;
  clinicName: string;
  clinicSlug: string | null;
  location: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  cityNames: string[];
  isStripeManaged: boolean;
}

export interface AdminPremiumOverview {
  listings: AdminPremiumListing[];
  activeCount: number;
  expiredCount: number;
}

export function addMonthsClamped(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  const dayOfMonth = result.getDate();
  result.setMonth(result.getMonth() + months);
  // Rolling 31 Jan forward one month overflows into March, so pull it back to
  // the last day of the month we actually meant.
  if (result.getDate() < dayOfMonth) {
    result.setDate(0);
  }
  return result;
}

interface ResolvePremiumGrantEndDateInput {
  now: Date;
  durationMonths?: number | null;
  customEndDate?: string | null;
}

type ResolvePremiumGrantEndDateResult = { endDate: Date } | { error: string };

/**
 * Turns either a preset month count or a `YYYY-MM-DD` date into the end of the
 * premium window. A custom date runs to the end of the chosen day.
 */
export function resolvePremiumGrantEndDate({
  now,
  durationMonths,
  customEndDate,
}: ResolvePremiumGrantEndDateInput): ResolvePremiumGrantEndDateResult {
  if (durationMonths !== null && durationMonths !== undefined) {
    const isPreset = PREMIUM_GRANT_PRESET_MONTHS.some(
      (preset) => preset === durationMonths
    );
    if (!isPreset) {
      return { error: "Vælg en gyldig periode" };
    }
    return { endDate: addMonthsClamped(now, durationMonths) };
  }

  const trimmedEndDate = (customEndDate || "").trim();
  if (!trimmedEndDate) {
    return { error: "Vælg en periode eller en slutdato" };
  }

  if (!ISO_DATE_PATTERN.test(trimmedEndDate)) {
    return { error: "Slutdatoen skal have formatet ÅÅÅÅ-MM-DD" };
  }

  const [year, month, day] = trimmedEndDate.split("-").map(Number);
  const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
  // Date rolls impossible days over (31 Feb becomes 3 Mar) instead of failing,
  // so compare the parts back to what was asked for.
  if (
    endDate.getUTCFullYear() !== year ||
    endDate.getUTCMonth() !== month - 1 ||
    endDate.getUTCDate() !== day
  ) {
    return { error: "Slutdatoen er ikke en gyldig dato" };
  }

  if (endDate.getTime() <= now.getTime()) {
    return { error: "Slutdatoen skal ligge i fremtiden" };
  }

  if (endDate.getTime() > addMonthsClamped(now, MAX_GRANT_YEARS * 12).getTime()) {
    return { error: `Slutdatoen kan højst være ${MAX_GRANT_YEARS} år frem` };
  }

  return { endDate };
}
