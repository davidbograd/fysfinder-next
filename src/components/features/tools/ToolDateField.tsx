"use client";

import { ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ToolDateFieldProps {
  id: string;
  label: string;
  /** ISO-dato ("2026-10-19"), som browserens datovælger leverer den. */
  value: string;
  onChange: (value: string) => void;
  hint?: ReactNode;
  /** Vises i stedet for hintet, når feltet mangler ved beregning. */
  error?: string;
  className?: string;
}

/** Browserens egen datovælger, så telefoner viser deres indbyggede kalender. */
export function ToolDateField({
  id,
  label,
  value,
  onChange,
  hint,
  error,
  className,
}: ToolDateFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="date"
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "tabular-nums",
          error && "border-red-400 focus-visible:ring-red-400"
        )}
      />
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
