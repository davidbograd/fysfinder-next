// Added: 2026-09-07 - Verifies pain-location/symptom-context cards link to level 3 with crawlable hrefs and hide the relations block entirely when a card has none.

import { render, screen } from "@testing-library/react";
import { NavigationCardGrid } from "../NavigationCardGrid";

const cards = [
  {
    id: "ydersiden-af-knaeet",
    title: "På ydersiden af knæet",
    description: "Smerter på ydersiden af knæet kan opstå ved løb.",
    conditionSlugs: ["loeberknae"],
  },
  {
    id: "bag-knaeet",
    title: "Bag knæet",
    description: "Smerter bag knæet kan opstå af flere forskellige årsager.",
    conditionSlugs: [],
  },
];

describe("NavigationCardGrid", () => {
  it("links related conditions to their level 3 page", () => {
    render(<NavigationCardGrid cards={cards} bodyAreaSlug="knae" />);

    expect(screen.getByRole("link", { name: "Løberknæ" })).toHaveAttribute(
      "href",
      "/symptomer/knae/loeberknae"
    );
  });

  it("still renders a card with no relations, without an empty relations block", () => {
    render(<NavigationCardGrid cards={cards} bodyAreaSlug="knae" />);

    expect(screen.getByText("Bag knæet")).toBeInTheDocument();
    expect(
      screen.getByText(/Smerter bag knæet kan opstå af flere/)
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("Relevante problemstillinger")
    ).toHaveLength(1);
  });

  it("drops unknown or inactive condition slugs", () => {
    render(
      <NavigationCardGrid
        cards={[{ ...cards[0], conditionSlugs: ["findes-ikke"] }]}
        bodyAreaSlug="knae"
      />
    );

    expect(screen.queryByText("Relevante problemstillinger")).toBeNull();
  });
});
