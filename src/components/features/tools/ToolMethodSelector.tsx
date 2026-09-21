"use client";

import { useId } from "react";
import { Gauge, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToolMethodOption<TValue extends string> {
  value: TValue;
  title: string;
  description: string;
  /** Hvor besværlig metoden er, fx "Nem" eller "Kræver en hård test". */
  effort?: string;
  /** Hvor præcist resultatet bliver, fx "Mest præcis". */
  precision?: string;
}

interface ToolMethodSelectorProps<TValue extends string> {
  label: string;
  options: ToolMethodOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  className?: string;
}

function MethodTag({
  icon: Icon,
  children,
  isSelected,
}: {
  icon: typeof Gauge;
  children: string;
  isSelected: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium ring-1",
        isSelected
          ? "text-brand-primary ring-brand-primary/20"
          : "text-gray-600 ring-gray-200"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}

export function ToolMethodSelector<TValue extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: ToolMethodSelectorProps<TValue>) {
  const groupName = useId();

  return (
    <fieldset className={cn("space-y-3", className)}>
      <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer flex-col gap-2 rounded-xl border-2 p-4 transition-colors motion-reduce:transition-none",
                "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2",
                isSelected
                  ? "border-brand-primary bg-brand-beige"
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name={groupName}
                  value={option.value}
                  checked={isSelected}
                  onChange={() => onChange(option.value)}
                  className="sr-only"
                />
                <span
                  aria-hidden
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors motion-reduce:transition-none",
                    isSelected ? "border-brand-primary" : "border-gray-300"
                  )}
                >
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full bg-brand-primary transition-transform motion-reduce:transition-none",
                      isSelected ? "scale-100" : "scale-0"
                    )}
                  />
                </span>
                <span
                  className={cn(
                    "font-semibold",
                    isSelected ? "text-brand-primary" : "text-gray-900"
                  )}
                >
                  {option.title}
                </span>
              </span>

              <span className="text-sm text-gray-600 text-pretty">
                {option.description}
              </span>

              {(option.effort || option.precision) && (
                <span className="flex flex-wrap gap-2">
                  {option.effort && (
                    <MethodTag icon={Gauge} isSelected={isSelected}>
                      {option.effort}
                    </MethodTag>
                  )}
                  {option.precision && (
                    <MethodTag icon={Target} isSelected={isSelected}>
                      {option.precision}
                    </MethodTag>
                  )}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
