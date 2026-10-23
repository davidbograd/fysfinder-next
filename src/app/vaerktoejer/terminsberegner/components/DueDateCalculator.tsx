"use client";

import { FormEvent, useState } from "react";
import { Baby } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ToolDateField } from "@/components/features/tools/ToolDateField";
import {
  ToolMethodOption,
  ToolMethodSelector,
} from "@/components/features/tools/ToolMethodSelector";
import { ToolNumberField } from "@/components/features/tools/ToolNumberField";
import { ToolRatingSummary } from "@/components/features/tools/ToolRatingSummary";
import {
  ToolErrorNote,
  ToolPrimaryResult,
  ToolStatGrid,
} from "@/components/features/tools/ToolResult";
import {
  formatDanishDate,
  formatDanishWeekday,
  toIsoDate,
  todayIsoDate,
} from "@/lib/calculators/dates";
import {
  computeDueDate,
  DueDateMethod,
  DueDateResult,
  DueDateSuccess,
  formatGestationalAge,
  STANDARD_CYCLE_DAYS,
} from "@/lib/calculators/due-date";
import { formatInteger } from "@/lib/calculators/format";
import {
  FieldErrors,
  findMissingFields,
  hasFieldErrors,
} from "@/lib/calculators/required-fields";
import { notifyToolCompleted } from "@/lib/tools/tool-completion";
import { PublishedToolRating } from "@/lib/tools/tool-ratings";
import { ToolShareImageButton } from "@/components/features/tools/ToolShareImageButton";
import { buildDueDateShareUrl, canShareDueDate } from "@/lib/og/due-date-share";
import { PregnancyTimeline, TrimesterProgress } from "./PregnancyTimeline";
import { useScrollToResult } from "@/components/features/tools/useScrollToResult";

type FieldKey = "date";

const METHODS: ToolMethodOption<DueDateMethod>[] = [
  {
    value: "lastPeriod",
    title: "Sidste menstruation",
    description: "Ud fra første dag i din sidste menstruation – den mest brugte metode.",
  },
  {
    value: "conception",
    title: "Undfangelse eller fertilitetsbehandling",
    description: "Kender du datoen for undfangelse, insemination eller ægudtagning.",
  },
];

const DATE_FIELD: Record<DueDateMethod, { label: string; hint: string }> = {
  lastPeriod: {
    label: "Første dag i din sidste menstruation",
    hint: "Den første dag med blødning – ikke dagen, hvor den stoppede.",
  },
  conception: {
    label: "Dato for undfangelse eller behandling",
    hint: "Ved insemination (IUI): inseminationsdagen. Ved IVF: dagen for ægudtagning – eller oplægningen ved frosne æg.",
  },
};

function describeProfile(profile: DueDateSuccess["profile"]): string {
  if (profile.method === "conception") {
    return `Undfangelse ${formatDanishDate(profile.date)}`;
  }
  return `Sidste menstruation ${formatDanishDate(profile.date)} · ${profile.cycleLength} dages cyklus`;
}

const STATUS_NOTE: Partial<Record<DueDateSuccess["status"], string>> = {
  planned:
    "Datoen ligger i fremtiden. Når graviditeten er begyndt, kan du se, hvilken uge du er i.",
  ended: "Terminsperioden for denne dato er passeret.",
};

function describeDaysUntilDue(days: number): string {
  if (days === 0) return "Termin i dag";
  if (days < 0) return `${formatInteger(-days)} dage over termin`;
  return `${formatInteger(days)} dage til termin`;
}

interface DueDateCalculatorProps {
  rating?: PublishedToolRating | null;
}

