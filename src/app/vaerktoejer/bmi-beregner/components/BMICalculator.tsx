"use client";

import React, { useState } from "react";
import { Calculator, Info } from "lucide-react";

interface BMIResult {
  bmi: number;
  category: string;
  description: string;
  color: string;
}

export function BMICalculator() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [result, setResult] = useState<BMIResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const getBMICategory = (
    bmi: number
  ): { category: string; description: string; color: string } => {
    if (bmi < 18.5) {
      return {
        category: "Undervægtig",
        description:
          "Dit BMI er under normalområdet. Konsulter en sundhedsprofessionel for rådgivning.",
        color: "blue",
      };
    } else if (bmi >= 18.5 && bmi < 24.9) {
      return {
        category: "Normal vægt",
        description:
          "Dit BMI er inden for det sunde normalområde. Fortsæt med at opretholde en sund livsstil.",
        color: "green",
      };
    } else if (bmi >= 25 && bmi < 29.9) {
      return {
        category: "Overvægtig",
        description:
          "Dit BMI er over normalområdet. Overvej en sundere kost og mere motion.",
        color: "orange",
      };
    } else {
      return {
        category: "Svært overvægtig",
        description:
          "Dit BMI er betydeligt over normalområdet. Søg professionel hjælp til vægttab.",
        color: "red",
      };
    }
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

      const categoryInfo = getBMICategory(calculatedBmi);

      setResult({
        bmi: Math.round(calculatedBmi * 10) / 10, // Round to 1 decimal
        category: categoryInfo.category,
        description: categoryInfo.description,
        color: categoryInfo.color,
      });
      setIsCalculating(false);
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weight && height) {
      calculateBMI();
    }
  };

  const isFormValid = weight && height;

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-50 border-blue-200 text-blue-700";
      case "green":
        return "bg-green-50 border-green-200 text-green-700";
      case "orange":
        return "bg-orange-50 border-orange-200 text-orange-700";
      case "red":
        return "bg-red-50 border-red-200 text-red-700";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-6 h-6 text-logo-blue" />
        <h2 className="text-2xl font-semibold text-gray-900">BMI-beregner</h2>
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

        <button
          type="submit"
          disabled={!isFormValid || isCalculating}
          className="w-full bg-logo-blue text-white py-3 px-4 rounded-md font-medium hover:bg-logo-blue/90 focus:outline-none focus:ring-2 focus:ring-logo-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isCalculating ? "Beregner..." : "Beregn BMI"}
        </button>
      </form>

      {result && (
        <div className="mt-8 space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Dit resultat
          </h3>

          <div
            className={`p-6 rounded-lg border ${getColorClasses(result.color)}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5" />
              <h4 className="font-semibold text-lg">Dit BMI: {result.bmi}</h4>
            </div>
            <p className="text-xl font-bold mb-2">{result.category}</p>
            <p className="text-sm leading-relaxed">{result.description}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">BMI kategorier</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Undervægtig:</span>
                <span className="font-medium">Under 18,5</span>
              </div>
              <div className="flex justify-between">
                <span>Normal vægt:</span>
                <span className="font-medium">18,5 - 24,9</span>
              </div>
              <div className="flex justify-between">
                <span>Overvægtig:</span>
                <span className="font-medium">25,0 - 29,9</span>
              </div>
              <div className="flex justify-between">
                <span>Svært overvægtig:</span>
                <span className="font-medium">30,0 og derover</span>
              </div>
            </div>
          </div>

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
        </div>
      )}
    </div>
  );
}
