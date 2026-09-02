const mockGetUser = jest.fn();
const mockIsAdminEmail = jest.fn();
const mockRevalidatePath = jest.fn();
const mockPremiumListingsOrder = jest.fn();
const mockPremiumListingLookup = jest.fn();
const mockPremiumListingsUpdate = jest.fn();
const mockPremiumListingsInsert = jest.fn();
const mockPremiumLocationsIn = jest.fn();
const mockPremiumLocationsUpsert = jest.fn();
const mockClinicsIn = jest.fn();
const mockClinicLookup = jest.fn();
const mockCitiesIn = jest.fn();

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
      if (table === "premium_listings") {
        return {
          select: () => ({
            order: (...args: unknown[]) => mockPremiumListingsOrder(...args),
            eq: () => ({
              maybeSingle: (...args: unknown[]) => mockPremiumListingLookup(...args),
              gt: () => ({
                order: () => ({
                  limit: () => ({
                    maybeSingle: (...args: unknown[]) => mockPremiumListingLookup(...args),
                  }),
                }),
              }),
            }),
          }),
          update: (payload: unknown) => ({
            eq: (column: string, value: string) =>
              mockPremiumListingsUpdate(payload, column, value),
          }),
          insert: (payload: unknown) => ({
            select: () => ({
              single: () => mockPremiumListingsInsert(payload),
            }),
          }),
        };
      }

      if (table === "premium_listing_locations") {
        return {
          select: () => ({
            in: (...args: unknown[]) => mockPremiumLocationsIn(...args),
          }),
          upsert: (...args: unknown[]) => mockPremiumLocationsUpsert(...args),
        };
      }

      if (table === "clinics") {
        return {
          select: () => ({
            in: (...args: unknown[]) => mockClinicsIn(...args),
            eq: () => ({
              maybeSingle: (...args: unknown[]) => mockClinicLookup(...args),
            }),
          }),
        };
      }

      if (table === "cities") {
        return {
          select: () => ({
            in: (...args: unknown[]) => mockCitiesIn(...args),
          }),
        };
      }

      throw new Error(`Unexpected table in mock: ${table}`);
    },
  }),
}));

import {
  getPremiumListingsForAdmin,
  grantPremiumForAdmin,
  revokePremiumForAdmin,
} from "../admin-premium";

const signInAsAdmin = () => {
  mockGetUser.mockResolvedValue({
    data: { user: { id: "admin-1", email: "admin@example.com" } },
  });
  mockIsAdminEmail.mockReturnValue(true);
};

