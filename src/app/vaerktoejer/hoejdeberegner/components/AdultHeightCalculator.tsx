"use client";

import { FormEvent, useState } from "react";
import { Ruler } from "lucide-react";
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
import {
  AdultHeightResult,
  ChildSex,
  computeAdultHeight,
} from "@/lib/calculators/adult-height";
import { formatCompact, formatDecimal } from "@/lib/calculators/format";
import {
  FieldErrors,
  findMissingFields,
  hasFieldErrors,
} from "@/lib/calculators/required-fields";
import { notifyToolCompleted } from "@/lib/tools/tool-completion";
import { PublishedToolRating } from "@/lib/tools/tool-ratings";
import { HeightComparison } from "./HeightComparison";

type FieldKey = "sex" | "motherHeightCm" | "fatherHeightCm";

const SEXES = [
  { value: "boy" as ChildSex, label: "Dreng" },
  { value: "girl" as ChildSex, label: "Pige" },
];

function describeProfile(
  profile: Extract<AdultHeightResult, { ok: true }>["profile"]
): string {
  return [
    profile.sex === "boy" ? "Dreng" : "Pige",
    `mor ${formatCompact(profile.motherHeightCm)} cm`,
    `far ${formatCompact(profile.fatherHeightCm)} cm`,
  ].join(" · ");
}

interface AdultHeightCalculatorProps {
  rating?: PublishedToolRating | null;
}

export function AdultHeightCalculator({ rating }: AdultHeightCalculatorProps) {
  const [sex, setSex] = useState<ChildSex | "">("");
  const [motherHeightCm, setMotherHeightCm] = useState("");
  const [fatherHeightCm, setFatherHeightCm] = useState("");
  const [result, setResult] = useState<AdultHeightResult | null>(null);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors<FieldKey>>({});

  const clearError = (field: FieldKey) =>
    setFieldErrors(({ [field]: _removed, ...rest }) => rest);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const missing = findMissingFields<FieldKey>([
      { key: "sex", label: "Barnets køn", value: sex, choice: true },
      { key: "motherHeightCm", label: "Mors højde", value: motherHeightCm },
      { key: "fatherHeightCm", label: "Fars højde", value: fatherHeightCm },
    ]);

    if (hasFieldErrors(missing)) {
      setFieldErrors(missing);
      setResult(null);
      return;
    }

    setFieldErrors({});

    const calculation = computeAdultHeight({
      sex,
      motherHeightCm,
      fatherHeightCm,
    });

    setResult(calculation);
    if (calculation.ok) {
      notifyToolCompleted("hoejdeberegner");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
              <Ruler className="h-5 w-5" />
              Højdeberegner
            </CardTitle>
            <ToolRatingSummary rating={rating} />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <ToolChoiceGroup
                label="Barnets køn"
                options={SEXES}
                value={sex}
                error={fieldErrors.sex}
                onChange={(value) => {
                  setSex(value);
                  clearError("sex");
                }}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ToolNumberField
                id="height-mother"
                label="Mors højde"
                unit="cm"
                placeholder="f.eks. 170"
                value={motherHeightCm}
                error={fieldErrors.motherHeightCm}
                onChange={(value) => {
                  setMotherHeightCm(value);
                  clearError("motherHeightCm");
                }}
              />
              <ToolNumberField
                id="height-father"
                label="Fars højde"
                unit="cm"
                placeholder="f.eks. 182"
                value={fatherHeightCm}
                error={fieldErrors.fatherHeightCm}
                onChange={(value) => {
                  setFatherHeightCm(value);
                  clearError("fatherHeightCm");
                }}
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-brand-primary text-white hover:bg-brand-primary/90"
              >
                Beregn sluthøjde
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
                  label="Forventet sluthøjde"
                  value={`${formatDecimal(result.predictedHeightCm)} cm`}
                  caption={`De fleste børn ender mellem ${formatDecimal(
                    result.rangeLowCm
                  )} og ${formatDecimal(result.rangeHighCm)} cm`}
                />

                <HeightComparison
                  key={`${result.profile.motherHeightCm}-${result.profile.fatherHeightCm}-${result.predictedHeightCm}`}
                  motherHeightCm={result.profile.motherHeightCm}
                  fatherHeightCm={result.profile.fatherHeightCm}
                  childHeightCm={result.predictedHeightCm}
                  rangeLowCm={result.rangeLowCm}
                  rangeHighCm={result.rangeHighCm}
                  childLabel={result.profile.sex === "boy" ? "Dreng" : "Pige"}
                />

                <ToolStatGrid
                  items={[
                    {
                      label: "Forældrenes gennemsnit",
                      value: `${formatDecimal(result.parentAverageCm)} cm`,
                      caption: "Udgangspunktet for beregningen",
                    },
                    {
                      label: "Forventet interval",
                      value: `${formatDecimal(
                        result.rangeLowCm
                      )} – ${formatDecimal(result.rangeHighCm)} cm`,
                      caption: "Cirka 8,5 cm til hver side",
                    },
                  ]}
                />

                <div className="rounded-xl bg-gray-50 p-4">
                  <h3 className="mb-2 font-semibold text-gray-900">
                    Sådan er tallet beregnet
                  </h3>
                  <p className="text-sm text-gray-600 text-pretty">
                    Vi bruger midtforældre-metoden: gennemsnittet af forældrenes
                    højde, hvor drenge lægger 6,5 cm til og piger trækker 6,5 cm
                    fra. Metoden rammer de fleste børn, men arv fra resten af
                    familien, ernæring, søvn og sygdom kan flytte sluthøjden
                    inden for – og nogle gange uden for – intervallet.
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
