// Added: 2026-09-07 - Quick facts and medical reviewer blocks for condition pages. Both read from Condition data so the same components serve every problemstilling.

import Link from "next/link";
import { resolveReviewer } from "@/lib/symptomer";
import type { MedicalReview, QuickFact } from "@/lib/symptomer/types";
import { CONDITION_SECTION_IDS } from "@/lib/symptomer/constants";

interface ConditionQuickFactsProps {
  quickFacts: QuickFact[];
}

export function ConditionQuickFacts({
  quickFacts,
}: ConditionQuickFactsProps) {
  if (quickFacts.length === 0) return null;

  return (
    <dl
      id={CONDITION_SECTION_IDS.quickFacts}
      className="mt-8 grid gap-4 sm:grid-cols-2"
    >
      {quickFacts.map((fact) => (
        <div
          key={fact.label}
          className="rounded-2xl bg-white/70 px-5 py-4 ring-1 ring-inset ring-white"
        >
          <dt className="text-[13px] font-medium uppercase tracking-wide text-[#3f4b48]/70">
            {fact.label}
          </dt>
          <dd className="mt-1.5 text-[16px] leading-snug text-[#1f2b28]">
            {fact.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

interface MedicalReviewerProps {
  review: MedicalReview;
}

export function MedicalReviewer({ review }: MedicalReviewerProps) {
  const reviewer = resolveReviewer(review);
  if (!reviewer) return null;

  const { author, profileHref, reviewDate, reviewDateLabel } = reviewer;

  return (
    <div className="mt-8 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[15px] text-[#3f4b48]">
      <span>
        Fagligt gennemgået af{" "}
        <Link
          href={profileHref}
          className="font-medium text-brand-primary underline underline-offset-2 hover:text-brand-primary/80"
        >
          {author.name}
        </Link>
        , fysioterapeut
      </span>
      <span aria-hidden="true">·</span>
      <span>
        Senest opdateret:{" "}
        <time dateTime={reviewDate} className="tabular-nums">
          {reviewDateLabel}
        </time>
      </span>
    </div>
  );
}
