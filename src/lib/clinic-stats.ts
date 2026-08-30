/**
 * Shared clinic analytics mapping used by the dashboard and monthly summary emails.
 */

export interface ClinicEventCount {
  event_type: string;
  count: number | string;
}

export interface ClinicStats {
  clinicId: string;
  period: string;
  profileViews: number;
  listImpressions: number;
  phoneClicks: number;
  websiteClicks: number;
  emailClicks: number;
  bookingClicks: number;
  totalContactClicks: number;
}

function toCount(value: number | string | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mapEventCountsToClinicStats(
  clinicId: string,
  period: string,
  counts: ClinicEventCount[]
): ClinicStats {
  const getCount = (type: string) =>
    toCount(counts.find((row) => row.event_type === type)?.count);

  const phoneClicks = getCount("phone_click");
  const websiteClicks = getCount("website_click");
  const emailClicks = getCount("email_click");
  const bookingClicks = getCount("booking_click");

  return {
    clinicId,
    period,
    profileViews: getCount("profile_view"),
    listImpressions: getCount("list_impression"),
    phoneClicks,
    websiteClicks,
    emailClicks,
    bookingClicks,
    totalContactClicks:
      phoneClicks + websiteClicks + emailClicks + bookingClicks,
  };
}
