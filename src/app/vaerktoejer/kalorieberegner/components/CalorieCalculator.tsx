"use client";

import React, { useState } from "react";
import { Calculator, Info } from "lucide-react";

interface CalorieResult {
  bmr: number;
  tdee: number;
  weightLoss: number;
  weightGain: number;
}

export function CalorieCalculator() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [activityLevel, setActivityLevel] = useState("1.2");
  const [result, setResult] = useState<CalorieResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

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
      const weightLoss = tdee - 500; // 500 calorie deficit for weight loss
      const weightGain = tdee + 300; // 300 calorie surplus for weight gain

      setResult({
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        weightLoss: Math.round(weightLoss),
        weightGain: Math.round(weightGain),
      });
      setIsCalculating(false);
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weight && height && age && gender) {
      calculateCalories();
    }
  };

  const isFormValid = weight && height && age && gender;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-6 h-6 text-logo-blue" />
        <h2 className="text-2xl font-semibold text-gray-900">
          Kalorieberegner
        </h2>
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
              onChange={(e) => setWeight(e.target.value)}
              placeholder="f.eks. 70"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-logo-blue focus:border-transparent"
              min="30"
              max="300"
              step="0.1"
            />
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
              onChange={(e) => setHeight(e.target.value)}
              placeholder="f.eks. 175"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-logo-blue focus:border-transparent"
              min="100"
              max="250"
              step="1"
            />
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
              onChange={(e) => setAge(e.target.value)}
              placeholder="f.eks. 30"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-logo-blue focus:border-transparent"
              min="15"
              max="100"
              step="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Køn
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setGender("male")}
                className={`flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors h-10 px-6 border border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                  gender === "male"
                    ? "bg-gray-800 text-white hover:bg-gray-800/90 hover:text-white"
                    : ""
                }`}
              >
                Mand
              </button>
              <button
                type="button"
                onClick={() => setGender("female")}
                className={`flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors h-10 px-6 border border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                  gender === "female"
                    ? "bg-gray-800 text-white hover:bg-gray-800/90 hover:text-white"
                    : ""
                }`}
              >
                Kvinde
              </button>
            </div>
          </div>
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
          disabled={!isFormValid || isCalculating}
          className="w-full bg-logo-blue text-white py-3 px-4 rounded-md font-medium hover:bg-logo-blue/90 focus:outline-none focus:ring-2 focus:ring-logo-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
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
                <p className="text-xl font-bold text-orange-700">
                  {result.weightLoss} kcal/dag
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  For at tabe ca. 0,5 kg om ugen
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
