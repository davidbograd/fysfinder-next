// Updated: 2026-10-10 - Added the Udbyder (organiser) filter alongside Område/Dato/Emne/Eventtype.
"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Building2,
  CalendarDays,
  ChevronDown,
  ExternalLink,
  Link2,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  COURSE_REGIONS,
  Course,
  CourseFilters,
  CourseRegion,
  CourseStatusBadge,
  EMPTY_COURSE_FILTERS,
  filterCourses,
  formatCourseDateDetails,
  formatCourseDuration,
  formatCourseLocation,
  getCourseAnchorId,
  getCourseDurationDays,
  getCourseRegion,
  getCourseStatusBadge,
  getCourseTopics,
  getMonthLabel,
  getProviderName,
  getPublicCourseNote,
  getShortMonthLabel,
  groupCoursesByMonth,
} from "@/lib/courses";
import {
  CourseMultiSelectFilter,
  FilterOption,
} from "./CourseMultiSelectFilter";
import { CourseMonthTimeline, TimelineMonth } from "./CourseMonthTimeline";

interface CourseOverviewProps {
  courses: Course[];
  pastCourses?: Course[];
  providerAbbreviations: Record<string, string>;
}

type ListFilterKey = "regions" | "months" | "topics" | "types" | "providers";

// Site header height; the full search area counts as out of view once it slides under it.
const SITE_HEADER_MARGIN = "-64px 0px 0px 0px";

const PAST_SECTION_ID = "afholdte-kurser";

