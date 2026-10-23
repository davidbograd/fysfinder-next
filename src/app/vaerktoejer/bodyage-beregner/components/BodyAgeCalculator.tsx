"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Hourglass, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ToolGenderSelector } from "@/components/features/tools/ToolGenderSelector";
import { ToolNumberField } from "@/components/features/tools/ToolNumberField";
import { ToolRatingSummary } from "@/components/features/tools/ToolRatingSummary";
import {
  ToolErrorNote,
  ToolPrimaryResult,
  ToolStatGrid,
} from "@/components/features/tools/ToolResult";
import {
  ToolSelectField,
  ToolSelectOption,
} from "@/components/features/tools/ToolSelectField";
import type { Gender } from "@/lib/bodyFat";
import {
  computeFitnessAge,
  ExerciseDuration,
  ExerciseFrequency,
  ExerciseIntensity,
  FitnessAgeResult,
  FitnessAgeSuccess,
  MAX_BODY_AGE,
  MIN_BODY_AGE,
} from "@/lib/calculators/fitness-age";
import { formatCompact, formatDecimal } from "@/lib/calculators/format";
import {
  FieldErrors,
  findMissingFields,
  hasFieldErrors,
} from "@/lib/calculators/required-fields";
import { notifyToolCompleted } from "@/lib/tools/tool-completion";
import { PublishedToolRating } from "@/lib/tools/tool-ratings";
import { useScrollToResult } from "@/components/features/tools/useScrollToResult";
import { ToolShareImageButton } from "@/components/features/tools/ToolShareImageButton";
import { buildBodyAgeShareUrl } from "@/lib/og/tool-share";

type FieldKey = "gender" | "age" | "waistCm" | "restingPulse";

const FREQUENCIES: ToolSelectOption<ExerciseFrequency>[] = [
  { value: "sjaeldent", label: "Sjældnere end én gang om ugen" },
  { value: "ugentligt", label: "Én gang om ugen" },
  { value: "flereGange", label: "2–3 gange om ugen" },
  { value: "dagligt", label: "Næsten hver dag" },
];

const INTENSITIES: ToolSelectOption<ExerciseIntensity>[] = [
  { value: "let", label: "Jeg tager det roligt uden at blive forpustet" },
  { value: "moderat", label: "Jeg bliver forpustet og svedig" },
  { value: "haard", label: "Jeg tager mig selv næsten helt ud" },
];

const DURATIONS: ToolSelectOption<ExerciseDuration>[] = [
  { value: "kort", label: "Under 30 minutter" },
  { value: "lang", label: "30 minutter eller mere" },
];

function describeProfile(profile: FitnessAgeSuccess["profile"]): string {
  return [
    profile.gender === "male" ? "Mand" : "Kvinde",
    `${formatCompact(profile.age, 0)} år`,
    `talje ${formatCompact(profile.waistCm)} cm`,
    `hvilepuls ${formatCompact(profile.restingPulse, 0)}`,
  ].join(" · ");
}

function describeBodyAge(result: FitnessAgeSuccess): string {
  if (result.isAtFloor) return `${MIN_BODY_AGE} år eller yngre`;
  if (result.isAtCeiling) return `${MAX_BODY_AGE} år eller ældre`;
  return `${result.bodyAge} år`;
}

function describeDifference(difference: number): string {
  if (difference === 0) return "Samme som din alder";
  const years = Math.abs(difference);
  return difference < 0
    ? `${years} år yngre end din alder`
    : `${years} år ældre end din alder`;
}

interface BodyAgeCalculatorProps {
  rating?: PublishedToolRating | null;
}

