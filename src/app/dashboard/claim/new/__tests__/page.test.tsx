import { render } from "@testing-library/react";

const mockRedirect = jest.fn();
const mockGetUser = jest.fn();
const mockProfileSingle = jest.fn();
const mockCreateClinicRequestPage = jest.fn(() => null);

jest.mock("next/navigation", () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}));

jest.mock("@/app/utils/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: (...args: unknown[]) => mockGetUser(...args),
    },
    from: (table: string) => {
      if (table !== "user_profiles") {
        throw new Error(`Unexpected table in mock: ${table}`);
      }

      return {
        select: () => ({
          eq: () => ({
            single: (...args: unknown[]) => mockProfileSingle(...args),
          }),
        }),
      };
    },
  }),
}));

jest.mock("@/components/dashboard/CreateClinicRequestPage", () => ({
  CreateClinicRequestPage: (props: unknown) => {
    mockCreateClinicRequestPage(props);
    return null;
  },
}));

describe("CreateClaimNewPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("falls back to auth email when profile email is empty", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "auth@example.com" } },
    });
    mockProfileSingle.mockResolvedValue({
      data: { full_name: "Test Person", email: null },
    });

    const CreateClaimNewPage = (await import("../page")).default;
    const ui = await CreateClaimNewPage({
      searchParams: Promise.resolve({
        cityId: "city-1",
        cityName: "Aabenraa",
        citySlug: "aabenraa",
        postalCode: "6200",
      }),
    });

    render(ui);

    const props = mockCreateClinicRequestPage.mock.calls[0][0];
    expect(props.userProfile).toEqual({
      full_name: "Test Person",
      email: "auth@example.com",
    });
    expect(props.initialCity).toEqual({
      id: "city-1",
      name: "Aabenraa",
      slug: "aabenraa",
      postalCode: "6200",
    });
  });

  it("redirects unauthenticated users", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    mockRedirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });

    const CreateClaimNewPage = (await import("../page")).default;

    await expect(
      CreateClaimNewPage({
        searchParams: Promise.resolve({}),
      })
    ).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/auth/signin");
  });
});