export function CourseOverview({
  courses,
  pastCourses = [],
  providerAbbreviations,
}: CourseOverviewProps) {
  const [filters, setFilters] = useState<CourseFilters>(EMPTY_COURSE_FILTERS);
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(
    () => new Set([PAST_SECTION_ID]),
  );
  const agendaRef = useRef<HTMLDivElement>(null);
  const fullSearchRef = useRef<HTMLDivElement>(null);
  const isFullSearchInView = useIsInView(fullSearchRef, SITE_HEADER_MARGIN);
  const deferredQuery = useDeferredValue(filters.query);
  const filterOptions = useMemo(
    () => buildFilterOptions(courses, providerAbbreviations),
    [courses, providerAbbreviations],
  );

  const monthGroups = useMemo(
    () =>
      groupCoursesByMonth(
        filterCourses(
          courses,
          { ...filters, query: deferredQuery },
          providerAbbreviations,
        ),
      ),
    [courses, filters, deferredQuery, providerAbbreviations],
  );
  const visiblePastCourses = useMemo(
    () =>
      filterCourses(
        pastCourses,
        { ...filters, query: deferredQuery },
        providerAbbreviations,
      ),
    [pastCourses, filters, deferredQuery, providerAbbreviations],
  );
  const timelineMonths = useMemo<TimelineMonth[]>(
    () =>
      monthGroups.map((group) => ({
        id: group.id,
        yearMonth: group.yearMonth,
        label: group.label,
        shortLabel: getShortMonthLabel(group.yearMonth),
        count: group.courses.length,
      })),
    [monthGroups],
  );
  const visibleCount = monthGroups.reduce(
    (sum, group) => sum + group.courses.length,
    0,
  );
  const isFiltered =
    filters.query.trim() !== "" ||
    filters.regions.length > 0 ||
    filters.months.length > 0 ||
    filters.topics.length > 0 ||
    filters.types.length > 0 ||
    filters.providers.length > 0;

  const activeFilterCount =
    filters.regions.length +
    filters.months.length +
    filters.topics.length +
    filters.types.length +
    filters.providers.length;

  function updateQuery(query: string) {
    setFilters((current) => ({ ...current, query }));
  }

  function updateListFilter(key: ListFilterKey, values: string[]) {
    setFilters((current) => ({ ...current, [key]: values }));
  }

  function resetFilters() {
    setFilters(EMPTY_COURSE_FILTERS);
  }

  function toggleMonth(id: string) {
    setCollapsedMonths((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const expandMonth = useCallback((id: string) => {
    setCollapsedMonths((current) => {
      if (!current.has(id)) return current;
      const next = new Set(current);
      next.delete(id);
      return next;
    });
  }, []);

  function jumpToMonth(id: string) {
    expandMonth(id);
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    document.getElementById(id)?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  useOpenCourseFromHash(expandMonth);

  const filterControlProps = {
    filters,
    filterOptions,
    isFiltered,
    onChangeFilter: updateListFilter,
    onReset: resetFilters,
  };

  return (
    <div>
      <div ref={fullSearchRef} role="search" aria-label="Søg og filtrer kurser">
        <CourseSearchField value={filters.query} onChange={updateQuery} />
        <CourseFilterControls
          {...filterControlProps}
          className="mt-4 grid grid-cols-2 gap-x-2 gap-y-3 sm:flex sm:flex-wrap sm:items-end"
        />
        <p aria-live="polite" className="mt-3 min-h-5 text-sm text-gray-600">
          {isFiltered && `Viser ${visibleCount} af ${courses.length} kurser`}
        </p>
      </div>

      <CondensedSearchBar
        isVisible={!isFullSearchInView}
        query={filters.query}
        onChangeQuery={updateQuery}
        activeFilterCount={activeFilterCount}
        filterControlProps={filterControlProps}
      />

      <div ref={agendaRef} className="mt-6">
        {monthGroups.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center">
            <p className="font-medium text-[#1f2b28]">
              Ingen kurser matcher din søgning
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Prøv et andet søgeord eller fjern nogle filtre.
            </p>
            <Button variant="outline" className="mt-4" onClick={resetFilters}>
              Nulstil filtre
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {monthGroups.map((group) => (
              <CourseGroupSection
                key={group.id}
                id={group.id}
                label={group.label}
                courses={group.courses}
                isCollapsed={collapsedMonths.has(group.id)}
                onToggle={() => toggleMonth(group.id)}
                providerAbbreviations={providerAbbreviations}
              />
            ))}
          </div>
        )}

        {visiblePastCourses.length > 0 && (
          <CourseGroupSection
            id={PAST_SECTION_ID}
            label="Afholdte kurser"
            courses={visiblePastCourses}
            isCollapsed={collapsedMonths.has(PAST_SECTION_ID)}
            onToggle={() => toggleMonth(PAST_SECTION_ID)}
            providerAbbreviations={providerAbbreviations}
            isPast
            className="mt-12"
          />
        )}
      </div>

      <CourseMonthTimeline
        months={timelineMonths}
        agendaRef={agendaRef}
        onSelectMonth={jumpToMonth}
      >
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-600">
          <p className="font-semibold text-[#1f2b28]">Mangler dit kursus?</p>
          <p className="mt-1">
            Få det på listen, eller giv det ekstra synlighed.
          </p>
          <Link
            href="/om-os#kontakt"
            className="mt-2 inline-flex font-medium text-brand-primary underline-offset-2 hover:underline"
          >
            Kontakt os
          </Link>
        </div>
      </CourseMonthTimeline>
    </div>
  );
}

function CourseGroupSection({
  id,
  label,
  courses,
  isCollapsed,
  onToggle,
  providerAbbreviations,
  isPast = false,
  className,
}: {
  id: string;
  label: string;
  courses: Course[];
  isCollapsed: boolean;
  onToggle: () => void;
  providerAbbreviations: Record<string, string>;
  isPast?: boolean;
  className?: string;
}) {
  const listId = `${id}-kurser`;
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      // html already has scroll-pt-20 (80px) for the site header; this adds the condensed search bar.
      className={cn("scroll-mt-8 sm:scroll-mt-10", className)}
    >
      <h2
        id={`${id}-heading`}
        className="sticky top-28 z-10 mb-3 border-b border-gray-200 bg-brand-cream/95 backdrop-blur-sm sm:top-[7.5rem]"
      >
        <button
          type="button"
          aria-expanded={!isCollapsed}
          aria-controls={listId}
          onClick={onToggle}
          className="flex w-full items-center gap-3 pb-2 pt-3 text-left"
        >
          <span
            className={cn(
              "flex items-center gap-2 text-xl font-semibold",
              isPast ? "text-gray-500" : "text-[#1f2b28]",
            )}
          >
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "h-5 w-5 text-gray-400 transition-transform duration-200 motion-reduce:transition-none",
                isCollapsed && "-rotate-90",
              )}
            />
            {label}
          </span>
          <span className="mt-0.5 text-sm font-normal tabular-nums text-gray-500">
            {courses.length} {courses.length === 1 ? "kursus" : "kurser"}
          </span>
        </button>
      </h2>
      <ul id={listId} hidden={isCollapsed} className="space-y-2">
        {courses.map((course) => (
          <li key={course.id}>
            <CourseItem
              course={course}
              providerAbbreviations={providerAbbreviations}
              isPast={isPast}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

const BADGE_TONES: Record<CourseStatusBadge["tone"], string> = {
  positive: "bg-emerald-50 text-emerald-800",
  warning: "bg-amber-50 text-amber-800",
  muted: "bg-gray-100 text-gray-600",
  neutral: "bg-brand-beige text-[#1f2b28]",
};

function CourseItem({
  course,
  providerAbbreviations,
  isPast = false,
}: {
  course: Course;
  providerAbbreviations: Record<string, string>;
  isPast?: boolean;
}) {
  const anchorId = getCourseAnchorId(course);
  const statusBadge: CourseStatusBadge | null = isPast
    ? { label: "Afholdt", tone: "muted" }
    : getCourseStatusBadge(course);
  const needsReview = course.requires_review && !isPast;
  const publicNote = getPublicCourseNote(course);
  const location = formatCourseLocation(course.location);
  const dateDetails = formatCourseDateDetails(course.date_details);
  const durationDays = getCourseDurationDays(course);
  const duration = durationDays ? formatCourseDuration(durationDays) : null;
  const topics = getCourseTopics(course);
  const providerName = getProviderName(course.provider, providerAbbreviations);

  return (
    <details
      id={anchorId}
      className={cn(
        "group scroll-mt-24 rounded-xl border border-gray-200 transition-colors hover:border-gray-300 open:border-gray-300 target:ring-2 target:ring-brand-primary",
        isPast ? "bg-white/60 text-gray-500 [&_h3]:text-gray-600" : "bg-white",
      )}
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
              {course.type}
            </p>
            <h3 className="mt-0.5 font-semibold leading-snug text-[#1f2b28]">
              {course.title}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1">
                <CalendarDays
                  aria-hidden="true"
                  className="h-3.5 w-3.5 shrink-0 text-gray-400"
                />
                {dateDetails}
                {duration && (
                  <span className="text-gray-500"> · {duration}</span>
                )}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin
                  aria-hidden="true"
                  className="h-3.5 w-3.5 shrink-0 text-gray-400"
                />
                {location}
              </span>
              <span className="inline-flex items-center gap-1">
                <Building2
                  aria-hidden="true"
                  className="h-3.5 w-3.5 shrink-0 text-gray-400"
                />
                Afholdt af {course.provider}
              </span>
            </div>
          </div>
          {(statusBadge || needsReview) && (
            <div className="mt-1.5 flex flex-wrap gap-1.5 sm:mt-0 sm:max-w-[12rem] sm:shrink-0 sm:justify-end">
              {statusBadge && (
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium",
                    BADGE_TONES[statusBadge.tone],
                  )}
                >
                  {statusBadge.label}
                </span>
              )}
              {needsReview && (
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                  Kontrollér hos udbyder
                </span>
              )}
            </div>
          )}
        </div>

        <ChevronDown
          aria-hidden="true"
          className="h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
        />
      </summary>

      <div className="border-t border-gray-100 px-4 pb-5 pt-4">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <CourseDetail label="Format" value={course.format} />
          <CourseDetail label="Emne" value={topics.join(", ")} />
          <CourseDetail
            label="Pris"
            value={course.price_text ?? "Ikke oplyst"}
          />
          {providerName !== course.provider && (
            <CourseDetail label="Udbyder" value={providerName} />
          )}
        </dl>

        {publicNote && (
          <p className="mt-4 text-sm text-gray-700">{publicNote}</p>
        )}

        {needsReview && (
          <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Vi har ikke kunnet bekræfte alle oplysninger direkte hos udbyderen.
            Kontrollér dato, pris og sted, før du tilmelder dig.
          </p>
        )}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:gap-3">
          <Button asChild>
            <a
              href={course.source_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Se kurset hos udbyder
              <ExternalLink aria-hidden="true" className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <CopyLinkButton anchorId={anchorId} />
        </div>
      </div>
    </details>
  );
}

function CourseDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-[#1f2b28]">{value}</dd>
    </div>
  );
}

function CopyLinkButton({ anchorId }: { anchorId: string }) {
  const [hasCopied, setHasCopied] = useState(false);

  async function copyLink() {
    const url = `${window.location.origin}${window.location.pathname}#${anchorId}`;
    window.history.replaceState(null, "", `#${anchorId}`);
    try {
      await navigator.clipboard.writeText(url);
      setHasCopied(true);
      window.setTimeout(() => setHasCopied(false), 2000);
    } catch {
      setHasCopied(false);
    }
  }

  return (
    <Button type="button" variant="outline" onClick={copyLink}>
      <Link2 aria-hidden="true" className="mr-2 h-4 w-4" />
      {hasCopied ? "Link kopieret" : "Kopiér link"}
    </Button>
  );
}

function buildFilterOptions(
  courses: Course[],
  providerAbbreviations: Record<string, string>,
): Record<ListFilterKey, FilterOption[]> {
  const regions = new Set(courses.map(getCourseRegion));
  const typeCounts = new Map<string, number>();
  for (const course of courses) {
    typeCounts.set(course.type, (typeCounts.get(course.type) ?? 0) + 1);
  }

  return {
    regions: (Object.keys(COURSE_REGIONS) as CourseRegion[])
      .filter((key) => regions.has(key))
      .map((key) => ({ value: key, label: COURSE_REGIONS[key] })),
    months: Array.from(
      new Set(courses.map((course) => course.start_date.slice(0, 7))),
    )
      .sort()
      .map((value) => ({ value, label: getMonthLabel(`${value}-01`) })),
    topics: Array.from(new Set(courses.flatMap(getCourseTopics)))
      .sort((a, b) => a.localeCompare(b, "da"))
      .map((value) => ({ value, label: value })),
    types: Array.from(typeCounts.keys())
      .sort((a, b) => (typeCounts.get(b) ?? 0) - (typeCounts.get(a) ?? 0))
      .map((value) => ({ value, label: value })),
    providers: Array.from(new Set(courses.map((course) => course.provider)))
      .map((value) => ({
        value,
        label: getProviderName(value, providerAbbreviations),
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "da")),
  };
}

interface CourseFilterControlsProps {
  filters: CourseFilters;
  filterOptions: Record<ListFilterKey, FilterOption[]>;
  isFiltered: boolean;
  onChangeFilter: (key: ListFilterKey, values: string[]) => void;
  onReset: () => void;
}

function CourseSearchField({
  value,
  onChange,
  isCompact = false,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  isCompact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-gray-500",
          isCompact ? "left-3.5 h-4 w-4" : "left-4 h-5 w-5",
        )}
      />
      <input
        type="search"
        aria-label="Søg efter kurser"
        placeholder={
          isCompact
            ? "Søg i kurser..."
            : "Søg efter kursus, emne eller udbyder..."
        }
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "w-full rounded-full border border-gray-200 bg-white pr-4 text-[#1f2b28] placeholder:text-gray-500 transition-colors hover:border-gray-300 focus:border-brand-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20",
          isCompact ? "h-9 pl-10 text-base sm:text-sm" : "h-12 pl-12 text-base",
        )}
      />
    </div>
  );
}

