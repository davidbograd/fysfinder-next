// Added: 2026-09-07 - Generic content/navigation cards used for both pain locations and symptom contexts on body-area pages. No routes are created for these cards.

import Link from "next/link";
import { conditionHref, getConditionsBySlugs } from "@/lib/symptomer";
import { symptomEventAttributes } from "@/lib/symptomer/analytics";
import type { NavigationCard } from "@/lib/symptomer/types";

interface NavigationCardGridProps {
  cards: NavigationCard[];
  bodyAreaSlug: string;
}

export function NavigationCardGrid({
  cards,
  bodyAreaSlug,
}: NavigationCardGridProps) {
  return (
    <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const relatedConditions = getConditionsBySlugs(card.conditionSlugs);

        return (
          <li key={card.id} className="h-full">
            <article className="flex h-full flex-col rounded-2xl bg-brand-beige p-5">
              <h3 className="text-[18px] font-medium leading-snug text-[#1f2b28]">
                {card.title}
              </h3>
              <p className="mt-2 flex-1 text-[15px] leading-relaxed text-[#3f4b48]">
                {card.description}
              </p>

              {/* An empty relation renders nothing rather than an empty placeholder. */}
              {relatedConditions.length > 0 ? (
                <div className="mt-4 border-t border-[#dfe3de] pt-4">
                  <p className="text-[13px] font-medium uppercase tracking-wide text-[#3f4b48]/70">
                    Relevante problemstillinger
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
                    {relatedConditions.map((condition, index) => (
                      <li
                        key={condition.slug}
                        className="text-[15px] text-[#3f4b48]"
                      >
                        <Link
                          href={conditionHref(condition)}
                          className="font-medium text-brand-primary underline underline-offset-2 hover:text-brand-primary/80"
                          {...symptomEventAttributes("condition_click", {
                            bodyArea: bodyAreaSlug,
                            condition: condition.slug,
                            destination: conditionHref(condition),
                          })}
                        >
                          {condition.name}
                        </Link>
                        {index < relatedConditions.length - 1 ? (
                          <span aria-hidden="true" className="ml-2">
                            ·
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>
          </li>
        );
      })}
    </ul>
  );
}
