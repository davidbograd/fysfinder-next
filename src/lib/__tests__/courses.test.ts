// Updated: 2026-10-10 - Also covers the provider filter.
import {
  Course,
  EMPTY_COURSE_FILTERS,
  buildCourseEventSchema,
  courseDataset,
  filterCourses,
  formatCourseDateDetails,
  getCourseDurationDays,
  getCourseTopics,
  getCourseRegion,
  getPastCourses,
  getPublicCourseNote,
  getStructuredDataCourses,
  getTodayIsoInCopenhagen,
  getUpcomingCourses,
  groupCoursesByMonth,
} from "@/lib/courses";

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

describe("getUpcomingCourses", () => {
  it("drops past courses and sorts soonest first", () => {
    const courses = [
      makeCourse({ id: "late", start_date: "2027-03-01" }),
      makeCourse({ id: "past", start_date: "2026-10-01" }),
      makeCourse({ id: "today", start_date: "2026-10-10" }),
    ];

    expect(getUpcomingCourses(courses, "2026-10-10").map((c) => c.id)).toEqual([
      "today",
      "late",
    ]);
  });
});

describe("getPastCourses", () => {
  it("keeps only courses that started before today, most recent first", () => {
    const courses = [
      makeCourse({ id: "older", start_date: "2026-08-01" }),
      makeCourse({ id: "today", start_date: "2026-10-10" }),
      makeCourse({ id: "recent", start_date: "2026-10-01" }),
    ];

    expect(getPastCourses(courses, "2026-10-10").map((c) => c.id)).toEqual([
      "recent",
      "older",
    ]);
  });
});

describe("getTodayIsoInCopenhagen", () => {
  it("uses the Copenhagen calendar date, not UTC", () => {
    expect(getTodayIsoInCopenhagen(new Date("2026-10-09T23:30:00Z"))).toBe(
      "2026-10-10",
    );
  });
});

describe("groupCoursesByMonth", () => {
  it("groups in order with Danish-aware month anchor ids", () => {
    const groups = groupCoursesByMonth([
      makeCourse({ id: "a", start_date: "2026-11-02" }),
      makeCourse({ id: "b", start_date: "2026-11-20" }),
      makeCourse({ id: "c", start_date: "2027-05-01" }),
    ]);

    expect(groups.map((g) => [g.id, g.label, g.courses.length])).toEqual([
      ["november-2026", "November 2026", 2],
      ["maj-2027", "Maj 2027", 1],
    ]);
  });
});

describe("getCourseRegion", () => {
  it("maps every located course in the dataset to a region", () => {
    const unmapped = courseDataset.courses
      .filter((course) => course.location && !getCourseRegion(course))
      .map((course) => course.location);

    expect(unmapped).toEqual([]);
  });

  it("treats online courses as online regardless of location", () => {
    expect(
      getCourseRegion(makeCourse({ format: "Online", location: null })),
    ).toBe("online");
  });
});

describe("getPublicCourseNote", () => {
  it("shows prerequisites but hides internal research notes", () => {
    expect(
      getPublicCourseNote(makeCourse({ notes: "Forudsætter del 1." })),
    ).toBe("Forudsætter del 1.");
    expect(
      getPublicCourseNote(
        makeCourse({
          notes:
            "Direkte sidevisning blev blokeret (403); dato og pris skal genkontrolleres før publicering.",
        }),
      ),
    ).toBeNull();
  });
});

describe("getCourseDurationDays", () => {
  it.each([
    ["24. oktober 2026", 1],
    ["23.–24. oktober 2026", 2],
    ["20-10-2026 til 21-10-2026", 2],
    ["29. oktober–1. november 2026", 4],
    ["5.–7. og 27.–28. november 2026", 5],
    ["30. september–2. oktober og 29.–30. oktober 2027", 5],
    ["30. december–2. januar 2027", 4],
  ])("counts %s as %i days", (dateDetails, days) => {
    expect(
      getCourseDurationDays(makeCourse({ date_details: dateDetails })),
    ).toBe(days);
  });

  it.each([
    "1. februar–11. juni 2027",
    "Start 20. maj 2027; slutdato ikke fastslået",
    "3. november 2026–9. november 2027",
  ])("leaves long or vague periods (%s) without a duration", (dateDetails) => {
    expect(
      getCourseDurationDays(makeCourse({ date_details: dateDetails })),
    ).toBeNull();
  });

  it("skips courses whose dates only mark a programme's start and end", () => {
    expect(
      getCourseDurationDays(
        makeCourse({
          date_details: "23.–24. oktober 2026",
          notes: "Perioden er modulets start og slut.",
        }),
      ),
    ).toBeNull();
  });
});

