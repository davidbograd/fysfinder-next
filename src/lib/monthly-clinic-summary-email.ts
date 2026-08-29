/**
 * Danish monthly clinic summary email: HTML/text builder and Resend send helper.
 * Updated: clinic summary sits under the name; profile tips are a short CTA only.
 */

import { Resend } from "resend";
import { getAdminEmails } from "@/lib/admin";
import { titleCaseDanishMonth } from "@/lib/calendar-month";
import { buildUnsubscribeUrl } from "@/lib/email-unsubscribe";
import type { MonthlySummaryClinicView } from "@/lib/monthly-clinic-summary";

const DASHBOARD_URL = "https://www.fysfinder.dk/dashboard";
const PREHEADER =
  "Se hvor mange potentielle patienter der fandt og viste interesse for din klinik.";
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

function greetingLine(recipientName?: string | null): string {
  const first = recipientName?.trim().split(/\s+/)[0];
  return first ? `Hej ${first}` : "Hej";
}

function clinicEditUrl(clinicId: string): string {
  return `https://www.fysfinder.dk/dashboard/clinic/${clinicId}/edit`;
}

function clinicPremiumUrl(clinicId: string): string {
  return `https://www.fysfinder.dk/dashboard/clinic/${clinicId}/premium`;
}

function clinicTotals(clinic: MonthlySummaryClinicView): {
  interactions: number;
  views: number;
} {
  return {
    interactions: clinic.stats.totalContactClicks,
    views: clinic.stats.profileViews + clinic.stats.listImpressions,
  };
}

function interactionHeading(count: number): string {
  return count === 1 ? "1 patientinteraktion" : `${formatCount(count)} patientinteraktioner`;
}

function viewHeading(count: number): string {
  return count === 1 ? "1 klinikvisning" : `${formatCount(count)} klinikvisninger`;
}

function timesLabel(count: number): string {
  return count === 1 ? "1 gang" : `${formatCount(count)} gange`;
}

function nextStepLabel(count: number): string {
  return count === 1
    ? "1 patient tog næste skridt"
    : `${formatCount(count)} patienter tog næste skridt`;
}

function renderCountRow(count: number, label: string): string {
  return `<tr><td style="padding:3px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#333333;"><strong>${formatCount(count)}</strong> ${escapeHtml(label)}</td></tr>`;
}

function renderCta(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0 8px 0;">
<tr><td bgcolor="#104534" style="background-color:#104534;border-radius:9999px;text-align:center;">
<a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#ffffff;text-decoration:none;border-radius:9999px;">${escapeHtml(label)}</a>
</td></tr>
</table>`;
}

function clinicSummarySentenceHtml(
  views: number,
  interactions: number
): string {
  return `Din klinik er blevet vist <strong>${escapeHtml(timesLabel(views))}</strong>, og <strong>${escapeHtml(nextStepLabel(interactions))}</strong> ved at klikke videre fra din profil. Se detaljer i <a href="${DASHBOARD_URL}" style="color:#104534;text-decoration:underline;">dit dashboard</a>.`;
}

function clinicSummarySentenceText(
  views: number,
  interactions: number
): string {
  return `Din klinik er blevet vist ${timesLabel(views)}, og ${nextStepLabel(interactions)} ved at klikke videre fra din profil. Se detaljer i dit dashboard: ${DASHBOARD_URL}`;
}

function renderClinicSection(clinic: MonthlySummaryClinicView): string {
  const { interactions, views } = clinicTotals(clinic);
  const premiumUrl = clinicPremiumUrl(clinic.clinicId);
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px 0;">
  <tr>
    <td style="padding-bottom:8px;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:1.4;color:#104534;font-weight:bold;">
      ${escapeHtml(clinic.clinicName)}
    </td>
  </tr>
  <tr>
    <td style="padding:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#333333;">
      ${clinicSummarySentenceHtml(views, interactions)}
    </td>
  </tr>
  <tr>
    <td style="border-top:1px solid #e5e7eb;padding-top:24px;font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:1.4;color:#111111;font-weight:bold;">
      ${escapeHtml(interactionHeading(interactions))}
    </td>
  </tr>
  <tr>
    <td style="padding:8px 0 12px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#333333;">
      Patienter, der har taget næste skridt fra din profil.
    </td>
  </tr>
  <tr>
    <td>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${renderCountRow(clinic.stats.websiteClicks, "besøgte dit website")}
        ${renderCountRow(clinic.stats.phoneClicks, "viste dit telefonnummer")}
        ${renderCountRow(clinic.stats.emailClicks, "kopierede din e-mail")}
        ${renderCountRow(clinic.stats.bookingClicks, "booking via Fysfinder*")}
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:12px 0 24px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#6b7280;">
      *Booking via Fysfinder kræver Premium. <a href="${escapeHtml(premiumUrl)}" style="color:#104534;text-decoration:underline;">Opgrader her</a>.
    </td>
  </tr>
  <tr>
    <td style="border-top:1px solid #e5e7eb;padding-top:24px;font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:1.4;color:#111111;font-weight:bold;">
      ${escapeHtml(viewHeading(views))}
    </td>
  </tr>
  <tr>
    <td style="padding:8px 0 12px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#333333;">
      Så mange gange blev din klinik vist til potentielle patienter på Fysfinder.
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:8px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${renderCountRow(clinic.stats.listImpressions, "visninger i søgeresultater")}
        ${renderCountRow(clinic.stats.profileViews, "visninger af din klinikprofil")}
      </table>
    </td>
  </tr>
</table>`;
}

