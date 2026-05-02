import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/app/utils/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import {
  getClinicAdminAnalytics,
  getSuburbAnalytics,
  type ClinicAdminAnalyticsRow,
  type SuburbAnalyticsRow,
} from "@/app/actions/admin-stats";
import { AdminClinicAnalyticsTable } from "@/components/dashboard/AdminClinicAnalyticsTable";
import { AdminSuburbAnalyticsTable } from "@/components/dashboard/AdminSuburbAnalyticsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Aktivitets data",
};

const ANALYTICS_PATH = "/dashboard/admin/analytics";

const DAY_RANGE_OPTIONS = [
  { value: 7, label: "7d" },
  { value: 30, label: "30d" },
  { value: 90, label: "90d" },
  { value: "all", label: "All time" },
] as const;

const VIEW_OPTIONS = [
  { value: "suburb", label: "Bydele" },
  { value: "clinic", label: "Klinikker" },
] as const;

const parseDaysFilter = (value?: string): 7 | 30 | 90 | "all" => {
  if (value === "7") return 7;
  if (value === "90") return 90;
  if (value === "all") return "all";
  return 30;
};

const parseViewFilter = (value?: string): "suburb" | "clinic" => {
  if (value === "clinic") return "clinic";
  return "suburb";
};

const parseVerifiedFilter = (value?: string) => value === "1" || value === "true";

const buildAnalyticsHref = ({
  days,
  view,
  verifiedOnly = false,
}: {
  days: 7 | 30 | 90 | "all";
  view: "suburb" | "clinic";
  verifiedOnly?: boolean;
}) => {
  const params = new URLSearchParams({
    days: String(days),
    view,
  });

  if (view === "clinic" && verifiedOnly) {
    params.set("verified", "1");
  }

  return `${ANALYTICS_PATH}?${params.toString()}`;
};

const formatPeriodDate = (dateIso: string | null) => {
  if (!dateIso) return null;

  return new Intl.DateTimeFormat("da-DK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateIso));
};

interface AdminAnalyticsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminAnalyticsPage({
  searchParams,
}: AdminAnalyticsPageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedRange = parseDaysFilter(
    typeof resolvedSearchParams.days === "string" ? resolvedSearchParams.days : undefined
  );
  const selectedView = parseViewFilter(
    typeof resolvedSearchParams.view === "string" ? resolvedSearchParams.view : undefined
  );
  const selectedVerifiedOnly =
    selectedView === "clinic" &&
    parseVerifiedFilter(
      typeof resolvedSearchParams.verified === "string" ? resolvedSearchParams.verified : undefined
    );

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  const selectedDays = selectedRange === "all" ? null : selectedRange;
  const result =
    selectedView === "clinic"
      ? await getClinicAdminAnalytics(selectedDays, { verifiedOnly: selectedVerifiedOnly })
      : await getSuburbAnalytics(selectedDays);
  const rows = result.rows || [];
  const formattedStartDate = formatPeriodDate(result.period?.startDate || null);
  const formattedEndDate = formatPeriodDate(result.period?.endDate || null);
  const periodLabel =
    formattedStartDate && formattedEndDate
      ? `${formattedStartDate} - ${formattedEndDate}`
      : selectedRange === "all"
        ? "all time"
        : `sidste ${selectedRange} dage`;
  const cardTitle = selectedView === "clinic" ? "Alle klinikker" : "Alle bydele";
  const countLabel = selectedView === "clinic" ? "klinikker" : "bydele";

  return (
    <div className="w-full py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Aktivitets data</h1>
        <p className="mt-2 text-sm text-gray-600">
          Se aktivitet fordelt på bydele eller klinikker. Sorter tabellen ved at klikke på
          kolonneoverskrifterne for lead klik eller visninger.
        </p>
      </div>

      <Card className="w-full lg:max-w-[66.666%]">
        <CardHeader>
          <div className="flex flex-col gap-3">
            <div>
              <CardTitle>{cardTitle}</CardTitle>
              <p className="mt-2 flex flex-wrap items-center gap-1.5 text-sm text-gray-600">
                <span className="rounded-full bg-brand-beige px-2 py-0.5 font-medium text-gray-900">
                  {rows.length.toLocaleString("da-DK")} {countLabel}
                </span>
                <span>med aktivitet i perioden</span>
                <span className="rounded-full bg-brand-beige px-2 py-0.5 font-medium text-gray-900">
                  {periodLabel}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {VIEW_OPTIONS.map((option) => {
                const isActive = selectedView === option.value;
                return (
                  <Button
                    key={option.value}
                    asChild
                    type="button"
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    className="rounded-full"
                  >
                    <Link
                      href={buildAnalyticsHref({
                        days: selectedRange,
                        view: option.value,
                        verifiedOnly: option.value === "clinic" && selectedVerifiedOnly,
                      })}
                    >
                      {option.label}
                    </Link>
                  </Button>
                );
              })}
            </div>
            {selectedView === "clinic" ? (
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={buildAnalyticsHref({
                    days: selectedRange,
                    view: "clinic",
                    verifiedOnly: !selectedVerifiedOnly,
                  })}
                  role="checkbox"
                  aria-checked={selectedVerifiedOnly}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-none border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      selectedVerifiedOnly
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-transparent"
                    )}
                    aria-hidden="true"
                  >
                    {selectedVerifiedOnly ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                  </span>
                  <span>Kun verified</span>
                </a>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {DAY_RANGE_OPTIONS.map((option) => {
                const isActive = selectedRange === option.value;
                return (
                  <Button
                    key={option.value}
                    asChild
                    type="button"
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    className="rounded-full"
                  >
                    <Link
                      href={buildAnalyticsHref({
                        days: option.value,
                        view: selectedView,
                        verifiedOnly: selectedVerifiedOnly,
                      })}
                    >
                      {option.label}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selectedView === "clinic" ? (
            <AdminClinicAnalyticsTable rows={rows as ClinicAdminAnalyticsRow[]} />
          ) : (
            <AdminSuburbAnalyticsTable rows={rows as SuburbAnalyticsRow[]} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
