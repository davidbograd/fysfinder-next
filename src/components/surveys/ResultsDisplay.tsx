import React from "react";
import { StartBackScore, ResultCategory } from "@/types/survey";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface ResultsDisplayProps {
  score: StartBackScore;
  resultCategories: Record<string, ResultCategory>;
}

export function ResultsDisplay({
  score,
  resultCategories,
}: ResultsDisplayProps) {
  const category = resultCategories[score.riskLevel];

  return (
    <Card className={getCardColorClass(score.riskLevel)}>
      <CardHeader>
        <CardTitle>Resultat - Ryg Smerte Risiko</CardTitle>
        <CardDescription>{category.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{category.recommendation}</p>
      </CardContent>
    </Card>
  );
}

function getCardColorClass(riskLevel: StartBackScore["riskLevel"]): string {
  switch (riskLevel) {
    case "low":
      return "bg-green-50";
    case "medium":
      return "bg-yellow-50";
    case "high":
      return "bg-red-50";
    default:
      return "";
  }
}