export function buildMonthlyClinicSummaryEmail(
  input: MonthlyClinicSummaryEmailInput
): MonthlyClinicSummaryEmailContent {
  const monthTitle = titleCaseDanishMonth(input.monthLabelDa);
  const subject = `Dine resultater på Fysfinder: ${monthTitle}`;
  const greeting = greetingLine(input.recipientName);
  const primaryClinicId = input.clinics[0]?.clinicId;
  const profileUrl = primaryClinicId
    ? clinicEditUrl(primaryClinicId)
    : DASHBOARD_URL;
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
<td style="font-size:1px;line-height:1px;padding:0;margin:0;color:#f6f6f6;font-family:Arial,Helvetica,sans-serif;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(PREHEADER)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</td>
</tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f6f6f6;">
<tr>
<td align="center" style="padding:24px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;">
<tr>
<td style="padding:32px 24px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#333333;">
<p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#333333;">${escapeHtml(greeting)}</p>
<p style="margin:0 0 24px 0;font-size:16px;line-height:1.6;color:#333333;">Her er dit månedlige overblik fra Fysfinder. Se, hvordan potentielle patienter har fundet og interageret med din klinik i ${escapeHtml(input.monthLabelDa)}.</p>
${clinicHtml}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 0 0;">
<tr>
<td style="border-top:1px solid #e5e7eb;padding-top:24px;">
<p style="margin:0 0 12px 0;font-size:18px;line-height:1.4;color:#104534;font-weight:bold;">Få flere patienthenvendelser</p>
<p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#333333;">En komplet profil på Fysfinder gør det lettere for patienter at vælge jer.</p>
${renderCta(profileUrl, "Opdater din profil nu →")}
</td>
</tr>
</table>
<p style="margin:24px 0;font-size:16px;line-height:1.6;color:#333333;">Har I spørgsmål til dine tal eller profil, er du altid velkomne til at skrive. Jeg svarer selv.</p>
<p style="margin:0 0 4px 0;font-size:16px;line-height:1.6;color:#333333;">Bedste hilsner<br /><strong>Joachim Bograd</strong><br />Fysfinder</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
<tr>
<td style="padding-top:24px;border-top:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#6b7280;">
<p style="margin:0;">Vil I ikke modtage denne månedlige opsummering fra Fysfinder? <a href="${escapeHtml(input.unsubscribeUrl)}" style="color:#104534;text-decoration:underline;">Afmeld her</a>.</p>
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
      const { interactions, views } = clinicTotals(clinic);
      return [
        clinic.clinicName,
        clinicSummarySentenceText(views, interactions),
        "",
        interactionHeading(interactions),
        "Patienter, der har taget næste skridt fra din profil.",
        `${formatCount(clinic.stats.websiteClicks)} besøgte dit website`,
        `${formatCount(clinic.stats.phoneClicks)} viste dit telefonnummer`,
        `${formatCount(clinic.stats.emailClicks)} kopierede din e-mail`,
        `${formatCount(clinic.stats.bookingClicks)} booking via Fysfinder*`,
        "*Booking via Fysfinder kræver Premium. Opgrader her.",
        "",
        viewHeading(views),
        "Så mange gange blev din klinik vist til potentielle patienter på Fysfinder.",
        `${formatCount(clinic.stats.listImpressions)} visninger i søgeresultater`,
        `${formatCount(clinic.stats.profileViews)} visninger af din klinikprofil`,
      ].join("\n");
    })
    .join("\n\n");

  const text = [
    greeting,
    "",
    `Her er dit månedlige overblik fra Fysfinder. Se, hvordan potentielle patienter har fundet og interageret med din klinik i ${input.monthLabelDa}.`,
    "",
    clinicText,
    "",
    "Få flere patienthenvendelser",
    "En komplet profil på Fysfinder gør det lettere for patienter at vælge jer.",
    `Opdater din profil nu → ${profileUrl}`,
    "",
    "Har I spørgsmål til dine tal eller profil, er du altid velkomne til at skrive. Jeg svarer selv.",
    "",
    "Bedste hilsner",
    "Joachim Bograd",
    "Fysfinder",
    "",
    `Vil I ikke modtage denne månedlige opsummering fra Fysfinder? Afmeld her: ${input.unsubscribeUrl}`,
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
    const { data, error } = await resend.emails.send({
      from: FROM_OWNER,
      replyTo: REPLY_TO,
      to: input.recipientEmail,
      subject: content.subject,
      html: content.html,
      text: content.text,
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
