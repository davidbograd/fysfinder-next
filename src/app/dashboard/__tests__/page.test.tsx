// Updated: 2026-04-22 - Covers auth-gate redirect, booking-inclusive lead KPIs, and admin ownership tool entry visibility.
import { render, screen } from "@testing-library/react";

const mockRedirect = jest.fn();
const mockGetUser = jest.fn();
const mockGetOwnedClinics = jest.fn();
const mockGetAllOwnedClinicAnalytics = jest.fn();
const mockGetClinicDashboardUplift = jest.fn();
const mockGetUserClaims = jest.fn();
const mockIsAdminEmail = jest.fn();

jest.mock("next/navigation", () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}));

jest.mock("@/app/utils/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: (...args: unknown[]) => mockGetUser(...args),
    },
  }),
}));

jest.mock("@/app/actions/clinic-management", () => ({
  getOwnedClinics: (...args: unknown[]) => mockGetOwnedClinics(...args),
}));

jest.mock("@/app/actions/clinic-analytics", () => ({
  getAllOwnedClinicAnalytics: (...args: unknown[]) =>
    mockGetAllOwnedClinicAnalytics(...args),
}));

jest.mock("@/app/actions/dashboard-uplift", () => ({
  getClinicDashboardUplift: (...args: unknown[]) =>
    mockGetClinicDashboardUplift(...args),
}));

jest.mock("@/app/actions/user-claims", () => ({
  getUserClaims: (...args: unknown[]) => mockGetUserClaims(...args),
}));

jest.mock("@/lib/admin", () => ({
  isAdminEmail: (...args: unknown[]) => mockIsAdminEmail(...args),
}));

jest.mock("@/components/dashboard/AdminClaimsSection", () => ({
  AdminClaimsSection: () => null,
}));
jest.mock("@/components/dashboard/AdminStatsSection", () => ({
  AdminStatsSection: () => null,
}));
jest.mock("@/components/dashboard/AdminAnalyticsSection", () => ({
  AdminAnalyticsSection: () => null,
}));
jest.mock("@/components/dashboard/UserClaimsSection", () => ({
  UserClaimsSection: () => null,
}));
jest.mock("@/components/dashboard/OwnedClinicCard", () => ({
  OwnedClinicCard: () => null,
}));
jest.mock("@/components/dashboard/DashboardDevToolbar", () => ({
  DashboardDevToolbar: () => null,
}));

describe("DashboardPage auth gate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: null } });
    mockGetOwnedClinics.mockResolvedValue({ clinics: [] });
    mockGetAllOwnedClinicAnalytics.mockResolvedValue({ stats: {} });
    mockGetClinicDashboardUplift.mockResolvedValue({ data: null });
    mockGetUserClaims.mockResolvedValue({ claims: [] });
    mockIsAdminEmail.mockReturnValue(false);
  });

  it("redirects anonymous users to signin", async () => {
    mockRedirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
    const DashboardPage = (await import("../page")).default;

    await expect(
      DashboardPage({ searchParams: Promise.resolve({}) })
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mockRedirect).toHaveBeenCalledWith("/auth/signin");
  });

  it("includes booking clicks in lead click totals", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "owner@example.com" } },
    });
    mockGetOwnedClinics.mockResolvedValue({
      clinics: [
        {
          clinics_id: "clinic-1",
          klinikNavn: "Klinik One",
          lokation: "Aabenraa",
          verified_klinik: true,
        },
      ],
    });
    mockGetAllOwnedClinicAnalytics.mockResolvedValue({
      stats: {
        "clinic-1": {
          clinicId: "clinic-1",
          period: "30 dage",
          profileViews: 0,
          listImpressions: 0,
          phoneClicks: 10,
          websiteClicks: 10,
          emailClicks: 5,
          bookingClicks: 20,
          totalContactClicks: 45,
        },
      },
    });

    const DashboardPage = (await import("../page")).default;
    const ui = await DashboardPage({ searchParams: Promise.resolve({}) });
    render(ui);

    expect(screen.getAllByText("Lead klik").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Booking klik").length).toBeGreaterThan(0);
    expect(screen.getByText("45")).toBeInTheDocument();
  });

  it("hides lead and view upsell when at least one clinic is premium", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "owner@example.com" } },
    });
    mockGetOwnedClinics.mockResolvedValue({
      clinics: [
        {
          clinics_id: "clinic-1",
          klinikNavn: "Premium Klinik",
          lokation: "Aabenraa",
          verified_klinik: true,
        },
        {
          clinics_id: "clinic-2",
          klinikNavn: "Free Klinik",
          lokation: "Rødekro",
          verified_klinik: false,
        },
      ],
    });
    mockGetAllOwnedClinicAnalytics.mockResolvedValue({
      stats: {
        "clinic-1": {
          clinicId: "clinic-1",
          period: "30 dage",
          profileViews: 200,
          listImpressions: 500,
          phoneClicks: 5,
          websiteClicks: 3,
          emailClicks: 2,
          bookingClicks: 1,
          totalContactClicks: 11,
        },
        "clinic-2": {
          clinicId: "clinic-2",
          period: "30 dage",
          profileViews: 100,
          listImpressions: 100,
          phoneClicks: 1,
          websiteClicks: 1,
          emailClicks: 0,
          bookingClicks: 0,
          totalContactClicks: 2,
        },
      },
    });

    const DashboardPage = (await import("../page")).default;
    const ui = await DashboardPage({ searchParams: Promise.resolve({}) });
    render(ui);

    expect(screen.queryByText("Du går glip af patienter")).not.toBeInTheDocument();
  });

  it("shows clinic ownership admin link for admins", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-1", email: "admin@example.com" } },
    });
    mockIsAdminEmail.mockReturnValue(true);

    const DashboardPage = (await import("../page")).default;
    const ui = await DashboardPage({ searchParams: Promise.resolve({}) });
    render(ui);

    expect(
      screen.getByRole("link", { name: /åbn ejerskabsværktøj/i })
    ).toHaveAttribute("href", "/dashboard/admin/clinic-owners");
  });
});
