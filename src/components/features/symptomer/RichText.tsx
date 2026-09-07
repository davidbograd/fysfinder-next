// Added: 2026-09-07 - Renders symptom-universe copy with inline crawlable links and bold runs, server-side and without JavaScript.

import Link from "next/link";
import { parseRichText } from "@/lib/symptomer/rich-text";
import type { RichText as RichTextValue } from "@/lib/symptomer/types";

const LINK_CLASSES =
  "text-brand-primary underline underline-offset-2 hover:text-brand-primary/80";

interface RichTextProps {
  value: RichTextValue;
}

export function RichText({ value }: RichTextProps) {
  const tokens = parseRichText(value);

  return (
    <>
      {tokens.map((token, index) => {
        if (token.type === "bold") {
          return <strong key={index}>{token.value}</strong>;
        }

        if (token.type === "link") {
          const isInternal =
            token.href.startsWith("/") || token.href.startsWith("#");

          return isInternal ? (
            <Link key={index} href={token.href} className={LINK_CLASSES}>
              {token.label}
            </Link>
          ) : (
            <a
              key={index}
              href={token.href}
              className={LINK_CLASSES}
              rel="noopener noreferrer"
            >
              {token.label}
            </a>
          );
        }

        return <span key={index}>{token.value}</span>;
      })}
    </>
  );
}
