// Updated: 2026-10-08 - Online fysioterapi chip rerouting.
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

  it("applies ydernummer immediately on location pages", async () => {
    const user = userEvent.setup();

    render(
      <SearchInterface
        specialties={[]}
        citySlug="aarhus-c"
        defaultSearchValue="Aarhus C"
        showFilters
      />
    );

    await user.click(
      screen.getByRole("checkbox", { name: "Med ydernummer" })
    );

    expect(global.__TEST_ROUTER_MOCKS__.push).toHaveBeenCalledWith(
      "/find/fysioterapeut/aarhus-c?ydernummer=true"
    );
  });

  it("applies handicapadgang immediately on location pages", async () => {
    const user = userEvent.setup();

    render(
      <SearchInterface
        specialties={[]}
        citySlug="aarhus-c"
        defaultSearchValue="Aarhus C"
        showFilters
        initialFilters={{ ydernummer: true }}
      />
    );

    await user.click(screen.getByRole("checkbox", { name: "Handicapadgang" }));

    expect(global.__TEST_ROUTER_MOCKS__.push).toHaveBeenCalledWith(
      "/find/fysioterapeut/aarhus-c?handicap=true&ydernummer=true"
    );
  });

  it("shows active filter chips as checked and removes them on click", async () => {
    const user = userEvent.setup();

    render(
      <SearchInterface
        specialties={[]}
        citySlug="holte"
        defaultSearchValue="Holte"
        showFilters
        initialFilters={{ ydernummer: true }}
      />
    );

    const ydernummerChip = screen.getByRole("checkbox", {
      name: "Med ydernummer",
    });
    expect(ydernummerChip).toHaveAttribute("aria-checked", "true");
    expect(
      screen.getByRole("checkbox", { name: "Handicapadgang" })
    ).toHaveAttribute("aria-checked", "false");

    await user.click(ydernummerChip);

    expect(global.__TEST_ROUTER_MOCKS__.push).toHaveBeenCalledWith(
      "/find/fysioterapeut/holte"
    );
  });

  it("reroutes to the online page and keeps specialty and filters", async () => {
    const user = userEvent.setup();

    render(
      <SearchInterface
        specialties={[
          {
            specialty_id: "1",
            specialty_name: "Sportsskader",
            specialty_name_slug: "sportsskader",
          },
        ]}
        currentSpecialty="sportsskader"
        citySlug="aarhus"
        defaultSearchValue="Aarhus"
        showFilters
        initialFilters={{ ydernummer: true }}
      />
    );

    const onlineChip = screen.getByRole("checkbox", {
      name: "Online fysioterapi",
    });
    expect(onlineChip).toHaveAttribute("aria-checked", "false");

    await user.click(onlineChip);

    expect(global.__TEST_ROUTER_MOCKS__.push).toHaveBeenCalledWith(
      "/find/fysioterapeut/online/sportsskader?ydernummer=true"
    );
  });

  it("shows online as checked on the online page and unchecking goes to danmark", async () => {
    const user = userEvent.setup();

    render(
      <SearchInterface
        specialties={[]}
        citySlug="online"
        defaultSearchValue="Online"
        showFilters
        initialFilters={{ handicap: true }}
      />
    );

    const onlineChip = screen.getByRole("checkbox", {
      name: "Online fysioterapi",
    });
    expect(onlineChip).toHaveAttribute("aria-checked", "true");

    await user.click(onlineChip);

    expect(global.__TEST_ROUTER_MOCKS__.push).toHaveBeenCalledWith(
      "/find/fysioterapeut/danmark?handicap=true"
    );
  });

  it("does not render filter chips on the homepage variant", () => {
    render(
      <SearchInterface specialties={[]} citySlug="danmark" defaultSearchValue="" />
    );

    expect(screen.queryByRole("group", { name: "Filtre" })).toBeNull();
  });
});
