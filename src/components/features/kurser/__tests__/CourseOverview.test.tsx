// Updated: 2026-10-10 - Adds coverage for the Udbyder filter and its dropdown search.
import { act, fireEvent, screen, within } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { CourseOverview } from "../CourseOverview";
import { Course } from "@/lib/courses";

function makeCourse(overrides: Partial<Course>): Course {
  return {
    id: "FFK-900",
    title: "Testkursus",
    provider: "DSSF",
    start_date: "2026-11-01",
    date_details: "1. november 2026",
    location: "Odense",
    format: "Fysisk",
    price_text: "1.000 kr.",
    status: "Dato offentliggjort",
    notes: "",
    type: "Kursus",
    source_url: "https://www.sportsfysioterapi.dk/kursus",
    checked_on: "2026-10-08",
    verification_level: "official_page",
    registration_availability_verified: false,
    requires_review: false,
    ...overrides,
  };
}

const courses = [
  makeCourse({
    id: "FFK-001",
    title: "Smerte 1",
    provider: "DSMF",
    location: "København",
    start_date: "2026-11-05",
    date_details: "5.–6. november 2026",
    status: "Tilmelding åben",
  }),
  makeCourse({
    id: "FFK-002",
    title: "Akupunktur og dry needling 1",
    provider: "DSAF",
    location: "Aarhus",
    start_date: "2026-12-03",
  }),
  makeCourse({
    id: "FFK-003",
    title: "B-kursus, nedre kvadrant",
    provider: "The Mulligan Concept Danmark",
    location: "København",
    start_date: "2027-01-08",
    type: "Eksamen",
    requires_review: true,
  }),
];

function renderOverview(pastCourses: Course[] = []) {
  return renderWithProviders(
    <CourseOverview
      courses={courses}
      pastCourses={pastCourses}
      providerAbbreviations={{
        DSMF: "Dansk Selskab for Muskuloskeletal Fysioterapi",
        DSAF: "Dansk Selskab for Akupunktur i Fysioterapi",
      }}
    />,
  );
}

function courseRow(title: string) {
  return screen
    .getByRole("heading", { level: 3, name: title })
    .closest("details")!;
}

function visibleCourseTitles() {
  return screen
    .queryAllByRole("heading", { level: 3 })
    .map((h) => h.textContent);
}

function filterButton(label: string) {
  return screen.getByRole("button", { name: new RegExp(`^${label} `) });
}

function toggleFilterOptions(label: string, options: string[]) {
  fireEvent.click(filterButton(label));
  const popover = screen.getByRole("dialog");
  for (const option of options) {
    fireEvent.click(within(popover).getByRole("checkbox", { name: option }));
  }
  fireEvent.keyDown(popover, { key: "Escape" });
}

function monthHeading(month: string) {
  return screen.getByRole("heading", {
    level: 2,
    name: new RegExp(`^${month}`),
  });
}

type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;

function mockIntersectionObserver() {
  const observers: { callback: ObserverCallback; targets: Element[] }[] = [];
  window.IntersectionObserver = class {
    targets: Element[] = [];
    constructor(public callback: ObserverCallback) {
      observers.push(this);
    }
    observe(target: Element) {
      this.targets.push(target);
    }
    disconnect() {}
  } as unknown as typeof IntersectionObserver;

  return function setInView(target: Element, isIntersecting: boolean) {
    act(() => {
      for (const observer of observers) {
        if (observer.targets.includes(target)) {
          observer.callback([{ isIntersecting, target }]);
        }
      }
    });
  };
}

