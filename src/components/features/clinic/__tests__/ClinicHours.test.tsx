import { render, screen } from "@testing-library/react";
import { ClinicHours } from "../ClinicHours";
import type { Clinic } from "@/app/types";

const clinic = (overrides: Partial<Clinic> = {}): Clinic =>
  ({
    klinikNavn: "BeneFit Herning",
    parkering: null,
    handicapadgang: undefined,
    ...overrides,
  }) as unknown as Clinic;

describe("ClinicHours", () => {
  it("renders structured hours and marks only genuinely closed days", () => {
    render(
      <ClinicHours
        clinic={clinic({
          opening_hours: {
            mon: [{ open: "08:00", close: "18:00" }],
            fri: [{ open: "08:00", close: "14:00" }],
            sat: [],
            sun: [],
          },
        })}
      />
    );

    expect(screen.getByText("08.00–18.00")).toBeInTheDocument();
    expect(screen.getByText("08.00–14.00")).toBeInTheDocument();
    expect(screen.getAllByText("Lukket")).toHaveLength(2);
  });

  it("falls back to the legacy day columns when opening_hours is not set", () => {
    render(
      <ClinicHours
        clinic={clinic({
          opening_hours: null,
          mandag: "09:00 - 17:00",
        })}
      />
    );

    expect(screen.getByText("09.00–17.00")).toBeInTheDocument();
  });

  it("shows the empty state when we have no hours at all", () => {
    render(<ClinicHours clinic={clinic({ opening_hours: null })} />);

    expect(screen.getByText("Ingen åbningstider tilføjet.")).toBeInTheDocument();
    expect(screen.queryByText("Lukket")).not.toBeInTheDocument();
  });

  it("does not claim a clinic is closed on days Google had no data for", () => {
    render(
      <ClinicHours
        clinic={clinic({
          opening_hours: { mon: [{ open: "08:00", close: "18:00" }] },
        })}
      />
    );

    // Tuesday through Sunday are unknown, not closed.
    expect(screen.queryByText("Lukket")).not.toBeInTheDocument();
    expect(screen.getAllByText("–")).toHaveLength(6);
  });
});
