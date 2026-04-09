// Added: 2026-04-06 - Added regression test for remade /tilmeld page core sections.
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
        name: /Spørgsmål og svar om Fysfinder/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: /Opgrader til Premium \(kommer snart\)/i,
      })
    ).not.toBeInTheDocument();
  });
});
