"use client";

import { useId } from "react";
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
              variant={isSelected ? "default" : "outline"}
              aria-pressed={isSelected}
              onClick={() => onChange(option.value)}
              className={cn(
                "min-w-[6rem] flex-1",
                isSelected &&
                  "bg-brand-primary text-white hover:bg-brand-primary/90",
                error && !isSelected && "border-red-400"
              )}
            >
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