describe("admin premium actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getPremiumListingsForAdmin", () => {
    it("lists active premium first and resolves clinic and city names", async () => {
      signInAsAdmin();
      mockPremiumListingsOrder.mockResolvedValue({
        data: [
          {
            id: "listing-expired",
            clinic_id: "clinic-2",
            start_date: "2019-01-01T00:00:00+00:00",
            end_date: "2020-01-01T00:00:00+00:00",
            stripe_subscription_id: null,
          },
          {
            id: "listing-active",
            clinic_id: "clinic-1",
            start_date: "2026-01-01T00:00:00+00:00",
            end_date: "2099-01-01T00:00:00+00:00",
            stripe_subscription_id: "sub_123",
          },
        ],
        error: null,
      });
      mockClinicsIn.mockResolvedValue({
        data: [
          {
            clinics_id: "clinic-1",
            klinikNavn: "Klinik Nord",
            klinikNavnSlug: "klinik-nord",
            lokation: "Aarhus",
          },
          {
            clinics_id: "clinic-2",
            klinikNavn: "Klinik Syd",
            klinikNavnSlug: "klinik-syd",
            lokation: "Odense",
          },
        ],
        error: null,
      });
      mockPremiumLocationsIn.mockResolvedValue({
        data: [{ premium_listing_id: "listing-active", city_id: "city-1" }],
        error: null,
      });
      mockCitiesIn.mockResolvedValue({
        data: [{ id: "city-1", bynavn: "Aarhus" }],
        error: null,
      });

      const result = await getPremiumListingsForAdmin();

      if ("error" in result) throw new Error(result.error);
      expect(result.activeCount).toBe(1);
      expect(result.expiredCount).toBe(1);
      expect(result.listings.map((listing) => listing.listingId)).toEqual([
        "listing-active",
        "listing-expired",
      ]);
      expect(result.listings[0]).toMatchObject({
        clinicName: "Klinik Nord",
        clinicSlug: "klinik-nord",
        isActive: true,
        isStripeManaged: true,
        cityNames: ["Aarhus"],
      });
      expect(result.listings[1]).toMatchObject({
        clinicName: "Klinik Syd",
        isActive: false,
        isStripeManaged: false,
      });
    });

    it("blocks non-admin users", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-1", email: "user@example.com" } },
      });
      mockIsAdminEmail.mockReturnValue(false);

      const result = await getPremiumListingsForAdmin();

      expect(result).toEqual({
        error: "Ingen adgang - kun administratorer kan bruge værktøjet",
      });
      expect(mockPremiumListingsOrder).not.toHaveBeenCalled();
    });
  });

  describe("grantPremiumForAdmin", () => {
    it("creates a listing and gives the clinic its own city as a placement", async () => {
      signInAsAdmin();
      mockClinicLookup.mockResolvedValue({
        data: { clinics_id: "clinic-1", klinikNavn: "Klinik Nord", city_id: "city-1" },
        error: null,
      });
      mockPremiumListingLookup.mockResolvedValue({ data: null, error: null });
      mockPremiumListingsInsert.mockResolvedValue({
        data: { id: "listing-new" },
        error: null,
      });
      mockPremiumLocationsUpsert.mockResolvedValue({ error: null });

      const result = await grantPremiumForAdmin({
        clinicId: "clinic-1",
        durationMonths: 12,
      });

      if ("error" in result) throw new Error(result.error);
      expect(result).toMatchObject({
        success: true,
        clinicName: "Klinik Nord",
        extended: false,
      });

      const insertPayload = mockPremiumListingsInsert.mock.calls[0][0];
      expect(insertPayload.clinic_id).toBe("clinic-1");
      expect(new Date(insertPayload.end_date).getTime()).toBeGreaterThan(Date.now());

      expect(mockPremiumLocationsUpsert).toHaveBeenCalledWith(
        { premium_listing_id: "listing-new", city_id: "city-1" },
        expect.objectContaining({ onConflict: "premium_listing_id,city_id" })
      );
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/admin/premium");
    });

    it("extends an existing manual listing instead of creating a second one", async () => {
      signInAsAdmin();
      mockClinicLookup.mockResolvedValue({
        data: { clinics_id: "clinic-1", klinikNavn: "Klinik Nord", city_id: "city-1" },
        error: null,
      });
      mockPremiumListingLookup.mockResolvedValue({
        data: {
          id: "listing-existing",
          end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          stripe_subscription_id: null,
        },
        error: null,
      });
      mockPremiumListingsUpdate.mockResolvedValue({ error: null });
      mockPremiumLocationsUpsert.mockResolvedValue({ error: null });

      const result = await grantPremiumForAdmin({
        clinicId: "clinic-1",
        durationMonths: 6,
      });

      if ("error" in result) throw new Error(result.error);
      expect(result.extended).toBe(true);
      expect(mockPremiumListingsInsert).not.toHaveBeenCalled();
      expect(mockPremiumListingsUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ end_date: expect.any(String) }),
        "id",
        "listing-existing"
      );
    });

    it("leaves a Stripe-managed period alone", async () => {
      signInAsAdmin();
      mockClinicLookup.mockResolvedValue({
        data: { clinics_id: "clinic-1", klinikNavn: "Klinik Nord", city_id: "city-1" },
        error: null,
      });
      mockPremiumListingLookup.mockResolvedValue({
        data: {
          id: "listing-stripe",
          end_date: "2099-01-01T00:00:00+00:00",
          stripe_subscription_id: "sub_123",
        },
        error: null,
      });

      const result = await grantPremiumForAdmin({
        clinicId: "clinic-1",
        durationMonths: 12,
      });

      expect(result).toEqual({
        error:
          "Klinikken har et aktivt Stripe-abonnement. Perioden styres af Stripe og kan ikke ændres her.",
      });
      expect(mockPremiumListingsInsert).not.toHaveBeenCalled();
      expect(mockPremiumListingsUpdate).not.toHaveBeenCalled();
    });

    it("blocks non-admin users", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-1", email: "user@example.com" } },
      });
      mockIsAdminEmail.mockReturnValue(false);

      const result = await grantPremiumForAdmin({
        clinicId: "clinic-1",
        durationMonths: 12,
      });

      expect(result).toEqual({
        error: "Ingen adgang - kun administratorer kan bruge værktøjet",
      });
      expect(mockClinicLookup).not.toHaveBeenCalled();
    });
  });

  describe("revokePremiumForAdmin", () => {
    it("ends the premium window now and reports the still-running Stripe subscription", async () => {
      signInAsAdmin();
      mockPremiumListingLookup.mockResolvedValue({
        data: {
          id: "listing-stripe",
          clinic_id: "clinic-1",
          end_date: "2099-01-01T00:00:00+00:00",
          stripe_subscription_id: "sub_123",
        },
        error: null,
      });
      mockPremiumListingsUpdate.mockResolvedValue({ error: null });
      mockClinicLookup.mockResolvedValue({
        data: { klinikNavn: "Klinik Nord" },
        error: null,
      });

      const result = await revokePremiumForAdmin({ listingId: "listing-stripe" });

      expect(result).toEqual({
        success: true,
        clinicName: "Klinik Nord",
        hadStripeSubscription: true,
      });

      const [updatePayload, column, value] = mockPremiumListingsUpdate.mock.calls[0];
      expect(new Date(updatePayload.end_date).getTime()).toBeLessThanOrEqual(Date.now());
      expect(column).toBe("id");
      expect(value).toBe("listing-stripe");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
    });

    it("does not touch listings that already expired", async () => {
      signInAsAdmin();
      mockPremiumListingLookup.mockResolvedValue({
        data: {
          id: "listing-expired",
          clinic_id: "clinic-1",
          end_date: "2020-01-01T00:00:00+00:00",
          stripe_subscription_id: null,
        },
        error: null,
      });

      const result = await revokePremiumForAdmin({ listingId: "listing-expired" });

      expect(result).toEqual({ error: "Premium er allerede udløbet for denne klinik" });
      expect(mockPremiumListingsUpdate).not.toHaveBeenCalled();
    });
  });
});
