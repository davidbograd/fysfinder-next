// Added: 2026-09-17 - Guards that webhook idempotency uses the service-role client.
import { POST } from "../route";

const mockMaybeSingle = jest.fn();
const mockEq = jest.fn(() => ({ maybeSingle: mockMaybeSingle }));
const mockSelect = jest.fn(() => ({ eq: mockEq }));
const mockInsert = jest.fn();
const mockFrom = jest.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
}));
const mockCreateClient = jest.fn(() => ({ from: mockFrom }));
const mockConstructEvent = jest.fn();

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) =>
      ({
        status: init?.status ?? 200,
        json: async () => body,
      }) as { status: number; json: () => Promise<unknown> },
  },
}));

jest.mock("@supabase/supabase-js", () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...(args as [])),
}));

jest.mock("@/lib/stripe/server", () => ({
  getStripeClient: () => ({
    webhooks: {
      constructEvent: (...args: unknown[]) => mockConstructEvent(...args),
    },
  }),
  getStripeWebhookSecret: () => "whsec_test",
}));

function createMockRequest(): Request {
  return {
    headers: {
      get: (key: string) =>
        key.toLowerCase() === "stripe-signature" ? "sig_test" : null,
    } as Headers,
    text: async () => "{}",
  } as Request;
}

describe("POST /api/stripe/webhook", () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockInsert.mockResolvedValue({ error: null });
    mockConstructEvent.mockReturnValue({
      id: "evt_test_123",
      type: "ping",
    });
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceKey;
  });

  it("looks up and records webhook events with the service role client", async () => {
    const response = await POST(createMockRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ received: true });
    expect(mockCreateClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "service-role-key"
    );
    expect(mockFrom).toHaveBeenCalledWith("stripe_webhook_events");
    expect(mockInsert).toHaveBeenCalledWith({
      event_id: "evt_test_123",
      event_type: "ping",
    });
  });
});
