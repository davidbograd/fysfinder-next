// Updated: 2026-04-03 - Covers auth-gate redirect and booking-inclusive lead KPI totals.
import { render, screen } from "@testing-library/react";

const mockRedirect = jest.fn();
const mockGetUser = jest.fn();
const mockGetOwnedClinics = jest.fn();
const mockGetAllOwnedClinicAnalytics = jest.fn();
const mockGetClinicDashboardUplift = jest.fn();
const mockGetUserClaims = jest.fn();

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
jest.mock("@/components/dashboard/ClinicCard", () => ({
  ClinicCard: () => null,
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
});
