"use client";

import { ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface ToolSelectOption<TValue extends string> {
  value: TValue;
  label: string;
}

interface ToolSelectFieldProps<TValue extends string> {
  id: string;
  label: string;
  options: ToolSelectOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  hint?: ReactNode;
  className?: string;
}

const SELECT_CLASSES =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function ToolSelectField<TValue extends string>({
  id,
  label,
  options,
  value,
  onChange,
  hint,
  className,
}: ToolSelectFieldProps<TValue>) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as TValue)}
        className={SELECT_CLASSES}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && <p className="text-xs text-gray-500 text-pretty">{hint}</p>}
    </div>
  );
}
