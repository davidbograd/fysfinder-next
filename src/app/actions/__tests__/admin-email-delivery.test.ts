const mockGetUser = jest.fn();
const mockClinicSingle = jest.fn();
const mockExistingClaimMaybeSingle = jest.fn();
const mockServiceInsert = jest.fn();
const mockSendClaimNotification = jest.fn();
const mockSendSignupNotification = jest.fn();

jest.mock("@/app/utils/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: (...args: unknown[]) => mockGetUser(...args),
    },
    from: (table: string) => {
      if (table === "clinics") {
        return {
          select: () => ({
            eq: () => ({
              single: (...args: unknown[]) => mockClinicSingle(...args),
            }),
          }),
        };
      }

      if (table === "clinic_claims") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                in: () => ({
                  maybeSingle: (...args: unknown[]) =>
                    mockExistingClaimMaybeSingle(...args),
                }),
              }),
            }),
          }),
        };
      }

      throw new Error(`Unexpected table in mock: ${table}`);
    },
  }),
}));

jest.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: (table: string) => ({
      insert: (payload: unknown) => mockServiceInsert(table, payload),
    }),
  }),
}));

jest.mock("@/lib/email", () => ({
  sendClaimNotificationToAdmins: (...args: unknown[]) =>
    mockSendClaimNotification(...args),
  sendNewUserSignupNotificationToAdmins: (...args: unknown[]) =>
    mockSendSignupNotification(...args),
}));

import { submitClinicClaim } from "../claim-clinic";
import { createUserProfile } from "../auth";

async function flushMicrotasks(iterations = 10) {
  for (let i = 0; i < iterations; i++) {
    await Promise.resolve();
  }
}

describe("admin notification delivery", () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockClinicSingle.mockReset();
    mockExistingClaimMaybeSingle.mockReset();
    mockServiceInsert.mockReset();
    mockSendClaimNotification.mockReset();
    mockSendSignupNotification.mockReset();
  });

  it("waits for claim notification send before returning success", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockClinicSingle.mockResolvedValue({
      data: { verified_klinik: false },
      error: null,
    });
    mockExistingClaimMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockServiceInsert.mockResolvedValue({ error: null });

    let resolveEmail: ((value: { success: boolean }) => void) | undefined;
    mockSendClaimNotification.mockReturnValue(
      new Promise((resolve) => {
        resolveEmail = resolve;
      })
    );

    const resultPromise = submitClinicClaim({
      clinic_id: "clinic-1",
      klinik_navn: "Test Klinik",
      job_titel: "Ejer",
      fulde_navn: "Test Person",
      email: "test@example.com",
      telefon: "12345678",
    });

    let settled = false;
    resultPromise.then(() => {
      settled = true;
    });
    await flushMicrotasks();

    expect(settled).toBe(false);
    expect(mockSendClaimNotification).toHaveBeenCalledTimes(1);

    resolveEmail?.({ success: true });
    await expect(resultPromise).resolves.toEqual({ success: true });
  });

  it("waits for signup notification send before returning success", async () => {
    mockServiceInsert.mockResolvedValue({ error: null });

    let resolveEmail: ((value: { success: boolean }) => void) | undefined;
    mockSendSignupNotification.mockReturnValue(
      new Promise((resolve) => {
        resolveEmail = resolve;
      })
    );

    const resultPromise = createUserProfile({
      id: "user-2",
      email: "new-user@example.com",
      full_name: "New User",
    });

    let settled = false;
    resultPromise.then(() => {
      settled = true;
    });
    await flushMicrotasks();

    expect(settled).toBe(false);
    expect(mockSendSignupNotification).toHaveBeenCalledTimes(1);

    resolveEmail?.({ success: true });
    await expect(resultPromise).resolves.toEqual({ success: true });
  });
});
