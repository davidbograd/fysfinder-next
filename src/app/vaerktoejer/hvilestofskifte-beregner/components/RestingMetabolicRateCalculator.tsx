"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ToolChoiceGroup } from "@/components/features/tools/ToolChoiceGroup";
import { ToolNumberField } from "@/components/features/tools/ToolNumberField";
import { ToolRatingSummary } from "@/components/features/tools/ToolRatingSummary";
import {
  ToolErrorNote,
  ToolPrimaryResult,
  ToolStatGrid,
} from "@/components/features/tools/ToolResult";
import type { Gender } from "@/lib/bodyFat";
import {
  computeRestingMetabolicRate,
  RestingMetabolicRateResult,
  RMR_SHARE_OF_TOTAL_HIGH_PCT,
  RMR_SHARE_OF_TOTAL_LOW_PCT,
} from "@/lib/calculators/resting-metabolic-rate";
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

type FieldKey = "gender" | keyof typeof initialForm;

const GENDERS = [
  { value: "male" as Gender, label: "Mand" },
  { value: "female" as Gender, label: "Kvinde" },
];

const initialForm = { age: "", heightCm: "", weightKg: "" };

function describeProfile(
  profile: Extract<
    RestingMetabolicRateResult,
    { ok: true }
  >["profile"]
): string {
  const gender = profile.gender === "male" ? "mand" : "kvinde";
  return [
    `${formatCompact(profile.age, 0)}-årig ${gender}`,
    `${formatCompact(profile.heightCm)} cm`,
    `${formatCompact(profile.weightKg)} kg`,
  ].join(" · ");
}

interface RestingMetabolicRateCalculatorProps {
  rating?: PublishedToolRating | null;
}

export function RestingMetabolicRateCalculator({
  rating,
}: RestingMetabolicRateCalculatorProps) {
  const [gender, setGender] = useState<Gender | "">("");
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState<RestingMetabolicRateResult | null>(null);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors<FieldKey>>({});

  const clearError = (field: FieldKey) =>
    setFieldErrors(({ [field]: _removed, ...rest }) => rest);

  const updateField = (field: keyof typeof initialForm) => (value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    clearError(field);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const missing = findMissingFields<FieldKey>([
      { key: "gender", label: "Køn", value: gender, choice: true },
      { key: "age", label: "Alder", value: form.age },
      { key: "heightCm", label: "Højde", value: form.heightCm },
      { key: "weightKg", label: "Vægt", value: form.weightKg },
    ]);

    if (hasFieldErrors(missing)) {
      setFieldErrors(missing);
      setResult(null);
      return;
    }

    setFieldErrors({});

    const calculation = computeRestingMetabolicRate({ gender, ...form });

    setResult(calculation);
    if (calculation.ok) {
      notifyToolCompleted("hvilestofskifte-beregner");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
              <Flame className="h-5 w-5" />
              Hvilestofskifte beregner
            </CardTitle>
            <ToolRatingSummary rating={rating} />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <ToolChoiceGroup
                label="Køn"
                options={GENDERS}
                value={gender}
                error={fieldErrors.gender}
                onChange={(value) => {
                  setGender(value);
                  clearError("gender");
                }}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ToolNumberField
                id="rmr-age"
                label="Alder"
                unit="år"
                placeholder="f.eks. 35"
                allowDecimal={false}
                value={form.age}
                onChange={updateField("age")}
                error={fieldErrors.age}
              />
              <ToolNumberField
                id="rmr-height"
                label="Højde"
                unit="cm"
                placeholder="f.eks. 175"
                value={form.heightCm}
                onChange={updateField("heightCm")}
                error={fieldErrors.heightCm}
              />
              <ToolNumberField
                id="rmr-weight"
                label="Vægt"
                unit="kg"
                placeholder="f.eks. 75"
                value={form.weightKg}
                onChange={updateField("weightKg")}
                error={fieldErrors.weightKg}
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-brand-primary text-white hover:bg-brand-primary/90"
              >
                Beregn hvilestofskifte
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
                  label="Dit hvilestofskifte"
                  value={`${formatInteger(result.kcalPerDay)} kcal/dag`}
                  caption="Det din krop bruger på at holde sig i gang i hvile – vejrtrækning, hjerteslag, temperatur og organer"
                />

                <ToolStatGrid
                  items={[
                    {
                      label: "Pr. time",
                      value: `${formatDecimal(result.kcalPerHour)} kcal`,
                      caption: "Også mens du sover",
                    },
                    {
                      label: "I kilojoule",
                      value: `${formatInteger(result.kjPerDay)} kJ/dag`,
                      caption: "Samme tal i kJ",
                    },
                    {
                      label: "Pr. kg kropsvægt",
                      value: `${formatDecimal(result.kcalPerKgPerDay)} kcal`,
                      caption: "Pr. dag",
                    },
                  ]}
                />

                <div className="rounded-xl bg-gray-50 p-4">
                  <h3 className="mb-2 font-semibold text-gray-900">
                    Hvad kan du bruge tallet til?
                  </h3>
                  <p className="text-sm text-gray-600 text-pretty">
                    Hvilestofskiftet er typisk{" "}
                    {RMR_SHARE_OF_TOTAL_LOW_PCT}–{RMR_SHARE_OF_TOTAL_HIGH_PCT} %
                    af dit samlede daglige energiforbrug. Oven i kommer alt, du
                    bevæger dig – fra træning til gang, husarbejde og uro på
                    stolen – samt den energi, der går til at fordøje maden. Skal
                    du bruge dit samlede daglige kaloriebehov, så brug{" "}
                    <Link
                      href="/vaerktoejer/kalorieberegner"
                      className="font-medium text-logo-blue hover:underline"
                    >
                      kalorieberegneren
                    </Link>
                    .
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