export function BodyAgeCalculator({ rating }: BodyAgeCalculatorProps) {
  const [gender, setGender] = useState<Gender | "">("");
  const [age, setAge] = useState("");
  const [waistCm, setWaistCm] = useState("");
  const [restingPulse, setRestingPulse] = useState("");
  const [frequency, setFrequency] = useState<ExerciseFrequency>("flereGange");
  const [intensity, setIntensity] = useState<ExerciseIntensity>("moderat");
  const [duration, setDuration] = useState<ExerciseDuration>("lang");
  const [result, setResult] = useState<FitnessAgeResult | null>(null);
  const resultRef = useScrollToResult(result);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<FieldKey>>({});

  const clearError = (field: FieldKey) =>
    setFieldErrors(({ [field]: _removed, ...rest }) => rest);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const missing = findMissingFields<FieldKey>([
      { key: "gender", label: "Køn", value: gender, choice: true },
      { key: "age", label: "Alder", value: age },
      { key: "waistCm", label: "Taljemål", value: waistCm },
      { key: "restingPulse", label: "Hvilepuls", value: restingPulse },
    ]);

    if (hasFieldErrors(missing)) {
      setFieldErrors(missing);
      setResult(null);
      return;
    }

    setFieldErrors({});
    const calculation = computeFitnessAge({
      gender,
      age,
      waistCm,
      restingPulse,
      frequency,
      intensity,
      duration,
    });
    setResult(calculation);
    if (calculation.ok) {
      notifyToolCompleted("bodyage-beregner");
    }
  };

  const exercises = frequency !== "sjaeldent";

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
              <Hourglass className="h-5 w-5" />
              Bodyage beregner
            </CardTitle>
            <ToolRatingSummary rating={rating} />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                id="bodyage-age"
                label="Alder"
                unit="år"
                placeholder="f.eks. 45"
                allowDecimal={false}
                value={age}
                error={fieldErrors.age}
                onChange={(value) => {
                  setAge(value);
                  clearError("age");
                }}
              />
              <ToolNumberField
                id="bodyage-waist"
                label="Taljemål"
                unit="cm"
                placeholder="f.eks. 90"
                value={waistCm}
                error={fieldErrors.waistCm}
                hint="Mål i højde med navlen, stående og efter en normal udånding."
                onChange={(value) => {
                  setWaistCm(value);
                  clearError("waistCm");
                }}
              />
              <ToolNumberField
                id="bodyage-pulse"
                label="Hvilepuls"
                unit="slag/min"
                placeholder="f.eks. 65"
                allowDecimal={false}
                value={restingPulse}
                error={fieldErrors.restingPulse}
                hint="Sid stille i 10 minutter, og tæl pulsen i 30 sekunder gange 2 – eller brug dit ur."
                onChange={(value) => {
                  setRestingPulse(value);
                  clearError("restingPulse");
                }}
              />
            </div>

            <div className="space-y-4 border-t border-gray-100 pt-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Din træning i fritiden
              </p>
              <ToolSelectField
                id="bodyage-frequency"
                label="Hvor ofte træner eller motionerer du?"
                options={FREQUENCIES}
                value={frequency}
                onChange={setFrequency}
              />
              {exercises && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <ToolSelectField
                    id="bodyage-intensity"
                    label="Hvor hårdt træner du?"
                    options={INTENSITIES}
                    value={intensity}
                    onChange={setIntensity}
                  />
                  <ToolSelectField
                    id="bodyage-duration"
                    label="Hvor længe varer en træning?"
                    options={DURATIONS}
                    value={duration}
                    onChange={setDuration}
                  />
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-brand-primary text-white hover:bg-brand-primary/90"
              >
                Beregn din kropsalder
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
                  label="Din kropsalder"
                  value={describeBodyAge(result)}
                  badge={describeDifference(result.difference)}
                  caption="Den alder, hvor gennemsnittet har din kondition"
                />

                <ToolStatGrid
                  items={[
                    {
                      label: "Dit estimerede kondital",
                      value: formatDecimal(result.estimatedVo2),
                      caption: "ml ilt pr. kg pr. minut (VO2-max)",
                    },
                    {
                      label: "Gennemsnit for din alder",
                      value: formatDecimal(result.averageVo2ForAge),
                      caption: `For ${result.profile.gender === "male" ? "mænd" : "kvinder"} på ${formatCompact(result.profile.age, 0)} år`,
                    },
                  ]}
                />

                {result.levers.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-lg font-semibold text-gray-900">
                      Sådan bliver din krop yngre
                    </h3>
                    <ul className="space-y-2">
                      {result.levers.map((lever) => (
                        <li
                          key={lever.key}
                          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-xl border border-gray-200 p-3"
                        >
                          <span className="flex items-center gap-2 text-sm font-medium text-gray-900">
                            <TrendingDown className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
                            {lever.label}
                          </span>
                          <span className="text-sm tabular-nums text-gray-900">
                            <strong>−{lever.yearsYounger} år</strong>{" "}
                            <span className="text-gray-500">
                              (kropsalder {lever.bodyAge})
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-xs text-gray-500 text-pretty">
                  Beregningen bruger NTNU&apos;s model fra HUNT-studiet med over
                  4.000 raske voksne. Den rammer typisk inden for ±5
                  kondital – omkring ±5 år. Vil du have et mere præcist tal, så
                  test dig selv med{" "}
                  <Link
                    href="/vaerktoejer/kondital-beregner"
                    className="font-medium text-brand-primary underline underline-offset-2"
                  >
                    konditalberegneren
                  </Link>
                  .
                </p>

                <ToolShareImageButton
                  toolSlug="bodyage-beregner"
                  href={buildBodyAgeShareUrl(result)}
                  fileName={`kropsalder-${result.bodyAge}-aar.png`}
                  label="Del din kropsalder - Download"
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
