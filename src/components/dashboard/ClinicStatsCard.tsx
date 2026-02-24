// Dashboard component showing analytics stats for a single clinic
// Fetches data via server action and displays key metrics

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Eye, Phone, Globe, Mail, CalendarCheck } from "lucide-react";
import {
  getClinicAnalytics,
  type ClinicStats,
} from "@/app/actions/clinic-analytics";

interface ClinicStatsCardProps {
  clinicId: string;
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

const StatItem = ({ icon, label, value }: StatItemProps) => (
  <div className="flex items-center gap-2">
    <div className="rounded-md bg-gray-50 p-1.5 text-gray-400">
      {icon}
    </div>
    <span className="text-sm font-semibold text-gray-900 tabular-nums">
      {value.toLocaleString("da-DK")}
    </span>
    <span className="text-sm text-gray-500">{label}</span>
  </div>
);

export const ClinicStatsCard = ({ clinicId }: ClinicStatsCardProps) => {
  const [stats, setStats] = useState<ClinicStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const result = await getClinicAnalytics(clinicId);

        if (result.error) {
          setHasError(true);
          return;
        }

        setStats(result.stats || null);
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [clinicId]);

  const hasAnyData =
    !hasError &&
    stats &&
    (stats.profileViews > 0 ||
      stats.listImpressions > 0 ||
      stats.totalContactClicks > 0);

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Aktivitet</CardTitle>
          {hasAnyData && (
            <span className="text-xs text-gray-400">Sidste 30 dage</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Spinner size="md" className="text-gray-400" />
          </div>
        ) : hasAnyData ? (
          <div className="space-y-3">
            {/* Visninger — merged section with total */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-gray-50 p-1.5 text-gray-400">
                  <Eye className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold text-gray-900 tabular-nums">
                  {(stats.listImpressions + stats.profileViews).toLocaleString("da-DK")}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  Visninger
                </span>
              </div>
              <div className="flex items-center gap-2 pl-9">
                <span className="text-sm tabular-nums text-gray-500">
                  {stats.listImpressions.toLocaleString("da-DK")}
                </span>
                <span className="text-sm text-gray-400">
                  i søgeresultater
                </span>
              </div>
              <div className="flex items-center gap-2 pl-9">
                <span className="text-sm tabular-nums text-gray-500">
                  {stats.profileViews.toLocaleString("da-DK")}
                </span>
                <span className="text-sm text-gray-400">
                  på kliniksiden
                </span>
              </div>
            </div>

            {/* Contact metrics — single column */}
            <div className="space-y-2 pt-1">
              <StatItem
                icon={<Phone className="h-4 w-4" />}
                label="Vist tlf nummer"
                value={stats.phoneClicks}
              />
              <StatItem
                icon={<Globe className="h-4 w-4" />}
                label="Website klik"
                value={stats.websiteClicks}
              />
              <StatItem
                icon={<Mail className="h-4 w-4" />}
                label="Email klik"
                value={stats.emailClicks}
              />
              {stats.bookingClicks > 0 && (
                <StatItem
                  icon={<CalendarCheck className="h-4 w-4" />}
                  label="Booking klik"
                  value={stats.bookingClicks}
                />
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 py-2">
            Vi har ingen data på din klinik endnu.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
