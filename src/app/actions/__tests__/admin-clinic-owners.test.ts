const mockGetUser = jest.fn();
const mockIsAdminEmail = jest.fn();
const mockClinicSingle = jest.fn();
const mockUserSingle = jest.fn();
const mockOwnerSelectEq = jest.fn();
const mockOwnerDeleteEq = jest.fn();
const mockOwnerInsert = jest.fn();
const mockRevalidatePath = jest.fn();

jest.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
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

jest.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
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

      if (table === "user_profiles") {
        return {
          select: () => ({
            eq: () => ({
              single: (...args: unknown[]) => mockUserSingle(...args),
            }),
          }),
        };
      }

      if (table === "clinic_owners") {
        return {
          select: () => ({
            eq: (...args: unknown[]) => mockOwnerSelectEq(...args),
          }),
          delete: () => ({
            eq: (...args: unknown[]) => mockOwnerDeleteEq(...args),
          }),
          insert: (...args: unknown[]) => mockOwnerInsert(...args),
        };
      }

      throw new Error(`Unexpected table in mock: ${table}`);
    },
  }),
}));

import { setClinicOwnerForAdmin } from "../admin-clinic-owners";

describe("admin clinic owner actions", () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockIsAdminEmail.mockReset();
    mockClinicSingle.mockReset();
    mockUserSingle.mockReset();
    mockOwnerSelectEq.mockReset();
    mockOwnerDeleteEq.mockReset();
    mockOwnerInsert.mockReset();
    mockRevalidatePath.mockReset();
  });

  it("replaces existing owners with the selected owner", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-1", email: "admin@example.com" } },
    });
    mockIsAdminEmail.mockReturnValue(true);
    mockClinicSingle.mockResolvedValue({ data: { clinics_id: "clinic-1" }, error: null });
    mockUserSingle.mockResolvedValue({ data: { id: "user-new" }, error: null });
    mockOwnerSelectEq.mockResolvedValue({
      data: [{ user_id: "user-old", clinic_id: "clinic-1" }],
      error: null,
    });
    mockOwnerDeleteEq.mockResolvedValue({ error: null });
    mockOwnerInsert.mockResolvedValue({ error: null });

    const result = await setClinicOwnerForAdmin({
      clinicId: "clinic-1",
      newOwnerUserId: "user-new",
    });

    expect(result).toEqual({
      success: true,
      previousOwnerUserIds: ["user-old"],
      ownerUserId: "user-new",
    });
    expect(mockOwnerDeleteEq).toHaveBeenCalledWith("clinic_id", "clinic-1");
    expect(mockOwnerInsert).toHaveBeenCalledWith({
      clinic_id: "clinic-1",
      user_id: "user-new",
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/admin/clinic-owners");
  });

  it("blocks no-op transfers when the same user is already sole owner", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-1", email: "admin@example.com" } },
    });
    mockIsAdminEmail.mockReturnValue(true);
    mockClinicSingle.mockResolvedValue({ data: { clinics_id: "clinic-1" }, error: null });
    mockUserSingle.mockResolvedValue({ data: { id: "user-1" }, error: null });
    mockOwnerSelectEq.mockResolvedValue({
      data: [{ user_id: "user-1", clinic_id: "clinic-1" }],
      error: null,
    });

    const result = await setClinicOwnerForAdmin({
      clinicId: "clinic-1",
      newOwnerUserId: "user-1",
    });

    expect(result).toEqual({ error: "Brugeren er allerede ejer af klinikken" });
    expect(mockOwnerDeleteEq).not.toHaveBeenCalled();
    expect(mockOwnerInsert).not.toHaveBeenCalled();
  });

  it("blocks non-admin users", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "user@example.com" } },
    });
    mockIsAdminEmail.mockReturnValue(false);

    const result = await setClinicOwnerForAdmin({
      clinicId: "clinic-1",
      newOwnerUserId: "user-2",
    });

    expect(result).toEqual({
      error: "Ingen adgang - kun administratorer kan bruge værktøjet",
    });
    expect(mockClinicSingle).not.toHaveBeenCalled();
  });
});
