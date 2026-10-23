// Delbart story-billede af kaloriemål og makroer fra makroberegneren.

import { formatInteger } from "@/lib/calculators/format";
import type { Macro } from "@/lib/calculators/macros";
import { BRAND_PRIMARY, INK } from "@/lib/og/brand-og-image";
import { MACRO_SHARE_ORDER, type MacroShareContent } from "@/lib/og/macro-share";
import { lucideIconDataUri, renderStoryCard, STORY_MUTED } from "@/lib/og/story-card";

const PIE_ICON = lucideIconDataUri(
  '<path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"/><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>'
);

const MACRO_STYLE: Record<Macro, { label: string; color: string }> = {
  protein: { label: "Protein", color: BRAND_PRIMARY },
  carbs: { label: "Kulhydrat", color: "#fbbf24" },
  fat: { label: "Fedt", color: "#38bdf8" },
};

export function renderMacroShareImage(content: MacroShareContent, headers?: HeadersInit) {
  return renderStoryCard(
    {
      icon: PIE_ICON,
      label: "Mit daglige kaloriemål",
      value: `${formatInteger(content.kcalPerDay)} kcal`,
      panel: (
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
              display: "flex",
              width: "100%",
              height: 28,
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            {MACRO_SHARE_ORDER.map((macro) => (
              <div
                key={macro}
                style={{
                  flexGrow: content.macros[macro].pct,
                  flexBasis: 0,
                  height: "100%",
                  background: MACRO_STYLE[macro].color,
                }}
              />
            ))}
          </div>

          <div style={{ display: "flex", width: "100%", gap: 24, marginTop: 56 }}>
            {MACRO_SHARE_ORDER.map((macro) => (
              <div
                key={macro}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: 1,
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 999,
                      background: MACRO_STYLE[macro].color,
                    }}
                  />
                  <div style={{ fontSize: 34, fontWeight: 500, color: STORY_MUTED }}>
                    {MACRO_STYLE[macro].label}
                  </div>
                </div>
                <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: -2, color: INK }}>
                  {`${formatInteger(content.macros[macro].grams)} g`}
                </div>
                <div style={{ fontSize: 32, fontWeight: 500, color: STORY_MUTED }}>
                  {`${content.macros[macro].pct} %`}
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    headers
  );
}