export function DueDateCalculator({ rating }: DueDateCalculatorProps) {
  const [method, setMethod] = useState<DueDateMethod>("lastPeriod");
  const [date, setDate] = useState("");
  const [cycleLength, setCycleLength] = useState(String(STANDARD_CYCLE_DAYS));
  const [result, setResult] = useState<DueDateResult | null>(null);
  const resultRef = useScrollToResult(result);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<FieldKey>>({});

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const missing = findMissingFields<FieldKey>([
      { key: "date", label: "Datoen", value: date, choice: true },
    ]);
    if (hasFieldErrors(missing)) {
      setFieldErrors(missing);
      setResult(null);
      return;
    }

    setFieldErrors({});
    const calculation = computeDueDate({
      method,
      date,
      cycleLength,
      today: todayIsoDate(),
    });
    setResult(calculation);
    if (calculation.ok) {
      notifyToolCompleted("terminsberegner");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
              <Baby className="h-5 w-5" />
              Terminsberegner
            </CardTitle>
            <ToolRatingSummary rating={rating} />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <ToolMethodSelector
                label="Beregn ud fra"
                options={METHODS}
                value={method}
                onChange={(value) => {
                  setMethod(value);
                  setResult(null);
                }}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ToolDateField
                id="termin-date"
                label={DATE_FIELD[method].label}
                hint={DATE_FIELD[method].hint}
                value={date}
                error={fieldErrors.date}
                onChange={(value) => {
                  setDate(value);
                  setFieldErrors({});
                }}
              />
              {method === "lastPeriod" && (
                <ToolNumberField
                  id="termin-cycle"
                  label="Længde på din cyklus"
                  unit="dage"
                  placeholder="28"
                  allowDecimal={false}
                  value={cycleLength}
                  onChange={setCycleLength}
                  hint="Fra første blødningsdag til dagen før næste menstruation. De fleste har 28 dage."
                />
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-brand-primary text-white hover:bg-brand-primary/90"
              >
                Beregn termin
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card ref={resultRef} className="rounded-2xl scroll-mt-24">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Din termin</CardTitle>
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
                  label="Din forventede terminsdato"
                  value={formatDanishDate(result.dueDate)}
                  icon={
                    <span
                      aria-hidden
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white"
                    >
                      <Baby className="h-7 w-7 text-brand-primary" />
                    </span>
                  }
                  caption={
                    result.status === "ended"
                      ? `En ${formatDanishWeekday(result.dueDate)}`
                      : `En ${formatDanishWeekday(result.dueDate)} · ${describeDaysUntilDue(result.daysUntilDue)}`
                  }
                />

                {result.status !== "ongoing" && (
                  <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700 text-pretty">
                    {STATUS_NOTE[result.status]}
                  </p>
                )}

                {result.status === "ongoing" && (
                  <>
                    <ToolStatGrid
                      items={[
                        {
                          label: "Graviditetsuge",
                          value: `${result.gestationalWeeks}+${result.gestationalDays}`,
                          caption: `Du er i ${result.currentWeek}. uge`,
                        },
                        {
                          label: "Trimester",
                          value: `${result.trimester}. trimester`,
                        },
                        {
                          label: "Gennemført",
                          value: `${result.progressPct} %`,
                          caption: "af en graviditet på 40 uger",
                        },
                      ]}
                    />

                    <TrimesterProgress result={result} />
                  </>
                )}

                {canShareDueDate(result) && (
                  <ToolShareImageButton
                    toolSlug="terminsberegner"
                    href={buildDueDateShareUrl(result)}
                    fileName={`termin-${toIsoDate(result.dueDate)}.png`}
                    label="Del din termin - Download"
                  />
                )}

                {result.cycleAdjustmentDays !== 0 && (
                  <div className="rounded-xl bg-brand-beige p-4">
                    <p className="text-sm text-gray-700 text-pretty">
                      <strong>Justeret for din cyklus:</strong> terminen er
                      flyttet {Math.abs(result.cycleAdjustmentDays)} dage{" "}
                      {result.cycleAdjustmentDays > 0 ? "senere" : "tidligere"},
                      fordi din cyklus er {result.profile.cycleLength} dage og
                      ikke 28.
                      {result.isCycleUncertain &&
                        " Ved en så kort eller lang cyklus er beregningen mere usikker – scanningen giver en mere præcis termin."}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">
                    Vigtige datoer i din graviditet
                  </h3>
                  <PregnancyTimeline result={result} />
                  <p className="mt-4 text-xs text-gray-500 text-pretty">
                    Scanningerne er omtrentlige tidspunkter – du får den
                    præcise tid af din region. Ved nakkefoldsscanningen
                    fastsættes din endelige termin ud fra barnets størrelse.
                    Uge {formatGestationalAge(0)} er første dag i sidste
                    menstruation.
                  </p>
                </div>
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
