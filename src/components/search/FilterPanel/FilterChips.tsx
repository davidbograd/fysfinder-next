"use client";

import React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FilterChip {
  id: string;
  label: string;
  value: string;
  onRemove: () => void;
}

interface FilterChipsProps {
  filters: FilterChip[];
  onClearAll?: () => void;
  className?: string;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  onClearAll,
  className = "",
}) => {
  if (filters.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-600 font-medium">Active filters:</span>

      {filters.map((filter) => (
        <Badge
          key={filter.id}
          variant="secondary"
          className="flex items-center gap-1 pr-1 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
        >
          <span className="text-xs">{filter.label}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={filter.onRemove}
            className="h-4 w-4 p-0 hover:bg-blue-200 rounded-full"
            aria-label={`Remove ${filter.label} filter`}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}

      {filters.length > 0 && onClearAll && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearAll}
          className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 border-gray-200 hover:border-gray-300"
        >
          Clear all
        </Button>
      )}
    </div>
  );
};
