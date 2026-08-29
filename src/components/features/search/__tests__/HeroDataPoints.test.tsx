import { render, screen } from "@testing-library/react";
import { HeroDataPoints } from "../HeroDataPoints";

describe("HeroDataPoints", () => {
  it("shows the cumulative user count instead of monthly visitors", () => {
    render(<HeroDataPoints totalClinics={1200} specialtyCount={18} />);

    expect(screen.getByText("+81.000")).toBeInTheDocument();
    expect(screen.getByText("har brugt Fysfinder")).toBeInTheDocument();
    expect(
      screen.queryByText("bruger Fysfinder månedligt")
    ).not.toBeInTheDocument();
  });
});
