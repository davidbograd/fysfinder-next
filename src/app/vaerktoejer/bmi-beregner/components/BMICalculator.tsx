"use client";

import React, { useState } from "react";
import { Calculator } from "lucide-react";
import { notifyToolCompleted } from "@/lib/tools/tool-completion";
import { ToolRatingSummary } from "@/components/features/tools/ToolRatingSummary";
import { PublishedToolRating } from "@/lib/tools/tool-ratings";
import {
  FieldErrors,
  findMissingFields,
  hasFieldErrors,
} from "@/lib/calculators/required-fields";
import { useScrollToResult } from "@/components/features/tools/useScrollToResult";
import { ToolShareImageButton } from "@/components/features/tools/ToolShareImageButton";
import { buildBmiShareUrl } from "@/lib/og/tool-share";
import { BMI_BANDS, BmiCategory, bmiCategory } from "@/lib/calculators/bmi";
import { formatDecimal } from "@/lib/calculators/format";
import { ToolBandTable } from "@/components/features/tools/ToolBandTable";
import { ToolPrimaryResult } from "@/components/features/tools/ToolResult";

type FieldKey = "weight" | "height";

const BMI_DESCRIPTIONS: Record<BmiCategory, string> = {
  Undervægtig:
    "Dit BMI er under normalområdet. Konsulter en sundhedsprofessionel for rådgivning.",
  "Normal vægt":
    "Dit BMI er inden for det sunde normalområde. Fortsæt med at opretholde en sund livsstil.",
  Overvægtig:
    "Dit BMI er over normalområdet. Overvej en sundere kost og mere motion.",
  "Svært overvægtig":
    "Dit BMI er betydeligt over normalområdet. Søg professionel hjælp til vægttab.",
};

const INPUT_CLASSES =
  "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-logo-blue focus:border-transparent";
const INPUT_ERROR_CLASSES = "border-red-400 focus:ring-red-400";

interface BMIResult {
  bmi: number;
  category: string;
  description: string;
}

interface BMICalculatorProps {
  rating?: PublishedToolRating | null;
}

export function BMICalculator({ rating }: BMICalculatorProps) {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [result, setResult] = useState<BMIResult | null>(null);
  const resultRef = useScrollToResult(result);
  const [isCalculating, setIsCalculating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<FieldKey>>({});

  const clearError = (field: FieldKey) =>
    setFieldErrors(({ [field]: _removed, ...rest }) => rest);

  const getBMICategory = (
    bmi: number
  ): { category: string; description: string } => {
    const category = bmiCategory(bmi);
    return { category, description: BMI_DESCRIPTIONS[category] };
  };

  const calculateBMI = () => {
    setIsCalculating(true);

    // Simulate a brief calculation delay for better UX
    setTimeout(() => {
      const w = parseFloat(weight);
      const h = parseFloat(height);

      // Konverter højde fra cm til meter
      const heightInMeters = h / 100;
      // Beregn BMI
      const calculatedBmi = w / (heightInMeters * heightInMeters);
      const roundedBmi = Math.round(calculatedBmi * 10) / 10;

      const categoryInfo = getBMICategory(roundedBmi);

      setResult({
        bmi: roundedBmi,
        category: categoryInfo.category,
        description: categoryInfo.description,
      });
      setIsCalculating(false);
      notifyToolCompleted("bmi-beregner");
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const missing = findMissingFields<FieldKey>([
      { key: "weight", label: "Vægt", value: weight },
      { key: "height", label: "Højde", value: height },
    ]);
    if (hasFieldErrors(missing)) {
      setFieldErrors(missing);
      setResult(null);
      return;
    }
    setFieldErrors({});
    calculateBMI();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Calculator className="w-6 h-6 text-logo-blue" />
          <h2 className="text-2xl font-semibold text-gray-900">BMI-beregner</h2>
        </div>
        <ToolRatingSummary rating={rating} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="weight"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Vægt (kg)
            </label>
            <input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => {
                setWeight(e.target.value);
                clearError("weight");
              }}
              placeholder="f.eks. 70"
              aria-invalid={fieldErrors.weight ? true : undefined}
              aria-describedby={fieldErrors.weight ? "weight-error" : undefined}
              className={`${INPUT_CLASSES} ${fieldErrors.weight ? INPUT_ERROR_CLASSES : ""}`}
              min="30"
              max="300"
              step="0.1"
            />
            {fieldErrors.weight && (
              <p id="weight-error" className="mt-2 text-xs font-medium text-red-600">
                {fieldErrors.weight}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="height"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Højde (cm)
            </label>
            <input
              id="height"
              type="number"
              value={height}
              onChange={(e) => {
                setHeight(e.target.value);
                clearError("height");
              }}
              placeholder="f.eks. 175"
              aria-invalid={fieldErrors.height ? true : undefined}
              aria-describedby={fieldErrors.height ? "height-error" : undefined}
              className={`${INPUT_CLASSES} ${fieldErrors.height ? INPUT_ERROR_CLASSES : ""}`}
              min="100"
              max="250"
              step="1"
            />
            {fieldErrors.height && (
              <p id="height-error" className="mt-2 text-xs font-medium text-red-600">
                {fieldErrors.height}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isCalculating}
          className="w-full bg-logo-blue text-white py-3 px-4 rounded-full font-medium hover:bg-logo-blue/90 focus:outline-none focus:ring-2 focus:ring-logo-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isCalculating ? "Beregner..." : "Beregn BMI"}
        </button>
      </form>

      {result && (
        <div ref={resultRef} className="mt-8 scroll-mt-24 space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Dit resultat
          </h3>

          <ToolPrimaryResult
            label="Dit BMI"
            value={formatDecimal(result.bmi)}
            badge={result.category}
            caption={result.description}
          />

          <ToolBandTable
            title="BMI-kategorier"
            valueHeader="BMI"
            bands={BMI_BANDS}
            currentLabel={result.category}
          />

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-gray-900 mb-2">Vigtige noter</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                • BMI er kun en indikator og tager ikke højde for muskelmasse
              </li>
              <li>
                • Konsulter altid en sundhedsprofessionel for personlig
                rådgivning
              </li>
              <li>• BMI-kategorier kan variere for ældre og atleter</li>
              <li>• Fokuser på en sund livsstil frem for kun BMI-tallet</li>
            </ul>
          </div>

          <ToolShareImageButton
            toolSlug="bmi-beregner"
            href={buildBmiShareUrl(result.bmi)}
            fileName={`bmi-${result.bmi}.png`}
            label="Gem dit BMI - Download"
          />
        </div>
      )}
    </div>
  );
}
