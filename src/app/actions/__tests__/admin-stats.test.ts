const mockGetUser = jest.fn();
const mockIsAdminEmail = jest.fn();
const mockRpc = jest.fn();
const mockLimit = jest.fn();

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

jest.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    rpc: (...args: unknown[]) => mockRpc(...args),
    from: () => ({
      select: () => ({
        order: () => ({
          limit: (...args: unknown[]) => mockLimit(...args),
        }),
      }),
    }),
  }),
}));

import { getSuburbAnalytics } from "../admin-stats";

describe("admin stats actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-1", email: "admin@example.com" } },
    });
    mockIsAdminEmail.mockReturnValue(true);
    mockRpc.mockResolvedValue({
      data: [
        {
          suburb: "Vejle",
          lead_clicks: 70,
          phone_clicks: 20,
          website_clicks: 30,
          email_clicks: 5,
          booking_clicks: 15,
          views: 888,
          list_impressions: 640,
          profile_views: 248,
        },
      ],
      error: null,
    });
    mockLimit
      .mockResolvedValueOnce({
        data: [{ created_at: "2026-02-26T11:48:09.840Z" }],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [{ created_at: "2026-05-02T06:50:19.348Z" }],
        error: null,
      });
  });

  it("fetches suburb analytics through the database aggregation RPC", async () => {
    const result = await getSuburbAnalytics(null, {
      limit: 10,
      sortBy: "views",
      sortDirection: "asc",
    });

    expect(mockRpc).toHaveBeenCalledWith(
      "get_suburb_event_counts",
      expect.objectContaining({
        p_start_date: null,
        p_limit: 10,
        p_offset: 0,
        p_sort_by: "views",
        p_sort_dir: "asc",
      })
    );
    expect(result.rows).toEqual([
      {
        suburb: "Vejle",
        leadClicks: 70,
        phoneClicks: 20,
        websiteClicks: 30,
        emailClicks: 5,
        bookingClicks: 15,
        views: 888,
        listImpressions: 640,
        profileViews: 248,
      },
    ]);
    expect(result.period).toEqual({
      startDate: "2026-02-26T11:48:09.840Z",
      endDate: "2026-05-02T06:50:19.348Z",
      oldestEventDate: "2026-02-26T11:48:09.840Z",
    });
  });

  it("returns a clear error when the suburb aggregation RPC is missing", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockLimit
      .mockResolvedValueOnce({
        data: [{ created_at: "2026-02-26T11:48:09.840Z" }],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [{ created_at: "2026-05-02T06:50:19.348Z" }],
        error: null,
      });
    mockRpc.mockResolvedValue({
      data: null,
      error: { code: "PGRST202", message: "function missing" },
    });

    await expect(getSuburbAnalytics(30)).resolves.toEqual({
      error: "Mangler databasefunktion til bydata",
    });
    consoleErrorSpy.mockRestore();
  });

  it("uses the oldest event date as displayed period start when requested range begins earlier", async () => {
    const result = await getSuburbAnalytics(90);

    expect(result.period?.startDate).toBe("2026-02-26T11:48:09.840Z");
  });
});
