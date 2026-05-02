"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getSuburbAnalytics, type SuburbAnalyticsRow } from "@/app/actions/admin-stats";
import { useToast } from "@/hooks/use-toast";

interface AdminSuburbLeadsSectionProps {
  variant?: "card" | "inline";
}

export const AdminSuburbLeadsSection = ({
  variant = "card",
}: AdminSuburbLeadsSectionProps) => {
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

  const titleRow = (
    <div className="flex items-center justify-between gap-3">
      <CardTitle className="flex items-center gap-2 text-base">
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
        Top bydele efter lead klik
      </CardTitle>
    </div>
  );

  const tableContent = isLoading ? (
    <div className="flex items-center justify-center py-6">
      <Spinner size="md" className="text-gray-400" />
    </div>
  ) : rows.length === 0 ? (
    <p className="text-sm text-gray-500">Ingen bydata endnu.</p>
  ) : (
    <div className="space-y-2">
      <div className="grid grid-cols-[minmax(0,1fr)_88px_72px_78px_64px] gap-2 px-3 text-xs font-medium uppercase tracking-wide text-gray-500">
        <span>Bydel</span>
        <span className="text-right">Lead klik</span>
        <span className="text-right">Tlf</span>
        <span className="text-right">Website</span>
        <span className="text-right">Email</span>
      </div>
      {rows.map((row, index) => (
        <div
          key={row.suburb}
          className="grid grid-cols-[minmax(0,1fr)_88px_72px_78px_64px] items-center gap-2 rounded-lg border border-gray-100 px-3 py-2"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="w-5 shrink-0 text-right text-xs font-semibold text-gray-500 tabular-nums">
              {index + 1}.
            </span>
            <span className="truncate text-sm font-medium text-gray-900">{row.suburb}</span>
          </div>
          <span className="text-right text-sm font-semibold tabular-nums text-gray-900">
            {row.leadClicks.toLocaleString("da-DK")}
          </span>
          <span className="text-right text-sm tabular-nums text-gray-700">
            {row.phoneClicks.toLocaleString("da-DK")}
          </span>
          <span className="text-right text-sm tabular-nums text-gray-700">
            {row.websiteClicks.toLocaleString("da-DK")}
          </span>
          <span className="text-right text-sm tabular-nums text-gray-700">
            {row.emailClicks.toLocaleString("da-DK")}
          </span>
        </div>
      ))}
      <Button
        asChild
        type="button"
        size="sm"
        className="mt-3 rounded-full bg-brand-primary text-white hover:bg-brand-primary/90"
      >
        <Link href="/dashboard/admin/suburb-analytics">Se alle</Link>
      </Button>
    </div>
  );

  if (variant === "inline") {
    return (
      <div className="space-y-4">
        {titleRow}
        {tableContent}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">{titleRow}</CardHeader>
      <CardContent>{tableContent}</CardContent>
    </Card>
  );
};
