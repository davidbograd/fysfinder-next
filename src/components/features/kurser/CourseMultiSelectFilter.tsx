// Updated: 2026-10-10 - Added compact variant (visually hidden label, smaller trigger) for the condensed sticky filter bar.
"use client";

import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

interface CourseMultiSelectFilterProps {
  isCompact?: boolean;
  label: string;
  allLabel: string;
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function CourseMultiSelectFilter({
  isCompact = false,
  label,
  allLabel,
  options,
  selected,
  onChange,
}: CourseMultiSelectFilterProps) {
  const labelId = useId();
  const valueId = useId();
  const selectedOptions = options.filter((option) =>
    selected.includes(option.value),
  );
  const isActive = selectedOptions.length > 0;
  const summary =
    selectedOptions.length === 0
      ? allLabel
      : selectedOptions.length === 1
        ? selectedOptions[0].label
        : `${selectedOptions[0].label} +${selectedOptions.length - 1}`;

  function toggle(value: string, isChecked: boolean) {
    onChange(
      isChecked
        ? [...selected, value]
        : selected.filter((current) => current !== value),
    );
  }

  return (
    <div className="min-w-0">
      <span
        id={labelId}
        className={
          isCompact
            ? "sr-only"
            : "mb-1 block pl-1 text-xs font-medium text-gray-600"
        }
      >
        {label}
      </span>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-labelledby={`${labelId} ${valueId}`}
            className={cn(
              "flex w-full items-center justify-between gap-2 rounded-full border bg-white pl-4 pr-3 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20",
              isCompact ? "h-9 sm:w-auto sm:max-w-40" : "h-10 sm:w-40",
              isActive
                ? "border-brand-primary bg-brand-primary/5 font-medium text-brand-primary"
                : "border-gray-200 text-[#1f2b28] hover:border-gray-300",
            )}
          >
            <span id={valueId} className="truncate">
              {summary}
            </span>
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "h-4 w-4 shrink-0",
                isActive ? "text-brand-primary" : "text-gray-500",
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent className="max-h-80 w-72 overflow-y-auto">
          <fieldset>
            <legend className="sr-only">{label}</legend>
            {options.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-[#1f2b28] hover:bg-brand-beige"
              >
                <Checkbox
                  checked={selected.includes(option.value)}
                  onCheckedChange={(checked) =>
                    toggle(option.value, checked === true)
                  }
                  className="rounded border-gray-300 data-[state=checked]:border-brand-primary data-[state=checked]:bg-brand-primary"
                />
                {option.label}
              </label>
            ))}
          </fieldset>
          {isActive && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="mt-1 w-full rounded-full px-3 py-2 text-sm font-medium text-brand-primary transition-colors hover:bg-brand-primary/5"
            >
              Ryd valg
            </button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
