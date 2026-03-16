// Admin-only aggregate analytics across all clinics
// Shows platform-wide event totals for the last 30 days

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Eye, Phone, Globe, Mail, CalendarCheck, Activity } from "lucide-react";
import {
  getAggregateAnalytics,
  type AggregateAnalytics,
} from "@/app/actions/admin-stats";

interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  label: string;
}

const StatItem = ({ icon, value, label }: StatItemProps) => (
  <div className="flex items-center gap-2">
    <div className="rounded-md bg-gray-50 p-1.5 text-gray-400">{icon}</div>
    <span className="text-sm font-semibold text-gray-900 tabular-nums">
      {value.toLocaleString("da-DK")}
    </span>
    <span className="text-sm text-gray-500">{label}</span>
  </div>
);

export const AdminAnalyticsSection = () => {
  const [stats, setStats] = useState<AggregateAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const result = await getAggregateAnalytics();
        if (!result.error && result.stats) {
          setStats(result.stats);
        }
      } catch {
        // Silently fail — admin section is non-critical
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">
              Platform aktivitet
            </CardTitle>
          </div>
          <span className="text-xs text-gray-400">Sidste 30 dage</span>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Spinner size="md" className="text-gray-400" />
          </div>
        ) : stats ? (
          <div className="space-y-4">
            {/* Summary row */}
            <div className="flex items-center gap-6 pb-3 border-b border-gray-100">
              <div>
                <p className="text-2xl font-bold text-gray-900 tabular-nums">
                  {stats.totalEvents.toLocaleString("da-DK")}
                </p>
                <p className="text-xs text-gray-500">events total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 tabular-nums">
                  {stats.uniqueClinicsWithEvents.toLocaleString("da-DK")}
                </p>
                <p className="text-xs text-gray-500">klinikker med aktivitet</p>
              </div>
            </div>

            {/* Visninger */}
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
                <span className="text-sm text-gray-400">i søgeresultater</span>
              </div>
              <div className="flex items-center gap-2 pl-9">
                <span className="text-sm tabular-nums text-gray-500">
                  {stats.profileViews.toLocaleString("da-DK")}
                </span>
                <span className="text-sm text-gray-400">på kliniksider</span>
              </div>
            </div>

            {/* Contact metrics */}
            <div className="space-y-2">
              <StatItem
                icon={<Phone className="h-4 w-4" />}
                value={stats.phoneClicks}
                label="Vist tlf nummer"
              />
              <StatItem
                icon={<Globe className="h-4 w-4" />}
                value={stats.websiteClicks}
                label="Website klik"
              />
              <StatItem
                icon={<Mail className="h-4 w-4" />}
                value={stats.emailClicks}
                label="Email klik"
              />
              {stats.bookingClicks > 0 && (
                <StatItem
                  icon={<CalendarCheck className="h-4 w-4" />}
                  value={stats.bookingClicks}
                  label="Booking klik"
                />
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 py-2">
            Ingen analytics data endnu.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
