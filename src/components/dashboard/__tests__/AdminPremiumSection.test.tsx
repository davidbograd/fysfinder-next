import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockGetPremiumListings = jest.fn();
const mockGrantPremium = jest.fn();
const mockRevokePremium = jest.fn();
const mockSearchClinics = jest.fn();
const mockToast = jest.fn();

jest.mock("@/app/actions/admin-premium", () => ({
  getPremiumListingsForAdmin: (...args: unknown[]) => mockGetPremiumListings(...args),
  grantPremiumForAdmin: (...args: unknown[]) => mockGrantPremium(...args),
  revokePremiumForAdmin: (...args: unknown[]) => mockRevokePremium(...args),
}));

jest.mock("@/app/actions/admin-clinic-owners", () => ({
  searchClinicsForAdmin: (...args: unknown[]) => mockSearchClinics(...args),
}));

jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

import { AdminPremiumSection } from "../AdminPremiumSection";

const activeStripeListing = {
  listingId: "listing-1",
  clinicId: "clinic-1",
  clinicName: "Klinik Nord",
  clinicSlug: "klinik-nord",
  location: "Aarhus C",
  startDate: "2026-01-01T00:00:00+00:00",
  endDate: "2099-01-01T00:00:00+00:00",
  isActive: true,
  cityNames: ["Aarhus", "Risskov"],
  isStripeManaged: true,
};

describe("AdminPremiumSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPremiumListings.mockResolvedValue({
      listings: [],
      activeCount: 0,
      expiredCount: 0,
    });
  });

  it("shows each premium clinic with its status, period cities and source", async () => {
    mockGetPremiumListings.mockResolvedValue({
      listings: [activeStripeListing],
      activeCount: 1,
      expiredCount: 0,
    });

    render(<AdminPremiumSection />);

    expect(await screen.findByRole("link", { name: "Klinik Nord" })).toHaveAttribute(
      "href",
      "/klinik/klinik-nord"
    );
    expect(screen.getByText("Aktiv")).toBeInTheDocument();
    expect(screen.getByText("Aarhus, Risskov")).toBeInTheDocument();
    expect(screen.getByText("Stripe")).toBeInTheDocument();
    expect(screen.getByText("1 aktiv · 0 udløbet")).toBeInTheDocument();
  });

  it("warns that changes take up to 24 hours to reach search results", async () => {
    render(<AdminPremiumSection />);

    expect(
      await screen.findByText(/op til 24 timer, før ændringen slår igennem/)
    ).toBeInTheDocument();
  });

  it("adds premium for a searched clinic using the selected period", async () => {
    mockSearchClinics.mockResolvedValue({
      clinics: [
        {
          clinics_id: "clinic-1",
          klinikNavn: "Klinik Nord",
          lokation: "Aarhus C",
          adresse: null,
          postnummer: null,
        },
      ],
    });
    mockGrantPremium.mockResolvedValue({
      success: true,
      clinicName: "Klinik Nord",
      endDate: "2027-01-01T00:00:00.000Z",
      extended: false,
    });

    const user = userEvent.setup();
    render(<AdminPremiumSection />);
    await screen.findByText("Ingen klinikker har premium endnu.");

    await user.type(screen.getByLabelText("Søg efter klinik"), "nord");
    await user.click(screen.getByRole("button", { name: /søg/i }));
    await user.click(await screen.findByRole("button", { name: /Klinik Nord/ }));
    await user.click(screen.getByRole("button", { name: "3 måneder" }));
    await user.click(screen.getByRole("button", { name: "Tilføj premium" }));

    await waitFor(() => {
      expect(mockGrantPremium).toHaveBeenCalledWith({
        clinicId: "clinic-1",
        durationMonths: 3,
        customEndDate: null,
      });
    });
  });

  it("sends a custom end date instead of a preset period", async () => {
    mockSearchClinics.mockResolvedValue({
      clinics: [
        {
          clinics_id: "clinic-1",
          klinikNavn: "Klinik Nord",
          lokation: "Aarhus C",
          adresse: null,
          postnummer: null,
        },
      ],
    });
    mockGrantPremium.mockResolvedValue({
      success: true,
      clinicName: "Klinik Nord",
      endDate: "2026-12-24T23:59:59.999Z",
      extended: false,
    });

    const user = userEvent.setup();
    render(<AdminPremiumSection />);
    await screen.findByText("Ingen klinikker har premium endnu.");

    await user.type(screen.getByLabelText("Søg efter klinik"), "nord");
    await user.click(screen.getByRole("button", { name: /søg/i }));
    await user.click(await screen.findByRole("button", { name: /Klinik Nord/ }));
    await user.type(screen.getByLabelText("Eller vælg en slutdato"), "2026-12-24");
    await user.click(screen.getByRole("button", { name: "Tilføj premium" }));

    await waitFor(() => {
      expect(mockGrantPremium).toHaveBeenCalledWith({
        clinicId: "clinic-1",
        durationMonths: null,
        customEndDate: "2026-12-24",
      });
    });
  });

  it("warns that removing premium does not cancel the Stripe subscription", async () => {
    mockGetPremiumListings.mockResolvedValue({
      listings: [activeStripeListing],
      activeCount: 1,
      expiredCount: 0,
    });
    mockRevokePremium.mockResolvedValue({
      success: true,
      clinicName: "Klinik Nord",
      hadStripeSubscription: true,
    });

    const user = userEvent.setup();
    render(<AdminPremiumSection />);

    await user.click(
      await screen.findByRole("button", { name: "Fjern premium for Klinik Nord" })
    );

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/Annuller abonnementet i Stripe/)).toBeInTheDocument();
    expect(
      within(dialog).getByText(/op til 24 timer, før ændringen slår igennem/)
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ja, fjern premium" }));

    await waitFor(() => {
      expect(mockRevokePremium).toHaveBeenCalledWith({ listingId: "listing-1" });
    });
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Premium fjernet",
        description: expect.stringContaining("Stripe-abonnementet kører stadig"),
      })
    );
  });
});
