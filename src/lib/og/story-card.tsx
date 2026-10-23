// Fælles story-billede (1080×1920) til de delbare værktøjsresultater.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ReactNode } from "react";
import { ImageResponse } from "next/og";
import { BRAND_CREAM, BRAND_PRIMARY, INK, Logo } from "@/lib/og/brand-og-image";

export const STORY_SIZE = { width: 1080, height: 1920 } as const;
export const STORY_MUTED = "#5f6b66";
export const STORY_TRACK = "#e4e2da";

/** Et Lucide-ikon som data-URI; Satori tegner SVG sikrest som <img>. */
export function lucideIconDataUri(svgChildren: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${BRAND_PRIMARY}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svgChildren}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

let fontsPromise: Promise<[Buffer, Buffer]> | null = null;

function loadFonts() {
  fontsPromise ??= Promise.all([
    readFile(join(process.cwd(), "src/assets/fonts/manrope-latin-500-normal.ttf")),
    readFile(join(process.cwd(), "src/assets/fonts/manrope-latin-800-normal.ttf")),
  ]);
  return fontsPromise;
}

export interface StoryCardContent {
  icon: string;
  label: string;
  value: string;
  caption?: string;
  badge?: string;
  /** Det hvide kort under hovedtallet. */
  panel?: ReactNode;
}

export function StoryPanel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        marginTop: 110,
        padding: "64px 64px 56px",
        borderRadius: 48,
        background: "white",
        boxShadow: "0 20px 50px rgba(16,69,52,0.08)",
      }}
    >
      {children}
    </div>
  );
}

export function PanelTitle({ children }: { children: string }) {
  return (
    <div
      style={{
        alignSelf: "flex-start",
        marginBottom: 28,
        fontSize: 36,
        fontWeight: 800,
        color: INK,
      }}
    >
      {children}
    </div>
  );
}

export function PanelRow({
  accent,
  name,
  range,
  highlighted = false,
}: {
  accent?: string;
  name: string;
  range: string;
  highlighted?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        gap: 24,
        padding: "12px 24px",
        borderRadius: 24,
        background: highlighted ? "#f1f1ef" : "transparent",
      }}
    >
      {accent && (
        <div
          style={{
            width: 14,
            height: 44,
            borderRadius: 999,
            background: accent,
          }}
        />
      )}
      <div
        style={{
          flex: 1,
          fontSize: 34,
          fontWeight: highlighted ? 800 : 500,
          color: INK,
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontSize: 34,
          fontWeight: highlighted ? 800 : 500,
          color: highlighted ? INK : STORY_MUTED,
        }}
      >
        {range}
      </div>
    </div>
  );
}

export async function renderStoryCard(
  { icon, label, value, caption, badge, panel }: StoryCardContent,
  headers?: HeadersInit
): Promise<ImageResponse> {
  const [fontMedium, fontExtraBold] = await loadFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: BRAND_CREAM,
          fontFamily: "Manrope",
          color: INK,
          padding: "150px 90px 90px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 220,
              height: 220,
              borderRadius: 999,
              background: "white",
              boxShadow: "0 20px 50px rgba(16,69,52,0.12)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not the browser */}
            <img src={icon} alt="" width={130} height={130} />
          </div>

          <div style={{ marginTop: 80, fontSize: 46, fontWeight: 500, color: STORY_MUTED }}>
            {label}
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 124,
              fontWeight: 800,
              letterSpacing: -3,
              lineHeight: 1.05,
              textAlign: "center",
              color: INK,
            }}
          >
            {value}
          </div>
          {badge && (
            <div
              style={{
                display: "flex",
                marginTop: 28,
                padding: "14px 36px",
                borderRadius: 999,
                background: "white",
                fontSize: 40,
                fontWeight: 800,
                color: INK,
              }}
            >
              {badge}
            </div>
          )}
          {caption && (
            <div style={{ marginTop: 20, fontSize: 48, fontWeight: 500, color: STORY_MUTED }}>
              {caption}
            </div>
          )}

          {panel && <StoryPanel>{panel}</StoryPanel>}
        </div>

        <Logo width={220} />
      </div>
    ),
    {
      ...STORY_SIZE,
      headers,
      fonts: [
        { name: "Manrope", data: fontMedium, weight: 500, style: "normal" },
        { name: "Manrope", data: fontExtraBold, weight: 800, style: "normal" },
      ],
    }
  );
}
