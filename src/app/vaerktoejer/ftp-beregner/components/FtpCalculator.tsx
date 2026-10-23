"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Bike, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ToolMethodOption,
  ToolMethodSelector,
} from "@/components/features/tools/ToolMethodSelector";
import { ToolNumberField } from "@/components/features/tools/ToolNumberField";
import { ToolRatingSummary } from "@/components/features/tools/ToolRatingSummary";
import { ToolShareImageButton } from "@/components/features/tools/ToolShareImageButton";
import {
  ToolErrorNote,
  ToolPrimaryResult,
} from "@/components/features/tools/ToolResult";
import {
  computeFtp,
  formatZoneRange,
  FtpResult,
  PowerSource,
} from "@/lib/calculators/ftp";
import { formatInteger } from "@/lib/calculators/format";
import {
  FieldErrors,
  findMissingFields,
  hasFieldErrors,
} from "@/lib/calculators/required-fields";
import { buildFtpShareUrl } from "@/lib/og/cycling-share";
import { notifyToolCompleted } from "@/lib/tools/tool-completion";
import { PublishedToolRating } from "@/lib/tools/tool-ratings";
import { useScrollToResult } from "@/components/features/tools/useScrollToResult";

type FieldKey = "watts";
type TestSource = Exclude<PowerSource, "ftp">;

const SOURCES: ToolMethodOption<TestSource>[] = [
  {
    value: "test20",
    title: "20-minutterstest",
    description: "Din gennemsnitlige effekt over 20 minutter i en hård, jævn test.",
  },
  {
    value: "ramp",
    title: "Ramptest",
    description: "Dit bedste minut i en test, hvor belastningen stiger trin for trin.",
  },
];

const WATTS_FIELD: Record<TestSource, { label: string; hint: string }> = {
  test20: {
    label: "Gennemsnitlig effekt over 20 minutter (watt)",
    hint: "Din FTP estimeres til 95 % af din gennemsnitlige effekt over 20 minutter.",
  },
  ramp: {
    label: "Bedste gennemsnitlige effekt over ét minut (watt)",
    hint: "Din FTP estimeres til 75 % af den højeste gennemsnitlige effekt over ét minut i ramptesten. Andre ramptestprotokoller kan anvende andre faktorer.",
  },
};

const RESULT_CAPTION: Record<TestSource, (inputWatts: number) => string> = {
  test20: (watts) =>
    `95 % af dine ${formatInteger(watts)} watt i gennemsnit over 20 minutter.`,
  ramp: (watts) =>
    `75 % af dine ${formatInteger(watts)} watt i ramptestens bedste minut.`,
};

const ZONE_ACCENTS: Record<string, string> = {
  Z1: "bg-slate-300",
  Z2: "bg-sky-400",
  Z3: "bg-emerald-400",
  Z4: "bg-amber-400",
  Z5: "bg-orange-500",
  Z6: "bg-rose-500",
  Z7: "bg-purple-600",
};

interface FtpCalculatorProps {
  rating?: PublishedToolRating | null;
}

export function FtpCalculator({ rating }: FtpCalculatorProps) {
  const [source, setSource] = useState<TestSource>("test20");
  const [watts, setWatts] = useState("");
  const [result, setResult] = useState<FtpResult | null>(null);
  const resultRef = useScrollToResult(result);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<FieldKey>>({});

  const resetResult = () => {
    setResult(null);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const missing = findMissingFields<FieldKey>([
      { key: "watts", label: "Watt", value: watts },
    ]);

    if (hasFieldErrors(missing)) {
      setFieldErrors(missing);
      resetResult();
      return;
    }

    setFieldErrors({});
    const calculation = computeFtp({ source, watts });
    setResult(calculation);
    if (calculation.ok) {
      notifyToolCompleted("ftp-beregner");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
              <Zap className="h-5 w-5" />
              FTP beregner
            </CardTitle>
            <ToolRatingSummary rating={rating} />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <ToolMethodSelector
                label="Hvad har du målt?"
                options={SOURCES}
                value={source}
                onChange={(value) => {
                  setSource(value);
                  resetResult();
                }}
              />
            </div>

            <ToolNumberField
              id="ftp-watts"
              label={WATTS_FIELD[source].label}
              placeholder="f.eks. 250"
              allowDecimal={false}
              value={watts}
              error={fieldErrors.watts}
              hint={WATTS_FIELD[source].hint}
              onChange={(value) => {
                setWatts(value);
                setFieldErrors({});
                resetResult();
              }}
            />

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-brand-primary text-white hover:bg-brand-primary/90"
              >
                Beregn min FTP
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card ref={resultRef} className="rounded-2xl scroll-mt-24">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Dit resultat</CardTitle>
            {result.ok && (
              <CardDescription>
                {SOURCES.find((option) => option.value === result.source)?.title}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {result.ok ? (
              <>
                <ToolPrimaryResult
                  label="Din estimerede FTP"
                  value={`${formatInteger(result.ftp)} watt`}
                  icon={
                    <span
                      aria-hidden
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white"
                    >
                      <Bike className="h-7 w-7 text-brand-primary" />
                    </span>
                  }
                  caption={RESULT_CAPTION[source](result.inputWatts)}
                />

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Dine wattzoner til cykeltræning
                  </h3>
                  <ol className="space-y-2">
                    {result.zones.map((zone) => (
                      <li
                        key={zone.id}
                        className="flex items-start gap-3 rounded-xl bg-gray-50 p-4"
                      >
                        <span
                          aria-hidden
                          className={`mt-1 h-8 w-1.5 shrink-0 rounded-full ${ZONE_ACCENTS[zone.id]}`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                            <p className="font-semibold text-gray-900">
                              {zone.id} · {zone.name}
                            </p>
                            <p className="text-sm font-semibold tabular-nums text-gray-900">
                              {formatZoneRange(zone)}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-gray-600 text-pretty">
                            {zone.description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  <p className="text-xs text-gray-500 text-pretty">
                    Zonerne bygger på Andrew Coggans syv effektzoner. Z7 er
                    maksimal sprint og kan ikke fastlægges ud fra FTP alene.
                  </p>
                </div>

                <ToolShareImageButton
                  toolSlug="ftp-beregner"
                  href={buildFtpShareUrl(result)}
                  fileName={`ftp-${result.ftp}-watt.png`}
                  label="Del din FTP - Download"
                />

                <p className="text-sm text-gray-600 text-pretty">
                  Vil du se, hvad din FTP svarer til i forhold til din vægt? Brug
                  vores{" "}
                  <Link
                    href="/vaerktoejer/watt-pr-kg-beregner"
                    className="font-medium text-brand-primary underline underline-offset-2"
                  >
                    watt pr. kg-beregner
                  </Link>
                  .
                </p>
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
