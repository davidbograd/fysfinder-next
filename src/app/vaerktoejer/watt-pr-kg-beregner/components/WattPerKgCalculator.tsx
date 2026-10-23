"use client";

import { FormEvent, useState } from "react";
import { Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ToolBandTable } from "@/components/features/tools/ToolBandTable";
import { ToolGenderSelector } from "@/components/features/tools/ToolGenderSelector";
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
  ToolStatGrid,
} from "@/components/features/tools/ToolResult";
import type { Gender } from "@/lib/bodyFat";
import {
  computeWattPerKg,
  PowerSource,
  WattPerKgResult,
  WattPerKgSuccess,
} from "@/lib/calculators/watt-per-kg";
import {
  formatCompact,
  formatDecimal,
  formatInteger,
} from "@/lib/calculators/format";
import {
  FieldErrors,
  findMissingFields,
  hasFieldErrors,
} from "@/lib/calculators/required-fields";
import { buildWattPerKgShareUrl } from "@/lib/og/cycling-share";
import { notifyToolCompleted } from "@/lib/tools/tool-completion";
import { PublishedToolRating } from "@/lib/tools/tool-ratings";
import { useScrollToResult } from "@/components/features/tools/useScrollToResult";

type FieldKey = "gender" | "watts" | "weightKg";

const SOURCES: ToolMethodOption<PowerSource>[] = [
  {
    value: "ftp",
    title: "Jeg kender min FTP",
    description: "Fra din cykelcomputer, Zwift, TrainerRoad eller en tidligere test.",
  },
  {
    value: "test20",
    title: "20-minutterstest",
    description: "Din gennemsnitlige effekt på 20 minutter all out. FTP er 95 % af den.",
  },
  {
    value: "ramp",
    title: "Ramptest",
    description: "Dit bedste minut i en ramptest. FTP er 75 % af den.",
  },
];

const WATTS_LABEL: Record<PowerSource, { label: string; hint: string }> = {
  ftp: {
    label: "FTP",
    hint: "Den effekt, du kan holde i omkring en time.",
  },
  test20: {
    label: "Gennemsnitlig effekt på 20 minutter",
    hint: "Kør 20 minutter så hårdt, du kan holde jævnt hele vejen.",
  },
  ramp: {
    label: "Bedste minut i ramptesten",
    hint: "Den højeste effekt, du holdt i et helt minut, før du stoppede.",
  },
};

const SOURCE_SUMMARY: Record<PowerSource, string> = {
  ftp: "FTP",
  test20: "20-min test",
  ramp: "ramptest",
};

function describeProfile(profile: WattPerKgSuccess["profile"]): string {
  return [
    profile.gender === "male" ? "Mand" : "Kvinde",
    `${formatInteger(profile.watts)} W (${SOURCE_SUMMARY[profile.source]})`,
    `${formatCompact(profile.weightKg)} kg`,
  ].join(" · ");
}

interface WattPerKgCalculatorProps {
  rating?: PublishedToolRating | null;
}

export function WattPerKgCalculator({ rating }: WattPerKgCalculatorProps) {
  const [source, setSource] = useState<PowerSource>("ftp");
  const [gender, setGender] = useState<Gender | "">("");
  const [watts, setWatts] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [result, setResult] = useState<WattPerKgResult | null>(null);
  const resultRef = useScrollToResult(result);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<FieldKey>>({});

  const clearError = (field: FieldKey) =>
    setFieldErrors(({ [field]: _removed, ...rest }) => rest);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const missing = findMissingFields<FieldKey>([
      { key: "gender", label: "Køn", value: gender, choice: true },
      { key: "watts", label: "Watt", value: watts },
      { key: "weightKg", label: "Vægt", value: weightKg },
    ]);

    if (hasFieldErrors(missing)) {
      setFieldErrors(missing);
      setResult(null);
      return;
    }

    setFieldErrors({});
    const calculation = computeWattPerKg({ source, gender, watts, weightKg });
    setResult(calculation);
    if (calculation.ok) {
      notifyToolCompleted("watt-pr-kg-beregner");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
              <Bike className="h-5 w-5" />
              Watt pr. kg beregner
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
                  setResult(null);
                }}
              />
            </div>

            <ToolGenderSelector
              value={gender}
              error={fieldErrors.gender}
              onChange={(value) => {
                setGender(value);
                clearError("gender");
              }}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <ToolNumberField
                id="watt-watts"
                label={WATTS_LABEL[source].label}
                unit="watt"
                placeholder="f.eks. 250"
                allowDecimal={false}
                value={watts}
                error={fieldErrors.watts}
                hint={WATTS_LABEL[source].hint}
                onChange={(value) => {
                  setWatts(value);
                  clearError("watts");
                }}
              />
              <ToolNumberField
                id="watt-weight"
                label="Vægt"
                unit="kg"
                placeholder="f.eks. 75"
                value={weightKg}
                error={fieldErrors.weightKg}
                hint="Din vægt uden cykel og udstyr."
                onChange={(value) => {
                  setWeightKg(value);
                  clearError("weightKg");
                }}
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-brand-primary text-white hover:bg-brand-primary/90"
              >
                Beregn watt pr. kg
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
              <CardDescription className="tabular-nums">
                {describeProfile(result.profile)}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {result.ok ? (
              <>
                <ToolPrimaryResult
                  label="Din watt pr. kg"
                  value={`${formatDecimal(result.wattsPerKg, 2)} W/kg`}
                  icon={
                    <span
                      aria-hidden
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white"
                    >
                      <Bike className="h-7 w-7 text-brand-primary" />
                    </span>
                  }
                  badge={result.level}
                  caption="FTP delt med din kropsvægt"
                />

                <ToolStatGrid
                  items={[
                    {
                      label: "FTP brugt i beregningen",
                      value: `${formatInteger(result.ftpWatts)} W`,
                      caption:
                        result.profile.source === "ftp"
                          ? "Som du indtastede den"
                          : `Estimeret fra din ${SOURCE_SUMMARY[result.profile.source]}`,
                    },
                    ...(result.nextLevel
                      ? [
                          {
                            label: `Til "${result.nextLevel.label}"`,
                            value: `+${formatInteger(result.nextLevel.extraWatts)} W`,
                            caption: `Eller ${formatCompact(result.nextLevel.lessKg)} kg lettere ved samme effekt`,
                          },
                        ]
                      : []),
                  ]}
                />

                <ToolBandTable
                  title={`Niveauer for ${result.profile.gender === "male" ? "mænd" : "kvinder"}`}
                  valueHeader="W/kg ved FTP"
                  bands={result.bands}
                  currentLabel={result.level}
                  footnote="Niveauerne bygger på Andrew Coggans power-profil. Watt pr. kg afgør, hvor hurtigt du kører op ad bakke – på flad vej betyder dine samlede watt og din aerodynamik mere."
                />

                <ToolShareImageButton
                  toolSlug="watt-pr-kg-beregner"
                  href={buildWattPerKgShareUrl(result)}
                  fileName={`watt-pr-kg-${result.wattsPerKg.toFixed(2)}.png`}
                  label="Del din watt pr. kg - Download"
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
