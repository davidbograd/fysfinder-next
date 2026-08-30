/**
 * Monthly clinic summary job: load owners, apply skip rules, send Resend emails.
 * Updated: cast ownership rows via unknown — the nested clinics select is not in
 * generated Supabase types, so a direct assertion fails `next build`.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Resend } from "resend";
import {
  getCalendarMonthBounds,
  getPreviousCalendarMonthBounds,
  parsePeriodYm,
  type CalendarMonthBounds,
} from "@/lib/calendar-month";
import { computeClinicProfileCompleteness } from "@/lib/clinic-profile-completeness";
import {
  mapEventCountsToClinicStats,
  type ClinicEventCount,
} from "@/lib/clinic-stats";
import { sendMonthlyClinicSummaryEmail } from "@/lib/monthly-clinic-summary-email";
import {
  decideMonthlySummaryAction,
  filterClinicsOwnedInPeriod,
  groupRowsByOwner,
  resolveOwnerEmail,
  type MonthlySummarySkipReason,
} from "@/lib/monthly-clinic-summary";
import type { MonthlySummaryClinicView } from "@/lib/monthly-clinic-summary";

export interface MonthlySummaryRunOptions {
  supabase: SupabaseClient;
  resend: Resend;
  dryRun?: boolean;
  previewTo?: string;
  periodYm?: string;
  now?: Date;
  siteUrl?: string;
}

export interface MonthlySummaryRunResult {
  periodYm: string;
  monthLabelDa: string;
  sent: number;
  skipped: number;
  failed: number;
  dryRun: boolean;
  previewTo?: string;
  details: string[];
}

interface OwnershipClinicRow {
  clinics_id: string;
  klinikNavn: string | null;
  klinikNavnSlug: string | null;
  verified_email: string | null;
  email: string | null;
  tlf: string | null;
  website: string | null;
  om_os: string | null;
  mandag: string | null;
  tirsdag: string | null;
  onsdag: string | null;
  torsdag: string | null;
  fredag: string | null;
  lørdag: string | null;
  søndag: string | null;
  førsteKons: string | null;
  opfølgning: string | null;
  ydernummer: boolean | null;
  logo_url: string | null;
  clinic_specialties?: Array<{ specialty_id: string }> | null;
  clinic_team_members?: Array<{ id: string }> | null;
  clinic_insurances?: Array<{ insurance_id: string }> | null;
}

interface OwnershipRow {
  user_id: string;
  clinic_id: string;
  created_at: string;
  clinics: OwnershipClinicRow | OwnershipClinicRow[] | null;
}

interface PreparedOwner {
  userId: string;
  email: string | null;
  displayName: string | null;
  clinics: MonthlySummaryClinicView[];
}

function unwrapClinic(
  clinic: OwnershipClinicRow | OwnershipClinicRow[] | null
): OwnershipClinicRow | null {
  if (!clinic) {
    return null;
  }
  return Array.isArray(clinic) ? clinic[0] ?? null : clinic;
}

function resolvePeriod(options: MonthlySummaryRunOptions): CalendarMonthBounds {
  if (options.periodYm) {
    const { year, month } = parsePeriodYm(options.periodYm);
    return getCalendarMonthBounds(year, month);
  }
  return getPreviousCalendarMonthBounds(options.now);
}

async function isResendUnsubscribed(
  resend: Resend,
  email: string
): Promise<boolean> {
  try {
    const { data, error } = await resend.contacts.get({ email });
    if (error || !data) {
      return false;
    }
    return Boolean(data.unsubscribed);
  } catch {
    return false;
  }
}

export async function runMonthlyClinicSummary(
  options: MonthlySummaryRunOptions
): Promise<MonthlySummaryRunResult> {
  const bounds = resolvePeriod(options);
  const result: MonthlySummaryRunResult = {
    periodYm: bounds.periodYm,
    monthLabelDa: bounds.monthLabelDa,
    sent: 0,
    skipped: 0,
    failed: 0,
    dryRun: Boolean(options.dryRun),
    previewTo: options.previewTo,
    details: [],
  };

  const [ownershipsResult, insuranceCountResult] = await Promise.all([
    options.supabase
      .from("clinic_owners")
      .select(
        `
        user_id,
        clinic_id,
        created_at,
        clinics:clinic_id (
          clinics_id,
          klinikNavn,
          klinikNavnSlug,
          verified_email,
          email,
          tlf,
          website,
          om_os,
          mandag,
          tirsdag,
          onsdag,
          torsdag,
          fredag,
          lørdag,
          søndag,
          førsteKons,
          opfølgning,
          ydernummer,
          logo_url,
          clinic_specialties ( specialty_id ),
          clinic_team_members ( id ),
          clinic_insurances ( insurance_id )
        )
      `
      ),
    options.supabase
      .from("insurance_companies")
      .select("insurance_id", { count: "exact", head: true }),
  ]);

  if (ownershipsResult.error) {
    throw new Error(
      `Kunne ikke hente clinic_owners: ${ownershipsResult.error.message}`
    );
  }

  const ownerships = (ownershipsResult.data || []) as unknown as OwnershipRow[];
  const totalInsuranceTypesCount = insuranceCountResult.count ?? 0;
  const grouped = groupRowsByOwner(
    ownerships.map((row) => ({
      ...row,
      ownerUserId: row.user_id,
      ownedAt: row.created_at,
    }))
  );

  const userIds = Array.from(grouped.keys());
  const { data: profiles, error: profilesError } = userIds.length
    ? await options.supabase
        .from("user_profiles")
        .select("id, full_name, email")
        .in("id", userIds)
    : { data: [], error: null };

  if (profilesError) {
    throw new Error(`Kunne ikke hente user_profiles: ${profilesError.message}`);
  }

  const profileById = new Map(
    (profiles || []).map((profile) => [profile.id as string, profile])
  );

  const { data: alreadySentRows, error: alreadySentError } = await options.supabase
    .from("clinic_monthly_summary_sends")
    .select("user_id")
    .eq("period_ym", bounds.periodYm);

  if (alreadySentError) {
    throw new Error(
      `Kunne ikke hente tidligere sends: ${alreadySentError.message}`
    );
  }

  const alreadySentIds = new Set(
    (alreadySentRows || []).map((row) => row.user_id as string)
  );

  const preparedOwners: PreparedOwner[] = [];

  for (const [userId, rows] of grouped) {
    const inPeriod = filterClinicsOwnedInPeriod(rows, bounds.endIso);
    const profile = profileById.get(userId);
    let authEmail: string | null = null;

    if (!profile?.email) {
      const { data: authUserData, error: authUserError } =
        await options.supabase.auth.admin.getUserById(userId);
      if (authUserError) {
        console.error("Monthly summary: auth email lookup failed", authUserError);
      } else {
        authEmail = authUserData.user?.email ?? null;
      }
    }

    const clinics: MonthlySummaryClinicView[] = [];
    const verifiedEmails: Array<string | null> = [];

    for (const row of inPeriod) {
      const clinic = unwrapClinic(row.clinics);
      if (!clinic) {
        continue;
      }

      verifiedEmails.push(clinic.verified_email);
      const { data: eventCounts, error: countsError } = await options.supabase.rpc(
        "get_clinic_event_counts",
        {
          p_clinic_id: clinic.clinics_id,
          p_start_date: bounds.startIso,
          p_end_date: bounds.endIso,
        }
      );

      if (countsError) {
        console.error(
          `Monthly summary: stats failed for ${clinic.clinics_id}`,
          countsError
        );
      }

      const completeness = computeClinicProfileCompleteness({
        email: clinic.email,
        tlf: clinic.tlf,
        website: clinic.website,
        om_os: clinic.om_os,
        mandag: clinic.mandag,
        tirsdag: clinic.tirsdag,
        onsdag: clinic.onsdag,
        torsdag: clinic.torsdag,
        fredag: clinic.fredag,
        lørdag: clinic.lørdag,
        søndag: clinic.søndag,
        førsteKons: clinic.førsteKons,
        opfølgning: clinic.opfølgning,
        ydernummer: clinic.ydernummer,
        specialtyCount: clinic.clinic_specialties?.length ?? 0,
        teamMemberCount: clinic.clinic_team_members?.length ?? 0,
        acceptedInsuranceCount: clinic.clinic_insurances?.length ?? 0,
        totalInsuranceTypesCount,
      });

      clinics.push({
        clinicId: clinic.clinics_id,
        clinicName: clinic.klinikNavn?.trim() || "Klinik",
        clinicSlug: clinic.klinikNavnSlug?.trim() || undefined,
        missingKeys: completeness.missingKeys,
        hasLogo: Boolean(clinic.logo_url?.trim()),
        hasWebsite: Boolean(clinic.website?.trim()),
        hasPhone: Boolean(clinic.tlf?.trim()),
        hasEmail: Boolean(clinic.email?.trim()),
        stats: mapEventCountsToClinicStats(
          clinic.clinics_id,
          bounds.monthLabelDa,
          (eventCounts as ClinicEventCount[]) || []
        ),
      });
    }

    preparedOwners.push({
      userId,
      displayName: profile?.full_name ?? null,
      email: resolveOwnerEmail({
        profileEmail: profile?.email,
        authEmail,
        verifiedEmails,
      }),
      clinics,
    });
  }

  let previewConsumed = false;

  for (const owner of preparedOwners) {
    const alreadySent = alreadySentIds.has(owner.userId);
    const unsubscribed = owner.email
      ? await isResendUnsubscribed(options.resend, owner.email)
      : false;
    const decision = decideMonthlySummaryAction({
      clinicCountInPeriod: owner.clinics.length,
      email: owner.email,
      alreadySent,
      unsubscribed,
    });

    if (decision.action === "skip") {
      result.skipped += 1;
      result.details.push(formatSkip(owner, decision.reason));
      continue;
    }

    if (options.previewTo && previewConsumed) {
      result.skipped += 1;
      result.details.push(
        `${owner.email}: sprunget over (preview sender kun én mail)`
      );
      continue;
    }

    const recipientEmail = options.previewTo ?? owner.email!;
    const clinicNames = owner.clinics.map((clinic) => clinic.clinicName).join(", ");
    const sendLabel = `${owner.email} (${clinicNames})`;

    if (options.dryRun) {
      result.sent += 1;
      result.details.push(`dry-run: ville sende til ${sendLabel}`);
      if (options.previewTo) {
        previewConsumed = true;
      }
      continue;
    }

    const sendResult = await sendMonthlyClinicSummaryEmail(options.resend, {
      recipientEmail,
      recipientName: owner.displayName,
      monthLabelDa: bounds.monthLabelDa,
      clinics: owner.clinics,
      siteUrl: options.siteUrl,
    });

    if (!sendResult.success) {
      result.failed += 1;
      result.details.push(`fejl: ${sendLabel} — ${sendResult.error}`);
      continue;
    }

    if (!options.previewTo) {
      const { error: insertError } = await options.supabase
        .from("clinic_monthly_summary_sends")
        .insert({
          user_id: owner.userId,
          period_ym: bounds.periodYm,
          recipient_email: owner.email,
          resend_id: sendResult.id ?? null,
        });

      if (insertError) {
        console.error(
          "Monthly summary: sent but failed to record idempotency row",
          insertError
        );
        result.details.push(
          `sendt til ${sendLabel}, men kunne ikke gemme idempotens (${insertError.message})`
        );
      }
    }

    result.sent += 1;
    result.details.push(
      options.previewTo
        ? `preview sendt til ${recipientEmail} (prøve for ${sendLabel})`
        : `sendt til ${sendLabel}`
    );

    if (options.previewTo) {
      previewConsumed = true;
    }
  }

  if (options.previewTo && result.sent === 0 && result.failed === 0) {
    result.details.push("Ingen ejer at bruge som preview-grundlag.");
  }

  return result;
}

function formatSkip(
  owner: PreparedOwner,
  reason: MonthlySummarySkipReason
): string {
  const target = owner.email || owner.userId;
  const labels: Record<MonthlySummarySkipReason, string> = {
    no_clinics_in_period: "ingen klinikker i perioden",
    no_email: "ingen e-mail",
    already_sent: "allerede sendt",
    unsubscribed: "afmeldt",
  };
  return `${target}: sprunget over (${labels[reason]})`;
}
