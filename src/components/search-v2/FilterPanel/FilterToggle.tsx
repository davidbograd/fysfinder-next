"use client";

import React from "react";
import { Label } from "@/components/ui/label";

interface FilterToggleProps {
  id: string;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  description?: string;
  disabled?: boolean;
}

export const FilterToggle: React.FC<FilterToggleProps> = ({
  id,
  label,
  value,
  onChange,
  description,
  disabled = false,
}) => {
  const handleToggle = () => {
    onChange(!value);
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
      <div className="flex-1 space-y-1">
        <Label
          htmlFor={id}
          className="text-sm font-medium text-gray-900 cursor-pointer"
        >
          {label}
        </Label>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>

      {/* Simple toggle button */}
      <button
        id={id}
        onClick={handleToggle}
        disabled={disabled}
        aria-label={`Toggle ${label}`}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full border-2 border-transparent transition-colors cursor-pointer ml-4
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${
            value
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-200 hover:bg-gray-300"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <span
          className={`
            inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform
            ${value ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </button>
    </div>
  );
};
