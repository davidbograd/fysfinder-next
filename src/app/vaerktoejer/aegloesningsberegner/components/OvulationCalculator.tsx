"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { CalendarHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ToolDateField } from "@/components/features/tools/ToolDateField";
import { ToolNumberField } from "@/components/features/tools/ToolNumberField";
import { ToolRatingSummary } from "@/components/features/tools/ToolRatingSummary";
import {
  ToolErrorNote,
  ToolPrimaryResult,
  ToolStatGrid,
} from "@/components/features/tools/ToolResult";
import {
  formatDanishDate,
  formatDanishDateRange,
  formatDanishDayMonth,
  todayIsoDate,
  toIsoDate,
} from "@/lib/calculators/dates";
import {
  computeOvulation,
  OvulationResult,
  OvulationSuccess,
} from "@/lib/calculators/ovulation";
import {
  FieldErrors,
  findMissingFields,
  hasFieldErrors,
} from "@/lib/calculators/required-fields";
import { notifyToolCompleted } from "@/lib/tools/tool-completion";
import { PublishedToolRating } from "@/lib/tools/tool-ratings";
import { CycleCalendar } from "./CycleCalendar";
import { useScrollToResult } from "@/components/features/tools/useScrollToResult";
import { ToolShareImageButton } from "@/components/features/tools/ToolShareImageButton";
import { buildOvulationShareUrl } from "@/lib/og/tool-share";

type FieldKey = "lastPeriodStart" | "cycleLength";

function describeProfile(profile: OvulationSuccess["profile"]): string {
  return [
    `Sidste menstruation ${formatDanishDate(profile.lastPeriodStart)}`,
    `${profile.cycleLength} dages cyklus`,
  ].join(" · ");
}

function describeDaysUntil(result: OvulationSuccess): string {
  if (result.daysUntilOvulation === 0) return "Din ægløsning er i dag";
  if (result.isFertileToday) {
    return `Du er i dit frugtbare vindue nu – ægløsning om ${result.daysUntilOvulation} ${result.daysUntilOvulation === 1 ? "dag" : "dage"}`;
  }
  return `Om ${result.daysUntilOvulation} dage`;
}

interface OvulationCalculatorProps {
  rating?: PublishedToolRating | null;
}

