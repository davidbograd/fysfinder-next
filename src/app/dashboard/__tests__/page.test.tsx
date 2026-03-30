// Added: 2026-03-30 - MVP coverage for dashboard auth-gate redirect.
const mockRedirect = jest.fn();

jest.mock("next/navigation", () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}));

jest.mock("@/app/utils/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: null } }),
    },
  }),
}));

jest.mock("@/app/actions/clinic-management", () => ({
  getOwnedClinics: jest.fn(),
}));

jest.mock("@/app/actions/clinic-analytics", () => ({
  getAllOwnedClinicAnalytics: jest.fn(),
}));

jest.mock("@/app/actions/dashboard-uplift", () => ({
  getClinicDashboardUplift: jest.fn(),
}));

jest.mock("@/app/actions/user-claims", () => ({
  getUserClaims: jest.fn(),
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
});
