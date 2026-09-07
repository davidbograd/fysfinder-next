// Added: 2026-09-07 - Shared section shell for the symptom universe so every level gets the same heading hierarchy, anchor ids and vertical rhythm.

import { cn } from "@/lib/utils";

interface SymptomSectionProps {
  /** Stable anchor id from `CONDITION_SECTION_IDS` / `BODY_AREA_SECTION_IDS`. */
  id: string;
  heading: string;
  intro?: string;
  className?: string;
  children?: React.ReactNode;
}

export function SymptomSection({
  id,
  heading,
  intro,
  className,
  children,
}: SymptomSectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("mt-16 scroll-mt-24 md:mt-20", className)}
    >
      <h2
        id={headingId}
        className="text-balance text-[28px] leading-tight tracking-tight text-[#1f2b28] md:text-[32px]"
      >
        {heading}
      </h2>
      {intro ? (
        <p className="mt-4 max-w-3xl text-[17px] leading-relaxed text-[#3f4b48] md:text-[18px]">
          {intro}
        </p>
      ) : null}
      {children}
    </section>
  );
}
