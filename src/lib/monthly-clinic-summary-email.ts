/**
 * Danish monthly clinic summary email: HTML/text builder and Resend send helper.
 * Updated: show dashboard-style "X af 7" profile progress on incomplete clinics.
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { Resend } from "resend";
import { getAdminEmails } from "@/lib/admin";
import { buildUnsubscribeUrl } from "@/lib/email-unsubscribe";
import {
  buildMonthlySummaryClinicProfileNudge,
  buildMonthlySummaryOpeningLine,
  buildMonthlySummarySubject,
  clinicViewCount,
  formatMonthOverMonthChange,
  type MonthlySummaryClinicView,
} from "@/lib/monthly-clinic-summary";

const SITE_URL = "https://www.fysfinder.dk";
const LOGO_CID = "fysfinder-logo";
const LOGO_WIDTH = 167;
const LOGO_HEIGHT = 34;
const FROM_OWNER = "Joachim Bograd <kontakt@fysfinder.dk>";
const REPLY_TO = "kontakt@fysfinder.dk";
const FROM_TRANSACTIONAL = "Fysfinder <noreply@fysfinder.dk>";

export interface MonthlyClinicSummaryEmailInput {
  recipientEmail: string;
  recipientName?: string | null;
  monthLabelDa: string;
  clinics: MonthlySummaryClinicView[];
  unsubscribeUrl: string;
}

export interface MonthlyClinicSummaryEmailContent {
  subject: string;
  html: string;
  text: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatCount(value: number): string {
  return value.toLocaleString("da-DK");
}

function getLogoAttachment():
  | {
      filename: string;
      content: Buffer;
      contentId: string;
      contentType: string;
    }
  | undefined {
  const logoPath = join(process.cwd(), "public/images/email/fysfinder-logo.png");
  if (!existsSync(logoPath)) {
    return undefined;
  }

  return {
    filename: "fysfinder-logo.png",
    content: readFileSync(logoPath),
    contentId: LOGO_CID,
    contentType: "image/png",
  };
}

function renderLogo(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px 0;">
<tr>
<td>
<a href="${SITE_URL}" style="text-decoration:none;">
<img src="cid:${LOGO_CID}" alt="Fysfinder" width="${LOGO_WIDTH}" height="${LOGO_HEIGHT}" style="display:block;border:0;outline:none;text-decoration:none;width:${LOGO_WIDTH}px;height:auto;max-width:167px;" />
</a>
</td>
</tr>
</table>`;
}

function clinicPublicUrl(slug?: string): string | null {
  const trimmed = slug?.trim();
  if (!trimmed) {
    return null;
  }
  return `${SITE_URL}/klinik/${encodeURIComponent(trimmed)}`;
}

function clinicEditUrl(clinicId: string): string {
  return `https://www.fysfinder.dk/dashboard/clinic/${clinicId}/edit`;
}

function renderClinicName(clinic: MonthlySummaryClinicView): string {
  const name = escapeHtml(clinic.clinicName);
  const url = clinicPublicUrl(clinic.clinicSlug);
  if (!url) {
    return name;
  }
  return `<a href="${escapeHtml(url)}" style="color:#104534;text-decoration:underline;">${name}</a>`;
}

function clinicPremiumUrl(clinicId: string): string {
  return `https://www.fysfinder.dk/dashboard/clinic/${clinicId}/premium`;
}

function nextStepHeading(count: number): string {
  return `${formatCount(count)} tog næste skridt`;
}

function viewHeading(clinic: MonthlySummaryClinicView): string {
  const views = clinicViewCount(clinic);
  const base =
    views === 1
      ? "1 klinikvisning"
      : `${formatCount(views)} klinikvisninger`;
  const change = formatMonthOverMonthChange(
    clinic.comparison?.viewsChangePercent,
    clinic.comparison?.previousMonthLabelDa
  );
  return change ? `${base} ${change}` : base;
}

function renderHeadlineRow(text: string): string {
  return `<tr><td style="padding:16px 0 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:1.4;color:#111111;font-weight:bold;">${escapeHtml(text)}</td></tr>`;
}

function renderCountRow(count: number, label: string): string {
  return `<tr><td style="padding:2px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#333333;"><strong>${formatCount(count)}</strong> ${escapeHtml(label)}</td></tr>`;
}

function shouldShowContactChannel(enabled?: boolean): boolean {
  return enabled !== false;
}

function renderOptionalCountRow(
  enabled: boolean | undefined,
  count: number,
  label: string
): string {
  if (!shouldShowContactChannel(enabled)) {
    return "";
  }
  return renderCountRow(count, label);
}

function optionalCountLine(
  enabled: boolean | undefined,
  count: number,
  label: string
): string[] {
  if (!shouldShowContactChannel(enabled)) {
    return [];
  }
  return [`${formatCount(count)} ${label}`];
}

function profileBarFilledColor(completedCount: number): string {
  if (completedCount <= 3) {
    return "#f97316";
  }
  if (completedCount <= 5) {
    return "#eab308";
  }
  return "#16a34a";
}

function renderProfileProgressBar(
  completedCount: number,
  totalCount: number
): string {
  const filled = profileBarFilledColor(completedCount);
  const cells = Array.from({ length: totalCount }, (_, index) => {
    const isFilled = index < completedCount;
    const paddingRight = index === totalCount - 1 ? "0" : "6px";
    return `<td style="padding:0 ${paddingRight} 0 0;width:${Math.round(100 / totalCount)}%;">
<div style="height:10px;line-height:10px;font-size:0;background-color:${isFilled ? filled : "#f2f1ec"};border-radius:999px;">&nbsp;</div>
</td>`;
  });
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 10px 0;"><tr>${cells.join("")}</tr></table>`;
}

function renderClinicProfileNudge(clinic: MonthlySummaryClinicView): string {
  const nudge = buildMonthlySummaryClinicProfileNudge(clinic);
  if (!nudge) {
    return "";
  }

  const profileUrl = clinicEditUrl(clinic.clinicId);
  const body = nudge.body
    ? `<p style="margin:0 0 8px 0;font-size:16px;line-height:1.55;color:#104534;">${escapeHtml(nudge.body)}</p>`
    : "";

  return `<tr><td style="padding:16px 0 4px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8f7f2;border-radius:12px;">
<tr>
<td style="padding:16px 18px;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td style="font-size:16px;line-height:1.4;color:#111111;font-weight:bold;">Klinikprofil</td>
<td align="right" style="font-size:16px;line-height:1.4;color:#333333;font-variant-numeric:tabular-nums;">${escapeHtml(nudge.progressLabel)}</td>
</tr>
</table>
${renderProfileProgressBar(nudge.completedCount, nudge.totalCount)}
${body}
<p style="margin:0;font-size:16px;line-height:1.55;color:#104534;"><a href="${escapeHtml(profileUrl)}" style="color:#104534;font-weight:bold;text-decoration:underline;">Opdater</a></p>
</td>
</tr>
</table>
</td></tr>`;
}

function clinicProfileNudgeText(clinic: MonthlySummaryClinicView): string[] {
  const nudge = buildMonthlySummaryClinicProfileNudge(clinic);
  if (!nudge) {
    return [];
  }
  const lines = [`Klinikprofil: ${nudge.progressLabel}`];
  if (nudge.body) {
    lines.push(nudge.body);
  }
  lines.push(`Opdater: ${clinicEditUrl(clinic.clinicId)}`);
  return lines;
}

function bookingLabel(count: number): string {
  if (count <= 0) {
    return "bookinger*";
  }
  return count === 1 ? "booking" : "bookinger";
}

function renderBookingRow(clinic: MonthlySummaryClinicView): string {
  return renderCountRow(clinic.stats.bookingClicks, bookingLabel(clinic.stats.bookingClicks));
}

function renderPremiumUpsellRow(clinic: MonthlySummaryClinicView): string {
  if (clinic.stats.bookingClicks > 0) {
    return "";
  }

  const premiumUrl = clinicPremiumUrl(clinic.clinicId);
  return `<tr><td style="padding:16px 0 4px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8f7f2;border-radius:12px;">
<tr>
<td style="padding:16px 18px;border-left:4px solid #104534;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55;color:#104534;">
<strong>*Vil du også modtage bookinger direkte fra Fysfinder?</strong><br />
Direkte booking er inkluderet med <a href="${escapeHtml(premiumUrl)}" style="color:#104534;font-weight:bold;text-decoration:underline;">Premium</a>.
</td>
</tr>
</table>
</td></tr>`;
}

function premiumUpsellText(clinic: MonthlySummaryClinicView): string[] {
  if (clinic.stats.bookingClicks > 0) {
    return [];
  }
  return [
    "*Vil du også modtage bookinger direkte fra Fysfinder? Direkte booking er inkluderet med Premium.",
  ];
}

function renderClinicSection(clinic: MonthlySummaryClinicView): string {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px 0;">
  <tr>
    <td style="padding-bottom:8px;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:1.4;color:#104534;font-weight:bold;">
      ${renderClinicName(clinic)}
    </td>
  </tr>
  <tr>
    <td>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${renderHeadlineRow(viewHeading(clinic))}
        ${renderCountRow(clinic.stats.listImpressions, "visninger i søgeresultater")}
        ${renderCountRow(clinic.stats.profileViews, "profilvisninger")}
        ${renderHeadlineRow(nextStepHeading(clinic.stats.totalContactClicks))}
        ${renderOptionalCountRow(clinic.hasWebsite, clinic.stats.websiteClicks, "klikkede videre til dit website")}
        ${renderOptionalCountRow(clinic.hasPhone, clinic.stats.phoneClicks, "viste dit telefonnummer")}
        ${renderOptionalCountRow(clinic.hasEmail, clinic.stats.emailClicks, "kopierede din e-mail")}
        ${renderBookingRow(clinic)}
        ${renderPremiumUpsellRow(clinic)}
        ${renderClinicProfileNudge(clinic)}
      </table>
    </td>
  </tr>
</table>`;
}

export function buildMonthlyClinicSummaryEmail(
  input: MonthlyClinicSummaryEmailInput
): MonthlyClinicSummaryEmailContent {
  const subject = buildMonthlySummarySubject(input.clinics, input.monthLabelDa);
  const opening = buildMonthlySummaryOpeningLine(
    input.clinics,
    input.monthLabelDa
  );
  const clinicHtml = input.clinics
    .map((clinic) => renderClinicSection(clinic))
    .join(
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:16px 0;border-bottom:1px solid #e5e7eb;"></td></tr></table>`
    );

  const html = `<!DOCTYPE html>
<html lang="da">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f6f6f6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f6f6f6;">
<tr>
<td style="font-size:1px;line-height:1px;padding:0;margin:0;color:#f6f6f6;font-family:Arial,Helvetica,sans-serif;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(opening)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</td>
</tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f6f6f6;">
<tr>
<td align="center" style="padding:24px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;">
<tr>
<td style="padding:32px 24px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#333333;">
${renderLogo()}
<p style="margin:0 0 24px 0;font-size:16px;line-height:1.6;color:#333333;">${escapeHtml(opening)}</p>
${clinicHtml}
<p style="margin:24px 0;font-size:16px;line-height:1.6;color:#333333;">Har du spørgsmål til dine tal eller din profil, er du altid velkommen til at skrive. Jeg svarer selv.</p>
<p style="margin:0 0 4px 0;font-size:16px;line-height:1.6;color:#333333;"><strong>Joachim Bograd</strong> fra Fysfinder</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
<tr>
<td style="padding-top:24px;border-top:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#6b7280;">
<p style="margin:0;">Vil du ikke modtage denne månedlige opsummering fra Fysfinder? <a href="${escapeHtml(input.unsubscribeUrl)}" style="color:#104534;text-decoration:underline;">Afmeld her</a>.</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`;

  const clinicText = input.clinics
    .map((clinic) => {
      const publicUrl = clinicPublicUrl(clinic.clinicSlug);
      return [
        publicUrl ? `${clinic.clinicName}: ${publicUrl}` : clinic.clinicName,
        viewHeading(clinic),
        `${formatCount(clinic.stats.listImpressions)} visninger i søgeresultater`,
        `${formatCount(clinic.stats.profileViews)} profilvisninger`,
        nextStepHeading(clinic.stats.totalContactClicks),
        ...optionalCountLine(
          clinic.hasWebsite,
          clinic.stats.websiteClicks,
          "klikkede videre til dit website"
        ),
        ...optionalCountLine(
          clinic.hasPhone,
          clinic.stats.phoneClicks,
          "viste dit telefonnummer"
        ),
        ...optionalCountLine(
          clinic.hasEmail,
          clinic.stats.emailClicks,
          "kopierede din e-mail"
        ),
        `${formatCount(clinic.stats.bookingClicks)} ${bookingLabel(clinic.stats.bookingClicks)}`,
        ...premiumUpsellText(clinic),
        ...clinicProfileNudgeText(clinic),
      ].join("\n");
    })
    .join("\n\n");

  const text = [
    opening,
    "",
    clinicText,
    "",
    "Har du spørgsmål til dine tal eller din profil, er du altid velkommen til at skrive. Jeg svarer selv.",
    "",
    "Joachim Bograd fra Fysfinder",
    "",
    `Vil du ikke modtage denne månedlige opsummering fra Fysfinder? Afmeld her: ${input.unsubscribeUrl}`,
  ].join("\n");

  return { subject, html, text };
}

export async function sendMonthlyClinicSummaryEmail(
  resend: Resend,
  input: Omit<MonthlyClinicSummaryEmailInput, "unsubscribeUrl"> & {
    unsubscribeUrl?: string;
    siteUrl?: string;
  }
): Promise<{ success: boolean; id?: string; error?: string }> {
  const unsubscribeUrl =
    input.unsubscribeUrl ??
    buildUnsubscribeUrl(input.recipientEmail, input.siteUrl);
  const content = buildMonthlyClinicSummaryEmail({
    ...input,
    unsubscribeUrl,
  });

  try {
    const logoAttachment = getLogoAttachment();
    const { data, error } = await resend.emails.send({
      from: FROM_OWNER,
      replyTo: REPLY_TO,
      to: input.recipientEmail,
      subject: content.subject,
      html: content.html,
      text: content.text,
      ...(logoAttachment ? { attachments: [logoAttachment] } : {}),
    });

    if (error) {
      console.error("Failed to send monthly clinic summary:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error("Error sending monthly clinic summary:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function sendMonthlySummaryAdminReport(input: {
  periodYm: string;
  monthLabelDa: string;
  sent: number;
  skipped: number;
  failed: number;
  dryRun: boolean;
  details: string[];
}): Promise<{ success: boolean; error?: string }> {
  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) {
    console.warn("No admin emails configured - skipping monthly summary report");
    return { success: true };
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return { success: false, error: "RESEND_API_KEY is not set" };
  }

  const prefix = input.dryRun ? "[dry-run] " : "";
  const subject = `${prefix}Månedlig klinik-opsamling ${input.monthLabelDa}: ${input.sent} sendt`;
  const detailHtml = input.details
    .map((line) => `<li>${escapeHtml(line)}</li>`)
    .join("");

  try {
    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from: FROM_TRANSACTIONAL,
      to: adminEmails,
      subject,
      html: `
        <h2>Månedlig klinik-opsamling — ${escapeHtml(input.monthLabelDa)}</h2>
        <p>Periode: ${escapeHtml(input.periodYm)}</p>
        <ul>
          <li>Sendt: ${input.sent}</li>
          <li>Sprunget over: ${input.skipped}</li>
          <li>Fejlet: ${input.failed}</li>
        </ul>
        ${detailHtml ? `<h3>Detaljer</h3><ul>${detailHtml}</ul>` : ""}
      `,
    });

    if (error) {
      console.error("Failed to send monthly summary admin report:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
