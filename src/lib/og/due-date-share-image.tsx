// Delbart story-billede af terminen fra terminsberegneren.

import { formatDanishDate, formatDanishWeekday } from "@/lib/calculators/dates";
import { BRAND_PRIMARY, INK } from "@/lib/og/brand-og-image";
import type { DueDateShareContent } from "@/lib/og/due-date-share";
import {
  lucideIconDataUri,
  renderStoryCard,
  STORY_MUTED,
  STORY_TRACK,
} from "@/lib/og/story-card";

const BABY_ICON = lucideIconDataUri(
  '<path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/>',
);

const TRIMESTER_DAYS = 14 * 7;

function TrimesterBar({
  elapsedDays,
  trimester,
}: {
  elapsedDays: number;
  trimester: number;
}) {
  return (
    <div style={{ display: "flex", gap: 16, width: "100%" }}>
      {[1, 2, 3].map((number) => {
        const fraction = Math.min(
          1,
          Math.max(
            0,
            (elapsedDays - (number - 1) * TRIMESTER_DAYS) / TRIMESTER_DAYS,
          ),
        );
        const isCurrent = number === trimester;
        return (
          <div
            key={number}
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              gap: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                height: 22,
                borderRadius: 999,
                background: STORY_TRACK,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${fraction * 100}%`,
                  height: "100%",
                  borderRadius: 999,
                  background: BRAND_PRIMARY,
                }}
              />
            </div>
            <div
              style={{
                fontSize: 30,
                fontWeight: isCurrent ? 800 : 500,
                color: isCurrent ? INK : STORY_MUTED,
              }}
            >
              {`${number}. trimester`}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function renderDueDateShareImage(
  { dueDate, progress }: DueDateShareContent,
  headers?: HeadersInit,
) {
  return renderStoryCard(
    {
      icon: BABY_ICON,
      label: "Forventet termin",
      value: formatDanishDate(dueDate),
      caption: `En ${formatDanishWeekday(dueDate)}`,
      panel: progress && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div
            style={{
              fontSize: 104,
              fontWeight: 800,
              letterSpacing: -2,
              color: INK,
            }}
          >
            {`Uge ${progress.weeks}+${progress.days}`}
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 38,
              fontWeight: 500,
              color: STORY_MUTED,
            }}
          >
            {`${progress.progressPct} % af vejen`}
          </div>
          <div style={{ display: "flex", width: "100%", marginTop: 56 }}>
            <TrimesterBar
              elapsedDays={progress.elapsedDays}
              trimester={progress.trimester}
            />
          </div>
        </div>
      ),
    },
    headers,
  );
}
