/**
 * Monthly clinic summary HTML/text: opening, stats, booking upsell, and profile progress.
 * Updated: incomplete clinics show dashboard-style X af 7 progress.
 */

jest.mock("resend", () => ({
  Resend: jest.fn(),
}));

import { buildUnsubscribeUrl } from "../email-unsubscribe";
import { buildMonthlyClinicSummaryEmail } from "../monthly-clinic-summary-email";
import type { ClinicStats } from "../clinic-stats";

const originalEnv = process.env;

function stats(overrides: Partial<ClinicStats> = {}): ClinicStats {
  return {
    clinicId: "c1",
    period: "august",
    profileViews: 1,
    listImpressions: 11,
    phoneClicks: 0,
    websiteClicks: 0,
    emailClicks: 0,
    bookingClicks: 0,
    totalContactClicks: 0,
    ...overrides,
  };
}

describe("buildMonthlyClinicSummaryEmail", () => {
  beforeEach(() => {
    process.env = { ...originalEnv, RESEND_API_KEY: "re_test_key" };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("leads with the result, scannable stats, and a specific profile CTA", () => {
    const content = buildMonthlyClinicSummaryEmail({
      recipientEmail: "owner@example.com",
      recipientName: "Anders Jensen",
      monthLabelDa: "august",
      unsubscribeUrl: buildUnsubscribeUrl("owner@example.com"),
      clinics: [
        {
          clinicId: "c1",
          clinicName: "Fysio Nord",
          clinicSlug: "fysio-nord",
          missingKeys: ["specialties"],
          stats: stats({
            websiteClicks: 5,
            totalContactClicks: 5,
            listImpressions: 40,
            profileViews: 4,
          }),
        },
        {
          clinicId: "c2",
          clinicName: "Fysio Syd",
          missingKeys: [],
          stats: stats({
            clinicId: "c2",
            listImpressions: 4,
            profileViews: 2,
            phoneClicks: 1,
            totalContactClicks: 1,
          }),
        },
      ],
    });

    expect(content.subject).toBe(
      "Sådan klarede dine klinikker sig på Fysfinder i august"
    );
    expect(content.html).toContain(
      "I august blev dine klinikker set 50 gange, og 6 patienter tog næste skridt ved at klikke videre."
    );
    expect(content.html).not.toContain("månedlige overblik");
    expect(content.html).not.toContain("Hej Anders");
    expect(content.html).not.toMatch(/>Hej</);
    expect(content.html).toContain('alt="Fysfinder"');
    expect(content.html).toContain("cid:fysfinder-logo");
    expect(content.html).toContain("Fysio Nord");
    expect(content.html).toContain("/klinik/fysio-nord");
    expect(content.html).toContain("Fysio Syd");
    expect(content.html).toContain("tog næste skridt");
    expect(content.html).toContain("klikkede videre til dit website");
    expect(content.html).toContain("viste dit telefonnummer");
    expect(content.html).toContain("kopierede din e-mail");
    expect(content.html).toContain("klinikvisninger");
    expect(content.html).toContain("visninger i søgeresultater");
    expect(content.html).toContain("profilvisninger");
    expect(content.html).not.toContain("patientinteraktion");
    expect(content.html).toContain("bookinger*");
    expect(content.html).toContain(
      "*Vil du også modtage bookinger direkte fra Fysfinder?"
    );
    expect(content.html).toContain("Direkte booking er inkluderet med");
    expect(content.html).toContain("/dashboard/clinic/c1/premium");
    expect(content.html).toContain("Klinikprofil");
    expect(content.html).toContain("6 af 7");
    expect(content.html).toContain("Tilføj f.eks. specialer.");
    expect(content.html).toContain(">Opdater</a>");
    expect(content.html).not.toContain("En komplet profil gør det lettere for patienter at vælge din klinik.");
    expect(content.html).not.toContain("mere komplet");
    expect(content.html).not.toContain("Opdater klinikprofil");
    expect(content.html).not.toContain("Tilføj specialer");
    expect(content.html).not.toContain("Få flere patienthenvendelser");
    expect(content.html).not.toContain("Opdater din profil nu");
    expect(content.html).not.toContain("vælge jer");
    expect(content.html).not.toContain("Se flere detaljer i dit dashboard");
    expect(content.html).toContain("background-color:#f8f7f2");
    expect(content.html).toContain("Jeg svarer selv");
    expect(content.html).toContain("Joachim Bograd");
    expect(content.html).toContain("fra Fysfinder");
    expect(content.html).not.toContain("Bedste hilsner");
    expect(content.html).toContain("Har du spørgsmål");
    expect(content.html).toContain("Vil du ikke modtage");
    expect(content.html).toContain("/dashboard/clinic/c1/edit");
    expect(content.html).not.toContain("/dashboard/clinic/c2/edit");
    expect(content.html).toContain("/api/email/unsubscribe");
    expect(content.text).toContain("Fysio Nord");
    expect(content.text).toContain("Klinikprofil: 6 af 7");
    expect(content.text).toContain("klikkede videre til dit website");
    expect(content.html.indexOf("klinikvisninger")).toBeLessThan(
      content.html.indexOf("klikkede videre til dit website")
    );
    expect(content.html.indexOf("kopierede din e-mail")).toBeLessThan(
      content.html.indexOf("Vil du også modtage bookinger")
    );
    const nord = content.html.indexOf("Fysio Nord");
    const syd = content.html.indexOf("Fysio Syd");
    const progress = content.html.indexOf("6 af 7");
    expect(progress).toBeGreaterThan(nord);
    expect(progress).toBeLessThan(syd);
    expect(content.html.match(/af 7/g)?.length).toBe(1);
  });

  it("can show a month-over-month view change and zero bookings with a Premium upsell", () => {
    const content = buildMonthlyClinicSummaryEmail({
      recipientEmail: "owner@example.com",
      monthLabelDa: "august",
      unsubscribeUrl: "https://www.fysfinder.dk/api/email/unsubscribe?email=x&token=y",
      clinics: [
        {
          clinicId: "c1",
          clinicName: "Fysio Nord",
          missingKeys: ["openingHours"],
          hasLogo: false,
          comparison: {
            viewsChangePercent: 22,
            previousMonthLabelDa: "juli",
          },
          stats: stats({
            websiteClicks: 5,
            totalContactClicks: 5,
            listImpressions: 40,
            profileViews: 4,
          }),
        },
      ],
    });

    expect(content.subject).toBe(
      "Sådan klarede din klinik sig på Fysfinder i august"
    );
    expect(content.html).toContain("↑ 22% fra juli");
    expect(content.html).toContain("bookinger*");
    expect(content.html).toContain("Vil du også modtage bookinger");
    expect(content.html).toContain("6 af 7");
    expect(content.html).toContain("Opdater");
    expect(content.html).not.toContain("Tilføj åbningstider");
  });

  it("escapes clinic names in HTML", () => {
    const content = buildMonthlyClinicSummaryEmail({
      recipientEmail: "owner@example.com",
      monthLabelDa: "august",
      unsubscribeUrl: "https://www.fysfinder.dk/api/email/unsubscribe?email=x&token=y",
      clinics: [
        {
          clinicId: "c1",
          clinicName: "<script>alert(1)</script>",
          missingKeys: [],
          stats: stats({ totalContactClicks: 0, listImpressions: 0, profileViews: 0 }),
        },
      ],
    });

    expect(content.html).not.toContain("<script>alert(1)</script>");
    expect(content.html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  it("does not greet with Hej", () => {
    const content = buildMonthlyClinicSummaryEmail({
      recipientEmail: "owner@example.com",
      recipientName: "Anders Jensen",
      monthLabelDa: "august",
      unsubscribeUrl: "https://www.fysfinder.dk/api/email/unsubscribe?email=x&token=y",
      clinics: [
        {
          clinicId: "c1",
          clinicName: "Fysio Nord",
          missingKeys: [],
          stats: stats(),
        },
      ],
    });

    expect(content.html).not.toContain("Hej");
    expect(content.text.startsWith("I august")).toBe(true);
    expect(content.html).not.toContain("Klinikprofil");
    expect(content.html).not.toContain("af 7");
  });

  it("shows actual bookings without the Premium asterisk or upsell", () => {
    const content = buildMonthlyClinicSummaryEmail({
      recipientEmail: "owner@example.com",
      monthLabelDa: "august",
      unsubscribeUrl: "https://www.fysfinder.dk/api/email/unsubscribe?email=x&token=y",
      clinics: [
        {
          clinicId: "c1",
          clinicName: "Fysio Nord",
          missingKeys: [],
          stats: stats({
            bookingClicks: 2,
            totalContactClicks: 2,
          }),
        },
      ],
    });

    expect(content.html).toContain("2</strong> bookinger");
    expect(content.html).not.toContain("bookinger*");
    expect(content.html).not.toContain("Vil du også modtage bookinger");
  });

  it("hides website, phone, and email rows the clinic does not have", () => {
    const content = buildMonthlyClinicSummaryEmail({
      recipientEmail: "owner@example.com",
      monthLabelDa: "august",
      unsubscribeUrl: "https://www.fysfinder.dk/api/email/unsubscribe?email=x&token=y",
      clinics: [
        {
          clinicId: "c1",
          clinicName: "Fysio Nord",
          missingKeys: [],
          hasWebsite: false,
          hasPhone: true,
          hasEmail: false,
          stats: stats({
            phoneClicks: 2,
            totalContactClicks: 2,
            listImpressions: 10,
            profileViews: 2,
          }),
        },
      ],
    });

    expect(content.html).toContain("viste dit telefonnummer");
    expect(content.html).not.toContain("klikkede videre til dit website");
    expect(content.html).not.toContain("kopierede din e-mail");
    expect(content.text).toContain("viste dit telefonnummer");
    expect(content.text).not.toContain("klikkede videre til dit website");
    expect(content.text).not.toContain("kopierede din e-mail");
  });

  it("shows dashboard-style profile progress and the contact warning when contact is missing", () => {
    const content = buildMonthlyClinicSummaryEmail({
      recipientEmail: "owner@example.com",
      monthLabelDa: "august",
      unsubscribeUrl: "https://www.fysfinder.dk/api/email/unsubscribe?email=x&token=y",
      clinics: [
        {
          clinicId: "c1",
          clinicName: "Fysio Nord",
          missingKeys: [
            "contact",
            "pricing",
            "specialties",
            "about",
            "openingHours",
            "team",
            "insurances",
          ],
          hasWebsite: false,
          hasPhone: false,
          hasEmail: false,
          stats: stats({
            totalContactClicks: 0,
            listImpressions: 4,
            profileViews: 0,
          }),
        },
      ],
    });

    expect(content.html).toContain("0 af 7");
    expect(content.html).toContain(
      "Din klinik har ingen kontaktoplysninger. Patienter har ingen mulighed for at kontakte dig."
    );
    expect(content.html).toContain("/dashboard/clinic/c1/edit");
    expect(content.text).toContain("Klinikprofil: 0 af 7");
  });
});
