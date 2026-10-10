// Updated: 2026-10-10 - Reworded bottom note and surfaced the "add your course" contact near the top below xl (the desktop rail carries it on xl+).
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CourseOverview } from "@/components/features/kurser/CourseOverview";
import {
  COURSE_CONTACT_HREF,
  buildCourseEventSchema,
  courseDataset,
  formatCheckedOnDate,
  getStructuredDataCourses,
  getPastCourses,
  getTodayIsoInCopenhagen,
  getUpcomingCourses,
} from "@/lib/courses";

export const revalidate = 86400; // 24 hours ISR so past courses drop off daily (must be a literal for Next.js segment config)

const PAGE_PATH = "/for-klinikker/kurser";
const PAGE_URL = `https://www.fysfinder.dk${PAGE_PATH}`;
const PAGE_TITLE = "Kurser for fysioterapeuter 2026–2027";
const PAGE_DESCRIPTION =
  "Overblik over kommende kurser, efteruddannelse og faglige arrangementer for fysioterapeuter i Danmark – samlet ét sted og sorteret efter dato.";

export const metadata: Metadata = {
  title: `${PAGE_TITLE} | Fysfinder`,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
};

const breadcrumbItems = [
  { text: "Forside", link: "/" },
  { text: "For klinikker", link: "/for-klinikker" },
  { text: "Kurser" },
];

export default function CoursesPage() {
  const { courses, provider_abbreviations, checked_on } = courseDataset;
  const todayIso = getTodayIsoInCopenhagen();
  const upcomingCourses = getUpcomingCourses(courses, todayIso);
  const pastCourses = getPastCourses(courses, todayIso);
  const providerCount = new Set(
    upcomingCourses.map((course) => course.provider),
  ).size;

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbItems.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.text,
        ...(item.link ? { item: `https://www.fysfinder.dk${item.link}` } : {}),
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      url: PAGE_URL,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: getStructuredDataCourses(upcomingCourses).map(
          (course, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: buildCourseEventSchema(
              course,
              PAGE_URL,
              provider_abbreviations,
            ),
          }),
        ),
      },
    },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Breadcrumbs items={breadcrumbItems} />

      <header className="mb-6">
        <h1 className="text-3xl font-bold text-[#1f2b28] md:text-4xl">
          {PAGE_TITLE}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-gray-600">
          Kommende kurser, efteruddannelse og faglige arrangementer for
          fysioterapeuter i Danmark – samlet ét sted.
        </p>
        <p className="mt-2 text-sm tabular-nums text-gray-500">
          {upcomingCourses.length} kurser · {providerCount} udbydere · Sidst opdateret{" "}
          {formatCheckedOnDate(checked_on)}
        </p>
        <p className="mt-2 text-sm text-gray-600 xl:hidden">
          Mangler dit kursus, eller vil du give det ekstra synlighed?{" "}
          <a
            href={COURSE_CONTACT_HREF}
            className="font-medium text-brand-primary underline-offset-2 hover:underline"
          >
            Kontakt os
          </a>
        </p>
      </header>

      <CourseOverview
        courses={upcomingCourses}
        pastCourses={pastCourses}
        providerAbbreviations={provider_abbreviations}
      />

      <div className="mt-12 space-y-3 border-t border-gray-200 pt-6 text-sm text-gray-500">
        <p>
          Oversigten er bred, men ikke udtømmende. Kontrollér altid dato, pris
          og tilmelding hos udbyderen.
        </p>
        <p>
          Mangler dit kursus på listen, eller vil du give det ekstra synlighed?
          Kontakt os på{" "}
          <a
            href={COURSE_CONTACT_HREF}
            className="text-logo-blue hover:underline"
          >
            kontakt@fysfinder.dk
          </a>
          .
        </p>
      </div>
    </div>
  );
}
