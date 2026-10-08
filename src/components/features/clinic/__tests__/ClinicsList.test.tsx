// Updated: 2026-09-06 - Loads extra clinics from the server instead of hydrating the full list.

import { act, render, screen } from "@testing-library/react";
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

  it("replaces the list when the page re-renders with filtered clinics", () => {
    const { rerender } = render(
      <ClinicsList
        initialClinics={[makeClinic(1), makeClinic(2)]}
        totalClinics={2}
        locationSlug="aarhus"
      />
    );

    expect(screen.getByText("Klinik 1")).toBeInTheDocument();

    rerender(
      <ClinicsList
        initialClinics={[makeClinic(3)]}
        totalClinics={1}
        locationSlug="aarhus"
        filters={{ ydernummer: true }}
      />
    );

    expect(screen.getByText("Klinik 3")).toBeInTheDocument();
    expect(screen.queryByText("Klinik 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Klinik 2")).not.toBeInTheDocument();
  });

  it("drops a load-more response that resolves after the filters changed", async () => {
    const user = userEvent.setup();
    let resolveLoadMore: (clinics: Clinic[]) => void = () => {};
    mockLoadMoreLocationClinics.mockReturnValue(
      new Promise<Clinic[]>((resolve) => {
        resolveLoadMore = resolve;
      })
    );

    const { rerender } = render(
      <ClinicsList
        initialClinics={[makeClinic(1)]}
        totalClinics={2}
        locationSlug="aarhus"
      />
    );

    await user.click(screen.getByRole("button", { name: "Vis flere klinikker" }));

    rerender(
      <ClinicsList
        initialClinics={[makeClinic(3)]}
        totalClinics={1}
        locationSlug="aarhus"
        filters={{ handicap: true }}
      />
    );

    await act(async () => {
      resolveLoadMore([makeClinic(2)]);
    });

    expect(screen.getByText("Klinik 3")).toBeInTheDocument();
    expect(screen.queryByText("Klinik 2")).not.toBeInTheDocument();
  });
});
