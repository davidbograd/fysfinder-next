// Lets a calculator tell the feedback widget that the visitor reached a result,
// so we only ask for a rating once there is something to rate.

import { ToolSlug } from "./registry";

export const TOOL_COMPLETED_EVENT = "fysfinder:tool-completed";

export interface ToolCompletedDetail {
  slug: ToolSlug;
}

export function notifyToolCompleted(slug: ToolSlug): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<ToolCompletedDetail>(TOOL_COMPLETED_EVENT, {
      detail: { slug },
    })
  );
}
