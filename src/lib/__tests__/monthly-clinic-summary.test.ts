/**
 * Pure helpers for monthly clinic summary emails.
 * Updated: per-clinic "X af 7" profile progress for incomplete profiles.
 */

import { CLINIC_PROFILE_CONTACT_NO_INFO_WARNING_DA } from "../clinic-profile-completeness";
import type { ClinicStats } from "../clinic-stats";
import {
  buildMonthlySummaryAttentionParagraphs,
  buildMonthlySummaryClinicProfileNudge,
  buildMonthlySummaryOpeningLine,
  buildMonthlySummarySubject,
  decideMonthlySummaryAction,
  filterClinicsOwnedInPeriod,
  formatMonthOverMonthChange,
  getMonthlySummaryProfileCta,
  groupRowsByOwner,
  resolveOwnerEmail,
} from "../monthly-clinic-summary";

function emptyStats(overrides: Partial<ClinicStats> = {}): ClinicStats {
  return {
    clinicId: "c1",
    period: "august",
    profileViews: 0,
    listImpressions: 0,
    phoneClicks: 0,
    websiteClicks: 0,
    emailClicks: 0,
    bookingClicks: 0,
    totalContactClicks: 0,
    ...overrides,
  };
}

describe("resolveOwnerEmail", () => {
  it("prefers profile email, then auth, then verified_email", () => {
    expect(
      resolveOwnerEmail({
        profileEmail: " Owner@Example.com ",
        authEmail: "auth@example.com",
        verifiedEmails: ["verified@example.com"],
      })
    ).toBe("owner@example.com");

    expect(
      resolveOwnerEmail({
        profileEmail: null,
        authEmail: "auth@example.com",
        verifiedEmails: ["verified@example.com"],
      })
    ).toBe("auth@example.com");

    expect(
      resolveOwnerEmail({
        verifiedEmails: ["", "verified@example.com"],
      })
    ).toBe("verified@example.com");
  });

  it("returns null when no usable email exists", () => {
    expect(resolveOwnerEmail({ profileEmail: "   ", verifiedEmails: [null] })).toBe(
      null
    );
  });
});

describe("groupRowsByOwner and period filter", () => {
  const periodEnd = "2026-08-31T21:59:59.999Z";

  it("groups clinics by owner and drops clinics owned after the period", () => {
    const rows = [
      { ownerUserId: "u1", clinicId: "a", ownedAt: "2026-07-01T00:00:00.000Z" },
      { ownerUserId: "u1", clinicId: "b", ownedAt: "2026-09-01T00:00:00.000Z" },
      { ownerUserId: "u2", clinicId: "c", ownedAt: "2026-08-10T00:00:00.000Z" },
    ];

    const grouped = groupRowsByOwner(rows);
    expect(grouped.get("u1")).toHaveLength(2);
    expect(filterClinicsOwnedInPeriod(grouped.get("u1") || [], periodEnd)).toEqual([
      rows[0],
    ]);
    expect(filterClinicsOwnedInPeriod(grouped.get("u2") || [], periodEnd)).toEqual([
      rows[2],
    ]);
  });
});

describe("decideMonthlySummaryAction", () => {
  it("skips no clinics, missing email, already sent, and unsubscribed", () => {
    expect(
      decideMonthlySummaryAction({
        clinicCountInPeriod: 0,
        email: "a@b.dk",
        alreadySent: false,
        unsubscribed: false,
      })
    ).toEqual({ action: "skip", reason: "no_clinics_in_period" });

    expect(
      decideMonthlySummaryAction({
        clinicCountInPeriod: 1,
        email: null,
        alreadySent: false,
        unsubscribed: false,
      })
    ).toEqual({ action: "skip", reason: "no_email" });

    expect(
      decideMonthlySummaryAction({
        clinicCountInPeriod: 1,
        email: "a@b.dk",
        alreadySent: true,
        unsubscribed: false,
      })
    ).toEqual({ action: "skip", reason: "already_sent" });

    expect(
      decideMonthlySummaryAction({
        clinicCountInPeriod: 1,
        email: "a@b.dk",
        alreadySent: false,
        unsubscribed: true,
      })
    ).toEqual({ action: "skip", reason: "unsubscribed" });
  });

  it("sends when the owner has clinics, an email, and is eligible", () => {
    expect(
      decideMonthlySummaryAction({
        clinicCountInPeriod: 2,
        email: "a@b.dk",
        alreadySent: false,
        unsubscribed: false,
      })
    ).toEqual({ action: "send" });
  });
});

