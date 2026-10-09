"use client";

// Updated: 2026-09-29 - Compact weekly weight-loss dropdown sits inline in the result sentence.

import React, { useState } from "react";
import { Calculator, Info } from "lucide-react";
import { notifyToolCompleted } from "@/lib/tools/tool-completion";
import {
  ToolGender,
  ToolGenderSelector,
} from "@/components/features/tools/ToolGenderSelector";
import { ToolRatingSummary } from "@/components/features/tools/ToolRatingSummary";
import { PublishedToolRating } from "@/lib/tools/tool-ratings";
import {
  FieldErrors,
  findMissingFields,
  hasFieldErrors,
} from "@/lib/calculators/required-fields";

type FieldKey = "weight" | "height" | "age" | "gender";

const INPUT_CLASSES =
  "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-logo-blue focus:border-transparent";
const INPUT_ERROR_CLASSES = "border-red-400 focus:ring-red-400";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-xs font-medium text-red-600">
      {message}
    </p>
  );
}

interface CalorieResult {
  bmr: number;
  tdee: number;
  weightGain: number;
}

/** Dagligt kalorieunderskud pr. kg ugentligt vægttab. 0,5 kg/uge giver 500 kcal/dag, som før. */
const DAILY_KCAL_DEFICIT_PER_KG_PER_WEEK = 1000;

const WEEKLY_LOSS_OPTIONS = [
  { value: "0.25", label: "0,25 kg" },
  { value: "0.5", label: "0,5 kg" },
  { value: "0.75", label: "0,75 kg" },
  { value: "1", label: "1 kg" },
] as const;

function caloriesForWeeklyLoss(tdee: number, weeklyLossKg: string): number {
  return tdee - Number(weeklyLossKg) * DAILY_KCAL_DEFICIT_PER_KG_PER_WEEK;
}

interface CalorieCalculatorProps {
  rating?: PublishedToolRating | null;
}

