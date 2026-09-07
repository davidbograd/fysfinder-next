// Added: 2026-09-07 - Renders structured condition/body-area copy (paragraphs, bullet lists, h3 subheadings) so the same UI works for every condition.

import { slugify } from "@/app/utils/slugify";
import type { ContentBlock } from "@/lib/symptomer/types";
import { RichText } from "./RichText";

interface ContentBlocksProps {
  blocks: ContentBlock[];
}

export function ContentBlocks({ blocks }: ContentBlocksProps) {
  return (
    <div className="mt-6 max-w-3xl space-y-5">
      {blocks.map((block, index) => {
        if (block.type === "subheading") {
          return (
            <h3
              key={index}
              id={slugify(block.text)}
              className="scroll-mt-24 pt-3 text-[21px] font-medium leading-snug text-[#1f2b28] md:text-[23px]"
            >
              {block.text}
            </h3>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={index} className="space-y-2.5">
              {block.items.map((item, itemIndex) => (
                <li
                  key={itemIndex}
                  className="relative pl-6 text-[17px] leading-relaxed text-[#3f4b48] md:text-[18px]"
                >
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-[0.65em] h-1.5 w-1.5 rounded-full bg-brand-primary"
                  />
                  <RichText value={item} />
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p
            key={index}
            className="text-[17px] leading-relaxed text-[#3f4b48] md:text-[18px]"
          >
            <RichText value={block.text} />
          </p>
        );
      })}
    </div>
  );
}
