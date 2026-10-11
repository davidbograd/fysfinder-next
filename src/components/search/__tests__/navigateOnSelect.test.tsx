import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchProvider } from "../SearchProvider";
import { LocationSearch } from "../SearchInput/LocationSearch";
import { SpecialtySearch } from "../SearchInput/SpecialtySearch";
import { searchCities } from "@/app/actions/search-cities";

jest.mock("@/app/actions/search-cities", () => ({
  searchCities: jest.fn(),
}));

jest.mock("@/app/utils/supabase/client", () => ({
  createClient: () => ({}),
}));

const specialties = [
  {
    specialty_id: "1",
    specialty_name: "Sportsskader",
    specialty_name_slug: "sportsskader",
  },
  {
    specialty_id: "2",
    specialty_name: "Rygsmerter",
    specialty_name_slug: "rygsmerter",
  },
];

const odense = {
  id: "c1",
  bynavn: "Odense C",
  bynavn_slug: "odense-c",
  postal_codes: ["5000"],
  distance: 0,
};

function renderSearch(navigateOnSelect: boolean) {
  return render(
    <SearchProvider
      initialLocation={{ name: "Aarhus", slug: "aarhus" }}
      initialSpecialty={{ name: "Sportsskader", slug: "sportsskader", id: "1" }}
      specialties={specialties}
    >
      <LocationSearch navigateOnSelect={navigateOnSelect} />
      <SpecialtySearch
        specialties={specialties}
        navigateOnSelect={navigateOnSelect}
      />
    </SearchProvider>
  );
}

describe("search inputs with navigateOnSelect", () => {
  beforeEach(() => {
    (searchCities as jest.Mock).mockResolvedValue({
      exact_match: odense,
      nearby_cities: [],
    });
  });

  it("navigates as soon as a new city is clicked, keeping the specialty", async () => {
    const user = userEvent.setup();
    renderSearch(true);

    const input = screen.getByRole("combobox", { name: "Search for location" });
    await user.clear(input);
    await user.type(input, "Odense");
    await user.click(await screen.findByRole("option", { name: /Odense C/ }));

    expect(global.__TEST_ROUTER_MOCKS__.push).toHaveBeenCalledWith(
      "/find/fysioterapeut/odense-c/sportsskader"
    );
  });

  it("navigates as soon as a new specialty is clicked, keeping the city", async () => {
    const user = userEvent.setup();
    renderSearch(true);

    const input = screen.getByRole("combobox", { name: "Search for specialty" });
    await user.clear(input);
    await user.type(input, "Ryg");
    await user.click(screen.getByRole("option", { name: "Rygsmerter" }));

    expect(global.__TEST_ROUTER_MOCKS__.push).toHaveBeenCalledWith(
      "/find/fysioterapeut/aarhus/rygsmerter"
    );
  });

  it("navigates to the city without specialty when Alle specialer is clicked", async () => {
    const user = userEvent.setup();
    renderSearch(true);

    await user.click(
      screen.getByRole("combobox", { name: "Search for specialty" })
    );
    await user.click(screen.getByRole("option", { name: /Alle specialer/ }));

    expect(global.__TEST_ROUTER_MOCKS__.push).toHaveBeenCalledWith(
      "/find/fysioterapeut/aarhus"
    );
  });

  it("waits for Find when navigateOnSelect is off", async () => {
    const user = userEvent.setup();
    renderSearch(false);

    const input = screen.getByRole("combobox", { name: "Search for specialty" });
    await user.clear(input);
    await user.type(input, "Ryg");
    await user.click(screen.getByRole("option", { name: "Rygsmerter" }));

    expect(global.__TEST_ROUTER_MOCKS__.push).not.toHaveBeenCalled();
  });
});