function CourseFilterControls({
  filters,
  filterOptions,
  isFiltered,
  onChangeFilter,
  onReset,
  id,
  isCompact = false,
  className,
}: CourseFilterControlsProps & {
  id?: string;
  isCompact?: boolean;
  className?: string;
}) {
  return (
    <div id={id} className={className}>
      <CourseMultiSelectFilter
        isCompact={isCompact}
        label="Område"
        allLabel="Hele Danmark"
        options={filterOptions.regions}
        selected={filters.regions}
        onChange={(values) => onChangeFilter("regions", values)}
      />
      <CourseMultiSelectFilter
        isCompact={isCompact}
        label="Dato"
        allLabel={getDateRangeLabel(filterOptions.months)}
        options={filterOptions.months}
        selected={filters.months}
        onChange={(values) => onChangeFilter("months", values)}
      />
      <CourseMultiSelectFilter
        isCompact={isCompact}
        label="Emne"
        allLabel="Alle emner"
        options={filterOptions.topics}
        selected={filters.topics}
        onChange={(values) => onChangeFilter("topics", values)}
      />
      <CourseMultiSelectFilter
        isCompact={isCompact}
        label="Eventtype"
        allLabel="Alle typer"
        options={filterOptions.types}
        selected={filters.types}
        onChange={(values) => onChangeFilter("types", values)}
      />
      <CourseMultiSelectFilter
        isCompact={isCompact}
        label="Udbyder"
        allLabel="Alle udbydere"
        searchPlaceholder="Søg efter udbyder..."
        options={filterOptions.providers}
        selected={filters.providers}
        onChange={(values) => onChangeFilter("providers", values)}
      />
      {isFiltered && (
        <button
          type="button"
          onClick={onReset}
          className={cn(
            "col-span-2 inline-flex items-center justify-center gap-1.5 rounded-full px-3 text-sm font-medium text-brand-primary transition-colors hover:bg-brand-primary/5 sm:col-span-1",
            isCompact ? "h-9" : "h-10",
          )}
        >
          <X aria-hidden="true" className="h-4 w-4" />
          {isCompact ? "Nulstil" : "Nulstil filtre"}
        </button>
      )}
    </div>
  );
}

