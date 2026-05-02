// Admin-only aggregate analytics across all clinics
// Shows platform-wide event totals for the last 30 days

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Eye, Activity, TrendingUp } from "lucide-react";
import {
  getAggregateAnalytics,
  type AggregateAnalytics,
} from "@/app/actions/admin-stats";
import { AdminSuburbLeadsSection } from "@/components/dashboard/AdminSuburbLeadsSection";

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
            <div className="flex items-center gap-6 border-b border-gray-100 pb-3">
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
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 text-left">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-gray-50 p-1.5 text-gray-400">
                    <Eye className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Visninger</span>
                </div>
                <p className="mt-3 text-3xl font-bold text-gray-900 tabular-nums">
                  {(stats.listImpressions + stats.profileViews).toLocaleString("da-DK")}
                </p>
                <div className="mt-3 space-y-1.5 pl-1 text-sm">
                  <p className="text-gray-500">
                    <span className="font-semibold text-gray-700 tabular-nums">
                      {stats.listImpressions.toLocaleString("da-DK")}
                    </span>{" "}
                    i søgeresultater
                  </p>
                  <p className="text-gray-500">
                    <span className="font-semibold text-gray-700 tabular-nums">
                      {stats.profileViews.toLocaleString("da-DK")}
                    </span>{" "}
                    på kliniksider
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 text-left">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-gray-50 p-1.5 text-gray-400">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Lead klik</span>
                </div>
                <p className="mt-3 text-3xl font-bold text-gray-900 tabular-nums">
                  {(
                    stats.phoneClicks +
                    stats.websiteClicks +
                    stats.emailClicks +
                    stats.bookingClicks
                  ).toLocaleString("da-DK")}
                </p>
                <div className="mt-3 space-y-1.5 pl-1 text-sm">
                  <p className="text-gray-500">
                    <span className="font-semibold text-gray-700 tabular-nums">
                      {stats.phoneClicks.toLocaleString("da-DK")}
                    </span>{" "}
                    vist tlf nummer
                  </p>
                  <p className="text-gray-500">
                    <span className="font-semibold text-gray-700 tabular-nums">
                      {stats.websiteClicks.toLocaleString("da-DK")}
                    </span>{" "}
                    website klik
                  </p>
                  <p className="text-gray-500">
                    <span className="font-semibold text-gray-700 tabular-nums">
                      {stats.emailClicks.toLocaleString("da-DK")}
                    </span>{" "}
                    email klik
                  </p>
                  {stats.bookingClicks > 0 && (
                    <p className="text-gray-500">
                      <span className="font-semibold text-gray-700 tabular-nums">
                        {stats.bookingClicks.toLocaleString("da-DK")}
                      </span>{" "}
                      booking klik
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <AdminSuburbLeadsSection variant="inline" />
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
