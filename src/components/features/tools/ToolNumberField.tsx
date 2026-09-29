"use client";

import { ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sanitizeNumericInput } from "@/lib/calculators/parse";
import { cn } from "@/lib/utils";

interface ToolNumberFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  unit?: string;
  placeholder?: string;
  /** Node frem for streng, så et hint kan rumme fx et link. */
  hint?: ReactNode;
  optional?: boolean;
  /** Alder, puls og meter tager ikke decimaler. */
  allowDecimal?: boolean;
  /** Vises i stedet for hintet, når feltet mangler ved beregning. */
  error?: string;
  className?: string;
}

export function ToolNumberField({
  id,
  label,
  value,
  onChange,
  unit,
  placeholder,
  hint,
  optional = false,
  allowDecimal = true,
  error,
  className,
}: ToolNumberFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>
        {label}
        {optional && (
          <span className="ml-1 font-normal text-gray-500">(valgfri)</span>
        )}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type="text"
          inputMode={allowDecimal ? "decimal" : "numeric"}
          autoComplete="off"
          value={value}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) =>
            onChange(sanitizeNumericInput(event.target.value, { allowDecimal }))
          }
          className={cn(
            "tabular-nums",
            unit && "pr-14",
            error && "border-red-400 focus-visible:ring-red-400"
          )}
        />
        {unit && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
            {unit}
          </span>
        )}
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-red-600">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-gray-500 text-pretty">{hint}</p>
      )}
    </div>
  );
}
