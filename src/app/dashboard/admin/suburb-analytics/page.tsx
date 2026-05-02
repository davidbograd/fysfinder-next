import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/app/utils/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { getSuburbAnalytics } from "@/app/actions/admin-stats";
import { AdminSuburbAnalyticsTable } from "@/components/dashboard/AdminSuburbAnalyticsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Bydels-analytics",
};

const DAY_RANGE_OPTIONS = [
  { value: "7", label: "7d" },
  { value: "30", label: "30d" },
  { value: "90", label: "90d" },
  { value: "all", label: "All time" },
] as const;

const parseDaysFilter = (value?: string): 7 | 30 | 90 | "all" => {
  if (value === "7") return 7;
  if (value === "90") return 90;
  if (value === "all") return "all";
  return 30;
};

const formatPeriodDate = (dateIso: string | null) => {
  if (!dateIso) return null;

  return new Intl.DateTimeFormat("da-DK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateIso));
};

interface AdminSuburbAnalyticsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminSuburbAnalyticsPage({
  searchParams,
}: AdminSuburbAnalyticsPageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedRange = parseDaysFilter(
    typeof resolvedSearchParams.days === "string" ? resolvedSearchParams.days : undefined
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

  const result = await getSuburbAnalytics(selectedRange === "all" ? null : selectedRange);
  const rows = result.rows || [];
  const formattedStartDate = formatPeriodDate(result.period?.startDate || null);
  const formattedEndDate = formatPeriodDate(result.period?.endDate || null);
  const periodLabel =
    formattedStartDate && formattedEndDate
      ? `${formattedStartDate} - ${formattedEndDate}`
      : selectedRange === "all"
        ? "all time"
        : `sidste ${selectedRange} dage`;

  return (
    <div className="w-full py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Bydels-analytics</h1>
        <p className="mt-2 text-sm text-gray-600">
          Sorter tabellen ved at klikke på kolonne-overskrifterne for Lead klik eller Visninger.
        </p>
      </div>

      <Card className="w-full lg:max-w-[66.666%]">
        <CardHeader>
          <div className="flex flex-col gap-3">
            <div>
              <CardTitle>Alle bydele</CardTitle>
              <p className="mt-2 flex flex-wrap items-center gap-1.5 text-sm text-gray-600">
                <span className="rounded-full bg-brand-beige px-2 py-0.5 font-medium text-gray-900">
                  {rows.length.toLocaleString("da-DK")} bydele
                </span>
                <span>med aktivitet i perioden</span>
                <span className="rounded-full bg-brand-beige px-2 py-0.5 font-medium text-gray-900">
                  {periodLabel}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {DAY_RANGE_OPTIONS.map((option) => {
                const isActive = String(selectedRange) === option.value;
                return (
                  <Button
                    key={option.value}
                    asChild
                    type="button"
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    className="rounded-full"
                  >
                    <Link href={`/dashboard/admin/suburb-analytics?days=${option.value}`}>
                      {option.label}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AdminSuburbAnalyticsTable rows={rows} />
        </CardContent>
      </Card>
    </div>
  );
}
