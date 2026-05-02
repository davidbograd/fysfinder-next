"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { SuburbAnalyticsRow } from "@/app/actions/admin-stats";

type SortKey =
  | "leadClicks"
  | "phoneClicks"
  | "websiteClicks"
  | "emailClicks"
  | "bookingClicks"
  | "views";
type SortDirection = "asc" | "desc";
type BreakdownKey = "phoneClicks" | "websiteClicks" | "emailClicks" | "bookingClicks";

interface AdminSuburbAnalyticsTableProps {
  rows: SuburbAnalyticsRow[];
}

const formatNumber = (value: number) => value.toLocaleString("da-DK");

const BREAKDOWN_COLUMNS: Array<{ key: BreakdownKey; label: string }> = [
  { key: "phoneClicks", label: "Telefon" },
  { key: "websiteClicks", label: "Website" },
  { key: "emailClicks", label: "Email" },
  { key: "bookingClicks", label: "Booking" },
];

export const AdminSuburbAnalyticsTable = ({ rows }: AdminSuburbAnalyticsTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>("leadClicks");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [visibleBreakdownColumns, setVisibleBreakdownColumns] = useState<
    Record<BreakdownKey, boolean>
  >({
    phoneClicks: true,
    websiteClicks: true,
    emailClicks: true,
    bookingClicks: true,
  });

  const handleSort = (nextKey: SortKey) => {
    if (sortKey === nextKey) {
      setSortDirection((currentDirection) =>
        currentDirection === "desc" ? "asc" : "desc"
      );
      return;
    }

    setSortKey(nextKey);
    setSortDirection("desc");
  };

  const handleToggleBreakdownColumn = (key: BreakdownKey) => {
    setVisibleBreakdownColumns((currentColumns) => ({
      ...currentColumns,
      [key]: !currentColumns[key],
    }));
  };

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const multiplier = sortDirection === "desc" ? -1 : 1;
      const valueDifference = (a[sortKey] - b[sortKey]) * multiplier;
      if (valueDifference !== 0) {
        return valueDifference;
      }

      return a.suburb.localeCompare(b.suburb, "da");
    });
  }, [rows, sortDirection, sortKey]);

  const renderSortIndicator = (key: SortKey) => {
    if (sortKey !== key) {
      return null;
    }

    if (sortDirection === "desc") {
      return <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />;
    }

    return <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />;
  };

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, row) => ({
          leadClicks: acc.leadClicks + row.leadClicks,
          phoneClicks: acc.phoneClicks + row.phoneClicks,
          websiteClicks: acc.websiteClicks + row.websiteClicks,
          emailClicks: acc.emailClicks + row.emailClicks,
          bookingClicks: acc.bookingClicks + row.bookingClicks,
          views: acc.views + row.views,
        }),
        {
          leadClicks: 0,
          phoneClicks: 0,
          websiteClicks: 0,
          emailClicks: 0,
          bookingClicks: 0,
          views: 0,
        }
      ),
    [rows]
  );

  if (rows.length === 0) {
    return <p className="text-sm text-gray-500">Ingen bydata endnu.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Vis kolonner:</span>
        {BREAKDOWN_COLUMNS.map((column) => (
          <label
            key={column.key}
            className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
          >
            <Checkbox
              checked={visibleBreakdownColumns[column.key]}
              className="rounded-none"
              onCheckedChange={() => handleToggleBreakdownColumn(column.key)}
              aria-label={`Vis ${column.label}`}
            />
            <span>{column.label}</span>
          </label>
        ))}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bydel</TableHead>
            <TableHead>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto rounded-full px-0 py-0 text-white hover:bg-transparent hover:text-white"
                onClick={() => handleSort("leadClicks")}
              >
                <span>Lead klik</span>
                <span className="ml-1">{renderSortIndicator("leadClicks")}</span>
              </Button>
            </TableHead>
            {BREAKDOWN_COLUMNS.map((column) =>
              visibleBreakdownColumns[column.key] ? (
                <TableHead key={column.key}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto rounded-full px-0 py-0 text-white hover:bg-transparent hover:text-white"
                    onClick={() => handleSort(column.key)}
                  >
                    <span>{column.label}</span>
                    <span className="ml-1">{renderSortIndicator(column.key)}</span>
                  </Button>
                </TableHead>
              ) : null
            )}
            <TableHead>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto rounded-full px-0 py-0 text-white hover:bg-transparent hover:text-white"
                onClick={() => handleSort("views")}
              >
                <span>Visninger</span>
                <span className="ml-1">{renderSortIndicator("views")}</span>
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRows.map((row) => (
            <TableRow key={row.suburb}>
              <TableCell className="font-medium">{row.suburb}</TableCell>
              <TableCell className="tabular-nums">{formatNumber(row.leadClicks)}</TableCell>
              {BREAKDOWN_COLUMNS.map((column) =>
                visibleBreakdownColumns[column.key] ? (
                  <TableCell key={column.key} className="tabular-nums">
                    {formatNumber(row[column.key])}
                  </TableCell>
                ) : null
              )}
              <TableCell className="tabular-nums">{formatNumber(row.views)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell className="tabular-nums">{formatNumber(totals.leadClicks)}</TableCell>
            {BREAKDOWN_COLUMNS.map((column) =>
              visibleBreakdownColumns[column.key] ? (
                <TableCell key={column.key} className="tabular-nums">
                  {formatNumber(totals[column.key])}
                </TableCell>
              ) : null
            )}
            <TableCell className="tabular-nums">{formatNumber(totals.views)}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};
