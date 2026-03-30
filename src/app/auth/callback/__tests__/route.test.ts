// Added: 2026-03-30 - MVP coverage for auth callback redirect behavior.
import { GET } from "../route";

const mockExchangeCodeForSession = jest.fn();
const mockMaybeSingle = jest.fn();
const mockCreateUserProfile = jest.fn();

jest.mock("@/app/actions/auth", () => ({
  createUserProfile: (...args: unknown[]) => mockCreateUserProfile(...args),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    redirect: (url: string) => ({
      headers: {
        get: (key: string) => (key.toLowerCase() === "location" ? url : null),
      },
    }),
  },
}));

jest.mock("@/app/utils/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      exchangeCodeForSession: (...args: unknown[]) =>
        mockExchangeCodeForSession(...args),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: (...args: unknown[]) => mockMaybeSingle(...args),
        }),
      }),
    }),
  }),
}));

describe("auth callback route", () => {
  beforeEach(() => {
    mockExchangeCodeForSession.mockReset();
    mockMaybeSingle.mockReset();
    mockCreateUserProfile.mockReset();
  });

  it("redirects to signin error when code is missing", async () => {
    const response = await GET({ url: "https://fysfinder.dk/auth/callback" } as Request);
    expect(response.headers.get("location")).toBe(
      "https://fysfinder.dk/auth/signin?error=callback_error"
    );
  });

  it("redirects to next path on successful callback", async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "test@example.com",
          user_metadata: { full_name: "Test User" },
        },
      },
      error: null,
    });
    mockMaybeSingle.mockResolvedValue({ data: null });
    mockCreateUserProfile.mockResolvedValue(undefined);

    const response = await GET(
      {
        url: "https://fysfinder.dk/auth/callback?code=abc&next=/dashboard",
      } as Request
    );

    expect(response.headers.get("location")).toBe("https://fysfinder.dk/dashboard");
    expect(mockExchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(mockCreateUserProfile).toHaveBeenCalled();
  });
});
