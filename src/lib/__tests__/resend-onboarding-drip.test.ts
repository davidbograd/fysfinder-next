import type { SupabaseClient } from "@supabase/supabase-js";
import {
  splitDisplayNameForContact,
  triggerClinicOwnerOnboardingDrip,
} from "../resend-onboarding-drip";

const mockContactsCreate = jest.fn();
const mockContactsUpdate = jest.fn();
const mockEventsSend = jest.fn();

jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({
    contacts: {
      create: mockContactsCreate,
      update: mockContactsUpdate,
    },
    events: {
      send: mockEventsSend,
    },
  })),
}));

const buildServiceSupabaseMock = (options: {
  existingDripAt?: string | null;
  readError?: { message: string } | null;
  markError?: { message: string } | null;
}) => {
  const maybeSingle = jest.fn().mockResolvedValue({
    data:
      options.readError != null
        ? null
        : { onboarding_drip_started_at: options.existingDripAt ?? null },
    error: options.readError ?? null,
  });

  const is = jest.fn().mockResolvedValue({
    error: options.markError ?? null,
  });

  const chainEqClinic = { is };
  const chainEqUser = { eq: jest.fn(() => chainEqClinic) };

  const from = jest.fn((table: string) => {
    if (table !== "clinic_owners") {
      throw new Error(`unexpected table ${table}`);
    }
    return {
      select: () => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle,
          })),
        })),
      }),
      update: () => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            is: is,
          })),
        })),
      }),
    };
  });

  return { from, maybeSingle, is } as unknown as SupabaseClient & {
    maybeSingle: jest.Mock;
    is: jest.Mock;
  };
};

describe("splitDisplayNameForContact", () => {
  it("returns empty object for empty input", () => {
    expect(splitDisplayNameForContact(undefined)).toEqual({});
    expect(splitDisplayNameForContact("")).toEqual({});
    expect(splitDisplayNameForContact("  ")).toEqual({});
  });

  it("uses full string as first name when there is no space", () => {
    expect(splitDisplayNameForContact("Joachim")).toEqual({ firstName: "Joachim" });
  });

  it("splits on first space into first and last name", () => {
    expect(splitDisplayNameForContact("Joachim Hansen")).toEqual({
      firstName: "Joachim",
      lastName: "Hansen",
    });
  });
});

describe("triggerClinicOwnerOnboardingDrip", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, RESEND_API_KEY: "re_test_key" };
    mockContactsCreate.mockResolvedValue({ data: { id: "c1" }, error: null });
    mockContactsUpdate.mockResolvedValue({ data: { id: "c1" }, error: null });
    mockEventsSend.mockResolvedValue({ data: { object: "event", event: "x" }, error: null });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("does nothing when API key is missing", async () => {
    delete process.env.RESEND_API_KEY;
    const supabase = buildServiceSupabaseMock({});

    await triggerClinicOwnerOnboardingDrip(supabase, {
      userId: "u1",
      clinicId: "k1",
      ownerEmail: "a@b.dk",
    });

    expect(mockContactsCreate).not.toHaveBeenCalled();
  });

  it("skips when drip was already recorded", async () => {
    const supabase = buildServiceSupabaseMock({
      existingDripAt: "2026-01-01T00:00:00.000Z",
    });

    await triggerClinicOwnerOnboardingDrip(supabase, {
      userId: "u1",
      clinicId: "k1",
      ownerEmail: "a@b.dk",
    });

    expect(mockContactsCreate).not.toHaveBeenCalled();
    expect(mockEventsSend).not.toHaveBeenCalled();
  });

  it("creates contact, sends event, and marks row when successful", async () => {
    const supabase = buildServiceSupabaseMock({});

    await triggerClinicOwnerOnboardingDrip(supabase, {
      userId: "u1",
      clinicId: "k1",
      ownerEmail: "Owner@Example.com",
      displayName: "Test Person",
    });

    expect(mockContactsCreate).toHaveBeenCalledWith({
      email: "owner@example.com",
      unsubscribed: false,
      firstName: "Test",
      lastName: "Person",
    });
    expect(mockEventsSend).toHaveBeenCalledWith({
      event: "fysfinder.clinic.onboarding_drip_started",
      email: "owner@example.com",
      payload: { clinicId: "k1", userId: "u1" },
    });
    expect(supabase.is).toHaveBeenCalledWith("onboarding_drip_started_at", null);
  });

  it("updates contact when create reports duplicate", async () => {
    mockContactsCreate.mockResolvedValue({
      data: null,
      error: { message: "Contact already exists" },
    });
    const supabase = buildServiceSupabaseMock({});

    await triggerClinicOwnerOnboardingDrip(supabase, {
      userId: "u1",
      clinicId: "k1",
      ownerEmail: "dup@example.com",
      displayName: "Dup User",
    });

    expect(mockContactsUpdate).toHaveBeenCalledWith({
      email: "dup@example.com",
      unsubscribed: false,
      firstName: "Dup",
      lastName: "User",
    });
    expect(mockEventsSend).toHaveBeenCalled();
  });

  it("does not send event when create fails with non-duplicate error", async () => {
    mockContactsCreate.mockResolvedValue({
      data: null,
      error: { message: "Rate limit exceeded" },
    });
    const supabase = buildServiceSupabaseMock({});

    await triggerClinicOwnerOnboardingDrip(supabase, {
      userId: "u1",
      clinicId: "k1",
      ownerEmail: "x@y.dk",
    });

    expect(mockContactsUpdate).not.toHaveBeenCalled();
    expect(mockEventsSend).not.toHaveBeenCalled();
  });
});
