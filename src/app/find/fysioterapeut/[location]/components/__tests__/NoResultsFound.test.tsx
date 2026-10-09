// Tests for the empty-state shown on location pages without clinics.

import { render, screen } from "@testing-library/react";
import { NoResultsFound } from "../NoResultsFound";

describe("NoResultsFound", () => {
  it("uses the city's preposition in the heading", () => {
    render(
      <NoResultsFound cityName="Omø" cityPreposition="på" locationSlug="omoe" />
    );

    expect(
      screen.getByRole("heading", { name: "Ingen klinikker fundet på Omø" })
    ).toBeInTheDocument();
  });

  it("defaults to 'i' when no preposition is given", () => {
    render(<NoResultsFound cityName="Aarhus" locationSlug="aarhus" />);

    expect(
      screen.getByRole("heading", { name: "Ingen klinikker fundet i Aarhus" })
    ).toBeInTheDocument();
  });
});
