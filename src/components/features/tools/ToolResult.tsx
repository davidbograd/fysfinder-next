import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ToolPrimaryResultProps {
  label: string;
  value: string;
  caption?: ReactNode;
  badge?: string;
  className?: string;
}

export function ToolPrimaryResult({
  label,
  value,
  caption,
  badge,
  className,
}: ToolPrimaryResultProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-brand-beige p-6 text-center",
        className
      )}
    >
      <p className="text-sm font-medium text-brand-primary/70">{label}</p>
      <p className="mt-1 text-4xl font-semibold tabular-nums text-brand-primary">
        {value}
      </p>
      {badge && (
        <p className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-sm font-semibold text-brand-primary">
          {badge}
        </p>
      )}
      {caption && (
        <p className="mt-2 text-sm text-gray-600 text-pretty">{caption}</p>
      )}
    </div>
  );
}

export interface ToolStat {
  label: string;
  value: string;
  caption?: ReactNode;
}

interface ToolStatGridProps {
  items: ToolStat[];
  className?: string;
}

export function ToolStatGrid({ items, className }: ToolStatGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2",
        items.length % 3 === 0 && "sm:grid-cols-3",
        className
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl bg-gray-50 p-4 text-center"
        >
          <p className="text-sm text-gray-600">{item.label}</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-gray-900">
            {item.value}
          </p>
          {item.caption && (
            <p className="mt-1 text-xs text-gray-500 text-pretty">
              {item.caption}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export function ToolErrorNote({ message }: { message: string }) {
  return (
    <div className="rounded-xl bg-red-50 p-4 text-center" role="alert">
      <p className="text-sm font-medium text-red-700 text-pretty">{message}</p>
    </div>
  );
}
