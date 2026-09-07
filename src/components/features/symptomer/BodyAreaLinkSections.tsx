// Added: 2026-09-07 - Crawlable body-area link sections on /symptomer: one block per active body area with a hub CTA and deep links to its popular conditions.

import Link from "next/link";
import {
  bodyAreaHref,
  conditionHref,
  getConditionsBySlugs,
} from "@/lib/symptomer";
import { symptomEventAttributes } from "@/lib/symptomer/analytics";
import type { ActiveBodyArea } from "@/lib/symptomer/types";

interface BodyAreaLinkSectionsProps {
  bodyAreas: ActiveBodyArea[];
}

export function BodyAreaLinkSections({
  bodyAreas,
}: BodyAreaLinkSectionsProps) {
  return (
    <div className="mt-8 space-y-6">
      {bodyAreas.map((area) => {
        const href = bodyAreaHref(area.slug);
        const popular = getConditionsBySlugs(area.hub.popularConditionSlugs);

        return (
          <article
            key={area.slug}
            className="rounded-2xl border border-[#dfe3de] bg-white p-6"
          >
            <h3 className="text-[22px] font-medium leading-snug text-[#1f2b28]">
              {area.hub.heading}
            </h3>
            <p className="mt-3 max-w-3xl text-[17px] leading-relaxed text-[#3f4b48]">
              {area.hub.description}
            </p>

            <Link
              href={href}
              className="mt-4 inline-flex text-[16px] font-medium text-brand-primary underline underline-offset-2 hover:text-brand-primary/80"
              {...symptomEventAttributes("symptom_body_area_click", {
                bodyArea: area.slug,
                destination: href,
              })}
            >
              {area.hub.ctaLabel}
            </Link>

            {popular.length > 0 ? (
              <p className="mt-5 text-[15px] leading-relaxed text-[#3f4b48]">
                <span className="font-medium text-[#1f2b28]">
                  Populære problemstillinger:{" "}
                </span>
                {popular.map((condition, index) => (
                  <span key={condition.slug}>
                    <Link
                      href={conditionHref(condition)}
                      className="text-brand-primary underline underline-offset-2 hover:text-brand-primary/80"
                      {...symptomEventAttributes("condition_click", {
                        bodyArea: area.slug,
                        condition: condition.slug,
                        destination: conditionHref(condition),
                      })}
                    >
                      {condition.name}
                    </Link>
                    {index < popular.length - 1 ? (
                      <span aria-hidden="true"> · </span>
                    ) : null}
                  </span>
                ))}
              </p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
