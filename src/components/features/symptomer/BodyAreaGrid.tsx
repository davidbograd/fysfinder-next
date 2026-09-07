// Added: 2026-09-07 - Body-area grid for /symptomer. Active areas are crawlable links; inactive ones render as non-linked placeholders so we never point at pages that do not exist.

import Link from "next/link";
import { bodyAreaHref } from "@/lib/symptomer";
import { symptomEventAttributes } from "@/lib/symptomer/analytics";
import type { BodyArea } from "@/lib/symptomer/types";

interface BodyAreaGridProps {
  bodyAreas: BodyArea[];
  headingId?: string;
}

export function BodyAreaGrid({ bodyAreas, headingId }: BodyAreaGridProps) {
  return (
    <ul
      aria-labelledby={headingId}
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
    >
      {bodyAreas.map((area) => (
        <li key={area.slug}>
          {area.isActive ? (
            <Link
              href={bodyAreaHref(area.slug)}
              className="flex h-full flex-col justify-between rounded-2xl border border-[#dfe3de] bg-white px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              {...symptomEventAttributes("symptom_body_area_click", {
                bodyArea: area.slug,
                destination: bodyAreaHref(area.slug),
              })}
            >
              <span className="text-[17px] font-medium text-[#1f2b28]">
                {area.name}
              </span>
              <span className="mt-2 text-[14px] text-brand-primary">
                Se symptomer →
              </span>
            </Link>
          ) : (
            <div className="flex h-full flex-col justify-between rounded-2xl border border-dashed border-[#dfe3de] bg-[#f8f7f2] px-4 py-4">
              <span className="text-[17px] font-medium text-[#1f2b28]/55">
                {area.name}
              </span>
              <span className="mt-2 text-[14px] text-[#3f4b48]/55">
                Kommer snart
              </span>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
