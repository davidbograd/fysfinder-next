import { render, screen } from "@testing-library/react";
import { ClinicServices } from "../ClinicServices";
import type { Clinic } from "@/app/types";

const clinic = (overrides: Partial<Clinic> = {}): Clinic =>
  ({
    klinikNavn: "BeneFit Herning",
    extraServices: [],
    ...overrides,
  }) as unknown as Clinic;

describe("ClinicServices", () => {
  it("shows a linked Online fysioterapi badge from the online flag", () => {
    render(
      <ClinicServices
        clinic={clinic({
          online_fysioterapeut: true,
          extraServices: [
            {
              service_id: "1",
              service_name: "Akupunktur",
              service_name_slug: "akupunktur",
            },
          ],
        })}
      />,
    );

    expect(
      screen.getByRole("link", { name: "Online fysioterapi" }),
    ).toHaveAttribute("href", "/find/fysioterapeut/online");
    expect(screen.getByText("Akupunktur")).toBeInTheDocument();
  });

  it("omits the online badge when the clinic is not online", () => {
    render(<ClinicServices clinic={clinic({ online_fysioterapeut: false })} />);

    expect(screen.queryByText("Online fysioterapi")).not.toBeInTheDocument();
    expect(
      screen.getByText("Ingen ekstra ydelser tilføjet."),
    ).toBeInTheDocument();
  });
});
