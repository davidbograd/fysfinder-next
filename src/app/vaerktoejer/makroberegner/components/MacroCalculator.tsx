"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ToolChoiceGroup } from "@/components/features/tools/ToolChoiceGroup";
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
} from "@/components/features/tools/ToolResult";
import {
  ToolSelectField,
  ToolSelectOption,
} from "@/components/features/tools/ToolSelectField";
import type { Gender } from "@/lib/bodyFat";
import {
  CalorieSource,
  computeMacros,
  Macro,
  MacroResult,
  MacroSplit,
  MacroSuccess,
  needsBodyProfile,
  NNR_RANGES,
} from "@/lib/calculators/macros";
import type { ProteinActivity, ProteinGoal } from "@/lib/calculators/protein";
import {
  formatCompact,
  formatDecimal,
  formatInteger,
} from "@/lib/calculators/format";
import {
  FieldErrors,
  findMissingFields,
  hasFieldErrors,
  RequiredField,
} from "@/lib/calculators/required-fields";
import { buildMacroShareUrl } from "@/lib/og/macro-share";
import { notifyToolCompleted } from "@/lib/tools/tool-completion";
import { PublishedToolRating } from "@/lib/tools/tool-ratings";
import { cn } from "@/lib/utils";
import { useScrollToResult } from "@/components/features/tools/useScrollToResult";

type FieldKey = "kcal" | "gender" | "heightCm" | "weightKg" | "age";

const CALORIE_SOURCES = [
  { value: "estimate" as CalorieSource, label: "Beregn det for mig" },
  { value: "known" as CalorieSource, label: "Jeg kender mit kalorietal" },
];

const ACTIVITIES: ToolSelectOption<ProteinActivity>[] = [
  { value: "stillesiddende", label: "Stillesiddende – ingen eller lidt motion" },
  { value: "let", label: "Let aktiv – gang eller let træning 1-2 gange om ugen" },
  { value: "moderat", label: "Moderat – træner 3-4 gange om ugen" },
  { value: "haard", label: "Hård træning – 5 gange om ugen eller mere" },
];

const GOALS: ToolSelectOption<ProteinGoal>[] = [
  { value: "vaegttab", label: "Vægttab" },
  { value: "vedligehold", label: "Vedligehold vægt" },
  { value: "muskelopbygning", label: "Muskelopbygning" },
];

const SPLITS: ToolMethodOption<MacroSplit>[] = [
  {
    value: "proteinfokus",
    title: "Proteinfokus",
    description:
      "Protein efter din vægt og dit mål, 30 % fedt og resten kulhydrat. Godt udgangspunkt, når du træner.",
  },
  {
    value: "nnr",
    title: "Nordiske anbefalinger",
    description:
      "15 % protein, 33 % fedt og 52 % kulhydrat – den fordeling, de officielle anbefalinger bygger på.",
  },
  {
    value: "lavkulhydrat",
    title: "Lavere kulhydrat",
    description:
      "Protein efter din vægt, 25 % kulhydrat og resten fedt. For dig, der har det bedst med mindre brød og pasta.",
  },
];

const GOAL_SUMMARY: Record<ProteinGoal, string> = {
  vaegttab: "vægttab",
  vedligehold: "vedligehold",
  muskelopbygning: "muskelopbygning",
};

const SPLIT_SUMMARY: Record<MacroSplit, string> = {
  proteinfokus: "proteinfokus",
  nnr: "nordiske anbefalinger",
  lavkulhydrat: "lavere kulhydrat",
};

const MACRO_DISPLAY: Record<
  Macro,
  { label: string; barClass: string; dotClass: string }
> = {
  protein: {
    label: "Protein",
    barClass: "bg-brand-primary",
    dotClass: "bg-brand-primary",
  },
  carbs: { label: "Kulhydrat", barClass: "bg-amber-400", dotClass: "bg-amber-400" },
  fat: { label: "Fedt", barClass: "bg-sky-400", dotClass: "bg-sky-400" },
};

const MACRO_ORDER: Macro[] = ["protein", "carbs", "fat"];
const MEAL_COUNTS = [2, 3, 4, 5, 6];

function describeProfile(profile: MacroSuccess["profile"]): string {
  if (profile.age === null || profile.weightKg === null) {
    return SPLIT_SUMMARY[profile.split];
  }
  return [
    `${formatCompact(profile.age, 0)} år`,
    `${formatCompact(profile.weightKg)} kg`,
    GOAL_SUMMARY[profile.goal],
    SPLIT_SUMMARY[profile.split],
  ].join(" · ");
}

function MacroBar({ macros }: { macros: MacroSuccess["macros"] }) {
  return (
    <div
      className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100"
      aria-hidden
    >
      {MACRO_ORDER.map((macro) => (
        <div
          key={macro}
          className={MACRO_DISPLAY[macro].barClass}
          style={{ width: `${macros[macro].pct}%` }}
        />
      ))}
    </div>
  );
}

