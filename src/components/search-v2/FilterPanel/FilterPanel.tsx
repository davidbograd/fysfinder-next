"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterToggle } from "./FilterToggle";
import { FilterChips } from "./FilterChips";

interface FilterPanelProps {
  // Filter values
  ydernummer: boolean;
  handicapAccess: boolean;

  // Filter change handlers
  onYdernummerChange: (value: boolean) => void;
  onHandicapAccessChange: (value: boolean) => void;
  onClearAllFilters: () => void;

  // Instant filter updates (optional - for non-search context use)
  instantUpdate?: boolean;

  // UI state
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  ydernummer,
  handicapAccess,
  onYdernummerChange,
  onHandicapAccessChange,
  onClearAllFilters,
  isCollapsed = false,
  onToggleCollapse,
  className = "",
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(isCollapsed);

  const collapsed = onToggleCollapse ? isCollapsed : internalCollapsed;
  const toggleCollapse =
    onToggleCollapse || (() => setInternalCollapsed(!internalCollapsed));

  // Create filter chips for active filters
  const activeFilters = [];
  if (ydernummer) {
    activeFilters.push({
      id: "ydernummer",
      label: "Ydernummer",
      value: "true",
      onRemove: () => onYdernummerChange(false),
    });
  }
  if (handicapAccess) {
    activeFilters.push({
      id: "handicap",
      label: "Handicap Access",
      value: "true",
      onRemove: () => onHandicapAccessChange(false),
    });
  }

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {activeFilters.length}
              </span>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapse}
            className="h-8 w-8 p-0"
            aria-label={collapsed ? "Expand filters" : "Collapse filters"}
          >
            {collapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Show filter chips even when collapsed */}
        {hasActiveFilters && (
          <FilterChips
            filters={activeFilters}
            onClearAll={onClearAllFilters}
            className="mt-2"
          />
        )}
      </CardHeader>

      {!collapsed && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            <FilterToggle
              id="ydernummer"
              label="Ydernummer"
              description="Show only clinics that accept public insurance"
              value={ydernummer}
              onChange={onYdernummerChange}
            />

            <FilterToggle
              id="handicap-access"
              label="Handicap Access"
              description="Show only clinics with wheelchair accessibility"
              value={handicapAccess}
              onChange={onHandicapAccessChange}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
};
