const mockContactsUpdate = jest.fn();
const mockContactsCreate = jest.fn();

jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({
    contacts: {
      update: mockContactsUpdate,
      create: mockContactsCreate,
    },
  })),
}));

jest.mock("next/server", () => ({
  NextResponse: class MockNextResponse {
    status: number;
    private readonly body: string;

    constructor(
      body: string,
      init?: { status?: number; headers?: Record<string, string> }
    ) {
      this.body = body;
      this.status = init?.status ?? 200;
    }

    async text() {
      return this.body;
    }
  },
}));

import { GET } from "../route";

const originalEnv = process.env;

function requestFor(email: string, token: string) {
  return {
    nextUrl: {
      searchParams: new URLSearchParams({ email, token }),
    },
  } as Parameters<typeof GET>[0];
}

describe("GET /api/email/unsubscribe", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, RESEND_API_KEY: "re_test_key" };
    mockContactsUpdate.mockResolvedValue({ error: null });
    mockContactsCreate.mockResolvedValue({ error: null });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("rejects invalid tokens", async () => {
    const response = await GET(requestFor("owner@example.com", "nope"));
    expect(response.status).toBe(400);
    const html = await response.text();
    expect(html).toMatch(/Linket virker ikke/);
    expect(mockContactsUpdate).not.toHaveBeenCalled();
  });

  it("marks the contact unsubscribed for a valid token", async () => {
    const { createUnsubscribeToken } = await import("@/lib/email-unsubscribe");
    const email = "owner@example.com";
    const token = createUnsubscribeToken(email);

    const response = await GET(requestFor(email, token));
    expect(response.status).toBe(200);
    expect(mockContactsUpdate).toHaveBeenCalledWith({
      email,
      unsubscribed: true,
    });
    const html = await response.text();
    expect(html).toMatch(/I er afmeldt/);
  });
});
