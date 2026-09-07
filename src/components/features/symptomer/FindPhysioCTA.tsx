// Added: 2026-09-07 - Shared "find a physiotherapist" CTA for body-area and condition pages. Destination comes from the condition's specialty relation, falling back to the general finder.

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { findPhysioHref } from "@/lib/symptomer";
import { symptomEventAttributes } from "@/lib/symptomer/analytics";
import type { FindPhysioSection } from "@/lib/symptomer/types";
import { RichText } from "./RichText";

interface FindPhysioCTAProps {
  section: FindPhysioSection;
  bodyAreaSlug: string;
  conditionSlug?: string;
}

export function FindPhysioCTA({
  section,
  bodyAreaSlug,
  conditionSlug,
}: FindPhysioCTAProps) {
  const href = findPhysioHref(section.specialtySlugs);

  return (
    <div className="mt-6 rounded-2xl bg-brand-primary px-6 py-7 sm:px-8 sm:py-8">
      <p className="max-w-3xl text-[17px] leading-relaxed text-white/90 md:text-[18px]">
        <RichText value={section.body} />
      </p>
      <Button
        asChild
        className="mt-6 h-auto bg-white px-7 py-3 text-[16px] font-medium text-brand-primary hover:bg-white/90"
      >
        <Link
          href={href}
          {...symptomEventAttributes("find_physio_click", {
            bodyArea: bodyAreaSlug,
            condition: conditionSlug,
            destination: href,
          })}
        >
          {section.ctaLabel}
        </Link>
      </Button>
    </div>
  );
}
