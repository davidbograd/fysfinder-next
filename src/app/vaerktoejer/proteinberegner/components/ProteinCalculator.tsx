"use client";

import { FormEvent, useState } from "react";
import { Beef } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ToolChoiceGroup } from "@/components/features/tools/ToolChoiceGroup";
import { ToolNumberField } from "@/components/features/tools/ToolNumberField";
import { ToolRatingSummary } from "@/components/features/tools/ToolRatingSummary";
import {
  ToolErrorNote,
  ToolPrimaryResult,
  ToolStatGrid,
} from "@/components/features/tools/ToolResult";
import {
  computeProteinNeed,
  LactationStatus,
  PregnancyStatus,
  ProteinActivity,
  ProteinGoal,
  ProteinResult,
} from "@/lib/calculators/protein";
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
import { notifyToolCompleted } from "@/lib/tools/tool-completion";
import { PublishedToolRating } from "@/lib/tools/tool-ratings";

type FieldKey = "weightKg" | "age";

const GOALS = [
  { value: "vaegttab" as ProteinGoal, label: "Vægttab" },
  { value: "vedligehold" as ProteinGoal, label: "Vedligehold vægt" },
  { value: "muskelopbygning" as ProteinGoal, label: "Muskelopbygning" },
];

const ACTIVITIES: { value: ProteinActivity; label: string }[] = [
  { value: "stillesiddende", label: "Stillesiddende – ingen eller lidt motion" },
  { value: "let", label: "Let aktiv – gang eller let træning 1-2 gange om ugen" },
  { value: "moderat", label: "Moderat – træner 3-4 gange om ugen" },
  { value: "haard", label: "Hård træning – 5 gange om ugen eller mere" },
];

/** Korte udgaver af mål og aktivitetsniveau til opsummeringen over resultatet. */
const GOAL_SUMMARY: Record<ProteinGoal, string> = {
  vaegttab: "vægttab",
  vedligehold: "vedligehold",
  muskelopbygning: "muskelopbygning",
};

const ACTIVITY_SUMMARY: Record<ProteinActivity, string> = {
  stillesiddende: "stillesiddende",
  let: "let aktiv",
  moderat: "moderat aktiv",
  haard: "hård træning",
};

const YES_NO = [
  { value: "nej" as const, label: "Nej" },
  { value: "ja" as const, label: "Ja" },
];

const PREGNANCY_OPTIONS: { value: PregnancyStatus; label: string }[] = [
  { value: "nej", label: "Nej" },
  { value: "trimester1", label: "Ja, i 1. trimester" },
  { value: "trimester2", label: "Ja, i 2. trimester" },
  { value: "trimester3", label: "Ja, i 3. trimester" },
];

const LACTATION_OPTIONS: { value: LactationStatus; label: string }[] = [
  { value: "nej", label: "Nej" },
  { value: "fuld", label: "Ja, fuld amning (kun modermælk)" },
  { value: "delvis", label: "Ja, delvis amning (barn får også anden mad)" },
];

const PREGNANCY_SUMMARY: Record<PregnancyStatus, string | null> = {
  nej: null,
  trimester1: "gravid, 1. trimester",
  trimester2: "gravid, 2. trimester",
  trimester3: "gravid, 3. trimester",
};

const LACTATION_SUMMARY: Record<LactationStatus, string | null> = {
  nej: null,
  fuld: "fuld amning",
  delvis: "delvis amning",
};

function describeProfile(
  profile: Extract<ProteinResult, { ok: true }>["profile"]
): string {
  return [
    `${formatCompact(profile.age, 0)} år`,
    `${formatCompact(profile.weightKg)} kg`,
    GOAL_SUMMARY[profile.goal],
    ACTIVITY_SUMMARY[profile.activity],
    PREGNANCY_SUMMARY[profile.pregnancy],
    LACTATION_SUMMARY[profile.lactation],
  ]
    .filter(Boolean)
    .join(" · ");
}

function describeExtraProtein(
  result: Extract<ProteinResult, { ok: true }>
): string {
  const parts: string[] = [];
  if (result.pregnancyExtraGrams > 0) {
    parts.push(`${result.pregnancyExtraGrams} g for graviditet`);
  }
  if (result.lactationExtraGrams > 0) {
    parts.push(`${result.lactationExtraGrams} g for amning`);
  }
  return parts.join(" og ");
}

