"use client";

import { ToolChoiceGroup } from "@/components/features/tools/ToolChoiceGroup";
import { cn } from "@/lib/utils";

export type ToolGender = "male" | "female";

const GENDER_OPTIONS: { value: ToolGender; label: string }[] = [
  { value: "male", label: "Mand" },
  { value: "female", label: "Kvinde" },
];

interface ToolGenderSelectorProps {
  value: ToolGender | "";
  onChange: (value: ToolGender) => void;
  /** Vises under knapperne, når køn mangler ved beregning. */
  error?: string;
  label?: string;
  className?: string;
}

/** Mand/Kvinde-valget i alle værktøjer. Holdes smalt, så det aldrig strækker sig over hele formularen. */
export function ToolGenderSelector({
  value,
  onChange,
  error,
  label = "Køn",
  className,
}: ToolGenderSelectorProps) {
  return (
    <ToolChoiceGroup
      label={label}
      options={GENDER_OPTIONS}
      value={value}
      onChange={onChange}
      error={error}
      className={cn("w-full max-w-sm", className)}
    />
  );
}
