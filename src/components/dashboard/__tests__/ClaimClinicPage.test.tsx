import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClaimClinicPage } from "../ClaimClinicPage";

const mockSearchCities = jest.fn();
const mockSearchClinicsByCity = jest.fn();
const mockToast = jest.fn();

jest.mock("@/app/actions/search-cities", () => ({
  searchCities: (...args: unknown[]) => mockSearchCities(...args),
}));

jest.mock("@/app/actions/claim-clinic", () => ({
  searchClinicsByCity: (...args: unknown[]) => mockSearchClinicsByCity(...args),
  submitClinicClaim: jest.fn(),
}));

jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: (...args: unknown[]) => mockToast(...args) }),
}));

describe("ClaimClinicPage", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockSearchCities.mockReset();
    mockSearchClinicsByCity.mockReset();
    mockToast.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("shows create clinic CTA when no clinic is found in selected city", async () => {
    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });

    mockSearchCities.mockResolvedValue({
      exact_match: {
        id: "city-1",
        bynavn: "Aabenraa",
        bynavn_slug: "aabenraa",
        postal_codes: ["6200"],
      },
      nearby_cities: [],
    });
    mockSearchClinicsByCity.mockResolvedValue({ clinics: [] });

    render(
      <ClaimClinicPage
        userProfile={{ full_name: "Test Person", email: "test@example.com" }}
      />
    );

    await user.type(screen.getByRole("combobox"), "Aabenraa");
    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(screen.getByRole("option", { name: /Aabenraa/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole("option", { name: /Aabenraa/i }));

    const ctaLink = await screen.findByRole("link", { name: "Opret ny klinik" });
    expect(ctaLink).toHaveAttribute(
      "href",
      "/dashboard/claim/new?cityId=city-1&cityName=Aabenraa&citySlug=aabenraa&postalCode=6200"
    );
  });

  it("shows non-verified clinics before verified clinics", async () => {
    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });

    mockSearchCities.mockResolvedValue({
      exact_match: {
        id: "city-1",
        bynavn: "Aabenraa",
        bynavn_slug: "aabenraa",
        postal_codes: ["6200"],
      },
      nearby_cities: [],
    });
    mockSearchClinicsByCity.mockResolvedValue({
      clinics: [
        {
          clinics_id: "verified-1",
          klinikNavn: "Verificeret Klinik",
          adresse: "Testvej 1",
          postnummer: 6200,
          lokation: "Aabenraa",
          verified_klinik: true,
        },
        {
          clinics_id: "open-1",
          klinikNavn: "Ikke Verificeret Klinik",
          adresse: "Testvej 2",
          postnummer: 6200,
          lokation: "Aabenraa",
          verified_klinik: false,
        },
      ],
    });

    render(
      <ClaimClinicPage
        userProfile={{ full_name: "Test Person", email: "test@example.com" }}
      />
    );

    await user.type(screen.getByRole("combobox"), "Aabenraa");
    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(screen.getByRole("option", { name: /Aabenraa/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole("option", { name: /Aabenraa/i }));

    const clinicHeadings = await screen.findAllByRole("heading", { level: 4 });
    expect(clinicHeadings[0]).toHaveTextContent("Ikke Verificeret Klinik");
    expect(clinicHeadings[1]).toHaveTextContent("Verificeret Klinik");
  });
});
