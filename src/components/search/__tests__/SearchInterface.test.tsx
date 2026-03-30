// Added: 2026-03-30 - MVP coverage for SearchInterface submit navigation behavior.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchInterface } from "../SearchInterface";

jest.mock("../SearchInput/LocationSearch", () => ({
  LocationSearch: () => <input aria-label="location-search" />,
}));

jest.mock("../SearchInput/SpecialtySearch", () => ({
  SpecialtySearch: () => <input aria-label="specialty-search" />,
}));

jest.mock("../SearchButton", () => ({
  SearchButton: () => null,
}));

describe("SearchInterface", () => {
  it("navigates to selected city when submit button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <SearchInterface
        specialties={[]}
        citySlug="aarhus"
        defaultSearchValue="Aarhus"
      />
    );

    await user.click(screen.getByRole("button", { name: "Find" }));

    expect(global.__TEST_ROUTER_MOCKS__.push).toHaveBeenCalledWith(
      "/find/fysioterapeut/aarhus"
    );
  });

  it("falls back to danmark when no location is selected", async () => {
    const user = userEvent.setup();

    render(
      <SearchInterface
        specialties={[]}
        citySlug="danmark"
        defaultSearchValue=""
      />
    );

    await user.click(screen.getByRole("button", { name: "Find" }));

    expect(global.__TEST_ROUTER_MOCKS__.push).toHaveBeenCalledWith(
      "/find/fysioterapeut/danmark"
    );
  });
});
