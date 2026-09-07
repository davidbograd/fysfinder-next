// Added: 2026-09-07 - FAQ accordion built on native details/summary so every question and answer is present in the server-rendered HTML and works without JavaScript.

import { ChevronDown } from "lucide-react";
import type { FaqSection } from "@/lib/symptomer/types";
import { RichText } from "./RichText";

interface SymptomFaqProps {
  section: FaqSection;
}

export function SymptomFaq({ section }: SymptomFaqProps) {
  return (
    <div className="mt-8 max-w-3xl divide-y divide-[#dfe3de] border-t border-[#dfe3de]">
      {section.items.map((item) => (
        <details
          key={item.question}
          className="group [&[open]_svg]:rotate-180"
        >
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
            <h3 className="text-[18px] font-medium leading-snug text-[#1f2b28] group-hover:underline md:text-[20px]">
              {item.question}
            </h3>
            <ChevronDown
              aria-hidden="true"
              className="mt-1 h-5 w-5 shrink-0 text-[#3f4b48] transition-transform duration-200 motion-reduce:transition-none"
            />
          </summary>
          <div className="space-y-4 pb-5 pr-9">
            {item.answer.map((paragraph, index) => (
              <p
                key={index}
                className="text-[16px] leading-relaxed text-[#3f4b48] md:text-[17px]"
              >
                <RichText value={paragraph} />
              </p>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
