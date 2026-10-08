import { render, screen } from "@testing-library/react";
import { ClinicPricing } from "../ClinicPricing";
import type { Clinic } from "@/app/types";

const clinic = (overrides: Partial<Clinic> = {}): Clinic =>
  ({
    klinikNavn: "BeneFit Herning",
    ydernummer: null,
    førsteKons: 0,
    opfølgning: 0,
    ...overrides,
  }) as unknown as Clinic;

describe("ClinicPricing", () => {
  it("shows the current sygesikring rates for clinics with ydernummer", () => {
    render(<ClinicPricing clinic={clinic({ ydernummer: true })} />);

    expect(screen.getByText("536,67 kr")).toBeInTheDocument();
    expect(
      screen.getByText("Med lægehenvisning: 325,76 kr"),
    ).toBeInTheDocument();
    expect(screen.getByText("341,24 kr")).toBeInTheDocument();
    expect(
      screen.getByText("Med lægehenvisning: 207,13 kr"),
    ).toBeInTheDocument();
  });

  it("shows the clinic's own prices when it has no ydernummer", () => {
    render(
      <ClinicPricing
        clinic={clinic({
          ydernummer: false,
          førsteKons: 650,
          opfølgning: 450,
          første_kons_minutter: 45,
          opfølgning_minutter: 30,
        })}
      />,
    );

    expect(screen.getByText("650 kr")).toBeInTheDocument();
    expect(screen.getByText("450 kr")).toBeInTheDocument();
    expect(screen.getByText("Første konsult (45 min)")).toBeInTheDocument();
    expect(screen.queryByText("536,67 kr")).not.toBeInTheDocument();
  });
});
