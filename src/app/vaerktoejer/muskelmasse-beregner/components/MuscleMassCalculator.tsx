"use client";

import { FormEvent, useState } from "react";
import { Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ToolChoiceGroup } from "@/components/features/tools/ToolChoiceGroup";
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
  computeMuscleMass,
  MuscleMassMethod,
  MuscleMassResult,
} from "@/lib/calculators/muscle-mass";
import { formatCompact, formatDecimal } from "@/lib/calculators/format";
import {
  FieldErrors,
  findMissingFields,
  hasFieldErrors,
} from "@/lib/calculators/required-fields";
import { notifyToolCompleted } from "@/lib/tools/tool-completion";
import { PublishedToolRating } from "@/lib/tools/tool-ratings";

type FieldKey = "gender" | keyof typeof initialForm;

function describeProfile(
  profile: Extract<MuscleMassResult, { ok: true }>["profile"]
): string {
  const gender = profile.gender === "male" ? "mand" : "kvinde";
  return [
    `${formatCompact(profile.age, 0)}-årig ${gender}`,
    `${formatCompact(profile.heightCm)} cm`,
    `${formatCompact(profile.weightKg)} kg`,
  ].join(" · ");
}

const METHODS: ToolMethodOption<MuscleMassMethod>[] = [
  {
    value: "simple",
    title: "Uden målebånd",
    description:
      "Kun højde, vægt, alder og køn. Et hurtigt overslag, hvis du ikke har et målebånd ved hånden.",
    effort: "Nem",
    precision: "Mindre præcis",
  },
  {
    value: "tape",
    title: "Med målebånd",
    description:
      "Mål hals og talje. Beregn din fedtprocent derfra, og hvor meget af din vægt der er muskel.",
    effort: "Tager et par minutter",
    precision: "Mest præcis",
  },
];

const GENDERS = [
  { value: "male" as Gender, label: "Mand" },
  { value: "female" as Gender, label: "Kvinde" },
];

const initialForm = {
  age: "",
  heightCm: "",
  weightKg: "",
  neckCm: "",
  waistCm: "",
  hipCm: "",
};

interface MuscleMassCalculatorProps {
  rating?: PublishedToolRating | null;
}

export function MuscleMassCalculator({ rating }: MuscleMassCalculatorProps) {
  const [method, setMethod] = useState<MuscleMassMethod>("simple");
  const [gender, setGender] = useState<Gender | "">("");
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState<MuscleMassResult | null>(null);

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
      ...(method === "tape"
        ? [
            { key: "neckCm" as const, label: "Halsomkreds", value: form.neckCm },
            { key: "waistCm" as const, label: "Taljeomkreds", value: form.waistCm },
            ...(gender === "female"
              ? [{ key: "hipCm" as const, label: "Hofteomkreds", value: form.hipCm }]
              : []),
          ]
        : []),
    ]);

    if (hasFieldErrors(missing)) {
      setFieldErrors(missing);
      setResult(null);
      return;
    }

    setFieldErrors({});

    const calculation = computeMuscleMass({ method, gender, ...form });

    setResult(calculation);
    if (calculation.ok) {
      notifyToolCompleted("muskelmasse-beregner");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
              <Dumbbell className="h-5 w-5" />
              Muskelmasse beregner
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
                id="muscle-age"
                label="Alder"
                unit="år"
                placeholder="f.eks. 35"
                allowDecimal={false}
                value={form.age}
                onChange={updateField("age")}
                error={fieldErrors.age}
              />
              <ToolNumberField
                id="muscle-height"
                label="Højde"
                unit="cm"
                placeholder="f.eks. 180"
                value={form.heightCm}
                onChange={updateField("heightCm")}
                error={fieldErrors.heightCm}
              />
              <ToolNumberField
                id="muscle-weight"
                label="Vægt"
                unit="kg"
                placeholder="f.eks. 80"
                value={form.weightKg}
                onChange={updateField("weightKg")}
                error={fieldErrors.weightKg}
              />

              {method === "tape" && (
                <>
                  <ToolNumberField
                    id="muscle-neck"
                    label="Halsomkreds"
                    unit="cm"
                    placeholder="f.eks. 38"
                    value={form.neckCm}
                    onChange={updateField("neckCm")}
                    error={fieldErrors.neckCm}
                    hint="Mål lige under strubehovedet."
                  />
                  <ToolNumberField
                    id="muscle-waist"
                    label="Taljeomkreds"
                    unit="cm"
                    placeholder="f.eks. 85"
                    value={form.waistCm}
                    onChange={updateField("waistCm")}
                    error={fieldErrors.waistCm}
                    hint="Mål ved navlen, afslappet mave."
                  />
                  {gender === "female" && (
                    <ToolNumberField
                      id="muscle-hip"
                      label="Hofteomkreds"
                      unit="cm"
                      placeholder="f.eks. 95"
                      value={form.hipCm}
                      onChange={updateField("hipCm")}
                      error={fieldErrors.hipCm}
                      hint="Mål det bredeste sted over sædemusklerne."
                    />
                  )}
                </>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-brand-primary text-white hover:bg-brand-primary/90"
              >
                Beregn muskelmasse
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
                  label="Estimeret muskelmasse"
                  value={`${formatDecimal(result.muscleMassKg)} kg`}
                  caption={`Svarer til ${formatDecimal(
                    result.muscleSharePct
                  )} % af din kropsvægt`}
                />

                <ToolStatGrid
                  items={[
                    {
                      label: "Muskelmasseindeks",
                      value: `${formatDecimal(result.muscleIndex)} kg/m²`,
                      caption: "Muskelmasse i forhold til din højde",
                    },
                    ...(result.bodyFatPct !== null
                      ? [
                          {
                            label: "Fedtprocent",
                            value: `${formatDecimal(result.bodyFatPct)} %`,
                            caption: result.bodyFatCategory ?? undefined,
                          },
                        ]
                      : []),
                    ...(result.leanMassKg !== null
                      ? [
                          {
                            label: "Fedtfri masse",
                            value: `${formatDecimal(result.leanMassKg)} kg`,
                            caption: "Muskler, knogler, organer og væske",
                          },
                        ]
                      : []),
                    ...(result.fatMassKg !== null
                      ? [
                          {
                            label: "Fedtmasse",
                            value: `${formatDecimal(result.fatMassKg)} kg`,
                            caption: "Din samlede mængde kropsfedt",
                          },
                        ]
                      : []),
                  ]}
                />

                <div className="rounded-xl bg-gray-50 p-4">
                  <h3 className="mb-2 font-semibold text-gray-900">
                    Sådan bruger du tallet
                  </h3>
                  <p className="text-sm text-gray-600 text-pretty">
                    Muskelmasse beregnet ud fra mål og vægt er et estimat, og
                    det enkelte tal siger ikke så meget i sig selv. Det
                    interessante er udviklingen: mål under samme forhold – fx
                    om morgenen før morgenmad – hver 4.–8. uge, og se om
                    muskelmassen bevæger sig den rigtige vej. Skal du have en
                    præcis måling, er en DEXA-scanning vejen frem.
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
