import { POST } from "../route";

const mockInsert = jest.fn();
const mockFrom = jest.fn(() => ({ insert: mockInsert }));
const mockSendToolDownload = jest.fn();

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
  sendToolDownloadNotificationToAdmins: (...args: unknown[]) =>
    mockSendToolDownload(...args),
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

function validRequest(body: Record<string, unknown>, ip: string) {
  return createMockRequest({
    headers: { origin: "https://www.fysfinder.dk", "x-forwarded-for": ip },
    body: { clientId: CLIENT_ID, eventType: "result_download", ...body },
  });
}

describe("POST /api/tool-event", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
    mockSendToolDownload.mockResolvedValue({ success: true });
  });

  it("stores a result download for the tool", async () => {
    const response = await POST(
      validRequest({ toolSlug: "pace-beregner", variant: "plan" }, "203.0.113.1")
    );

    expect(response.status).toBe(200);
    expect(mockFrom).toHaveBeenCalledWith("tool_events");
    expect(mockInsert).toHaveBeenCalledWith({
      tool_slug: "pace-beregner",
      event_type: "result_download",
      variant: "plan",
      client_id: CLIENT_ID,
    });
    expect(mockSendToolDownload).toHaveBeenCalledWith({
      tool_title: "Pace beregner",
      tool_href: "/vaerktoejer/pace-beregner",
      variant_label: "løbeplan",
    });
  });

  it("does not email the admins when the download could not be stored", async () => {
    mockInsert.mockResolvedValue({ error: { message: "boom" } });

    const response = await POST(validRequest({ toolSlug: "bmi-beregner" }, "203.0.113.4"));

    expect(response.status).toBe(500);
    expect(mockSendToolDownload).not.toHaveBeenCalled();
  });

  it("rejects disallowed origins", async () => {
    const response = await POST(
      createMockRequest({
        headers: { origin: "https://malicious.example" },
        body: { toolSlug: "bmi-beregner", eventType: "result_download", clientId: CLIENT_ID },
      })
    );

    expect(response.status).toBe(403);
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockSendToolDownload).not.toHaveBeenCalled();
  });

  it.each([
    ["an unknown tool", { toolSlug: "not-a-tool" }],
    ["an unknown event type", { toolSlug: "bmi-beregner", eventType: "page_view" }],
    ["a malformed variant", { toolSlug: "bmi-beregner", variant: "Hej med dig" }],
    ["a malformed client id", { toolSlug: "bmi-beregner", clientId: "x" }],
  ])("rejects %s", async (_name, body) => {
    const response = await POST(validRequest(body, "203.0.113.2"));

    expect(response.status).toBe(400);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("rate limits repeated downloads from one visitor", async () => {
    let lastStatus = 0;
    for (let i = 0; i < 31; i += 1) {
      const response = await POST(validRequest({ toolSlug: "bmi-beregner" }, "203.0.113.3"));
      lastStatus = response.status;
    }

    expect(lastStatus).toBe(429);
    expect(mockInsert).toHaveBeenCalledTimes(30);
  });
});