describe("CourseOverview", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = jest.fn();
  });

  const originalIntersectionObserver = window.IntersectionObserver;

  afterEach(() => {
    window.IntersectionObserver = originalIntersectionObserver;
  });

  it("groups courses by month with counts, anchors, duration and status", () => {
    renderOverview();

    expect(monthHeading("November 2026")).toHaveTextContent("1 kursus");
    expect(monthHeading("Januar 2027")).toBeInTheDocument();
    expect(courseRow("Smerte 1")).toHaveAttribute("id", "ffk-001");
    expect(
      within(courseRow("Smerte 1")).getAllByText(/2 dage/).length,
    ).toBeGreaterThan(0);
    expect(
      within(courseRow("Smerte 1")).getByText("Tilmelding åben"),
    ).toBeInTheDocument();
  });

  it("shows the type label and date details in the collapsed row", () => {
    renderOverview();

    const flaggedSummary = courseRow("B-kursus, nedre kvadrant").querySelector(
      "summary",
    )!;
    expect(within(flaggedSummary).getByText("Eksamen")).toBeInTheDocument();
    const summary = courseRow("Smerte 1").querySelector("summary")!;
    expect(
      within(summary).getByText(/5\.–6\. november 2026/),
    ).toBeInTheDocument();
    expect(within(summary).getByText("Afholdt af DSMF")).toBeInTheDocument();
  });

  it("only lists details in the expanded view that the row doesn't already show", () => {
    renderOverview();
    const terms = (title: string) =>
      Array.from(courseRow(title).querySelectorAll("dt")).map(
        (term) => term.textContent,
      );

    expect(terms("Smerte 1")).toEqual(["Format", "Emne", "Pris", "Udbyder"]);
    expect(terms("B-kursus, nedre kvadrant")).not.toContain("Udbyder");
  });

  it("labels each filter and defaults it to all", () => {
    renderOverview();

    expect(filterButton("Område")).toHaveTextContent("Hele Danmark");
    expect(filterButton("Dato")).toHaveTextContent("Hele 2026–2027");
    expect(filterButton("Emne")).toHaveTextContent("Alle emner");
    expect(filterButton("Eventtype")).toHaveTextContent("Alle typer");
    expect(filterButton("Udbyder")).toHaveTextContent("Alle udbydere");
  });

  it("filters by organiser using the full provider name", () => {
    renderOverview();

    toggleFilterOptions("Udbyder", [
      "Dansk Selskab for Muskuloskeletal Fysioterapi (DSMF)",
    ]);

    expect(visibleCourseTitles()).toEqual(["Smerte 1"]);
  });

  it("narrows the organiser options with the dropdown search", () => {
    renderOverview();
    fireEvent.click(filterButton("Udbyder"));
    const popover = screen.getByRole("dialog");

    fireEvent.change(
      within(popover).getByRole("searchbox", { name: "Søg i udbyder" }),
      { target: { value: "akupunktur" } },
    );
    expect(
      within(popover)
        .getAllByRole("checkbox")
        .map((box) => box.closest("label")?.textContent),
    ).toEqual(["Dansk Selskab for Akupunktur i Fysioterapi (DSAF)"]);

    fireEvent.change(within(popover).getByRole("searchbox"), {
      target: { value: "findes ikke" },
    });
    expect(within(popover).getByText("Ingen resultater")).toBeInTheDocument();
  });

  it("searches by provider full name and topic", () => {
    renderOverview();
    const search = screen.getByRole("searchbox", { name: "Søg efter kurser" });

    fireEvent.change(search, { target: { value: "muskuloskeletal" } });
    expect(visibleCourseTitles()).toEqual(["Smerte 1"]);
    expect(screen.getByText("Viser 1 af 3 kurser")).toBeInTheDocument();

    fireEvent.change(search, { target: { value: "manuel terapi" } });
    expect(visibleCourseTitles()).toEqual(["B-kursus, nedre kvadrant"]);
  });

  it("lets a filter select several values and summarises the selection", () => {
    renderOverview();

    toggleFilterOptions("Dato", ["November 2026", "Januar 2027"]);

    expect(visibleCourseTitles()).toEqual([
      "Smerte 1",
      "B-kursus, nedre kvadrant",
    ]);
    expect(filterButton("Dato")).toHaveTextContent("November 2026 +1");
  });

  it("combines filters and resets them", () => {
    renderOverview();

    toggleFilterOptions("Område", ["Hovedstaden"]);
    expect(visibleCourseTitles()).toEqual([
      "Smerte 1",
      "B-kursus, nedre kvadrant",
    ]);

    toggleFilterOptions("Eventtype", ["Eksamen"]);
    expect(visibleCourseTitles()).toEqual(["B-kursus, nedre kvadrant"]);

    fireEvent.click(screen.getByRole("button", { name: "Nulstil filtre" }));
    expect(visibleCourseTitles()).toHaveLength(3);
    expect(filterButton("Område")).toHaveTextContent("Hele Danmark");
    expect(
      screen.queryByRole("button", { name: "Nulstil filtre" }),
    ).not.toBeInTheDocument();
  });

  it("filters by derived topic", () => {
    renderOverview();

    toggleFilterOptions("Emne", ["Smerte"]);
    expect(visibleCourseTitles()).toEqual(["Smerte 1"]);
  });

  it("shows an empty state with a reset action when nothing matches", () => {
    renderOverview();

    fireEvent.change(
      screen.getByRole("searchbox", { name: "Søg efter kurser" }),
      { target: { value: "findes ikke" } },
    );
    expect(
      screen.getByText("Ingen kurser matcher din søgning"),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getAllByRole("button", { name: "Nulstil filtre" })[0],
    );
    expect(visibleCourseTitles()).toHaveLength(3);
  });

  it("collapses and expands a month", () => {
    renderOverview();
    const toggle = within(monthHeading("November 2026")).getByRole("button");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(visibleCourseTitles()).not.toContain("Smerte 1");
    expect(monthHeading("November 2026")).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(visibleCourseTitles()).toContain("Smerte 1");
  });

  it("lists months with counts in the timeline and jumps to a collapsed month", () => {
    renderOverview();
    const timeline = screen.getByRole("navigation", { name: "Måneder" });

    const monthButtons = within(timeline).getAllByRole("button");
    expect(monthButtons).toHaveLength(3);
    expect(
      monthButtons.filter((button) => button.hasAttribute("aria-current")),
    ).toHaveLength(1);

    fireEvent.click(within(monthHeading("Januar 2027")).getByRole("button"));
    expect(visibleCourseTitles()).not.toContain("B-kursus, nedre kvadrant");

    fireEvent.click(
      within(timeline).getByRole("button", { name: "Januar 2027, 1 kursus" }),
    );
    expect(visibleCourseTitles()).toContain("B-kursus, nedre kvadrant");
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it("flags unverified courses and keeps the provider link", () => {
    renderOverview();

    const flagged = courseRow("B-kursus, nedre kvadrant");
    expect(
      within(flagged).getByText("Kontrollér hos udbyder"),
    ).toBeInTheDocument();
    expect(
      within(flagged).getByText(/Kontrollér dato, pris og sted/),
    ).toBeInTheDocument();
    expect(
      within(courseRow("Smerte 1")).queryByText("Kontrollér hos udbyder"),
    ).not.toBeInTheDocument();

    const link = within(courseRow("Smerte 1")).getByRole("link", {
      name: /Se kurset hos udbyder/,
    });
    expect(link).toHaveAttribute(
      "href",
      "https://www.sportsfysioterapi.dk/kursus",
    );
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("shows a condensed search bar sharing state once the full search scrolls away", () => {
    const setInView = mockIntersectionObserver();
    renderOverview();
    const fullSearch = screen.getByRole("search", {
      name: "Søg og filtrer kurser",
    });
    expect(
      screen.queryByRole("search", { name: "Kompakt søgning og filtre" }),
    ).not.toBeInTheDocument();

    setInView(fullSearch, false);
    const condensed = screen.getByRole("search", {
      name: "Kompakt søgning og filtre",
    });

    fireEvent.change(within(condensed).getByRole("searchbox"), {
      target: { value: "muskuloskeletal" },
    });
    expect(visibleCourseTitles()).toEqual(["Smerte 1"]);
    expect(within(fullSearch).getByRole("searchbox")).toHaveValue(
      "muskuloskeletal",
    );

    const filtersToggle = within(condensed).getByRole("button", {
      name: /^Filtre/,
    });
    expect(filtersToggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(filtersToggle);
    expect(filtersToggle).toHaveAttribute("aria-expanded", "true");
    expect(
      within(condensed).getByRole("button", { name: /^Eventtype / }),
    ).toHaveTextContent("Alle typer");

    setInView(fullSearch, true);
    expect(
      screen.queryByRole("search", { name: "Kompakt søgning og filtre" }),
    ).not.toBeInTheDocument();
  });

  it("collapses past courses at the bottom and marks them as held", () => {
    renderOverview([
      makeCourse({
        id: "FFK-800",
        title: "Afholdt skulderkursus",
        start_date: "2026-09-01",
        requires_review: true,
      }),
    ]);
    const toggle = within(monthHeading("Afholdte kurser")).getByRole("button");

    expect(monthHeading("Afholdte kurser")).toHaveTextContent("1 kursus");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(visibleCourseTitles()).not.toContain("Afholdt skulderkursus");

    fireEvent.click(toggle);
    const row = courseRow("Afholdt skulderkursus");
    expect(within(row).getByText("Afholdt")).toBeInTheDocument();
    expect(
      within(row).queryByText("Kontrollér hos udbyder"),
    ).not.toBeInTheDocument();
    expect(visibleCourseTitles().at(-1)).toBe("Afholdt skulderkursus");
  });

  it("hides the past section when nothing past is passed in", () => {
    renderOverview();

    expect(
      screen.queryByRole("heading", { level: 2, name: /^Afholdte kurser/ }),
    ).not.toBeInTheDocument();
  });
});
