const mockEmailsSend = jest.fn();
const mockContactsGet = jest.fn();

jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: mockEmailsSend },
    contacts: { get: mockContactsGet },
  })),
}));

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Resend } from "resend";
import { runMonthlyClinicSummary } from "../monthly-clinic-summary-job";

const mockInsert = jest.fn();
const mockGetUserById = jest.fn();
const mockRpc = jest.fn();

const ownershipRow = {
  user_id: "u1",
  clinic_id: "c1",
  created_at: "2026-07-01T00:00:00.000Z",
  clinics: {
    clinics_id: "c1",
    klinikNavn: "Fysio Nord",
    verified_email: "verified@example.com",
    email: "clinic@example.com",
    tlf: "123",
    website: "https://example.com",
    om_os: "Om os",
    mandag: "8-16",
    tirsdag: "8-16",
    onsdag: "8-16",
    torsdag: "8-16",
    fredag: "8-16",
    lørdag: null,
    søndag: null,
    førsteKons: "600",
    opfølgning: "400",
    ydernummer: true,
    clinic_specialties: [{ specialty_id: "s1" }],
    clinic_team_members: [{ id: "t1" }],
    clinic_insurances: [{ insurance_id: "i1" }],
  },
};

function createSupabaseMock(options?: {
  ownerships?: typeof ownershipRow[];
  profileEmail?: string | null;
  alreadySentUserIds?: string[];
}) {
  const ownerships = options?.ownerships ?? [ownershipRow];

  return {
    from: (table: string) => {
      if (table === "clinic_owners") {
        return {
          select: () => Promise.resolve({ data: ownerships, error: null }),
        };
      }
      if (table === "insurance_companies") {
        return {
          select: () => Promise.resolve({ data: null, error: null, count: 3 }),
        };
      }
      if (table === "user_profiles") {
        return {
          select: () => ({
            in: () =>
              Promise.resolve({
                data: [
                  {
                    id: "u1",
                    full_name: "Anders Jensen",
                    email:
                      options && "profileEmail" in options
                        ? options.profileEmail
                        : "owner@example.com",
                  },
                ],
                error: null,
              }),
          }),
        };
      }
      if (table === "clinic_monthly_summary_sends") {
        return {
          select: () => ({
            eq: () =>
              Promise.resolve({
                data: (options?.alreadySentUserIds ?? []).map((user_id) => ({
                  user_id,
                })),
                error: null,
              }),
          }),
          insert: (payload: unknown) => mockInsert(payload),
        };
      }
      throw new Error(`Unexpected table ${table}`);
    },
    rpc: (...args: unknown[]) => mockRpc(...args),
    auth: {
      admin: {
        getUserById: (...args: unknown[]) => mockGetUserById(...args),
      },
    },
  } as unknown as SupabaseClient;
}

function createResendMock(): Resend {
  return {
    emails: { send: mockEmailsSend },
    contacts: { get: mockContactsGet },
  } as unknown as Resend;
}

describe("runMonthlyClinicSummary skip paths", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, RESEND_API_KEY: "re_test_key" };
    mockRpc.mockResolvedValue({ data: [], error: null });
    mockContactsGet.mockResolvedValue({ data: { unsubscribed: false }, error: null });
    mockEmailsSend.mockResolvedValue({ data: { id: "email_1" }, error: null });
    mockInsert.mockResolvedValue({ error: null });
    mockGetUserById.mockResolvedValue({ data: { user: { email: null } }, error: null });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("skips owners without an email", async () => {
    const result = await runMonthlyClinicSummary({
      supabase: createSupabaseMock({
        ownerships: [
          {
            ...ownershipRow,
            clinics: { ...ownershipRow.clinics, verified_email: null },
          },
        ],
        profileEmail: null,
      }),
      resend: createResendMock(),
      periodYm: "2026-08",
    });

    expect(result.skipped).toBe(1);
    expect(result.details.join(" ")).toMatch(/ingen e-mail/);
    expect(mockEmailsSend).not.toHaveBeenCalled();
  });

  it("skips owners already sent for the period", async () => {
    const result = await runMonthlyClinicSummary({
      supabase: createSupabaseMock({ alreadySentUserIds: ["u1"] }),
      resend: createResendMock(),
      periodYm: "2026-08",
    });

    expect(result.skipped).toBe(1);
    expect(result.details.join(" ")).toMatch(/allerede sendt/);
    expect(mockEmailsSend).not.toHaveBeenCalled();
  });

  it("skips unsubscribed contacts", async () => {
    mockContactsGet.mockResolvedValue({ data: { unsubscribed: true }, error: null });

    const result = await runMonthlyClinicSummary({
      supabase: createSupabaseMock(),
      resend: createResendMock(),
      periodYm: "2026-08",
    });

    expect(result.skipped).toBe(1);
    expect(result.details.join(" ")).toMatch(/afmeldt/);
    expect(mockEmailsSend).not.toHaveBeenCalled();
  });

  it("does not send during dry-run", async () => {
    const result = await runMonthlyClinicSummary({
      supabase: createSupabaseMock(),
      resend: createResendMock(),
      periodYm: "2026-08",
      dryRun: true,
    });

    expect(result.sent).toBe(1);
    expect(result.dryRun).toBe(true);
    expect(result.details.join(" ")).toMatch(/dry-run/);
    expect(mockEmailsSend).not.toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });
});