interface MacroCalculatorProps {
  rating?: PublishedToolRating | null;
}

export function MacroCalculator({ rating }: MacroCalculatorProps) {
  const [calorieSource, setCalorieSource] = useState<CalorieSource>("estimate");
  const [kcal, setKcal] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [age, setAge] = useState("");
  const [activity, setActivity] = useState<ProteinActivity>("moderat");
  const [goal, setGoal] = useState<ProteinGoal>("vedligehold");
  const [split, setSplit] = useState<MacroSplit>("proteinfokus");
  const [mealsPerDay, setMealsPerDay] = useState("3");
  const [result, setResult] = useState<MacroResult | null>(null);
  const resultRef = useScrollToResult(result);
  const usesBody = needsBodyProfile(calorieSource, split);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<FieldKey>>({});

  const clearError = (field: FieldKey) =>
    setFieldErrors(({ [field]: _removed, ...rest }) => rest);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const calorieFields: RequiredField<FieldKey>[] =
      calorieSource === "known"
        ? [{ key: "kcal", label: "Kalorier om dagen", value: kcal }]
        : [
            { key: "gender", label: "Køn", value: gender, choice: true },
            { key: "heightCm", label: "Højde", value: heightCm },
          ];

    const missing = findMissingFields<FieldKey>([
      ...calorieFields,
      ...(usesBody
        ? [
            { key: "weightKg" as const, label: "Vægt", value: weightKg },
            { key: "age" as const, label: "Alder", value: age },
          ]
        : []),
    ]);

    if (hasFieldErrors(missing)) {
      setFieldErrors(missing);
      setResult(null);
      return;
    }

    setFieldErrors({});
    const calculation = computeMacros({
      calorieSource,
      kcal,
      gender,
      heightCm,
      weightKg,
      age,
      activity,
      goal,
      split,
    });
    setResult(calculation);
    if (calculation.ok) {
      notifyToolCompleted("makroberegner");
    }
  };

  const meals = Number(mealsPerDay);

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
              <PieChart className="h-5 w-5" />
              Makroberegner
            </CardTitle>
            <ToolRatingSummary rating={rating} />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <ToolChoiceGroup
              label="Dit kaloriebehov"
              className="w-full max-w-lg"
              options={CALORIE_SOURCES}
              value={calorieSource}
              onChange={(value) => {
                setCalorieSource(value);
                setResult(null);
                setFieldErrors({});
              }}
            />

            {calorieSource === "known" && (
              <ToolNumberField
                id="makro-kcal"
                label="Kalorier om dagen"
                unit="kcal"
                placeholder="f.eks. 2200"
                allowDecimal={false}
                className="max-w-sm"
                value={kcal}
                error={fieldErrors.kcal}
                hint={
                  <>
                    Dit daglige mål – inklusiv et eventuelt underskud eller
                    overskud. Kender du det ikke, så find det med{" "}
                    <Link
                      href="/vaerktoejer/kalorieberegner"
                      className="font-medium text-brand-primary underline underline-offset-2"
                    >
                      kalorieberegneren
                    </Link>
                    .
                  </>
                }
                onChange={(value) => {
                  setKcal(value);
                  clearError("kcal");
                }}
              />
            )}

            <ToolMethodSelector
              label="Fordeling"
              options={SPLITS}
              value={split}
              onChange={(value) => {
                setSplit(value);
                setResult(null);
                setFieldErrors({});
              }}
            />

            {usesBody && (
              <div className="space-y-6 border-t border-gray-100 pt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {calorieSource === "estimate" && (
                    <ToolGenderSelector
                      value={gender}
                      error={fieldErrors.gender}
                      className="max-w-none"
                      onChange={(value) => {
                        setGender(value);
                        clearError("gender");
                      }}
                    />
                  )}
                  <ToolNumberField
                    id="makro-weight"
                    label="Vægt"
                    unit="kg"
                    placeholder="f.eks. 75"
                    value={weightKg}
                    error={fieldErrors.weightKg}
                    onChange={(value) => {
                      setWeightKg(value);
                      clearError("weightKg");
                    }}
                  />
                  <ToolNumberField
                    id="makro-age"
                    label="Alder"
                    unit="år"
                    placeholder="f.eks. 35"
                    allowDecimal={false}
                    value={age}
                    error={fieldErrors.age}
                    onChange={(value) => {
                      setAge(value);
                      clearError("age");
                    }}
                  />
                  {calorieSource === "estimate" && (
                    <ToolNumberField
                      id="makro-height"
                      label="Højde"
                      unit="cm"
                      placeholder="f.eks. 175"
                      value={heightCm}
                      error={fieldErrors.heightCm}
                      onChange={(value) => {
                        setHeightCm(value);
                        clearError("heightCm");
                      }}
                    />
                  )}
                </div>

                <ToolSelectField
                  id="makro-activity"
                  label="Aktivitetsniveau"
                  options={ACTIVITIES}
                  value={activity}
                  onChange={setActivity}
                />
                <ToolSelectField
                  id="makro-goal"
                  label="Mål"
                  options={GOALS}
                  value={goal}
                  onChange={setGoal}
                  hint={
                    calorieSource === "estimate"
                      ? "Ved vægttab trækkes 500 kcal fra, ved muskelopbygning lægges 300 kcal til."
                      : undefined
                  }
                />
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-brand-primary text-white hover:bg-brand-primary/90"
              >
                Beregn makroer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card ref={resultRef} className="rounded-2xl scroll-mt-24">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Dine makroer</CardTitle>
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
                  label="Dit daglige kaloriemål"
                  value={`${formatInteger(result.kcalPerDay)} kcal`}
                  icon={
                    <span
                      aria-hidden
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white"
                    >
                      <PieChart className="h-7 w-7 text-brand-primary" />
                    </span>
                  }
                  caption={
                    result.maintenanceKcal !== null &&
                    result.maintenanceKcal !== result.kcalPerDay
                      ? `Dit ligevægtsindtag er ca. ${formatInteger(result.maintenanceKcal)} kcal`
                      : undefined
                  }
                />

                <div className="space-y-4">
                  <MacroBar macros={result.macros} />
                  <div className="grid gap-4 sm:grid-cols-3">
                    {MACRO_ORDER.map((macro) => {
                      const amount = result.macros[macro];
                      return (
                        <div
                          key={macro}
                          className="rounded-xl bg-gray-50 p-4 text-center"
                        >
                          <p className="flex items-center justify-center gap-2 text-sm text-gray-600">
                            <span
                              aria-hidden
                              className={cn(
                                "h-2.5 w-2.5 rounded-full",
                                MACRO_DISPLAY[macro].dotClass
                              )}
                            />
                            {MACRO_DISPLAY[macro].label}
                          </p>
                          <p className="mt-1 text-xl font-semibold tabular-nums text-gray-900">
                            {formatInteger(amount.grams)} g
                          </p>
                          <p className="mt-1 text-xs text-gray-500 tabular-nums">
                            {formatInteger(amount.kcal)} kcal · {amount.pct} %
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  {result.proteinPerKg !== null && (
                    <p className="text-xs text-gray-500 text-pretty tabular-nums">
                      Protein svarer til {formatDecimal(result.proteinPerKg)} g
                      pr. kg kropsvægt.
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="mb-3 flex flex-wrap items-center gap-2 text-lg font-semibold text-gray-900">
                    Pr. måltid, fordelt på
                    <select
                      aria-label="Måltider om dagen"
                      value={mealsPerDay}
                      onChange={(event) => setMealsPerDay(event.target.value)}
                      className="rounded-full border border-gray-300 bg-white px-2 py-0.5 text-sm font-medium text-gray-900 tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {MEAL_COUNTS.map((count) => (
                        <option key={count} value={String(count)}>
                          {count}
                        </option>
                      ))}
                    </select>
                    måltider
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {MACRO_ORDER.map((macro) => (
                      <div key={macro} className="rounded-xl border border-gray-100 p-3">
                        <p className="text-xs text-gray-500">
                          {MACRO_DISPLAY[macro].label}
                        </p>
                        <p
                          className="mt-1 text-lg font-semibold tabular-nums text-gray-900"
                          data-testid={`per-meal-${macro}`}
                        >
                          {formatInteger(result.macros[macro].grams / meals)} g
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {result.outsideNnr.length > 0 && (
                  <div className="rounded-xl bg-brand-beige p-4">
                    <p className="text-sm text-gray-700 text-pretty">
                      <strong>Uden for de nordiske anbefalinger:</strong>{" "}
                      {result.outsideNnr
                        .map(
                          (macro) =>
                            `${MACRO_DISPLAY[macro].label.toLowerCase()} (${result.macros[macro].pct} % – anbefalet ${NNR_RANGES[macro][0]}–${NNR_RANGES[macro][1]} %)`
                        )
                        .join(", ")}
                      . Det er helt almindeligt, når du træner eller taber dig,
                      og ikke et problem for raske voksne. Over en længere
                      periode er en fordeling tæt på anbefalingerne et godt
                      udgangspunkt.
                    </p>
                  </div>
                )}

                <ToolShareImageButton
                  toolSlug="makroberegner"
                  href={buildMacroShareUrl(result)}
                  fileName={`makroer-${result.kcalPerDay}-kcal.png`}
                  label="Gem dine makroer - Download"
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