function CondensedSearchBar({
  isVisible,
  query,
  onChangeQuery,
  activeFilterCount,
  filterControlProps,
}: {
  isVisible: boolean;
  query: string;
  onChangeQuery: (query: string) => void;
  activeFilterCount: number;
  filterControlProps: CourseFilterControlsProps;
}) {
  const [areMobileFiltersOpen, setAreMobileFiltersOpen] = useState(false);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);
  // Stay put while typing, even if a shorter result list scrolls the full search back into view.
  const isShown = isVisible || hasFocusWithin;
  const panelId = "kurser-kompakte-filtre";

  return (
    <div
      role="search"
      aria-label="Kompakt søgning og filtre"
      aria-hidden={!isShown}
      inert={!isShown}
      onFocus={() => setHasFocusWithin(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setHasFocusWithin(false);
        }
      }}
      className={cn(
        "fixed inset-x-0 top-14 z-40 border-b border-gray-200 bg-brand-cream/95 backdrop-blur-sm transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none sm:top-16",
        isShown
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-2 opacity-0",
      )}
    >
      <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-2 px-4 py-2.5">
        <CourseSearchField
          isCompact
          value={query}
          onChange={onChangeQuery}
          className="min-w-0 flex-1"
        />
        <button
          type="button"
          aria-expanded={areMobileFiltersOpen}
          aria-controls={panelId}
          onClick={() => setAreMobileFiltersOpen((open) => !open)}
          className={cn(
            "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border bg-white px-3.5 text-sm font-medium transition-colors sm:hidden",
            activeFilterCount > 0
              ? "border-brand-primary text-brand-primary"
              : "border-gray-200 text-[#1f2b28]",
          )}
        >
          <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
          Filtre
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-brand-primary px-1.5 text-xs tabular-nums text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
        <CourseFilterControls
          {...filterControlProps}
          id={panelId}
          isCompact
          className={cn(
            "w-full grid-cols-2 gap-2 pb-1 sm:flex sm:w-auto sm:items-center sm:pb-0",
            areMobileFiltersOpen ? "grid" : "hidden",
          )}
        />
      </div>
    </div>
  );
}

function getDateRangeLabel(months: FilterOption[]) {
  if (months.length === 0) return "Alle datoer";
  const firstYear = months[0].value.slice(0, 4);
  const lastYear = months[months.length - 1].value.slice(0, 4);
  return firstYear === lastYear
    ? `Hele ${firstYear}`
    : `Hele ${firstYear}–${lastYear}`;
}

function useIsInView(
  ref: React.RefObject<HTMLElement | null>,
  rootMargin: string,
) {
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return isInView;
}

function useOpenCourseFromHash(expandMonth: (id: string) => void) {
  useEffect(() => {
    function openHashTarget() {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const target = document.getElementById(id);
      if (!(target instanceof HTMLDetailsElement)) return;

      const monthId = target.closest("section")?.id;
      if (monthId) expandMonth(monthId);
      target.open = true;
      window.requestAnimationFrame(() =>
        target.scrollIntoView({ block: "start" }),
      );
    }

    openHashTarget();
    window.addEventListener("hashchange", openHashTarget);
    return () => window.removeEventListener("hashchange", openHashTarget);
  }, [expandMonth]);
}