const SELECT_CLASSES =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const MEAL_COUNTS = [2, 3, 4, 5, 6];

const PROTEIN_SOURCES = [
  { food: "Kyllingebryst", portion: "100 g", grams: 23 },
  { food: "Hakket oksekød, 5 %", portion: "100 g", grams: 21 },
  { food: "Laks", portion: "100 g", grams: 20 },
  { food: "Æg", portion: "1 stk.", grams: 7 },
  { food: "Skyr", portion: "100 g", grams: 11 },
  { food: "Hytteost", portion: "100 g", grams: 13 },
  { food: "Linser, kogte", portion: "100 g", grams: 9 },
  { food: "Tofu", portion: "100 g", grams: 12 },
];

interface ProteinCalculatorProps {
  rating?: PublishedToolRating | null;
}

export function ProteinCalculator({ rating }: ProteinCalculatorProps) {
  const [weightKg, setWeightKg] = useState("");
  const [age, setAge] = useState("");
  const [goal, setGoal] = useState<ProteinGoal>("vedligehold");
  const [activity, setActivity] = useState<ProteinActivity>("moderat");
  const [mealsPerDay, setMealsPerDay] = useState("3");
  const [isPregnantOrBreastfeeding, setIsPregnantOrBreastfeeding] =
    useState(false);
  const [pregnancy, setPregnancy] = useState<PregnancyStatus>("nej");
  const [lactation, setLactation] = useState<LactationStatus>("nej");
  const [result, setResult] = useState<ProteinResult | null>(null);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors<FieldKey>>({});

  const clearError = (field: FieldKey) =>
    setFieldErrors(({ [field]: _removed, ...rest }) => rest);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const missing = findMissingFields<FieldKey>([
      { key: "weightKg", label: "Vægt", value: weightKg },
      { key: "age", label: "Alder", value: age },
    ]);

    if (hasFieldErrors(missing)) {
      setFieldErrors(missing);
      setResult(null);
      return;
    }

    setFieldErrors({});

    const calculation = computeProteinNeed({
      weightKg,
      age,
      goal,
      activity,
      mealsPerDay,
      pregnancy: isPregnantOrBreastfeeding ? pregnancy : "nej",
      lactation: isPregnantOrBreastfeeding ? lactation : "nej",
    });

    setResult(calculation);
    if (calculation.ok) {
      notifyToolCompleted("proteinberegner");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
              <Beef className="h-5 w-5" />
              Proteinberegner
            </CardTitle>
            <ToolRatingSummary rating={rating} />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <ToolNumberField
                id="protein-weight"
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
                id="protein-age"
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="protein-activity">Aktivitetsniveau</Label>
              <select
                id="protein-activity"
                value={activity}
                onChange={(event) =>
                  setActivity(event.target.value as ProteinActivity)
                }
                className={SELECT_CLASSES}
              >
                {ACTIVITIES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="protein-goal">Mål</Label>
              <select
                id="protein-goal"
                value={goal}
                onChange={(event) => setGoal(event.target.value as ProteinGoal)}
                className={SELECT_CLASSES}
              >
                {GOALS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4 border-t border-gray-100 pt-4">
              <ToolChoiceGroup
                label="Er du gravid eller ammer du?"
                className="w-full max-w-sm"
                options={YES_NO}
                value={isPregnantOrBreastfeeding ? "ja" : "nej"}
                onChange={(value) =>
                  setIsPregnantOrBreastfeeding(value === "ja")
                }
              />
              {isPregnantOrBreastfeeding && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="protein-pregnancy">Er du gravid?</Label>
                    <select
                      id="protein-pregnancy"
                      value={pregnancy}
                      onChange={(event) =>
                        setPregnancy(event.target.value as PregnancyStatus)
                      }
                      className={SELECT_CLASSES}
                    >
                      {PREGNANCY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {pregnancy !== "nej" && (
                      <p className="text-xs text-gray-500 text-pretty">
                        Brug din vægt fra før graviditeten – tillægget for
                        graviditet lægges oven i.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="protein-lactation">Ammer du?</Label>
                    <select
                      id="protein-lactation"
                      value={lactation}
                      onChange={(event) =>
                        setLactation(event.target.value as LactationStatus)
                      }
                      className={SELECT_CLASSES}
                    >
                      {LACTATION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-brand-primary text-white hover:bg-brand-primary/90"
              >
                Beregn proteinbehov
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className="rounded-2xl">
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
                  label="Dit daglige proteinbehov"
                  value={`${formatInteger(result.gramsPerDayTarget)} g protein`}
                  caption={`Anbefalet interval: ${formatInteger(
                    result.gramsPerDayLow
                  )}–${formatInteger(result.gramsPerDayHigh)} g om dagen`}
                />

                <ToolStatGrid
                  items={[
                    {
                      label: "Pr. måltid",
                      value: `${formatInteger(
                        result.gramsPerDayTarget / Number(mealsPerDay)
                      )} g`,
                      caption: (
                        <>
                          Fordelt på{" "}
                          <select
                            aria-label="Måltider om dagen"
                            value={mealsPerDay}
                            onChange={(event) =>
                              setMealsPerDay(event.target.value)
                            }
                            className="rounded-full border border-gray-300 bg-white px-2 py-0.5 text-xs font-medium text-gray-900 tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {MEAL_COUNTS.map((count) => (
                              <option key={count} value={String(count)}>
                                {count}
                              </option>
                            ))}
                          </select>{" "}
                          måltider
                        </>
                      ),
                    },
                    {
                      label: "Pr. kg kropsvægt",
                      value: `${formatDecimal(
                        result.gramsPerKgLow
                      )}–${formatDecimal(result.gramsPerKgHigh)} g`,
                      caption:
                        result.pregnancyExtraGrams + result.lactationExtraGrams >
                        0
                          ? "Før tillæg for graviditet og amning"
                          : "Dit anbefalede niveau",
                    },
                    {
                      label: "Energi fra protein",
                      value: `${formatInteger(result.kcalFromProtein)} kcal`,
                      caption: "4 kcal pr. gram protein",
                    },
                  ]}
                />

                {result.isSeniorAdjusted && (
                  <div className="rounded-xl bg-brand-beige p-4">
                    <p className="text-sm text-brand-primary text-pretty">
                      <strong>Justeret for alder:</strong> fra 65 år skal der
                      mere protein til at sætte den samme muskelopbygning i
                      gang. Derfor er anbefalingen hævet i forhold til en yngre
                      person med samme vægt og aktivitetsniveau.
                    </p>
                  </div>
                )}

                {result.pregnancyExtraGrams + result.lactationExtraGrams >
                  0 && (
                  <div className="rounded-xl bg-brand-beige p-4">
                    <p className="text-sm text-brand-primary text-pretty">
                      <strong>Justeret for graviditet og amning:</strong>{" "}
                      Resultatet indeholder {describeExtraProtein(result)} om
                      dagen ud over dit almindelige behov, som anbefalet i de
                      nordiske næringsstofanbefalinger (NNR 2023). Er du i
                      tvivl, så spørg din jordemoder, læge eller en klinisk
                      diætist.
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">
                    Sådan ser protein ud i maden
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="bg-gray-50 p-3 text-sm font-medium text-gray-700">
                            Fødevare
                          </th>
                          <th className="bg-gray-50 p-3 text-sm font-medium text-gray-700">
                            Portion
                          </th>
                          <th className="bg-gray-50 p-3 text-sm font-medium text-gray-700">
                            Protein
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {PROTEIN_SOURCES.map((source) => (
                          <tr
                            key={source.food}
                            className="border-b border-gray-100 last:border-0"
                          >
                            <td className="p-3 text-sm">{source.food}</td>
                            <td className="p-3 text-sm text-gray-600">
                              {source.portion}
                            </td>
                            <td className="p-3 text-sm tabular-nums">
                              {source.grams} g
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-3 text-xs text-gray-500 text-pretty">
                    Dit mål på {formatInteger(result.gramsPerDayTarget)} g svarer
                    fx til ca.{" "}
                    {formatInteger((result.gramsPerDayTarget / 23) * 100)} g
                    kyllingebryst fordelt over dagen – de fleste når nemmere
                    målet ved at have protein med i hvert måltid.
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
