// Shared MDX GFM table: horizontal scroll + edge fade on overflow (mobile-friendly wide tables).
import type { ComponentPropsWithoutRef } from "react";
import { HorizontalScrollFade } from "@/components/ui/horizontal-scroll-fade";

export const MdxProseTable = ({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<"table">) => (
  <HorizontalScrollFade>
    <table {...props} className={className}>
      {children}
    </table>
  </HorizontalScrollFade>
);
