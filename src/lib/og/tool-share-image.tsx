// Story-billedet for værktøjerne i tool-share.ts.

import { formatDecimal } from "@/lib/calculators/format";
import { BRAND_PRIMARY, INK } from "@/lib/og/brand-og-image";
import type { ToolShareCard, ToolShareFigure, ToolShareIcon } from "@/lib/og/tool-share";
import {
  lucideIconDataUri,
  PanelRow,
  PanelTitle,
  renderStoryCard,
  STORY_MUTED,
  STORY_TRACK,
} from "@/lib/og/story-card";

const ICONS: Record<ToolShareIcon, string> = {
  gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  personStanding:
    '<circle cx="12" cy="5" r="1"/><path d="m9 20 3-6 3 6"/><path d="m6 8 6 2 6-2"/><path d="M12 10v4"/>',
  dumbbell:
    '<path d="M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z"/><path d="m2.5 21.5 1.4-1.4"/><path d="m20.1 3.9 1.4-1.4"/><path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z"/><path d="m9.6 14.4 4.8-4.8"/>',
  utensils:
    '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  flame:
    '<path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/>',
  beef: '<path d="M16.4 13.7A6.5 6.5 0 1 0 6.28 6.6c-1.1 3.13-.78 3.9-3.18 6.08A3 3 0 0 0 5 18c4 0 8.4-1.8 11.4-4.3"/><path d="m18.5 6 2.19 4.5a6.48 6.48 0 0 1-2.29 7.2C15.4 20.2 11 22 7 22a3 3 0 0 1-2.68-1.66L2.4 16.5"/><circle cx="12.5" cy="8.5" r="2.5"/>',
  heartPulse:
    '<path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/><path d="M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
  hourglass:
    '<path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>',
  ruler:
    '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/>',
  calendarHeart:
    '<path d="M12.127 22H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5.125"/><path d="M14.62 18.8A2.25 2.25 0 1 1 18 15.836a2.25 2.25 0 1 1 3.38 2.966l-2.626 2.856a.998.998 0 0 1-1.507 0z"/><path d="M16 2v4"/><path d="M3 10h18"/><path d="M8 2v4"/>',
  timer:
    '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
  weight:
    '<circle cx="12" cy="5" r="3"/><path d="M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.925-2.54L19.4 9.5A2 2 0 0 0 17.48 8Z"/>',
};

const FIGURE_TRACK_PX = 520;
const FIGURE_HEAD_PX = 44;
const FIGURE_GAP_PX = 8;
const FIGURE_WIDTH_PX = 96;
const FIGURE_SPACING_PX = 110;
const PARENT_COLOR = "#d1d5db";

function FigurePanel({ figures }: { figures: ToolShareFigure[] }) {
  const tallestCm = Math.max(...figures.map((figure) => figure.heightCm)) * 1.05;
  const toPx = (cm: number) => (cm / tallestCm) * FIGURE_TRACK_PX;
  const highlighted = figures.find((figure) => figure.highlighted);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          width: "100%",
          height: FIGURE_TRACK_PX,
          gap: FIGURE_SPACING_PX,
          borderBottom: `3px solid ${STORY_TRACK}`,
        }}
      >
        {figures.map((figure) => {
          const color = figure.highlighted ? BRAND_PRIMARY : PARENT_COLOR;
          return (
            <div
              key={figure.label}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", width: FIGURE_WIDTH_PX }}
            >
              <div
                style={{
                  width: FIGURE_HEAD_PX,
                  height: FIGURE_HEAD_PX,
                  borderRadius: 999,
                  background: color,
                }}
              />
              <div
                style={{
                  width: FIGURE_WIDTH_PX,
                  height: Math.max(toPx(figure.heightCm) - FIGURE_HEAD_PX - FIGURE_GAP_PX, 8),
                  marginTop: FIGURE_GAP_PX,
                  borderTopLeftRadius: 999,
                  borderTopRightRadius: 999,
                  background: color,
                }}
              />
            </div>
          );
        })}
        {highlighted && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: toPx(highlighted.heightCm),
              borderTop: "4px dashed #9ca3af",
            }}
          />
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: FIGURE_SPACING_PX, marginTop: 28 }}>
        {figures.map((figure) => (
          <div
            key={figure.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: FIGURE_WIDTH_PX,
            }}
          >
            <div
              style={{
                fontSize: 34,
                fontWeight: figure.highlighted ? 800 : 500,
                color: figure.highlighted ? INK : STORY_MUTED,
              }}
            >
              {figure.label}
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 34,
                whiteSpace: "nowrap",
                fontWeight: figure.highlighted ? 800 : 500,
                color: figure.highlighted ? INK : STORY_MUTED,
              }}
            >
              {`${formatDecimal(figure.heightCm)} cm`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderPanel(card: ToolShareCard) {
  if (card.figures?.length) return <FigurePanel figures={card.figures} />;
  if (!card.rows?.length) return undefined;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      {card.panelTitle && <PanelTitle>{card.panelTitle}</PanelTitle>}
      {card.rows.map((row) => (
        <PanelRow key={row.name} name={row.name} range={row.value} highlighted={row.highlighted} />
      ))}
    </div>
  );
}

export function renderToolShareImage(card: ToolShareCard, headers?: HeadersInit) {
  return renderStoryCard(
    {
      icon: lucideIconDataUri(ICONS[card.icon]),
      label: card.label,
      value: card.value,
      caption: card.caption,
      badge: card.badge,
      panel: renderPanel(card),
    },
    headers
  );
}
