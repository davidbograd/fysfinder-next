// Tests for the nearby-town link cluster shown under the nearby-clinics heading.

import { render, screen } from "@testing-library/react";
import { NearbyCitiesLinks } from "../NearbyCitiesLinks";
import { NearbyCity } from "@/app/types";

function makeCity(overrides: Partial<NearbyCity> = {}): NearbyCity {
  return {
    id: "city-1",
    bynavn: "Nørrebro",
    bynavn_slug: "noerrebro",
    clinic_count: 8,
    distance: 2.4,
    ...overrides,
  };
}

describe("NearbyCitiesLinks", () => {
  it("links each town to its listing page", () => {
    render(
      <NearbyCitiesLinks
        cities={[
          makeCity(),
          makeCity({
            id: "city-2",
            bynavn: "Hellerup",
            bynavn_slug: "hellerup",
          }),
        ]}
      />
    );

    expect(
      screen.getByRole("heading", {
        name: "Udforsk fysioterapeuter i andre byer",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Fysioterapeut Nørrebro" })
    ).toHaveAttribute("href", "/find/fysioterapeut/noerrebro");
    expect(
      screen.getByRole("link", { name: "Fysioterapeut Hellerup" })
    ).toHaveAttribute("href", "/find/fysioterapeut/hellerup");
  });

  it("renders every town rather than hiding any behind a toggle", () => {
    // The cluster exists for internal linking, so all of it has to be in the markup.
    const cities = Array.from({ length: 12 }, (_, index) =>
      makeCity({
        id: `city-${index}`,
        bynavn: `By ${index}`,
        bynavn_slug: `by-${index}`,
      })
    );

    render(<NearbyCitiesLinks cities={cities} />);

    expect(screen.getAllByRole("link")).toHaveLength(12);
  });

  it("renders nothing when there are no nearby towns", () => {
    const { container } = render(<NearbyCitiesLinks cities={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
