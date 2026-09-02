import { render, screen } from "@testing-library/react";

const mockRedirect = jest.fn();
const mockGetUser = jest.fn();
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

jest.mock("@/lib/admin", () => ({
  isAdminEmail: (...args: unknown[]) => mockIsAdminEmail(...args),
}));

jest.mock("@/components/dashboard/AdminPremiumSection", () => ({
  AdminPremiumSection: () => null,
}));

describe("AdminPremiumPage access", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRedirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
  });

  it("redirects anonymous users to signin", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const AdminPremiumPage = (await import("../page")).default;

    await expect(AdminPremiumPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/auth/signin");
  });

  it("redirects signed-in non-admins back to the dashboard", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "user@example.com" } },
    });
    mockIsAdminEmail.mockReturnValue(false);
    const AdminPremiumPage = (await import("../page")).default;

    await expect(AdminPremiumPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
  });

  it("renders the premium tool for admins", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-1", email: "admin@example.com" } },
    });
    mockIsAdminEmail.mockReturnValue(true);
    const AdminPremiumPage = (await import("../page")).default;

    render(await AdminPremiumPage());

    expect(
      screen.getByRole("heading", { name: "Premium-abonnementer" })
    ).toBeInTheDocument();
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
