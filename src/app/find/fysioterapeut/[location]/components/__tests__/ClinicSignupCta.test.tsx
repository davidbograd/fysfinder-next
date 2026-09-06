// Tests for the clinic signup CTA shown beside the nearby-clinics list.

import { render, screen } from "@testing-library/react";
import { ClinicSignupCta } from "../ClinicSignupCta";

describe("ClinicSignupCta", () => {
  it("points clinic owners at the signup landing page", () => {
    render(<ClinicSignupCta cityLocationPhrase="på Østerbro" />);

    expect(
      screen.getByRole("link", { name: "Tilmeld din klinik" })
    ).toHaveAttribute("href", "/tilmeld");
  });

  it("addresses the visitor with the city's own preposition", () => {
    const { rerender } = render(
      <ClinicSignupCta cityLocationPhrase="på Østerbro" />
    );

    expect(
      screen.getByRole("heading", { name: "Driver du en klinik på Østerbro?" })
    ).toBeInTheDocument();

    rerender(<ClinicSignupCta cityLocationPhrase="i Aarhus" />);

    expect(
      screen.getByRole("heading", { name: "Driver du en klinik i Aarhus?" })
    ).toBeInTheDocument();
  });
});
