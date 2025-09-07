"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, User } from "lucide-react";
import {
  computeBodyFatFromStrings,
  type Gender,
  type BodyFatResult,
} from "@/lib/bodyFat";

interface FormData {
  gender: Gender;
  height: string;
  neck: string;
  waist: string;
  hip: string;
  weightKg: string;
}

const initialFormData: FormData = {
  gender: "" as Gender,
  height: "",
  neck: "",
  waist: "",
  hip: "",
  weightKg: "",
};

export const BodyFatCalculator = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [result, setResult] = useState<BodyFatResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenderChange = (value: Gender) => {
    setFormData((prev) => ({ ...prev, gender: value }));
  };


  const handleCalculate = () => {
    const calculationResult = computeBodyFatFromStrings({
      gender: formData.gender,
      unit: "cm",
      height: formData.height,
      neck: formData.neck,
      waist: formData.waist,
      hip: formData.gender === "female" ? formData.hip : undefined,
      weightKg: formData.weightKg,
    });

    setResult(calculationResult);
    setHasCalculated(true);
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setResult(null);
    setHasCalculated(false);
  };

  // Form validation
  const isFormValid = () => {
    // Gender is now required
    if (!formData.gender) return false;
    
    const requiredFields = [formData.height, formData.neck, formData.waist, formData.weightKg];
    const hasRequiredFields = requiredFields.every(field => field.trim() !== "");
    
    // For females, hip measurement is also required
    if (formData.gender === "female") {
      return hasRequiredFields && formData.hip.trim() !== "";
    }
    
    return hasRequiredFields;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Essentielt fedt":
        return "text-blue-600";
      case "Atletisk":
        return "text-green-600";
      case "Fitness":
        return "text-emerald-600";
      case "Gennemsnit":
        return "text-yellow-600";
      case "Høj (overvægt)":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case "Essentielt fedt":
        return "Minimum fedt nødvendigt for overlevelse";
      case "Atletisk":
        return "Typisk for konkurrenceidrætsudøvere";
      case "Fitness":
        return "Godt fitnessniveau";
      case "Gennemsnit":
        return "Normalt sundt niveau";
      case "Høj (overvægt)":
        return "Kan indikere sundhedsrisici";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Fedtprocent beregner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Gender Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Køn
            </Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleGenderChange("male")}
                className={`flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors h-10 px-6 border border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                  formData.gender === "male"
                    ? "bg-gray-800 text-white hover:bg-gray-800/90 hover:text-white"
                    : ""
                }`}
              >
                Mand
              </button>
              <button
                type="button"
                onClick={() => handleGenderChange("female")}
                className={`flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors h-10 px-6 border border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                  formData.gender === "female"
                    ? "bg-gray-800 text-white hover:bg-gray-800/90 hover:text-white"
                    : ""
                }`}
              >
                Kvinde
              </button>
            </div>
          </div>

          {/* Measurements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">
                Højde (cm)
              </Label>
              <Input
                id="height"
                type="text"
                placeholder="f.eks. 175"
                value={formData.height}
                onChange={(e) => handleInputChange("height", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="neck">
                Halsomkreds (cm)
              </Label>
              <Input
                id="neck"
                type="text"
                placeholder="f.eks. 38"
                value={formData.neck}
                onChange={(e) => handleInputChange("neck", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="waist">
                Taljeomkreds (cm)
              </Label>
              <Input
                id="waist"
                type="text"
                placeholder="f.eks. 85"
                value={formData.waist}
                onChange={(e) => handleInputChange("waist", e.target.value)}
              />
            </div>

            {formData.gender === "female" && (
              <div className="space-y-2">
                <Label htmlFor="hip">
                  Hofteomkreds (cm)
                </Label>
                <Input
                  id="hip"
                  type="text"
                  placeholder="f.eks. 95"
                  value={formData.hip}
                  onChange={(e) => handleInputChange("hip", e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="weight">
                Vægt (kg)
              </Label>
              <Input
                id="weight"
                type="text"
                placeholder="f.eks. 70"
                value={formData.weightKg}
                onChange={(e) => handleInputChange("weightKg", e.target.value)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleCalculate} 
              disabled={!isFormValid()}
              className="flex-1 bg-logo-blue text-white hover:bg-logo-blue/90 focus:ring-2 focus:ring-logo-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Beregn fedtprocent
            </Button>
            {hasCalculated && (
              <Button variant="outline" onClick={handleReset}>
                Nulstil
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Resultat</CardTitle>
          </CardHeader>
          <CardContent>
            {result.ok ? (
              <div className="space-y-4">
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">
                    Fedtprocent
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-3">
                    {result.bfp}%
                  </div>
                  <div className={`text-lg font-semibold mb-1 ${getCategoryColor(result.category)}`}>
                    {result.category}
                  </div>
                  <div className="text-sm text-gray-600">
                    {getCategoryDescription(result.category)}
                  </div>
                </div>

                {(result.fatMassKg !== null || result.leanMassKg !== null) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    {result.fatMassKg !== null && (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-xl font-semibold text-gray-900">
                          {result.fatMassKg} kg
                        </div>
                        <div className="text-sm text-gray-600">Fedtmasse</div>
                      </div>
                    )}
                    {result.leanMassKg !== null && (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-xl font-semibold text-gray-900">
                          {result.leanMassKg} kg
                        </div>
                        <div className="text-sm text-gray-600">Mager masse</div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">
                    Om fedtprocent kategorier
                  </h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Essentielt fedt:</strong> Minimum fedt nødvendigt for overlevelse</p>
                    <p><strong>Atletisk:</strong> Typisk for konkurrenceidrætsudøvere</p>
                    <p><strong>Fitness:</strong> Godt fitnessniveau</p>
                    <p><strong>Gennemsnit:</strong> Normalt sundt niveau</p>
                    <p><strong>Høj (overvægt):</strong> Kan indikere sundhedsrisici</p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center p-6 bg-red-50 rounded-lg">
                <div className="text-red-700 font-medium">{result.message}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
