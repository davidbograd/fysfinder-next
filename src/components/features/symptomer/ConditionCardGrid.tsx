// Added: 2026-09-07 - One reusable condition card + grid used by the hub, body-area hero, condition grid and related conditions, so all four stay in sync.

import Link from "next/link";
import { conditionCardCtaLabel, conditionHref } from "@/lib/symptomer";
import { symptomEventAttributes } from "@/lib/symptomer/analytics";
import type { Condition } from "@/lib/symptomer/types";
import { cn } from "@/lib/utils";

interface ConditionCardProps {
  condition: Condition;
}

export function ConditionCard({ condition }: ConditionCardProps) {
  const href = conditionHref(condition);

  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-[#dfe3de] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2">
      <h3 className="text-[20px] font-medium leading-snug text-[#1f2b28]">
        {/* The pseudo-element makes the whole card clickable without nesting a second link. */}
        <Link
          href={href}
          className="after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus:outline-none"
          {...symptomEventAttributes("condition_click", {
            bodyArea: condition.bodyAreaSlug,
            condition: condition.slug,
            destination: href,
          })}
        >
          {condition.name}
        </Link>
      </h3>
      <p className="mt-2 flex-1 text-[15px] leading-relaxed text-[#3f4b48]">
        {condition.shortDescription}
      </p>
      <span
        aria-hidden="true"
        className="mt-4 text-[15px] font-medium text-brand-primary group-hover:underline"
      >
        {conditionCardCtaLabel(condition)}
      </span>
    </article>
  );
}

interface ConditionCardGridProps {
  conditions: Condition[];
  className?: string;
}

export function ConditionCardGrid({
  conditions,
  className,
}: ConditionCardGridProps) {
  if (conditions.length === 0) return null;

  return (
    <ul className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {conditions.map((condition) => (
        <li key={condition.slug} className="h-full">
          <ConditionCard condition={condition} />
        </li>
      ))}
    </ul>
  );
}
