// Updated: 2026-10-10 - Added provider (Udbyder) filter.
import courseData from "@/content/kurser/kurser.json";
import { getCopenhagenDateParts } from "@/lib/calendar-month";
import { slugify } from "@/app/utils/slugify";

export interface Course {
  id: string;
  title: string;
  provider: string;
  start_date: string;
  date_details: string;
  location: string | null;
  format: string;
  price_text: string | null;
  status: string;
  notes: string;
  type: string;
  source_url: string;
  checked_on: string;
  verification_level: string;
  registration_availability_verified: boolean;
  requires_review: boolean;
}

export interface CourseDataset {
  checked_on: string;
  provider_abbreviations: Record<string, string>;
  courses: Course[];
}

export interface CourseMonthGroup {
  id: string;
  yearMonth: string;
  label: string;
  courses: Course[];
}

export interface CourseStatusBadge {
  label: string;
  tone: "positive" | "warning" | "muted" | "neutral";
}

export const COURSE_REGIONS = {
  hovedstaden: "Hovedstaden",
  sjaelland: "Sjælland",
  syddanmark: "Syddanmark",
  midtjylland: "Midtjylland",
  nordjylland: "Nordjylland",
  online: "Online",
} as const;

export type CourseRegion = keyof typeof COURSE_REGIONS;

const LOCATION_REGIONS: Record<string, CourseRegion> = {
  københavn: "hovedstaden",
  "københavn/rødovre": "hovedstaden",
  "hillerød eller kbh": "hovedstaden",
  gentofte: "hovedstaden",
  brøndby: "hovedstaden",
  allerød: "hovedstaden",
  tårnby: "hovedstaden",
  kastrup: "hovedstaden",
  hvidovre: "hovedstaden",
  vedbæk: "hovedstaden",
  rødovre: "hovedstaden",
  farum: "hovedstaden",
  hillerød: "hovedstaden",
  ringsted: "sjaelland",
  roskilde: "sjaelland",
  næstved: "sjaelland",
  odense: "syddanmark",
  "odense, hollufgård": "syddanmark",
  middelfart: "syddanmark",
  kerteminde: "syddanmark",
  varde: "syddanmark",
  vejle: "syddanmark",
  fredericia: "syddanmark",
  otterup: "syddanmark",
  svendborg: "syddanmark",
  kolding: "syddanmark",
  esbjerg: "syddanmark",
  horsens: "midtjylland",
  skanderborg: "midtjylland",
  aarhus: "midtjylland",
  viborg: "midtjylland",
  silkeborg: "midtjylland",
  herning: "midtjylland",
  aalborg: "nordjylland",
  hobro: "nordjylland",
  skagen: "nordjylland",
  online: "online",
};

const MONTH_LABELS = [
  "Januar",
  "Februar",
  "Marts",
  "April",
  "Maj",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "December",
] as const;

const SHORT_MONTH_LABELS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "maj",
  "jun",
  "jul",
  "aug",
  "sep",
  "okt",
  "nov",
  "dec",
] as const;

// Raw notes are research notes; only these participant-facing kinds are shown publicly.
const PUBLIC_NOTE_PATTERN = /^(Forudsætter|Perioden er|Tilmelding via e-mail)/;

const STATUS_BADGES: Record<string, CourseStatusBadge> = {
  "Tilmelding åben": { label: "Tilmelding åben", tone: "positive" },
  "Tilmelding endnu ikke åben": {
    label: "Tilmelding åbner senere",
    tone: "neutral",
  },
  Venteliste: { label: "Venteliste", tone: "warning" },
  "Tilmeldingsfrist passeret": {
    label: "Tilmeldingsfrist passeret",
    tone: "muted",
  },
  "Lukket for tilmelding": { label: "Lukket for tilmelding", tone: "muted" },
  "Program under udarbejdelse": {
    label: "Program under udarbejdelse",
    tone: "neutral",
  },
};

export const courseDataset = courseData as CourseDataset;