describe("formatCourseDateDetails", () => {
  it.each([
    ["20-10-2026 til 21-10-2026", "20.–21. oktober 2026"],
    ["29-10-2026 til 01-11-2026", "29. oktober–1. november 2026"],
    ["30-12-2026 til 02-01-2027", "30. december 2026–2. januar 2027"],
    ["23.–24. oktober 2026", "23.–24. oktober 2026"],
  ])("formats %s as %s", (input, expected) => {
    expect(formatCourseDateDetails(input)).toBe(expected);
  });
});

describe("getCourseTopics", () => {
  it("gives every course in the dataset at least one topic", () => {
    const withoutTopic = courseDataset.courses
      .filter((course) => getCourseTopics(course).length === 0)
      .map((course) => course.title);

    expect(withoutTopic).toEqual([]);
  });

  it("combines title keywords and the provider's specialty", () => {
    expect(
      getCourseTopics(
        makeCourse({ title: "Hovedpine og nakkesmerter", provider: "DSAF" }),
      ),
    ).toEqual(["Akupunktur og dry needling", "Hovedpine og nakke", "Smerte"]);
  });
});

describe("filterCourses", () => {
  const courses = [
    makeCourse({
      id: "a",
      title: "Smerte 1",
      provider: "DSMF",
      location: "Aarhus",
    }),
    makeCourse({
      id: "b",
      title: "BBAT 1",
      provider: "Dansk Institut for BBAT",
      start_date: "2027-02-01",
    }),
  ];
  const abbreviations = {
    DSMF: "Dansk Selskab for Muskuloskeletal Fysioterapi",
  };

  it("matches every search term across title, provider and topic", () => {
    const search = (query: string) =>
      filterCourses(
        courses,
        { ...EMPTY_COURSE_FILTERS, query },
        abbreviations,
      ).map((c) => c.id);

    expect(search("selskab smerte")).toEqual(["a"]);
    expect(search("krop og psyke")).toEqual(["b"]);
    expect(search("  ")).toEqual(["a", "b"]);
  });

  it("ANDs different filters together", () => {
    expect(
      filterCourses(
        courses,
        {
          ...EMPTY_COURSE_FILTERS,
          regions: ["midtjylland"],
          months: ["2026-11"],
        },
        abbreviations,
      ).map((c) => c.id),
    ).toEqual(["a"]);
  });

  it("ORs multiple values within one filter", () => {
    expect(
      filterCourses(
        courses,
        { ...EMPTY_COURSE_FILTERS, months: ["2026-11", "2027-02"] },
        abbreviations,
      ).map((c) => c.id),
    ).toEqual(["a", "b"]);
    expect(
      filterCourses(
        courses,
        { ...EMPTY_COURSE_FILTERS, topics: ["Krop og psyke", "Børn"] },
        abbreviations,
      ).map((c) => c.id),
    ).toEqual(["b"]);
  });

  it("filters by provider", () => {
    expect(
      filterCourses(
        courses,
        { ...EMPTY_COURSE_FILTERS, providers: ["Dansk Institut for BBAT"] },
        abbreviations,
      ).map((c) => c.id),
    ).toEqual(["b"]);
  });
});

describe("course structured data", () => {
  it("only marks up verified courses with a known place", () => {
    const courses = [
      makeCourse({ id: "ok" }),
      makeCourse({ id: "review", requires_review: true }),
      makeCourse({ id: "no-place", location: null }),
    ];

    expect(getStructuredDataCourses(courses).map((c) => c.id)).toEqual(["ok"]);
  });

  it("links each event to its anchor on the pillar page", () => {
    const schema = buildCourseEventSchema(
      makeCourse({ id: "FFK-001" }),
      "https://www.fysfinder.dk/for-klinikker/kurser",
      { DSSF: "Dansk Selskab for Sportsfysioterapi" },
    );

    expect(schema).toMatchObject({
      "@type": "Event",
      startDate: "2026-11-01",
      url: "https://www.fysfinder.dk/for-klinikker/kurser#ffk-001",
      organizer: { name: "Dansk Selskab for Sportsfysioterapi" },
    });
  });
});
