// Updated: 2026-09-06 - Loads extra clinics from the server instead of hydrating the full list.

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClinicsList } from "../ClinicsList";
import { Clinic } from "@/app/types";

const mockLoadMoreLocationClinics = jest.fn();

jest.mock("@/app/actions/load-more-location-clinics", () => ({
  loadMoreLocationClinics: (...args: unknown[]) =>
    mockLoadMoreLocationClinics(...args),
}));

jest.mock("../ClinicListingCard", () => ({
  __esModule: true,
  default: ({ klinikNavn }: { klinikNavn: string }) => <div>{klinikNavn}</div>,
}));

function makeClinic(index: number): Clinic {
  return {
    clinics_id: `clinic-${index}`,
    klinikNavn: `Klinik ${index}`,
    antalBehandlere: 1,
    ydernummer: false,
    avgRating: 4,
    ratingCount: 1,
    lokation: "Aarhus",
    lokationSlug: "aarhus",
    klinikNavnSlug: `klinik-${index}`,
    adresse: "Gade 1",
    postnummer: 8000,
    website: "",
    tlf: "",
    email: "",
    førsteKons: 0,
    opfølgning: 0,
    første_kons_minutter: 0,
    opfølgning_minutter: 0,
    mandag: "",
    tirsdag: "",
    onsdag: "",
    torsdag: "",
    fredag: "",
    lørdag: "",
    søndag: "",
    parkering: "",
    handicapadgang: null,
    god_adgang_verificeret: false,
    holdtræning: "",
    hjemmetræning: "",
    northstar: false,
    om_os: null,
    specialties: [],
  };
}

describe("ClinicsList", () => {
  beforeEach(() => {
    mockLoadMoreLocationClinics.mockReset();
  });

  it("renders the first page and loads more clinics from the server", async () => {
    const user = userEvent.setup();
    mockLoadMoreLocationClinics.mockResolvedValue([makeClinic(11)]);
    const initialClinics = Array.from({ length: 10 }, (_, index) =>
      makeClinic(index + 1)
    );

    render(
      <ClinicsList
        initialClinics={initialClinics}
        totalClinics={11}
        locationSlug="aarhus"
        specialtySlug="ryg"
        filters={{ ydernummer: true }}
      />
    );

    expect(screen.getByText("Klinik 1")).toBeInTheDocument();
    expect(screen.queryByText("Klinik 11")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Vis flere klinikker" }));

    expect(mockLoadMoreLocationClinics).toHaveBeenCalledWith({
      locationSlug: "aarhus",
      specialtySlug: "ryg",
      filters: { ydernummer: true },
      offset: 10,
    });
    expect(await screen.findByText("Klinik 11")).toBeInTheDocument();
  });
});
