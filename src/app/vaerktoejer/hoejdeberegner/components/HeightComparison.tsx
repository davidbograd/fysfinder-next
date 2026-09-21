"use client";

import { useEffect, useState } from "react";
import { formatDecimal } from "@/lib/calculators/format";
import { cn } from "@/lib/utils";

/** Højden på den højeste figur i px – alt andet skaleres 1:1 ud fra den. */
const TRACK_PX = 190;
const HEAD_PX = 16;
const BODY_GAP_PX = 3;

interface Figure {
  label: string;
  heightCm: number;
  isChild?: boolean;
}

interface HeightComparisonProps {
  motherHeightCm: number;
  fatherHeightCm: number;
  childHeightCm: number;
  rangeLowCm: number;
  rangeHighCm: number;
  childLabel: string;
}

export function HeightComparison({
  motherHeightCm,
  fatherHeightCm,
  childHeightCm,
  rangeLowCm,
  rangeHighCm,
  childLabel,
}: HeightComparisonProps) {
  // Figurerne vokser op fra grundlinjen, første gang resultatet vises.
  const [hasGrown, setHasGrown] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setHasGrown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const figures: Figure[] = [
    { label: "Mor", heightCm: motherHeightCm },
    { label: "Far", heightCm: fatherHeightCm },
    { label: childLabel, heightCm: childHeightCm, isChild: true },
  ];

  // Lidt luft over den højeste figur, så hovedet og linjen ikke rammer kanten.
  const tallestCm = Math.max(...figures.map((f) => f.heightCm)) * 1.05;
  const toPx = (cm: number) => (cm / tallestCm) * TRACK_PX;

  return (
    <div
      role="img"
      aria-label={`Mor ${formatDecimal(motherHeightCm)} cm, far ${formatDecimal(
        fatherHeightCm
      )} cm, og barnets forventede sluthøjde ${formatDecimal(
        childHeightCm
      )} cm.`}
      className="rounded-xl bg-gray-50 p-4 sm:p-6"
    >
      <div
        aria-hidden
        className="relative flex items-end justify-center gap-8 border-b border-gray-200 sm:gap-14"
        style={{ height: TRACK_PX }}
      >
        {figures.map((figure, index) => {
          const bodyPx = Math.max(toPx(figure.heightCm) - HEAD_PX - BODY_GAP_PX, 4);

          return (
            <div
              key={figure.label}
              className="relative flex h-full flex-col justify-end"
            >
              <div
                className={cn(
                  "relative flex flex-col items-center transition-[height] duration-700 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none",
                  figure.isChild ? "text-brand-primary" : "text-brand-primary/30"
                )}
                style={{
                  height: hasGrown ? toPx(figure.heightCm) : 0,
                  transitionDelay: `${index * 90}ms`,
                }}
              >
                <span
                  className="shrink-0 rounded-full bg-current"
                  style={{ height: HEAD_PX, width: HEAD_PX }}
                />
                <span
                  className="w-7 rounded-t-full bg-current sm:w-9"
                  style={{ height: bodyPx, marginTop: BODY_GAP_PX }}
                />
              </div>
            </div>
          );
        })}

        {/* Barnets højde ført hen over forældrene, så de kan sammenlignes. */}
        <span
          className={cn(
            "pointer-events-none absolute inset-x-0 z-10 border-t-2 border-dashed border-brand-primary/50 transition-opacity duration-500 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none",
            hasGrown ? "opacity-100" : "opacity-0"
          )}
          style={{
            bottom: toPx(childHeightCm),
            transitionDelay: `${figures.length * 90 + 200}ms`,
          }}
        />
      </div>

      <div className="mt-3 flex justify-center gap-8 sm:gap-14">
        {figures.map((figure) => (
          <div key={figure.label} className="w-7 text-center sm:w-9">
            <p
              className={cn(
                "text-sm font-medium",
                figure.isChild ? "text-brand-primary" : "text-gray-600"
              )}
            >
              {figure.label}
            </p>
            <p
              className={cn(
                "whitespace-nowrap text-sm tabular-nums",
                figure.isChild
                  ? "font-semibold text-brand-primary"
                  : "text-gray-500"
              )}
            >
              {formatDecimal(figure.heightCm)} cm
            </p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-gray-500 text-pretty">
        Den stiplede linje er barnets forventede sluthøjde. De fleste børn ender
        mellem {formatDecimal(rangeLowCm)} og {formatDecimal(rangeHighCm)} cm.
      </p>
    </div>
  );
}