describe("buildMonthlySummaryAttentionParagraphs", () => {
  it("uses the contact warning and completeness nudge on zeros", () => {
    const paragraphs = buildMonthlySummaryAttentionParagraphs([
      {
        clinicId: "c1",
        clinicName: "Test Klinik",
        missingKeys: ["contact", "specialties"],
        stats: emptyStats(),
      },
    ]);

    expect(paragraphs[0]).toBe(CLINIC_PROFILE_CONTACT_NO_INFO_WARNING_DA);
    expect(paragraphs.join(" ")).toMatch(/specialer/i);
  });

  it("gives a quiet-month tip when the profile is complete", () => {
    const paragraphs = buildMonthlySummaryAttentionParagraphs([
      {
        clinicId: "c1",
        clinicName: "Test Klinik",
        missingKeys: [],
        stats: emptyStats(),
      },
    ]);

    expect(paragraphs[0]).toMatch(/specialer og by/i);
    expect(paragraphs[0]).toMatch(/\bdu\b/);
    expect(paragraphs.join(" ")).not.toMatch(/\b(I|jer|jeres)\b/);
  });
});

describe("buildMonthlySummaryClinicProfileNudge", () => {
  it("returns X af 7 and a missing-fields nudge when the profile is incomplete", () => {
    const nudge = buildMonthlySummaryClinicProfileNudge({
      clinicId: "c1",
      clinicName: "Fysio Nord",
      missingKeys: ["specialties", "openingHours"],
      stats: emptyStats(),
    });

    expect(nudge?.progressLabel).toBe("5 af 7");
    expect(nudge?.completedCount).toBe(5);
    expect(nudge?.totalCount).toBe(7);
    expect(nudge?.body).toMatch(/specialer/i);
  });

  it("uses the contact warning when contact is missing", () => {
    const nudge = buildMonthlySummaryClinicProfileNudge({
      clinicId: "c1",
      clinicName: "Fysio Nord",
      missingKeys: ["contact", "specialties"],
      stats: emptyStats(),
    });

    expect(nudge?.progressLabel).toBe("5 af 7");
    expect(nudge?.body).toBe(CLINIC_PROFILE_CONTACT_NO_INFO_WARNING_DA);
  });

  it("returns null when the profile is complete", () => {
    expect(
      buildMonthlySummaryClinicProfileNudge({
        clinicId: "c1",
        clinicName: "Fysio Nord",
        missingKeys: [],
        stats: emptyStats(),
      })
    ).toBeNull();
  });
});

describe("monthly summary subject, opening, CTA, and MoM", () => {
  it("uses a stable monthly subject and a views-plus-next-step opening", () => {
    const clinics = [
      {
        clinicId: "c1",
        clinicName: "Fysio Nord",
        missingKeys: [],
        stats: emptyStats({
          websiteClicks: 5,
          totalContactClicks: 5,
          listImpressions: 40,
          profileViews: 4,
        }),
      },
    ];

    expect(buildMonthlySummarySubject(clinics, "august")).toBe(
      "Sådan klarede din klinik sig på Fysfinder i august"
    );
    expect(buildMonthlySummaryOpeningLine(clinics, "august")).toBe(
      "I august blev din klinik set 44 gange, og 5 patienter tog næste skridt ved at klikke videre."
    );
  });

  it("uses dine klinikker in the subject when the owner has more than one clinic", () => {
    expect(
      buildMonthlySummarySubject(
        [
          {
            clinicId: "c1",
            clinicName: "Fysio Nord",
            missingKeys: [],
            stats: emptyStats({ websiteClicks: 1, totalContactClicks: 1 }),
          },
          {
            clinicId: "c2",
            clinicName: "Fysio Syd",
            missingKeys: [],
            stats: emptyStats({ clinicId: "c2" }),
          },
        ],
        "august"
      )
    ).toBe("Sådan klarede dine klinikker sig på Fysfinder i august");
  });

  it("picks a specific profile CTA from the highest-priority missing field", () => {
    expect(
      getMonthlySummaryProfileCta([
        {
          clinicId: "c1",
          clinicName: "Fysio Nord",
          missingKeys: ["specialties", "openingHours"],
          stats: emptyStats(),
        },
      ])
    ).toEqual({ label: "Tilføj specialer →", clinicId: "c1" });

    expect(
      getMonthlySummaryProfileCta([
        {
          clinicId: "c2",
          clinicName: "Fysio Syd",
          missingKeys: [],
          hasLogo: false,
          stats: emptyStats(),
        },
      ])
    ).toEqual({ label: "Tilføj billeder →", clinicId: "c2" });
  });

  it("formats month-over-month view changes for later emails", () => {
    expect(formatMonthOverMonthChange(22.4, "juli")).toBe("↑ 22% fra juli");
    expect(formatMonthOverMonthChange(-8.1, "juli")).toBe("↓ 8% fra juli");
    expect(formatMonthOverMonthChange(null, "juli")).toBe("");
  });
});
