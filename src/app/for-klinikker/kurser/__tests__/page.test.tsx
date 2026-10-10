// Updated: 2026-10-10 - Also covers the past-courses section and the organiser contact links.
import { render, screen } from "@testing-library/react";
import CoursesPage from "../page";

describe("/for-klinikker/kurser page", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders the overview and drops courses that started before today", () => {
    jest.useFakeTimers().setSystemTime(Date.parse("2026-11-15T12:00:00Z"));

    render(<CoursesPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Kurser for fysioterapeuter/,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Opdateret 8\. oktober 2026/)).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 2, name: /^Oktober 2026/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /^November 2026/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /^Afholdte kurser/ }),
    ).toBeInTheDocument();
  });

  it("invites organisers to get in touch near the top and at the bottom", () => {
    render(<CoursesPage />);

    const contactHrefs = screen
      .getAllByRole("link", { name: "Kontakt os" })
      .map((link) => link.getAttribute("href"));
    expect(contactHrefs).toContain("/om-os#kontakt");
    expect(contactHrefs).toContainEqual(
      expect.stringMatching(/^mailto:kontakt@fysfinder\.dk\?subject=/),
    );
    expect(
      screen.getByText(
        /Mangler dit kursus på listen, eller vil du give det ekstra synlighed\?/,
      ),
    ).toBeInTheDocument();
  });
});
