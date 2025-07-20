"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "onChange"
  > {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(event.target.checked);
    };

    return (
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          className="sr-only"
          ref={ref}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          {...props}
        />
        <div
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full border-2 border-transparent transition-colors cursor-pointer",
            "focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
            checked
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-200 hover:bg-gray-300",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          <span
            className={cn(
              "inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
              checked ? "translate-x-5" : "translate-x-0"
            )}
          />
        </div>
      </div>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };
