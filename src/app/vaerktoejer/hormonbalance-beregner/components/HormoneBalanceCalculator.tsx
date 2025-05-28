"use client";

import React, { useState } from "react";
import { Activity, Info } from "lucide-react";

interface HormoneBalanceResult {
  score: number;
  category: string;
  description: string;
  color: string;
  recommendations: string[];
}

export function HormoneBalanceCalculator() {
  const [age, setAge] = useState("");
  const [stressLevel, setStressLevel] = useState("");
  const [sleepQuality, setSleepQuality] = useState("");
  const [diet, setDiet] = useState("");
  const [exercise, setExercise] = useState("");
  const [result, setResult] = useState<HormoneBalanceResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const getHormoneBalanceCategory = (
    score: number
  ): {
    category: string;
    description: string;
    color: string;
    recommendations: string[];
  } => {
    if (score >= 80) {
      return {
        category: "Excellent hormonbalance",
        description:
          "Din hormonbalance er fremragende! Du har sunde vaner, der understøtter optimal hormonproduktion.",
        color: "green",
        recommendations: [
          "Fortsæt med dine nuværende sunde vaner",
          "Oprethold regelmæssig motion og god søvn",
          "Hold fokus på en balanceret kost",
        ],
      };
    } else if (score >= 60) {
      return {
        category: "God hormonbalance",
        description:
          "Din hormonbalance er god, men der er plads til forbedringer. Små justeringer kan gøre en stor forskel.",
        color: "orange",
        recommendations: [
          "Fokuser på at få 7-9 timers kvalitetssøvn",
          "Reducer stress gennem meditation eller yoga",
          "Spis flere omega-3 rige fødevarer",
          "Øg dit aktivitetsniveau gradvist",
        ],
      };
    } else if (score >= 40) {
      return {
        category: "Moderat ubalance",
        description:
          "Din hormonbalance viser tegn på ubalance. Det er tid til at fokusere på livsstilsændringer.",
        color: "orange",
        recommendations: [
          "Prioriter søvnhygiejne og fast søvnrutine",
          "Implementer stresshåndteringsteknikker",
          "Spis mere grøntsager og fuldkorn",
          "Start med regelmæssig motion 3-4 gange om ugen",
          "Overvej at reducere koffein og alkohol",
        ],
      };
    } else {
      return {
        category: "Betydelig ubalance",
        description:
          "Din hormonbalance er betydeligt påvirket. Det anbefales at søge professionel rådgivning.",
        color: "red",
        recommendations: [
          "Konsulter en læge eller ernæringsekspert",
          "Fokuser intensivt på stressreduktion",
          "Etabler en streng søvnrutine",
          "Overvej en anti-inflammatorisk kost",
          "Start med let motion som gåture",
          "Overvej hormontest hos din læge",
        ],
      };
    }
  };

  const calculateHormoneBalance = () => {
    setIsCalculating(true);

    // Simulate a brief calculation delay for better UX
    setTimeout(() => {
      const ageNum = parseInt(age);
      const stress = parseInt(stressLevel);
      const sleep = parseInt(sleepQuality);
      const dietScore = parseInt(diet);
      const exerciseScore = parseInt(exercise);

      // Improved calculation logic
      // Start with base score and adjust based on factors
      let score = 100;

      // Stress impact (higher stress = lower score)
      score -= stress * 8;

      // Sleep quality impact (lower sleep quality = lower score)
      score -= (10 - sleep) * 6;

      // Diet impact (lower diet score = lower score)
      score -= (10 - dietScore) * 5;

      // Exercise impact (lower exercise = lower score)
      score -= (10 - exerciseScore) * 4;

      // Age factor (slight decrease with age)
      if (ageNum > 40) {
        score -= (ageNum - 40) * 0.5;
      }

      // Ensure score is between 0 and 100
      score = Math.max(0, Math.min(100, score));

      const categoryInfo = getHormoneBalanceCategory(score);

      setResult({
        score: Math.round(score),
        category: categoryInfo.category,
        description: categoryInfo.description,
        color: categoryInfo.color,
        recommendations: categoryInfo.recommendations,
      });
      setIsCalculating(false);
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (age && stressLevel && sleepQuality && diet && exercise) {
      calculateHormoneBalance();
    }
  };

  const isFormValid = age && stressLevel && sleepQuality && diet && exercise;

  const getColorClasses = (color: string) => {
    switch (color) {
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
        <Activity className="w-6 h-6 text-logo-blue" />
        <h2 className="text-2xl font-semibold text-gray-900">
          Hormonbalance-beregner
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="age"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Din alder
            </label>
            <input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="f.eks. 35"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-logo-blue focus:border-transparent"
              min="18"
              max="100"
            />
          </div>

          <div>
            <label
              htmlFor="stress"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Stressniveau (1-10)
            </label>
            <select
              id="stress"
              value={stressLevel}
              onChange={(e) => setStressLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-logo-blue focus:border-transparent"
            >
              <option value="">Vælg niveau</option>
              <option value="1">1 - Meget lavt stress</option>
              <option value="2">2 - Lavt stress</option>
              <option value="3">3 - Lidt stress</option>
              <option value="4">4 - Moderat stress</option>
              <option value="5">5 - Middel stress</option>
              <option value="6">6 - Højere stress</option>
              <option value="7">7 - Højt stress</option>
              <option value="8">8 - Meget højt stress</option>
              <option value="9">9 - Ekstremt stress</option>
              <option value="10">10 - Maksimalt stress</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="sleep"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Søvnkvalitet (1-10)
            </label>
            <select
              id="sleep"
              value={sleepQuality}
              onChange={(e) => setSleepQuality(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-logo-blue focus:border-transparent"
            >
              <option value="">Vælg kvalitet</option>
              <option value="1">1 - Meget dårlig søvn</option>
              <option value="2">2 - Dårlig søvn</option>
              <option value="3">3 - Ringe søvn</option>
              <option value="4">4 - Under middel</option>
              <option value="5">5 - Middel søvn</option>
              <option value="6">6 - Nogenlunde god</option>
              <option value="7">7 - God søvn</option>
              <option value="8">8 - Meget god søvn</option>
              <option value="9">9 - Fremragende søvn</option>
              <option value="10">10 - Perfekt søvn</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="diet"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Kostkvalitet (1-10)
            </label>
            <select
              id="diet"
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-logo-blue focus:border-transparent"
            >
              <option value="">Vælg kvalitet</option>
              <option value="1">1 - Meget usund kost</option>
              <option value="2">2 - Usund kost</option>
              <option value="3">3 - Ringe kost</option>
              <option value="4">4 - Under middel</option>
              <option value="5">5 - Middel kost</option>
              <option value="6">6 - Nogenlunde sund</option>
              <option value="7">7 - Sund kost</option>
              <option value="8">8 - Meget sund kost</option>
              <option value="9">9 - Fremragende kost</option>
              <option value="10">10 - Optimal kost</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="exercise"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Motionsniveau (1-10)
          </label>
          <select
            id="exercise"
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-logo-blue focus:border-transparent"
          >
            <option value="">Vælg niveau</option>
            <option value="1">1 - Ingen motion</option>
            <option value="2">2 - Meget lidt motion</option>
            <option value="3">3 - Lidt motion</option>
            <option value="4">4 - Sporadisk motion</option>
            <option value="5">5 - Moderat motion</option>
            <option value="6">6 - Regelmæssig motion</option>
            <option value="7">7 - God motion</option>
            <option value="8">8 - Meget aktiv</option>
            <option value="9">9 - Høj aktivitet</option>
            <option value="10">10 - Atletisk niveau</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={!isFormValid || isCalculating}
          className="w-full bg-logo-blue text-white py-3 px-4 rounded-md font-medium hover:bg-logo-blue/90 focus:outline-none focus:ring-2 focus:ring-logo-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isCalculating ? "Beregner..." : "Beregn hormonbalance"}
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
              <h4 className="font-semibold text-lg">
                Hormonbalance score: {result.score}/100
              </h4>
            </div>
            <p className="text-xl font-bold mb-2">{result.category}</p>
            <p className="text-sm leading-relaxed">{result.description}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">
              Anbefalinger til dig
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              {result.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-logo-blue font-bold">•</span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">
              Score kategorier
            </h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Excellent balance:</span>
                <span className="font-medium">80-100 point</span>
              </div>
              <div className="flex justify-between">
                <span>God balance:</span>
                <span className="font-medium">60-79 point</span>
              </div>
              <div className="flex justify-between">
                <span>Moderat ubalance:</span>
                <span className="font-medium">40-59 point</span>
              </div>
              <div className="flex justify-between">
                <span>Betydelig ubalance:</span>
                <span className="font-medium">0-39 point</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-gray-900 mb-2">Vigtige noter</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Dette er kun en indikator baseret på livsstilsfaktorer</li>
              <li>
                • Konsulter altid en læge ved mistanke om hormonelle problemer
              </li>
              <li>
                • Hormonbalance påvirkes af mange faktorer ud over livsstil
              </li>
              <li>• Fokuser på graduelle ændringer for bedste resultater</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
