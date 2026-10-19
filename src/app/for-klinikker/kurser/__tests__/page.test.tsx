// Updated: 2026-10-19 - Covers the evergreen meta title, single H1 and heading hierarchy.
import { render, screen } from "@testing-library/react";
import CoursesPage, { metadata } from "../page";

describe("/for-klinikker/kurser page", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders the overview and drops courses that started before today", () => {
    jest.useFakeTimers().setSystemTime(Date.parse("2026-11-15T12:00:00Z"));

    render(<CoursesPage />);

    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(
      /^Kurser, uddannelse og arrangementer for fysioterapeuter \(2026-2027\)$/,
    );
    expect(
      screen.getByText(/Sidst opdateret 10\. oktober 2026/),
    ).toBeInTheDocument();
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

  it("nests month h2s under the h1 and course h3s under their month", () => {
    jest.useFakeTimers().setSystemTime(Date.parse("2026-11-15T12:00:00Z"));

    const { container } = render(<CoursesPage />);

    const levels = Array.from(
      container.querySelectorAll("h1, h2, h3, h4, h5, h6"),
    ).map((heading) => Number(heading.tagName[1]));
    expect(levels[0]).toBe(1);
    levels.slice(1).forEach((level, index) => {
      expect(level).toBeGreaterThan(1);
      expect(level - levels[index]).toBeLessThanOrEqual(1);
    });

    const november = screen.getByRole("heading", {
      level: 2,
      name: "November 2026",
    });
    const section = november.closest("section")!;
    expect(section.querySelectorAll("h3").length).toBeGreaterThan(0);
    expect(section.querySelector("h4, h5, h6")).toBeNull();
  });

  it("starts the breadcrumbs at For klinikker without linking to the patient front page", () => {
    const { container } = render(<CoursesPage />);

    expect(screen.queryByRole("link", { name: "Forside" })).not.toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "For klinikker" }).length,
    ).toBeGreaterThan(0);

    const jsonLd = JSON.parse(
      container.querySelector('script[type="application/ld+json"]')!
        .textContent!,
    );
    const breadcrumbList = jsonLd.find(
      (entry: { "@type": string }) => entry["@type"] === "BreadcrumbList",
    );
    expect(
      breadcrumbList.itemListElement.map((item: { name: string }) => item.name),
    ).toEqual(["For klinikker", "Kurser"]);
  });

  it("uses the evergreen meta title and keeps the canonical", () => {
    expect(metadata.title).toBe(
      "Find kurser, arrangementer & uddannelser for fysioterapeuter →",
    );
    expect(metadata.alternates?.canonical).toBe("/for-klinikker/kurser");
  });

  it("sets page-specific Open Graph metadata", () => {
    expect(metadata.openGraph).toMatchObject({
      title: "Alle kurser for fysioterapeuter 2026–2027, samlet ét sted",
      description: expect.stringContaining("Find dit næste kursus"),
      url: "https://www.fysfinder.dk/for-klinikker/kurser",
      locale: "da_DK",
    });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
  });
});