export function getTodayIsoInCopenhagen(now: Date = new Date()): string {
  const { year, month, day } = getCopenhagenDateParts(now);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function getUpcomingCourses(
  courses: Course[],
  todayIso: string,
): Course[] {
  return courses
    .filter((course) => course.start_date >= todayIso)
    .sort(
      (a, b) =>
        a.start_date.localeCompare(b.start_date) ||
        a.title.localeCompare(b.title, "da"),
    );
}

export const COURSE_CONTACT_HREF = `mailto:kontakt@fysfinder.dk?subject=${encodeURIComponent("Kursus på Fysfinder")}`;

/** Courses that started before today, most recent first. */
export function getPastCourses(courses: Course[], todayIso: string): Course[] {
  return courses
    .filter((course) => course.start_date < todayIso)
    .sort(
      (a, b) =>
        b.start_date.localeCompare(a.start_date) ||
        a.title.localeCompare(b.title, "da"),
    );
}

export function getMonthLabel(startDate: string): string {
  const [year, month] = startDate.split("-").map(Number);
  return `${MONTH_LABELS[month - 1]} ${year}`;
}

export function getShortMonthLabel(yearMonth: string): string {
  const month = Number(yearMonth.slice(5, 7));
  const label = SHORT_MONTH_LABELS[month - 1];
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function groupCoursesByMonth(
  sortedCourses: Course[],
): CourseMonthGroup[] {
  const groups = new Map<string, CourseMonthGroup>();
  for (const course of sortedCourses) {
    const label = getMonthLabel(course.start_date);
    const group = groups.get(label) ?? {
      id: slugify(label),
      yearMonth: course.start_date.slice(0, 7),
      label,
      courses: [],
    };
    group.courses.push(course);
    groups.set(label, group);
  }
  return Array.from(groups.values());
}

export function getCourseRegion(course: Course): CourseRegion | null {
  if (course.format === "Online") return "online";
  if (!course.location) return null;
  return LOCATION_REGIONS[course.location.trim().toLowerCase()] ?? null;
}

export function getCourseAnchorId(course: Course): string {
  return slugify(course.id);
}

export function formatCourseLocation(location: string | null): string {
  if (!location) return "Sted ikke oplyst";
  return location.charAt(0).toUpperCase() + location.slice(1);
}

export function getProviderName(
  provider: string,
  abbreviations: Record<string, string>,
): string {
  const fullName = abbreviations[provider];
  return fullName ? `${fullName} (${provider})` : provider;
}

export function getPublicCourseNote(course: Course): string | null {
  return PUBLIC_NOTE_PATTERN.test(course.notes) ? course.notes : null;
}

export function getCourseStatusBadge(course: Course): CourseStatusBadge | null {
  return STATUS_BADGES[course.status] ?? null;
}

export function formatCheckedOnDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return `${day}. ${MONTH_LABELS[month - 1].toLowerCase()} ${year}`;
}

const ATTENDANCE_MODES: Record<string, string> = {
  Online: "https://schema.org/OnlineEventAttendanceMode",
  Hybrid: "https://schema.org/MixedEventAttendanceMode",
  Fysisk: "https://schema.org/OfflineEventAttendanceMode",
};

export function buildCourseEventSchema(
  course: Course,
  pageUrl: string,
  abbreviations: Record<string, string>,
) {
  const isOnline = course.format === "Online";
  return {
    "@type": "Event",
    name: course.title,
    startDate: course.start_date,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode:
      ATTENDANCE_MODES[course.format] ?? ATTENDANCE_MODES.Fysisk,
    url: `${pageUrl}#${getCourseAnchorId(course)}`,
    location: isOnline
      ? { "@type": "VirtualLocation", url: course.source_url }
      : {
          "@type": "Place",
          name: formatCourseLocation(course.location),
          address: {
            "@type": "PostalAddress",
            addressLocality: formatCourseLocation(course.location),
            addressCountry: "DK",
          },
        },
    organizer: {
      "@type": "Organization",
      name: abbreviations[course.provider] ?? course.provider,
      url: new URL(course.source_url).origin,
    },
  };
}

// Topics are not in the source data; they are inferred from title keywords and the provider's specialty.
const TOPIC_RULES: { topic: string; title?: RegExp; providers?: string[] }[] = [
  {
    topic: "Akupunktur og dry needling",
    title: /akupunktur|needling/i,
    providers: ["DSAF"],
  },
  {
    topic: "Bækken og underliv",
    title: /bækken|underliv|rectus|sexolog/i,
    providers: ["DUGOF", "Elin Solheim"],
  },
  { topic: "Børn", title: /børn|mindste|castillo/i, providers: ["DSPF"] },
  { topic: "Hjerte og lunge", title: /hjerte|lunge/i },
  { topic: "Hovedpine og nakke", title: /hovedpine|nakke|cervikal/i },
  {
    topic: "Kommunikation og samarbejde",
    title:
      /kommunikation|samtale|beslutningstagning|borgerinddragelse|lærested|supervision|tamtam/i,
  },
  {
    topic: "Krop og psyke",
    title: /bbat|psykosocial|kognitiv/i,
    providers: ["Dansk Institut for BBAT"],
  },
  { topic: "Lymfødem", title: /lymfødem|földi/i, providers: ["DSFL"] },
  {
    topic: "Manuel terapi",
    title:
      /kvadrant|columna|manuel|mulligan|\bMET\b|\bMDT\b|pelvis|ekstremiteter/i,
    providers: [
      "The Mulligan Concept Danmark",
      "Elitefys",
      "Lasota Terapi Akademi",
      "Dansk Selskab for MDT",
    ],
  },
  {
    topic: "Muskuloskeletal",
    title: /skulder|hofte|knæ|fod|ankel|ryg\b|lyske/i,
    providers: ["DSMF"],
  },
  {
    topic: "Neurologi",
    title: /neuro|f\.o\.t\.t|hjernerystelse|vestibulær|parkinson|dysautonomi/i,
    providers: [
      "Dansk Selskab for Neurologisk Fysioterapi",
      "Forenede Care Neuro",
      "HjernePraxis",
      "Hjernerystelsesfyssen",
      "Otterup Fysioterapi / IVRT",
    ],
  },
  { topic: "Osteoporose", title: /osteoporose/i },
  {
    topic: "Smerte",
    title: /smerte|pain|ppas/i,
    providers: ["SMOF", "Smertevidenskab", "CPOP"],
  },
  {
    topic: "Sportsfysioterapi",
    title: /sport|kinesio|antidoping/i,
    providers: ["DSSF"],
  },
  { topic: "Træning", title: /træning|styrke|udholdenhed/i },
  {
    topic: "Ultralyd og billeddiagnostik",
    title: /ultralyd|billeddiagnostik/i,
  },
];

export function getCourseTopics(course: Course): string[] {
  return TOPIC_RULES.filter(
    (rule) =>
      rule.title?.test(course.title) ||
      rule.providers?.includes(course.provider),
  ).map((rule) => rule.topic);
}

const MONTH_NUMBERS: Record<string, number> = Object.fromEntries(
  MONTH_LABELS.map((label, index) => [label.toLowerCase(), index + 1]),
);

const MAX_DURATION_DAYS = 14;

function countDaysInclusive(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

function parseNumericRangeDays(dateDetails: string): number | null {
  const match =
    /^(\d{1,2})-(\d{1,2})-(\d{4}) til (\d{1,2})-(\d{1,2})-(\d{4})$/.exec(
      dateDetails,
    );
  if (!match) return null;
  const [d1, m1, y1, d2, m2, y2] = match.slice(1).map(Number);
  return countDaysInclusive(
    new Date(Date.UTC(y1, m1 - 1, d1)),
    new Date(Date.UTC(y2, m2 - 1, d2)),
  );
}

// Handles "24. oktober 2026", "23.–24. oktober 2026", "29. oktober–1. november 2026"
// and "og"-joined sessions where month and year are only written once at the end.
function parseWrittenRangeDays(dateDetails: string): number | null {
  const yearMatch = /^(.+) (\d{4})$/.exec(dateDetails);
  if (!yearMatch) return null;

  const segments = yearMatch[1]
    .split(" og ")
    .map((segment) =>
      /^(\d{1,2})\.(?:\s*([a-zæøå]+))?(?:\s*–\s*(\d{1,2})\.(?:\s*([a-zæøå]+))?)?$/i.exec(
        segment.trim(),
      ),
    );
  if (segments.some((segment) => !segment)) return null;

  let year = Number(yearMatch[2]);
  let carryMonth: number | undefined;
  let totalDays = 0;

  for (const segment of [...segments].reverse()) {
    const [, startDay, startMonthName, endDay, endMonthName] = segment!;
    const toMonth = (name?: string) =>
      name ? MONTH_NUMBERS[name.toLowerCase()] : undefined;

    const endMonth = endDay
      ? (toMonth(endMonthName) ?? carryMonth)
      : (toMonth(startMonthName) ?? carryMonth);
    const startMonth = endDay
      ? (toMonth(startMonthName) ?? endMonth)
      : endMonth;
    if (!startMonth || !endMonth) return null;

    if (carryMonth && endMonth > carryMonth) year -= 1;
    const startYear = startMonth > endMonth ? year - 1 : year;

    totalDays += countDaysInclusive(
      new Date(Date.UTC(startYear, startMonth - 1, Number(startDay))),
      new Date(Date.UTC(year, endMonth - 1, Number(endDay ?? startDay))),
    );
    carryMonth = startMonth;
    year = startYear;
  }

  return totalDays;
}

export function getCourseDurationDays(course: Course): number | null {
  if (/^Perioden er/.test(course.notes)) return null;
  const details = course.date_details.trim();
  const days = parseNumericRangeDays(details) ?? parseWrittenRangeDays(details);
  return days && days > 0 && days <= MAX_DURATION_DAYS ? days : null;
}

// Rewrites "20-10-2026 til 21-10-2026" into "20.–21. oktober 2026" so all dates read alike.
export function formatCourseDateDetails(dateDetails: string): string {
  const match =
    /^(\d{1,2})-(\d{1,2})-(\d{4}) til (\d{1,2})-(\d{1,2})-(\d{4})$/.exec(
      dateDetails.trim(),
    );
  if (!match) return dateDetails;

  const [d1, m1, y1, d2, m2, y2] = match.slice(1).map(Number);
  const month = (m: number) => MONTH_LABELS[m - 1].toLowerCase();
  if (y1 === y2 && m1 === m2 && d1 === d2) return `${d1}. ${month(m1)} ${y1}`;
  if (y1 === y2 && m1 === m2) return `${d1}.–${d2}. ${month(m1)} ${y1}`;
  if (y1 === y2) return `${d1}. ${month(m1)}–${d2}. ${month(m2)} ${y1}`;
  return `${d1}. ${month(m1)} ${y1}–${d2}. ${month(m2)} ${y2}`;
}

export function formatCourseDuration(days: number): string {
  return days === 1 ? "1 dag" : `${days} dage`;
}

// Empty lists mean "no restriction"; multiple values within one filter are OR-ed.
export interface CourseFilters {
  query: string;
  regions: CourseRegion[];
  months: string[];
  topics: string[];
  types: string[];
  providers: string[];
}

export const EMPTY_COURSE_FILTERS: CourseFilters = {
  query: "",
  regions: [],
  months: [],
  topics: [],
  types: [],
  providers: [],
};

function normalizeSearchText(text: string): string {
  return text.toLowerCase().normalize("NFC");
}

export function matchesCourseSearch(
  course: Course,
  query: string,
  abbreviations: Record<string, string>,
): boolean {
  const terms = normalizeSearchText(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;

  const haystack = normalizeSearchText(
    [
      course.title,
      course.provider,
      abbreviations[course.provider] ?? "",
      course.type,
      course.location ?? "",
      ...getCourseTopics(course),
    ].join(" "),
  );
  return terms.every((term) => haystack.includes(term));
}

export function filterCourses(
  courses: Course[],
  filters: CourseFilters,
  abbreviations: Record<string, string>,
): Course[] {
  return courses.filter((course) => {
    const region = getCourseRegion(course);
    return (
      (filters.regions.length === 0 ||
        (region !== null && filters.regions.includes(region))) &&
      (filters.months.length === 0 ||
        filters.months.includes(course.start_date.slice(0, 7))) &&
      (filters.topics.length === 0 ||
        getCourseTopics(course).some((topic) =>
          filters.topics.includes(topic),
        )) &&
      (filters.types.length === 0 || filters.types.includes(course.type)) &&
      (filters.providers.length === 0 ||
        filters.providers.includes(course.provider)) &&
      matchesCourseSearch(course, filters.query, abbreviations)
    );
  });
}

// Only verified courses with a known place are marked up as events.
export function getStructuredDataCourses(courses: Course[]): Course[] {
  return courses.filter(
    (course) =>
      !course.requires_review &&
      (course.format === "Online" || Boolean(course.location)),
  );
}
