// Updated: 2026-08-29 - Asserts the tilmeld hero shows the cumulative user count.
import { render, screen } from "@testing-library/react";
import ClinicOwnerPage from "../page";

describe("/tilmeld page", () => {
  it("renders key conversion sections and hides premium upsell", () => {
    render(<ClinicOwnerPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /marketingbudget/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /Fysfinder FAQ/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText("+81.000 har brugt Fysfinder")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: /Opgrader til Premium \(kommer snart\)/i,
      })
    ).not.toBeInTheDocument();
  });
});