export function CalorieCalculator({ rating }: CalorieCalculatorProps) {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<ToolGender | "">("");
  const [activityLevel, setActivityLevel] = useState("1.2");
  const [weeklyLossKg, setWeeklyLossKg] = useState("0.5");
  const [result, setResult] = useState<CalorieResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<FieldKey>>({});

  const clearError = (field: FieldKey) =>
    setFieldErrors(({ [field]: _removed, ...rest }) => rest);

  const inputClasses = (field: FieldKey) =>
    `${INPUT_CLASSES} ${fieldErrors[field] ? INPUT_ERROR_CLASSES : ""}`;

  const errorProps = (field: FieldKey) => ({
    "aria-invalid": fieldErrors[field] ? true : undefined,
    "aria-describedby": fieldErrors[field] ? `${field}-error` : undefined,
  });

  // BMR beregning (Harris-Benedict formel)
  const calculateBMR = (w: number, h: number, a: number, g: string): number => {
    if (g === "male") {
      return 66.5 + 13.75 * w + 5.003 * h - 6.755 * a;
    } else {
      return 655 + 9.563 * w + 1.85 * h - 4.676 * a;
    }
  };

  const calculateCalories = () => {
    setIsCalculating(true);

    // Simulate a brief calculation delay for better UX
    setTimeout(() => {
      const w = parseFloat(weight);
      const h = parseFloat(height);
      const a = parseFloat(age);
      const activity = parseFloat(activityLevel);

      const bmr = calculateBMR(w, h, a, gender);
      const tdee = bmr * activity;
      const weightGain = tdee + 300; // 300 calorie surplus for weight gain

      setResult({
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        weightGain: Math.round(weightGain),
      });
      setIsCalculating(false);
      notifyToolCompleted("kalorieberegner");
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const missing = findMissingFields<FieldKey>([
      { key: "weight", label: "Vægt", value: weight },
      { key: "height", label: "Højde", value: height },
      { key: "age", label: "Alder", value: age },
      { key: "gender", label: "Køn", value: gender, choice: true },
    ]);
    if (hasFieldErrors(missing)) {
      setFieldErrors(missing);
      setResult(null);
      return;
    }
    setFieldErrors({});
    calculateCalories();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Calculator className="w-6 h-6 text-logo-blue" />
          <h2 className="text-2xl font-semibold text-gray-900">
            Kalorieberegner
          </h2>
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
              {...errorProps("weight")}
              className={inputClasses("weight")}
              min="30"
              max="300"
              step="0.1"
            />
            <FieldError id="weight-error" message={fieldErrors.weight} />
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
              {...errorProps("height")}
              className={inputClasses("height")}
              min="100"
              max="250"
              step="1"
            />
            <FieldError id="height-error" message={fieldErrors.height} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="age"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Alder (år)
            </label>
            <input
              id="age"
              type="number"
              value={age}
              onChange={(e) => {
                setAge(e.target.value);
                clearError("age");
              }}
              placeholder="f.eks. 30"
              {...errorProps("age")}
              className={inputClasses("age")}
              min="15"
              max="100"
              step="1"
            />
            <FieldError id="age-error" message={fieldErrors.age} />
          </div>

          <ToolGenderSelector
            value={gender}
            error={fieldErrors.gender}
            onChange={(value) => {
              setGender(value);
              clearError("gender");
            }}
          />
        </div>

        <div>
          <label
            htmlFor="activity"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Aktivitetsniveau
          </label>
          <select
            id="activity"
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-logo-blue focus:border-transparent"
          >
            <option value="1.2">
              Stillestående (ingen eller minimal motion)
            </option>
            <option value="1.375">
              Let aktivitet (let træning/sport 1-3 dage om ugen)
            </option>
            <option value="1.55">
              Moderat aktivitet (moderat træning/sport 3-5 dage om ugen)
            </option>
            <option value="1.725">
              Høj aktivitet (intens træning/sport 6-7 dage om ugen)
            </option>
            <option value="1.9">
              Meget høj aktivitet (meget intens træning/sport, fysisk krævende
              arbejde)
            </option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isCalculating}
          className="w-full bg-logo-blue text-white py-3 px-4 rounded-full font-medium hover:bg-logo-blue/90 focus:outline-none focus:ring-2 focus:ring-logo-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isCalculating ? "Beregner..." : "Beregn kalorier"}
        </button>
      </form>

      {result && (
        <div className="mt-8 space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Dine resultater
          </h3>

          <div className="grid gap-4">
            <div className="bg-brand-beige p-4 rounded-lg border border-[#104534]/18">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-logo-blue" />
                <h4 className="font-semibold text-gray-900">
                  Grundstofskifte (BMR)
                </h4>
              </div>
              <p className="text-2xl font-bold text-logo-blue">
                {result.bmr} kcal/dag
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Det antal kalorier din krop forbrænder i hvile
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-gray-900 mb-2">
                Vedligeholdelse (TDEE)
              </h4>
              <p className="text-2xl font-bold text-green-700">
                {result.tdee} kcal/dag
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Det antal kalorier du skal spise for at holde din nuværende vægt
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-gray-900 mb-2">Vægttab</h4>
                <p className="text-xl font-bold text-orange-700 tabular-nums">
                  {caloriesForWeeklyLoss(result.tdee, weeklyLossKg)} kcal/dag
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm text-gray-600">
                  <span>For at tabe ca.</span>
                  <label htmlFor="weekly-loss" className="sr-only">
                    Vægttab pr. uge
                  </label>
                  <select
                    id="weekly-loss"
                    value={weeklyLossKg}
                    onChange={(e) => setWeeklyLossKg(e.target.value)}
                    className="h-7 rounded-md border border-orange-300 bg-white px-1.5 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-logo-blue"
                  >
                    {WEEKLY_LOSS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span>om ugen</span>
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-gray-900 mb-2">Vægtøgning</h4>
                <p className="text-xl font-bold text-purple-700">
                  {result.weightGain} kcal/dag
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  For at tage på i muskelmasse
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mt-6">
            <h4 className="font-semibold text-gray-900 mb-2">Vigtige noter</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Disse tal er estimater baseret på standardformler</li>
              <li>
                • Individuelle forskelle kan påvirke dit faktiske kaloriebehov
              </li>
              <li>
                • Konsulter en sundhedsprofessionel for personlig rådgivning
              </li>
              <li>• Juster gradvist og følg din krops reaktion</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
