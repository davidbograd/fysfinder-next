import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchAndFilters } from "../SearchAndFilters";

// Mock the server action
jest.mock("@/app/actions/search-cities", () => ({
  searchCities: jest.fn().mockImplementation((query) =>
    Promise.resolve({
      exact_match:
        query === "København"
          ? {
              id: "1",
              bynavn: "København",
              bynavn_slug: "kobenhavn",
              postal_codes: ["1000", "1050", "1051", "1052", "1053", "1054"],
            }
          : null,
      nearby_cities: [],
    })
  ),
}));

const mockSpecialties = [
  {
    specialty_id: "1",
    specialty_name: "Sportsfysioterapi",
    specialty_name_slug: "sportsfysioterapi",
  },
  {
    specialty_id: "2",
    specialty_name: "Børnefysioterapi",
    specialty_name_slug: "bornefysioterapi",
  },
];

describe("SearchAndFilters", () => {
  it("renders search input and specialty dropdown", () => {
    render(
      <SearchAndFilters
        specialties={mockSpecialties}
        citySlug="danmark"
        defaultSearchValue=""
      />
    );

    // Check if search input exists
    expect(
      screen.getByPlaceholderText("By eller postnummer")
    ).toBeInTheDocument();

    // Check if specialty dropdown exists with default text
    expect(screen.getByText("Alle specialer")).toBeInTheDocument();
  });

  it("shows exact match when typing exact city name", async () => {
    render(
      <SearchAndFilters
        specialties={mockSpecialties}
        citySlug="danmark"
        defaultSearchValue=""
      />
    );

    const searchInput = screen.getByPlaceholderText("By eller postnummer");

    // Type in the search input
    await userEvent.type(searchInput, "København");

    // Wait for exact match to appear
    await waitFor(() => {
      expect(screen.getByText("København")).toBeInTheDocument();
      expect(
        screen.getByText("1000, 1050, 1051, 1052, 1053, 1054")
      ).toBeInTheDocument();
    });
  });
});
