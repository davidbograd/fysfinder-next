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

  it("includes the rewritten Danish copy, clinic names, and profile tips", () => {
    const content = buildMonthlyClinicSummaryEmail({
      recipientEmail: "owner@example.com",
      recipientName: "Anders Jensen",
      monthLabelDa: "august",
      unsubscribeUrl: buildUnsubscribeUrl("owner@example.com"),
      clinics: [
        {
          clinicId: "c1",
          clinicName: "Fysio Nord",
          missingKeys: ["specialties"],
          stats: stats(),
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

    expect(content.subject).toBe("Dine resultater på Fysfinder: August");
    expect(content.html).toContain(
      "Se hvor mange potentielle patienter der fandt og viste interesse for din klinik."
    );
    expect(content.html).toContain("Hej Anders");
    expect(content.html).toContain("Fysio Nord");
    expect(content.html).toContain("Fysio Syd");
    expect(content.html).toContain("patientinteraktioner");
    expect(content.html).toContain("klinikvisninger");
    expect(content.html).toContain("besøgte dit website");
    expect(content.html).toContain("viste dit telefonnummer");
    expect(content.html).toContain("kopierede din e-mail");
    expect(content.html).toContain("booking via Fysfinder");
    expect(content.html).toContain("visninger i søgeresultater");
    expect(content.html).toContain("visninger af din klinikprofil");
    expect(content.html).toContain("Din klinik er blevet vist");
    expect(content.html).toContain("dit dashboard");
    expect(content.html).not.toContain("Din måned kort fortalt");
    expect(content.html).toContain("Få flere patienthenvendelser");
    expect(content.html).not.toContain("Få flere patienthenvendelser via Fysfinder");
    expect(content.html).not.toContain("Tilføj jeres team");
    expect(content.html).toContain("Opdater din profil nu");
    expect(content.html).toContain("https://www.fysfinder.dk/dashboard");
    expect(content.html).toContain("/dashboard/clinic/c1/edit");
    expect(content.html).toContain("/api/email/unsubscribe");
    expect(content.text).toContain("Fysio Nord");
    expect(content.text).toContain("patientinteraktioner");
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

  it("greets with Hej when the owner name is missing", () => {
    const content = buildMonthlyClinicSummaryEmail({
      recipientEmail: "owner@example.com",
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

    expect(content.html).toContain(">Hej<");
    expect(content.html).not.toContain("Hej der");
    expect(content.text.startsWith("Hej\n")).toBe(true);
  });
});
