// Added: 2026-04-03 - Coverage for tracking route validation and successful writes.
import { POST } from "../route";

const mockInsert = jest.fn();
const mockFrom = jest.fn(() => ({ insert: mockInsert }));
const mockCreateClient = jest.fn(() => ({ from: mockFrom }));

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
  createClient: (...args: unknown[]) => mockCreateClient(...args),
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

describe("POST /api/track", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
  });

  it("rejects disallowed origins", async () => {
    const request = createMockRequest({
      headers: {
        origin: "https://malicious.example",
      },
      body: {
        clinicId: "clinic-abc123",
        eventType: "phone_click",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(403);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("rejects invalid metadata payloads", async () => {
    const request = createMockRequest({
      headers: {
        origin: "https://www.fysfinder.dk",
      },
      body: {
        clinicId: "clinic-abc123",
        eventType: "phone_click",
        metadata: "invalid",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("stores sanitized metadata for valid events", async () => {
    const request = createMockRequest({
      headers: {
        origin: "https://www.fysfinder.dk",
        "x-forwarded-for": "203.0.113.1",
      },
      body: {
        clinicId: "clinic-abc123",
        eventType: "website_click",
        eventId: "event-12345",
        metadata: {
          source: "list_view",
        },
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true });
    expect(mockInsert).toHaveBeenCalledWith({
      clinic_id: "clinic-abc123",
      event_type: "website_click",
      metadata: {
        source: "list_view",
        event_id: "event-12345",
      },
    });
  });
});
