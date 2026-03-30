// Added: 2026-03-30 - MVP coverage for header search form submit navigation.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HeaderSearchBar } from "../HeaderSearchBar";

jest.mock("@/components/search/SearchInput/LocationSearch", () => ({
  LocationSearch: () => <input aria-label="header-location-search" />,
}));

jest.mock("@/components/search/SearchInput/SpecialtySearch", () => ({
  SpecialtySearch: () => <input aria-label="header-specialty-search" />,
}));

describe("HeaderSearchBar", () => {
  it("submits to danmark fallback when no location is selected", async () => {
    const user = userEvent.setup();
    render(<HeaderSearchBar />);

    await user.click(screen.getByRole("button", { name: "Find fysioterapeut" }));

    expect(global.__TEST_ROUTER_MOCKS__.push).toHaveBeenCalledWith(
      "/find/fysioterapeut/danmark"
    );
  });
});
