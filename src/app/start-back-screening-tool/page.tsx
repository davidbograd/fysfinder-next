"use client";

import React, { useState } from "react";
import { Answer } from "@/types/survey";
import {
  questions,
  answerOptions,
  calculateScore,
  resultCategories,
} from "@/lib/surveys/start-back-tool";
import { QuestionCard } from "@/components/surveys/QuestionCard";
import { ResultsDisplay } from "@/components/surveys/ResultsDisplay";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import WebAppStructuredData from "@/components/seo/VaerktoejerStructuredData";

export default function StartBackScreeningTool() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const progress = (currentQuestionIndex / questions.length) * 100;

  const breadcrumbItems = [
    { text: "Værktøjer", link: "/vaerktoejer" },
    { text: "STarT Back Screening Tool" },
  ];

  const handleAnswer = (answer: Answer) => {
    setAnswers((prev) => {
      const newAnswers = [...prev];
      const existingIndex = newAnswers.findIndex(
        (a) => a.questionId === answer.questionId
      );

      if (existingIndex >= 0) {
        newAnswers[existingIndex] = answer;
      } else {
        newAnswers.push(answer);
      }

      return newAnswers;
    });
  };

  const currentAnswer = answers.find(
    (a) => a.questionId === questions[currentQuestionIndex].id
  )?.answer;

  const canGoNext = currentAnswer !== undefined;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleNext = () => {
    if (isLastQuestion) {
      setIsComplete(true);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex((prev) => prev - 1);
  };

  const handleRestart = () => {
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setIsComplete(false);
  };

  if (isComplete) {
    const score = calculateScore(answers);
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <WebAppStructuredData
          type="tool"
          name="STarT Back Screening Tool"
          description="Vurder risikoen for langvarige rygsmerter med dette validerede spørgeskema"
          breadcrumbs={breadcrumbItems}
        />
        <Breadcrumbs items={breadcrumbItems} />
        <ResultsDisplay score={score} resultCategories={resultCategories} />
        <div className="mt-6">
          <Button
            onClick={handleRestart}
            className="bg-logo-blue hover:bg-logo-blue/90"
          >
            Start forfra
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <WebAppStructuredData
        type="tool"
        name="STarT Back Screening Tool"
        description="Vurder risikoen for langvarige rygsmerter med dette validerede spørgeskema"
        breadcrumbs={breadcrumbItems}
      />
      <Breadcrumbs items={breadcrumbItems} />
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">STarT Back Screening Tool</h1>
        <Progress value={progress} className="w-full bg-gray-200" />
        <p className="text-sm text-gray-500 mt-2">
          Spørgsmål {currentQuestionIndex + 1} af {questions.length}
        </p>
      </div>

      <div className="space-y-6">
        <QuestionCard
          key={currentQuestionIndex}
          question={questions[currentQuestionIndex]}
          answerOptions={answerOptions}
          currentAnswer={undefined}
          onAnswerChange={handleAnswer}
        />

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Forrige
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canGoNext}
            className="bg-logo-blue hover:bg-logo-blue/90"
          >
            {isLastQuestion ? "Afslut" : "Næste"}
          </Button>
        </div>
      </div>
    </div>
  );
}
