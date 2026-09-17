import { POST } from "../route";

const mockUpsert = jest.fn();
const mockFrom = jest.fn(() => ({ upsert: mockUpsert }));
const mockSendToolFeedback = jest.fn();

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
  createClient: () => ({ from: mockFrom }),
}));

jest.mock("@/lib/email", () => ({
  sendToolFeedbackNotificationToAdmins: (...args: unknown[]) =>
    mockSendToolFeedback(...args),
}));

function createMockRequest({
  body,
  headers = {},
}: {
  body: unknown;
  headers?: Record<string, string>;
}): Request {
  const normalizedHeaders = new Map(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value])
  );

  return {
    headers: {
      get: (key: string) => normalizedHeaders.get(key.toLowerCase()) ?? null,
    } as Headers,
    json: async () => body,
  } as Request;
}

const CLIENT_ID = "3f1a2b4c-5d6e-7f80-9012-3456789abcde";

function validRequest(body: Record<string, unknown>, ip = "203.0.113.1") {
  return createMockRequest({
    headers: { origin: "https://www.fysfinder.dk", "x-forwarded-for": ip },
    body: { clientId: CLIENT_ID, ...body },
  });
}

describe("POST /api/tool-rating", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpsert.mockResolvedValue({ error: null });
    mockSendToolFeedback.mockResolvedValue({ success: true });
  });

  it("rejects disallowed origins", async () => {
    const request = createMockRequest({
      headers: { origin: "https://malicious.example" },
      body: { toolSlug: "bmi-beregner", sentiment: "up", rating: 5, clientId: CLIENT_ID },
    });

    const response = await POST(request);

    expect(response.status).toBe(403);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("rejects an unknown tool slug", async () => {
    const response = await POST(
      validRequest({ toolSlug: "not-a-tool", sentiment: "up", rating: 5 }, "203.0.113.2")
    );

    expect(response.status).toBe(400);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("rejects an out-of-range rating", async () => {
    const response = await POST(
      validRequest({ toolSlug: "bmi-beregner", sentiment: "up", rating: 9 }, "203.0.113.3")
    );

    expect(response.status).toBe(400);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("rejects a positive response with no rating, so the average cannot be padded", async () => {
    const response = await POST(
      validRequest({ toolSlug: "bmi-beregner", sentiment: "up" }, "203.0.113.4")
    );

    expect(response.status).toBe(400);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("rejects a malformed clientId", async () => {
    const request = createMockRequest({
      headers: { origin: "https://www.fysfinder.dk", "x-forwarded-for": "203.0.113.5" },
      body: { toolSlug: "bmi-beregner", sentiment: "up", rating: 5, clientId: "short" },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("stores a star rating and sends no email", async () => {
    const response = await POST(
      validRequest({ toolSlug: "bmi-beregner", sentiment: "up", rating: 5 }, "203.0.113.6")
    );

    expect(response.status).toBe(200);
    expect(mockFrom).toHaveBeenCalledWith("tool_ratings");
    expect(mockUpsert).toHaveBeenCalledWith(
      {
        tool_slug: "bmi-beregner",
        sentiment: "up",
        rating: 5,
        feedback_text: null,
        client_id: CLIENT_ID,
      },
      { onConflict: "tool_slug,client_id" }
    );
    expect(mockSendToolFeedback).not.toHaveBeenCalled();
  });

  it("stores negative feedback without a rating and emails the admins", async () => {
    const response = await POST(
      validRequest(
        {
          toolSlug: "pace-beregner",
          sentiment: "down",
          feedbackText: "  Jeg forstod ikke resultatet  ",
        },
        "203.0.113.7"
      )
    );

    expect(response.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        sentiment: "down",
        rating: null,
        feedback_text: "Jeg forstod ikke resultatet",
      }),
      expect.anything()
    );
    expect(mockSendToolFeedback).toHaveBeenCalledWith(
      expect.objectContaining({
        tool_title: "Pace beregner",
        tool_href: "/vaerktoejer/pace-beregner",
        feedback_text: "Jeg forstod ikke resultatet",
      })
    );
  });

  it("records a thumbs down with no text and stays silent", async () => {
    const response = await POST(
      validRequest({ toolSlug: "bmi-beregner", sentiment: "down" }, "203.0.113.8")
    );

    expect(response.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ sentiment: "down", feedback_text: null }),
      expect.anything()
    );
    expect(mockSendToolFeedback).not.toHaveBeenCalled();
  });

  it("throttles a client that floods submissions", async () => {
    const ip = "203.0.113.99";
    const statuses: number[] = [];

    for (let attempt = 0; attempt < 12; attempt += 1) {
      const response = await POST(
        validRequest({ toolSlug: "bmi-beregner", sentiment: "up", rating: 5 }, ip)
      );
      statuses.push(response.status);
    }

    expect(statuses.filter((status) => status === 429).length).toBeGreaterThan(0);
  });
});
