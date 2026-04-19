const mockGetUser = jest.fn();
const mockIsAdminEmail = jest.fn();
const mockRequestSingle = jest.fn();
const mockExistingClinicMaybeSingle = jest.fn();
const mockClinicsInsertSelectSingle = jest.fn();
const mockClinicOwnersInsert = jest.fn();
const mockInsurancesSelect = jest.fn();
const mockClinicInsurancesInsert = jest.fn();
const mockClinicInsurancesDeleteEq = jest.fn();
const mockRequestUpdateEq = jest.fn();
const mockClaimSingle = jest.fn();
const mockClaimUpdateEq = jest.fn();
const mockClinicsUpdateEq = jest.fn();
const mockSendClinicApprovalEmailToUser = jest.fn();
const mockSendClinicRejectionEmailToUser = jest.fn();
const mockSyncClinicFromGoogleMapsUrlOnApprove = jest.fn();

const mockClinicsInsert = jest.fn((payload: unknown) => ({
  select: () => ({
    single: () => mockClinicsInsertSelectSingle(payload),
  }),
}));

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

jest.mock("@/lib/email", () => ({
  sendClinicApprovalEmailToUser: (...args: unknown[]) =>
    mockSendClinicApprovalEmailToUser(...args),
  sendClinicRejectionEmailToUser: (...args: unknown[]) =>
    mockSendClinicRejectionEmailToUser(...args),
}));

jest.mock("@/lib/google-places/approve-bootstrap-sync", () => ({
  syncClinicFromGoogleMapsUrlOnApprove: (...args: unknown[]) =>
    mockSyncClinicFromGoogleMapsUrlOnApprove(...args),
}));

jest.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: (table: string) => {
      if (table === "clinic_creation_requests") {
        return {
          select: () => ({
            eq: () => ({
              single: (...args: unknown[]) => mockRequestSingle(...args),
            }),
          }),
          update: (payload: unknown) => ({
            eq: (...args: unknown[]) => mockRequestUpdateEq(payload, ...args),
          }),
        };
      }

      if (table === "clinics") {
        return {
          select: () => ({
            eq: () => ({
              ilike: () => ({
                maybeSingle: (...args: unknown[]) =>
                  mockExistingClinicMaybeSingle(...args),
              }),
            }),
          }),
          update: (payload: unknown) => ({
            eq: (...args: unknown[]) => mockClinicsUpdateEq(payload, ...args),
          }),
          insert: (...args: unknown[]) => mockClinicsInsert(...args),
        };
      }

      if (table === "clinic_claims") {
        return {
          select: () => ({
            eq: () => ({
              single: (...args: unknown[]) => mockClaimSingle(...args),
            }),
          }),
          update: (payload: unknown) => ({
            eq: (...args: unknown[]) => mockClaimUpdateEq(payload, ...args),
          }),
        };
      }

      if (table === "clinic_owners") {
        return {
          insert: (...args: unknown[]) => mockClinicOwnersInsert(...args),
        };
      }

      if (table === "insurance_companies") {
        return {
          select: (...args: unknown[]) => mockInsurancesSelect(...args),
        };
      }

      if (table === "clinic_insurances") {
        return {
          delete: () => ({
            eq: (...args: unknown[]) => mockClinicInsurancesDeleteEq(...args),
          }),
          insert: (...args: unknown[]) => mockClinicInsurancesInsert(...args),
        };
      }

      throw new Error(`Unexpected table in mock: ${table}`);
    },
  }),
}));

import {
  approveClaim,
  approveClinicCreationRequest,
  rejectClaim,
  rejectClinicCreationRequest,
} from "../admin-claims";

