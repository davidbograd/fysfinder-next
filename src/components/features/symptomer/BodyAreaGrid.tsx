// Added: 2026-09-07 - Body-area grid for /symptomer. Active areas are crawlable links; inactive ones render as non-linked placeholders so we never point at pages that do not exist.

import Image from "next/image";
import Link from "next/link";
import { bodyAreaHref, getBodyAreaImage } from "@/lib/symptomer";
import { symptomEventAttributes } from "@/lib/symptomer/analytics";
import type { BodyArea } from "@/lib/symptomer/types";

interface BodyAreaGridProps {
  bodyAreas: BodyArea[];
  headingId?: string;
}

/**
 * Anatomical illustration. Decorative on purpose: the card already names the
 * body area in text, so alt text here would only duplicate it for screen
 * readers. The slot keeps its size when no illustration exists, so the grid
 * rhythm holds.
 */
function BodyAreaThumb({
  bodyArea,
  dimmed,
}: {
  bodyArea: BodyArea;
  dimmed: boolean;
}) {
  const src = getBodyAreaImage(bodyArea.slug);

  return (
    <span
      className={`relative block aspect-[4/3] w-full overflow-hidden rounded-xl ${
        src ? "bg-[#1f2b28]" : "bg-brand-beige"
      } ${dimmed ? "opacity-60 saturate-[0.35]" : ""}`}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          aria-hidden="true"
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 240px"
          className="object-cover"
        />
      ) : null}
    </span>
  );
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
              className="flex h-full flex-col rounded-2xl border border-[#dfe3de] bg-white p-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              {...symptomEventAttributes("symptom_body_area_click", {
                bodyArea: area.slug,
                destination: bodyAreaHref(area.slug),
              })}
            >
              <BodyAreaThumb bodyArea={area} dimmed={false} />
              <span className="mt-2.5 block px-1 pb-1">
                <span className="block text-[17px] font-medium text-[#1f2b28]">
                  {area.name}
                </span>
                <span className="mt-0.5 block text-[14px] text-brand-primary">
                  Se symptomer →
                </span>
              </span>
            </Link>
          ) : (
            <div className="flex h-full flex-col rounded-2xl border border-dashed border-[#dfe3de] bg-[#f8f7f2] p-2.5">
              <BodyAreaThumb bodyArea={area} dimmed />
              <span className="mt-2.5 block px-1 pb-1">
                <span className="block text-[17px] font-medium text-[#1f2b28]/55">
                  {area.name}
                </span>
                <span className="mt-0.5 block text-[14px] text-[#3f4b48]/55">
                  Kommer snart
                </span>
              </span>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
