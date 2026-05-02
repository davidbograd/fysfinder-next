import { render, screen } from "@testing-library/react";

const mockRedirect = jest.fn();
const mockGetUser = jest.fn();
const mockIsAdminEmail = jest.fn();
const mockGetSuburbAnalytics = jest.fn();

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
  getSuburbAnalytics: (...args: unknown[]) => mockGetSuburbAnalytics(...args),
}));

jest.mock("@/components/dashboard/AdminSuburbAnalyticsTable", () => ({
  AdminSuburbAnalyticsTable: () => <div>table</div>,
}));

describe("AdminSuburbAnalyticsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-1", email: "admin@example.com" } },
    });
    mockIsAdminEmail.mockReturnValue(true);
    mockGetSuburbAnalytics.mockResolvedValue({
      rows: [],
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
  });

  it("supports all-time filter", async () => {
    const Page = (await import("../page")).default;
    const ui = await Page({ searchParams: Promise.resolve({ days: "all" }) });
    render(ui);

    expect(mockGetSuburbAnalytics).toHaveBeenCalledWith(null);
    expect(screen.getByRole("heading", { name: "Alle bydele" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /all time/i })
    ).toHaveAttribute("href", "/dashboard/admin/suburb-analytics?days=all");
  });
});
