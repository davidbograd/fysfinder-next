"use client";

import { useId } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ToolChoice<TValue extends string> {
  value: TValue;
  label: string;
}

interface ToolChoiceGroupProps<TValue extends string> {
  label: string;
  options: ToolChoice<TValue>[];
  value: TValue | "";
  onChange: (value: TValue) => void;
  /** Vises under knapperne, når der ikke er valgt noget ved beregning. */
  error?: string;
  className?: string;
}

export function ToolChoiceGroup<TValue extends string>({
  label,
  options,
  value,
  onChange,
  error,
  className,
}: ToolChoiceGroupProps<TValue>) {
  const labelId = useId();
  const errorId = `${labelId}-error`;

  return (
    <div className={cn("space-y-2", className)}>
      <span
        id={labelId}
        className="block text-sm font-medium leading-none text-gray-900"
      >
        {label}
      </span>
      <div
        role="group"
        aria-labelledby={labelId}
        aria-describedby={error ? errorId : undefined}
        className="flex flex-wrap gap-2"
      >
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <Button
              key={option.value}
              type="button"
              variant="outline"
              aria-pressed={isSelected}
              onClick={() => onChange(option.value)}
              className={cn(
                "min-w-[6rem] flex-1 gap-0 transition-colors duration-200",
                isSelected &&
                  "border-gray-800 bg-gray-800 text-white hover:bg-gray-800/90 hover:text-white",
                error && !isSelected && "border-red-400"
              )}
            >
              <span
                aria-hidden
                data-selected-check={isSelected ? "visible" : "hidden"}
                className={cn(
                  "inline-flex shrink-0 overflow-hidden transition-[width,margin,opacity,transform] duration-200 ease-out motion-reduce:transition-none",
                  isSelected
                    ? "mr-1.5 w-4 scale-100 opacity-100"
                    : "mr-0 w-0 scale-50 opacity-0"
                )}
              >
                <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} />
              </span>
              {option.label}
            </Button>
          );
        })}
      </div>
      {error && (
        <p id={errorId} className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
