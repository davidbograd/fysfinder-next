"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolSlug } from "@/lib/tools/registry";
import { trackToolEvent } from "@/lib/tools/tool-events";

interface ToolShareImageButtonProps {
  toolSlug: ToolSlug;
  /** Tells apart tools with more than one download, e.g. pace "loeb" and "plan". */
  variant?: string;
  href: string;
  fileName: string;
  label: string;
}

export function ToolShareImageButton({
  toolSlug,
  variant,
  href,
  fileName,
  label,
}: ToolShareImageButtonProps) {
  return (
    <div className="flex justify-center">
      <Button asChild variant="outline">
        <a
          href={href}
          download={fileName}
          className="gap-2"
          onClick={() => trackToolEvent(toolSlug, "result_download", variant)}
        >
          <Download className="h-4 w-4" aria-hidden />
          {label}
        </a>
      </Button>
    </div>
  );
}
