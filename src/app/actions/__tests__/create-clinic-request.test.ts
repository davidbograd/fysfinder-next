const mockGetUser = jest.fn();
const mockCitySingle = jest.fn();
const mockClinicsLookup = jest.fn();
const mockExistingRequestMaybeSingle = jest.fn();
const mockServiceInsert = jest.fn();
const mockSendCreationNotification = jest.fn();

jest.mock("@/app/utils/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: (...args: unknown[]) => mockGetUser(...args),
    },
    from: (table: string) => {
      if (table === "cities") {
        return {
          select: () => ({
            eq: () => ({
              single: (...args: unknown[]) => mockCitySingle(...args),
            }),
          }),
        };
      }

      if (table === "clinics") {
        return {
          select: () => ({
            eq: () => ({
              ilike: (...args: unknown[]) => mockClinicsLookup(...args),
            }),
          }),
        };
      }

      if (table === "clinic_creation_requests") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => ({
                  in: () => ({
                    maybeSingle: (...args: unknown[]) =>
                      mockExistingRequestMaybeSingle(...args),
                  }),
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
  sendClinicCreationNotificationToAdmins: (...args: unknown[]) =>
    mockSendCreationNotification(...args),
}));

import { submitClinicCreationRequest } from "../create-clinic-request";

describe("submitClinicCreationRequest", () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockCitySingle.mockReset();
    mockClinicsLookup.mockReset();
    mockExistingRequestMaybeSingle.mockReset();
    mockServiceInsert.mockReset();
    mockSendCreationNotification.mockReset();
  });

  it("stores a new clinic request as pending", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCitySingle.mockResolvedValue({
      data: { id: "city-1", bynavn: "Aabenraa" },
      error: null,
    });
    mockClinicsLookup.mockResolvedValue({ data: [], error: null });
    mockExistingRequestMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockServiceInsert.mockResolvedValue({ error: null });
    mockSendCreationNotification.mockResolvedValue({ success: true });

    const result = await submitClinicCreationRequest({
      clinic_name: "Ny Klinik",
      address: "Testvej 10",
      postal_code: "6200",
      city_id: "city-1",
      city_name: "Aabenraa",
      requester_name: "Test Person",
      requester_email: "test@example.com",
      requester_phone: "12345678",
      requester_role: "Ejer",
      website: "https://example.com",
      description: "Beskrivelse",
    });

    expect(result).toEqual({ success: true });
    expect(mockServiceInsert).toHaveBeenCalledWith(
      "clinic_creation_requests",
      expect.objectContaining({
        user_id: "user-1",
        clinic_name: "Ny Klinik",
        status: "pending",
      })
    );
    expect(mockSendCreationNotification).toHaveBeenCalledTimes(1);
  });

  it("accepts website without protocol", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCitySingle.mockResolvedValue({
      data: { id: "city-1", bynavn: "Aabenraa" },
      error: null,
    });
    mockClinicsLookup.mockResolvedValue({ data: [], error: null });
    mockExistingRequestMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockServiceInsert.mockResolvedValue({ error: null });
    mockSendCreationNotification.mockResolvedValue({ success: true });

    const result = await submitClinicCreationRequest({
      clinic_name: "Ny Klinik",
      address: "Testvej 10",
      postal_code: "6200",
      city_id: "city-1",
      city_name: "Aabenraa",
      requester_name: "Test Person",
      requester_email: "test@example.com",
      requester_role: "Ejer",
      website: "www.klinik.dk",
    });

    expect(result).toEqual({ success: true });
    expect(mockServiceInsert).toHaveBeenCalledWith(
      "clinic_creation_requests",
      expect.objectContaining({
        website: "www.klinik.dk",
      })
    );
  });
});
