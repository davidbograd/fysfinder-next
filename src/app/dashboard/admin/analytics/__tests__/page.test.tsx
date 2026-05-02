import { render, screen } from "@testing-library/react";

const mockRedirect = jest.fn();
const mockGetUser = jest.fn();
const mockIsAdminEmail = jest.fn();
const mockGetSuburbAnalytics = jest.fn();
const mockGetClinicAdminAnalytics = jest.fn();

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

jest.mock("@/lib/admin", () => ({
  isAdminEmail: (...args: unknown[]) => mockIsAdminEmail(...args),
}));

jest.mock("@/app/actions/admin-stats", () => ({
  getClinicAdminAnalytics: (...args: unknown[]) => mockGetClinicAdminAnalytics(...args),
  getSuburbAnalytics: (...args: unknown[]) => mockGetSuburbAnalytics(...args),
}));

jest.mock("@/components/dashboard/AdminClinicAnalyticsTable", () => ({
  AdminClinicAnalyticsTable: () => <div>clinic table</div>,
}));

jest.mock("@/components/dashboard/AdminSuburbAnalyticsTable", () => ({
  AdminSuburbAnalyticsTable: () => <div>suburb table</div>,
}));

describe("AdminAnalyticsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-1", email: "admin@example.com" } },
    });
    mockIsAdminEmail.mockReturnValue(true);
    mockGetSuburbAnalytics.mockResolvedValue({
      rows: [
        {
          suburb: "Aabenraa",
          leadClicks: 42,
          phoneClicks: 20,
          websiteClicks: 15,
          emailClicks: 5,
          bookingClicks: 2,
          views: 300,
          listImpressions: 220,
          profileViews: 80,
        },
      ],
      period: {
        startDate: "2026-02-26T11:48:09.840Z",
        endDate: "2026-05-02T06:50:19.348Z",
        oldestEventDate: "2026-02-26T11:48:09.840Z",
      },
    });
    mockGetClinicAdminAnalytics.mockResolvedValue({
      rows: [
        {
          clinicId: "clinic-1",
          clinicName: "Fysio Aabenraa",
          suburb: "Aabenraa",
          leadClicks: 42,
          phoneClicks: 20,
          websiteClicks: 15,
          emailClicks: 5,
          bookingClicks: 2,
          views: 300,
          listImpressions: 220,
          profileViews: 80,
        },
      ],
      period: {
        startDate: "2026-02-26T11:48:09.840Z",
        endDate: "2026-05-02T06:50:19.348Z",
        oldestEventDate: "2026-02-26T11:48:09.840Z",
      },
    });
  });

  it("uses 30 days by default", async () => {
    const Page = (await import("../page")).default;
    const ui = await Page({ searchParams: Promise.resolve({}) });
    render(ui);

    expect(mockGetSuburbAnalytics).toHaveBeenCalledWith(30);
    expect(screen.getByRole("heading", { name: "Aktivitets data" })).toBeInTheDocument();
    expect(screen.getByText("suburb table")).toBeInTheDocument();
  });

  it("supports all-time filter", async () => {
    const Page = (await import("../page")).default;
    const ui = await Page({ searchParams: Promise.resolve({ days: "all" }) });
    render(ui);

    expect(mockGetSuburbAnalytics).toHaveBeenCalledWith(null);
    expect(screen.getByRole("heading", { name: "Alle bydele" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /all time/i })
    ).toHaveAttribute("href", "/dashboard/admin/analytics?days=all&view=suburb");
  });

  it("supports switching to clinic analytics", async () => {
    const Page = (await import("../page")).default;
    const ui = await Page({ searchParams: Promise.resolve({ days: "7", view: "clinic" }) });
    render(ui);

    expect(mockGetClinicAdminAnalytics).toHaveBeenCalledWith(7, { verifiedOnly: false });
    expect(mockGetSuburbAnalytics).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Alle klinikker" })).toBeInTheDocument();
    expect(screen.getByText("clinic table")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Bydele" })).toHaveAttribute(
      "href",
      "/dashboard/admin/analytics?days=7&view=suburb"
    );
    expect(screen.getByRole("link", { name: "Klinikker" })).toHaveAttribute(
      "href",
      "/dashboard/admin/analytics?days=7&view=clinic"
    );
    expect(screen.getByRole("checkbox", { name: "Kun verified" })).toHaveAttribute(
      "href",
      "/dashboard/admin/analytics?days=7&view=clinic&verified=1"
    );
    expect(screen.getByRole("checkbox", { name: "Kun verified" })).toHaveAttribute(
      "aria-checked",
      "false"
    );
  });

  it("supports verified-only clinic analytics", async () => {
    const Page = (await import("../page")).default;
    const ui = await Page({
      searchParams: Promise.resolve({ days: "30", view: "clinic", verified: "1" }),
    });
    render(ui);

    expect(mockGetClinicAdminAnalytics).toHaveBeenCalledWith(30, { verifiedOnly: true });
    expect(screen.getByRole("checkbox", { name: "Kun verified" })).toHaveAttribute(
      "href",
      "/dashboard/admin/analytics?days=30&view=clinic"
    );
    expect(screen.getByRole("checkbox", { name: "Kun verified" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    expect(screen.getByRole("link", { name: "7d" })).toHaveAttribute(
      "href",
      "/dashboard/admin/analytics?days=7&view=clinic&verified=1"
    );
  });

  it("does not render top summary cards", async () => {
    const Page = (await import("../page")).default;
    const ui = await Page({ searchParams: Promise.resolve({ days: "7" }) });
    render(ui);

    expect(mockGetSuburbAnalytics).toHaveBeenCalledWith(7);
    expect(screen.queryByText("Visninger")).not.toBeInTheDocument();
    expect(screen.queryByText("Lead klik")).not.toBeInTheDocument();
  });
});
