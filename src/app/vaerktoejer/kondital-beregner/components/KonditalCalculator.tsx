"use client";

import { FormEvent, useState } from "react";
import { HeartPulse, PlayCircle } from "lucide-react";
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
import {
  ToolErrorNote,
  ToolPrimaryResult,
  ToolStatGrid,
} from "@/components/features/tools/ToolResult";
import type { Gender } from "@/lib/bodyFat";
import {
  computeKondital,
  KonditalMethod,
  KonditalResult,
} from "@/lib/calculators/kondital";
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
import { useScrollToResult } from "@/components/features/tools/useScrollToResult";
import { ToolShareImageButton } from "@/components/features/tools/ToolShareImageButton";
import { buildKonditalShareUrl } from "@/lib/og/tool-share";

type FieldKey = "gender" | keyof typeof initialForm;

const METHODS: ToolMethodOption<KonditalMethod>[] = [
  {
    value: "restingPulse",
    title: "Hvilepuls-metoden",
    description:
      "Brug din hvilepuls og din alder. Du skal ikke løbe eller teste noget – bare tælle pulsen, mens du sidder stille.",
    effort: "Nem",
    precision: "Mindre præcis",
  },
  {
    value: "cooper",
    title: "Cooper-testen",
    description:
      "Løb så langt du kan på 12 minutter, fx på en 400 meter bane, og indtast distancen.",
    effort: "Kræver en hård test",
    precision: "Mest præcis",
  },
];

const initialForm = {
  age: "",
  restingPulse: "",
  distanceMeters: "",
  weightKg: "",
};

function describeProfile(
  profile: Extract<KonditalResult, { ok: true }>["profile"]
): string {
  const gender = profile.gender === "male" ? "mand" : "kvinde";
  const parts = [`${formatCompact(profile.age, 0)}-årig ${gender}`];

  if (profile.restingPulse !== null) {
    parts.push(`hvilepuls ${formatCompact(profile.restingPulse, 0)}`);
  }
  if (profile.distanceMeters !== null) {
    parts.push(`${formatInteger(profile.distanceMeters)} m på 12 min`);
  }
  if (profile.weightKg !== null) {
    parts.push(`${formatCompact(profile.weightKg)} kg`);
  }

  return parts.join(" · ");
}

interface KonditalCalculatorProps {
  rating?: PublishedToolRating | null;
}

export function KonditalCalculator({ rating }: KonditalCalculatorProps) {
  const [method, setMethod] = useState<KonditalMethod>("restingPulse");
  const [gender, setGender] = useState<Gender | "">("");
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState<KonditalResult | null>(null);
  const resultRef = useScrollToResult(result);

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
      ...(method === "restingPulse"
        ? [{ key: "restingPulse" as const, label: "Hvilepuls", value: form.restingPulse }]
        : [
            {
              key: "distanceMeters" as const,
              label: "Distance på 12 minutter",
              value: form.distanceMeters,
            },
          ]),
    ]);

    if (hasFieldErrors(missing)) {
      setFieldErrors(missing);
      setResult(null);
      return;
    }

    setFieldErrors({});

    const calculation = computeKondital({
      method,
      gender,
      age: form.age,
      restingPulse: form.restingPulse,
      distanceMeters: form.distanceMeters,
      weightKg: form.weightKg,
    });

    setResult(calculation);
    if (calculation.ok) {
      notifyToolCompleted("kondital-beregner");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
              <HeartPulse className="h-5 w-5" />
              Kondital beregner
            </CardTitle>
            <ToolRatingSummary rating={rating} />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <ToolMethodSelector
                label="Vælg metode"
                options={METHODS}
                value={method}
                onChange={(value) => {
                  setMethod(value);
                  setResult(null);
                  setFieldErrors({});
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
                id="kondital-age"
                label="Alder"
                unit="år"
                placeholder="f.eks. 35"
                allowDecimal={false}
                value={form.age}
                onChange={updateField("age")}
                error={fieldErrors.age}
              />
              <ToolNumberField
                id="kondital-weight"
                label="Vægt"
                unit="kg"
                placeholder="f.eks. 80"
                optional
                value={form.weightKg}
                onChange={updateField("weightKg")}
              />

              {method === "restingPulse" ? (
                <ToolNumberField
                  id="kondital-resting-pulse"
                  label="Hvilepuls"
                  unit="slag/min"
                  placeholder="f.eks. 60"
                  allowDecimal={false}
                  value={form.restingPulse}
                  onChange={updateField("restingPulse")}
                  error={fieldErrors.restingPulse}
                  hint={
                    <>
                      <span className="block">
                        Tæl slagene i et helt minut, efter du har siddet stille i
                        fem minutter – ikke lige efter kaffe eller træning.
                      </span>
                      <a
                        href="https://www.youtube.com/watch?v=BSlRvD-CZSo"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1.5 inline-flex items-center gap-1 font-medium text-brand-primary underline underline-offset-2 hover:text-brand-primary/80"
                      >
                        <PlayCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        Se hvordan du tæller pulsen
                      </a>
                    </>
                  }
                />
              ) : (
                <ToolNumberField
                  id="kondital-distance"
                  label="Distance på 12 minutter"
                  unit="meter"
                  placeholder="f.eks. 2400"
                  allowDecimal={false}
                  value={form.distanceMeters}
                  onChange={updateField("distanceMeters")}
                  error={fieldErrors.distanceMeters}
                  hint="Løb så langt du kan på præcis 12 minutter."
                />
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-brand-primary text-white hover:bg-brand-primary/90"
              >
                Beregn kondital
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
                  label="Dit kondital"
                  value={formatDecimal(result.kondital)}
                  badge={result.category}
                  caption="ml ilt pr. kg kropsvægt pr. minut (VO2-max)"
                />

                <ToolStatGrid
                  items={[
                    ...(result.maxPulse !== null
                      ? [
                          {
                            label: "Makspuls brugt i beregningen",
                            value: `${result.maxPulse} slag/min`,
                            caption: "Estimeret ud fra din alder",
                          },
                        ]
                      : []),
                    ...(result.litersPerMinute !== null
                      ? [
                          {
                            label: "Maksimal iltoptagelse",
                            value: `${formatDecimal(result.litersPerMinute, 2)} l/min`,
                            caption: "Din samlede iltoptagelse ved maksimal indsats",
                          },
                        ]
                      : []),
                  ]}
                />

                <ToolBandTable
                  title={`Sådan ligger dit kondital (${result.ageGroupLabel})`}
                  valueHeader="Kondital"
                  bands={result.bands}
                  currentLabel={result.category}
                  footnote="Tabellen viser almindeligt brugte referenceværdier for din aldersgruppe. Et kondital er et estimat – det siger noget om din kondition, men ikke alt om dit helbred."
                />

                <ToolShareImageButton
                  toolSlug="kondital-beregner"
                  href={buildKonditalShareUrl(result)}
                  fileName={`kondital-${result.kondital}.png`}
                  label="Del dit kondital - Download"
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