export function OvulationCalculator({ rating }: OvulationCalculatorProps) {
  const [lastPeriodStart, setLastPeriodStart] = useState("");
  const [cycleLength, setCycleLength] = useState("28");
  const [result, setResult] = useState<OvulationResult | null>(null);
  const resultRef = useScrollToResult(result);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<FieldKey>>({});

  const clearError = (field: FieldKey) =>
    setFieldErrors(({ [field]: _removed, ...rest }) => rest);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const missing = findMissingFields<FieldKey>([
      {
        key: "lastPeriodStart",
        label: "Første dag i din seneste menstruation",
        value: lastPeriodStart,
        choice: true,
      },
      { key: "cycleLength", label: "Cykluslængde", value: cycleLength },
    ]);
    if (hasFieldErrors(missing)) {
      setFieldErrors(missing);
      setResult(null);
      return;
    }

    setFieldErrors({});
    const currentDay = todayIsoDate();
    const calculation = computeOvulation({
      lastPeriodStart,
      cycleLength,
      today: currentDay,
    });
    setResult(calculation);
    if (calculation.ok) {
      notifyToolCompleted("aegloesningsberegner");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
              <CalendarHeart className="h-5 w-5" />
              Ægløsningsberegner
            </CardTitle>
            <ToolRatingSummary rating={rating} />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <ToolDateField
                id="aegloesning-date"
                label="Første dag i din seneste menstruation"
                hint="Den første dag med blødning."
                value={lastPeriodStart}
                error={fieldErrors.lastPeriodStart}
                onChange={(value) => {
                  setLastPeriodStart(value);
                  clearError("lastPeriodStart");
                }}
              />
              <ToolNumberField
                id="aegloesning-cycle"
                label="Cykluslængde"
                unit="dage"
                placeholder="28"
                allowDecimal={false}
                value={cycleLength}
                error={fieldErrors.cycleLength}
                hint="Fra første blødningsdag til dagen før næste. Svinger den, så brug et gennemsnit."
                onChange={(value) => {
                  setCycleLength(value);
                  clearError("cycleLength");
                }}
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-brand-primary text-white hover:bg-brand-primary/90"
              >
                Beregn ægløsning
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card ref={resultRef} className="rounded-2xl scroll-mt-24">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Dine frugtbare dage</CardTitle>
            {result.ok && (
              <CardDescription className="tabular-nums">
                {describeProfile(result.profile)}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {result.ok ? (
              <>
                <ToolPrimaryResult
                  label="Din næste ægløsning"
                  value={formatDanishDayMonth(result.upcoming.ovulation)}
                  caption={describeDaysUntil(result)}
                />

                <ToolStatGrid
                  items={[
                    {
                      label: "Frugtbart vindue",
                      value: formatDanishDateRange(
                        result.upcoming.fertileStart,
                        result.upcoming.ovulation
                      ),
                      caption: "De 5 dage før ægløsning og selve dagen",
                    },
                    {
                      label: "Mest frugtbare dage",
                      value: formatDanishDateRange(
                        result.upcoming.peakStart,
                        result.upcoming.ovulation
                      ),
                      caption: "Her er chancen for graviditet størst",
                    },
                    {
                      label: "Næste menstruation",
                      value: formatDanishDayMonth(result.upcoming.nextPeriod),
                      caption: "Tag en graviditetstest fra denne dag, hvis den udebliver",
                    },
                  ]}
                />

                <CycleCalendar
                  cycle={result.upcoming}
                  lastPeriodStart={result.profile.lastPeriodStart}
                />

                <div className="rounded-xl bg-brand-beige p-4">
                  <p className="text-sm text-gray-700 text-pretty">
                    <strong>Bliver du gravid i denne cyklus,</strong> er din
                    forventede termin omkring{" "}
                    {formatDanishDate(result.upcoming.dueDateIfConceived)}.{" "}
                    <Link
                      href="/vaerktoejer/terminsberegner"
                      className="font-medium underline underline-offset-2"
                    >
                      Beregn din termin
                    </Link>
                  </p>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">
                    Dine næste cyklusser
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="bg-gray-50 p-3 text-sm font-medium text-gray-700">
                            Frugtbare dage
                          </th>
                          <th className="bg-gray-50 p-3 text-sm font-medium text-gray-700">
                            Ægløsning
                          </th>
                          <th className="bg-gray-50 p-3 text-sm font-medium text-gray-700">
                            Næste menstruation
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.cycles.map((cycle) => (
                          <tr
                            key={cycle.ovulation.toISOString()}
                            className="border-b border-gray-100 last:border-0"
                          >
                            <td className="p-3 text-sm tabular-nums">
                              {formatDanishDateRange(cycle.fertileStart, cycle.ovulation)}
                            </td>
                            <td className="p-3 text-sm tabular-nums">
                              {formatDanishDayMonth(cycle.ovulation)}
                            </td>
                            <td className="p-3 text-sm tabular-nums text-gray-600">
                              {formatDanishDayMonth(cycle.nextPeriod)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-3 text-xs text-gray-500 text-pretty">
                    Ægløsningen kan flytte sig fra måned til måned – også ved en
                    regelmæssig cyklus. Vil du være mere sikker, kan en
                    ægløsningstest (LH-test) fra apoteket vise, hvornår du
                    faktisk har ægløsning. Beregneren kan ikke bruges som
                    prævention.
                  </p>
                </div>

                <ToolShareImageButton
                  toolSlug="aegloesningsberegner"
                  href={buildOvulationShareUrl(result)}
                  fileName={`aegloesning-${toIsoDate(result.upcoming.ovulation)}.png`}
                  label="Gem din oversigt - Download"
                />
              </>
            ) : (
              <ToolErrorNote message={result.message} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
