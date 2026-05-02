"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getSuburbAnalytics, type SuburbAnalyticsRow } from "@/app/actions/admin-stats";
import { useToast } from "@/hooks/use-toast";

export const AdminSuburbLeadsSection = () => {
  const [rows, setRows] = useState<SuburbAnalyticsRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadRows = async () => {
      try {
        setIsLoading(true);
        const result = await getSuburbAnalytics(30, { limit: 10 });
        if (result.error) {
          toast({
            title: "Fejl",
            description: result.error,
            variant: "destructive",
          });
          return;
        }

        setRows(result.rows || []);
      } catch (error) {
        console.error("Error loading suburb analytics:", error);
        toast({
          title: "Fejl",
          description: "Kunne ikke hente bydata",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadRows();
  }, [toast]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Top bydele efter lead klik
            </CardTitle>
            <CardDescription>Sidste 30 dage</CardDescription>
          </div>
          <Button asChild type="button" size="sm" variant="outline" className="rounded-full">
            <Link href="/dashboard/admin/suburb-analytics">Se alle</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Spinner size="md" className="text-gray-400" />
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-500">Ingen bydata endnu.</p>
        ) : (
          <div className="space-y-2">
            {rows.map((row, index) => (
              <div
                key={row.suburb}
                className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 text-xs font-semibold text-gray-500 tabular-nums">
                    {index + 1}.
                  </span>
                  <span className="text-sm font-medium text-gray-900">{row.suburb}</span>
                </div>
                <span className="text-sm font-semibold tabular-nums text-gray-900">
                  {row.leadClicks.toLocaleString("da-DK")}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