describe("admin clinic creation request actions", () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockIsAdminEmail.mockReset();
    mockRequestSingle.mockReset();
    mockExistingClinicMaybeSingle.mockReset();
    mockClinicsInsertSelectSingle.mockReset();
    mockClinicsInsert.mockClear();
    mockClinicOwnersInsert.mockReset();
    mockInsurancesSelect.mockReset();
    mockClinicInsurancesInsert.mockReset();
    mockClinicInsurancesDeleteEq.mockReset();
    mockRequestUpdateEq.mockReset();
    mockClaimSingle.mockReset();
    mockClaimUpdateEq.mockReset();
    mockClinicsUpdateEq.mockReset();
    mockSendClinicApprovalEmailToUser.mockReset();
    mockSendClinicRejectionEmailToUser.mockReset();
    mockSyncClinicFromGoogleMapsUrlOnApprove.mockReset();
    mockSyncClinicFromGoogleMapsUrlOnApprove.mockResolvedValue({ ok: true });
  });

  it("approves request by creating clinic and owner relation", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-1", email: "admin@example.com" } },
    });
    mockIsAdminEmail.mockReturnValue(true);
    mockRequestSingle.mockResolvedValue({
      data: {
        id: "req-1",
        status: "pending",
        clinic_name: "Ny Klinik",
        address: "Testvej 10",
        postal_code: "6200",
        city_name: "Aabenraa",
        city_id: "city-1",
        website: null,
        description: null,
        requester_email: "owner@example.com",
        user_id: "user-1",
      },
      error: null,
    });
    mockExistingClinicMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockClinicsInsertSelectSingle.mockResolvedValue({
      data: { clinics_id: "clinic-new" },
      error: null,
    });
    mockClinicOwnersInsert.mockResolvedValue({ error: null });
    mockInsurancesSelect.mockResolvedValue({
      data: [{ insurance_id: "ins-1" }],
      error: null,
    });
    mockClinicInsurancesInsert.mockResolvedValue({ error: null });
    mockRequestUpdateEq.mockResolvedValue({ error: null });
    mockSendClinicApprovalEmailToUser.mockResolvedValue({ success: true });

    const result = await approveClinicCreationRequest("req-1");

    expect(result).toEqual({ success: true });
    expect(mockClinicsInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        klinikNavn: "Ny Klinik",
        verified_klinik: true,
        verified_email: "owner@example.com",
      })
    );
    expect(mockClinicOwnersInsert).toHaveBeenCalledWith({
      user_id: "user-1",
      clinic_id: "clinic-new",
    });
    expect(mockRequestUpdateEq).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "approved",
        created_clinic_id: "clinic-new",
      }),
      "id",
      "req-1"
    );
    expect(mockSendClinicApprovalEmailToUser).toHaveBeenCalledWith({
      clinic_name: "Ny Klinik",
      recipient_email: "owner@example.com",
      recipient_name: undefined,
    });
    expect(mockSyncClinicFromGoogleMapsUrlOnApprove).not.toHaveBeenCalled();
  });

  it("runs Google sync when googleMapsUrl is provided on creation approval", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-1", email: "admin@example.com" } },
    });
    mockIsAdminEmail.mockReturnValue(true);
    mockRequestSingle.mockResolvedValue({
      data: {
        id: "req-maps",
        status: "pending",
        clinic_name: "Maps Klinik",
        address: "Gade 1",
        postal_code: "2100",
        city_name: "København",
        city_id: "city-1",
        website: null,
        description: null,
        requester_email: "owner@example.com",
        user_id: "user-1",
      },
      error: null,
    });
    mockExistingClinicMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockClinicsInsertSelectSingle.mockResolvedValue({
      data: { clinics_id: "clinic-maps" },
      error: null,
    });
    mockClinicOwnersInsert.mockResolvedValue({ error: null });
    mockInsurancesSelect.mockResolvedValue({
      data: [{ insurance_id: "ins-1" }],
      error: null,
    });
    mockClinicInsurancesInsert.mockResolvedValue({ error: null });
    mockRequestUpdateEq.mockResolvedValue({ error: null });
    mockSendClinicApprovalEmailToUser.mockResolvedValue({ success: true });

    const mapsUrl = "https://maps.app.goo.gl/test";
    const result = await approveClinicCreationRequest("req-maps", { googleMapsUrl: mapsUrl });

    expect(result).toEqual({ success: true, googleSync: { ok: true } });
    expect(mockSyncClinicFromGoogleMapsUrlOnApprove).toHaveBeenCalledWith(
      expect.anything(),
      "clinic-maps",
      mapsUrl
    );
  });

  it("returns googleSync error when sync fails on creation approval", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-1", email: "admin@example.com" } },
    });
    mockIsAdminEmail.mockReturnValue(true);
    mockRequestSingle.mockResolvedValue({
      data: {
        id: "req-fail",
        status: "pending",
        clinic_name: "Fail Klinik",
        address: "Gade 2",
        postal_code: "2100",
        city_name: "København",
        city_id: "city-1",
        website: null,
        description: null,
        requester_email: "owner@example.com",
        user_id: "user-1",
      },
      error: null,
    });
    mockExistingClinicMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockClinicsInsertSelectSingle.mockResolvedValue({
      data: { clinics_id: "clinic-fail" },
      error: null,
    });
    mockClinicOwnersInsert.mockResolvedValue({ error: null });
    mockInsurancesSelect.mockResolvedValue({
      data: [{ insurance_id: "ins-1" }],
      error: null,
    });
    mockClinicInsurancesInsert.mockResolvedValue({ error: null });
    mockRequestUpdateEq.mockResolvedValue({ error: null });
    mockSendClinicApprovalEmailToUser.mockResolvedValue({ success: true });
    mockSyncClinicFromGoogleMapsUrlOnApprove.mockResolvedValue({
      ok: false,
      message: "Google fejl",
    });

    const result = await approveClinicCreationRequest("req-fail", {
      googleMapsUrl: "https://www.google.com/maps/place/Test",
    });

    expect(result).toEqual({
      success: true,
      googleSync: { ok: false, message: "Google fejl" },
    });
  });

  it("rejects request without creating a clinic", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-1", email: "admin@example.com" } },
    });
    mockIsAdminEmail.mockReturnValue(true);
    mockRequestSingle.mockResolvedValue({
      data: {
        id: "req-2",
        status: "pending",
        clinic_name: "Ny Klinik",
        requester_email: "owner@example.com",
        requester_name: "Clinic Owner",
      },
      error: null,
    });
    mockRequestUpdateEq.mockResolvedValue({ error: null });
    mockSendClinicRejectionEmailToUser.mockResolvedValue({ success: true });

    const result = await rejectClinicCreationRequest("req-2", "Mangelfulde oplysninger");

    expect(result).toEqual({ success: true });
    expect(mockClinicsInsert).not.toHaveBeenCalled();
    expect(mockRequestUpdateEq).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "rejected",
        admin_notes: "Mangelfulde oplysninger",
      }),
      "id",
      "req-2"
    );
    expect(mockSendClinicRejectionEmailToUser).toHaveBeenCalledWith({
      clinic_name: "Ny Klinik",
      recipient_email: "owner@example.com",
      recipient_name: "Clinic Owner",
      rejection_reason: "Mangelfulde oplysninger",
    });
  });

  it("requires rejection reason for clinic creation rejection", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-1", email: "admin@example.com" } },
    });
    mockIsAdminEmail.mockReturnValue(true);

    const result = await rejectClinicCreationRequest("req-3", "   ");

    expect(result).toEqual({ error: "Afvisningsårsag er påkrævet" });
    expect(mockRequestUpdateEq).not.toHaveBeenCalled();
    expect(mockSendClinicRejectionEmailToUser).not.toHaveBeenCalled();
  });

  it("sends approval email when claim is approved", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-1", email: "admin@example.com" } },
    });
    mockIsAdminEmail.mockReturnValue(true);
    mockClaimSingle.mockResolvedValue({
      data: {
        id: "claim-1",
        status: "pending",
        clinic_id: "clinic-1",
        user_id: "user-1",
        email: "owner@example.com",
        fulde_navn: "Clinic Owner",
        klinik_navn: "Test Klinik",
      },
      error: null,
    });
    mockClaimUpdateEq.mockResolvedValue({ error: null });
    mockClinicsUpdateEq.mockResolvedValue({ error: null });
    mockClinicOwnersInsert.mockResolvedValue({ error: null });
    mockInsurancesSelect.mockResolvedValue({
      data: [{ insurance_id: "ins-1" }],
      error: null,
    });
    mockClinicInsurancesDeleteEq.mockResolvedValue({ error: null });
    mockClinicInsurancesInsert.mockResolvedValue({ error: null });
    mockSendClinicApprovalEmailToUser.mockResolvedValue({ success: true });

    const result = await approveClaim("claim-1");

    expect(result).toEqual({ success: true });
    expect(mockSendClinicApprovalEmailToUser).toHaveBeenCalledWith({
      clinic_name: "Test Klinik",
      recipient_email: "owner@example.com",
      recipient_name: "Clinic Owner",
    });
    expect(mockSyncClinicFromGoogleMapsUrlOnApprove).not.toHaveBeenCalled();
  });

  it("runs Google sync when googleMapsUrl is provided on claim approval", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-1", email: "admin@example.com" } },
    });
    mockIsAdminEmail.mockReturnValue(true);
    mockClaimSingle.mockResolvedValue({
      data: {
        id: "claim-maps",
        status: "pending",
        clinic_id: "clinic-claim-maps",
        user_id: "user-1",
        email: "owner@example.com",
        fulde_navn: "Owner",
        klinik_navn: "Claim Maps",
      },
      error: null,
    });
    mockClaimUpdateEq.mockResolvedValue({ error: null });
    mockClinicsUpdateEq.mockResolvedValue({ error: null });
    mockClinicOwnersInsert.mockResolvedValue({ error: null });
    mockInsurancesSelect.mockResolvedValue({
      data: [{ insurance_id: "ins-1" }],
      error: null,
    });
    mockClinicInsurancesDeleteEq.mockResolvedValue({ error: null });
    mockClinicInsurancesInsert.mockResolvedValue({ error: null });
    mockSendClinicApprovalEmailToUser.mockResolvedValue({ success: true });

    const url = "https://maps.app.goo.gl/abc";
    const result = await approveClaim("claim-maps", { googleMapsUrl: url });

    expect(result).toEqual({ success: true, googleSync: { ok: true } });
    expect(mockSyncClinicFromGoogleMapsUrlOnApprove).toHaveBeenCalledWith(
      expect.anything(),
      "clinic-claim-maps",
      url
    );
  });

  it("sends rejection email when claim is rejected", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-1", email: "admin@example.com" } },
    });
    mockIsAdminEmail.mockReturnValue(true);
    mockClaimSingle.mockResolvedValue({
      data: {
        id: "claim-2",
        status: "pending",
        clinic_id: "clinic-2",
        user_id: "user-2",
        email: "owner2@example.com",
        fulde_navn: "Clinic Owner Two",
        klinik_navn: "Afvist Klinik",
      },
      error: null,
    });
    mockClaimUpdateEq.mockResolvedValue({ error: null });
    mockSendClinicRejectionEmailToUser.mockResolvedValue({ success: true });

    const result = await rejectClaim("claim-2", "Dokumentation mangler");

    expect(result).toEqual({ success: true });
    expect(mockClaimUpdateEq).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "rejected",
        admin_notes: "Dokumentation mangler",
      }),
      "id",
      "claim-2"
    );
    expect(mockSendClinicRejectionEmailToUser).toHaveBeenCalledWith({
      clinic_name: "Afvist Klinik",
      recipient_email: "owner2@example.com",
      recipient_name: "Clinic Owner Two",
      rejection_reason: "Dokumentation mangler",
    });
  });

  it("requires rejection reason for claim rejection", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-1", email: "admin@example.com" } },
    });
    mockIsAdminEmail.mockReturnValue(true);

    const result = await rejectClaim("claim-3", " ");

    expect(result).toEqual({ error: "Afvisningsårsag er påkrævet" });
    expect(mockClaimUpdateEq).not.toHaveBeenCalled();
    expect(mockSendClinicRejectionEmailToUser).not.toHaveBeenCalled();
  });
});
