"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { MDXRemote } from "next-mdx-remote/rsc";
import { FeedbackForm } from "./FeedbackForm";

const MAX_CHARS = 4000; // OpenAI has a token limit, so we'll limit characters

// Simple function to parse markdown bold text
const parseBoldText = (text: string) => {
  return text.split(/(\*\*[^*]+\*\*)/).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

export function TranslatorForm() {
  const [input, setInput] = useState("");
  const [translation, setTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [loadingTime, setLoadingTime] = useState<number | null>(null);
  const loadStartTime = useRef<number | null>(null);
  const [hasFeedback, setHasFeedback] = useState(false);

  const loadingStates = [
    { message: "Læser MR scanning", duration: 2500 },
    { message: "Analyserer", duration: 2500 },
    { message: "Færdiggører analyse", duration: 2500 },
    { message: "Skriver fortolkning", duration: 2500 },
  ];

  const handleLoadingStates = () => {
    let currentIndex = 0;
    let totalTime = 0;

    const updateLoadingState = () => {
      if (currentIndex < loadingStates.length) {
        setLoadingMessage(loadingStates[currentIndex].message);
        totalTime += loadingStates[currentIndex].duration;
        currentIndex++;
      } else if (totalTime >= 12000) {
        setLoadingMessage("Skriver fortolkning. Næsten færdig.");
      }
    };

    // Initial state
    updateLoadingState();

    // Schedule subsequent states
    loadingStates.forEach((_, index) => {
      if (index > 0) {
        setTimeout(
          () => {
            updateLoadingState();
          },
          loadingStates
            .slice(0, index)
            .reduce((acc, state) => acc + state.duration, 0)
        );
      }
    });

    // Set extended waiting message after 12 seconds
    setTimeout(() => {
      setLoadingMessage("Skriver fortolkning. Snart færdig...");
    }, 12000);
  };

  const simulateLoading = async (duration: number = 3000) => {
    setIsLoading(true);
    setError("");
    setProgress(0);
    setLoadingTime(null);
    loadStartTime.current = Date.now();
    handleLoadingStates();

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 0.5;
      });
    }, 50);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, duration));

      const endTime = Date.now();
      const timeElapsed = endTime - (loadStartTime.current || endTime);
      setLoadingTime(timeElapsed / 1000);

      setTranslation(
        "Dette er en test oversættelse for at demonstrere loading states.\n\nDen viser hvordan forskellige paragraffer vil se ud i den endelige oversættelse.\n\nDette hjælper os med at finjustere loading oplevelsen uden at skulle kalde API'et hver gang."
      );
      setProgress(100);
    } finally {
      setIsLoading(false);
      clearInterval(progressInterval);
      setTimeout(() => {
        setProgress(0);
        setLoadingMessage("");
      }, 500);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARS) {
      setInput(text);
      setError("");
    }
  };

  const handleTranslate = async () => {
    if (!input.trim()) {
      setError("Indsæt tekst fra din MR-scanning rapport.");
      return;
    }

    if (input.length < 10) {
      setError("Teksten er for kort til at være en MR-scanning rapport.");
      return;
    }

    // If in debug mode, use simulation instead of real API call
    if (isDebugMode) {
      await simulateLoading();
      return;
    }

    setIsLoading(true);
    setError("");
    setProgress(0);
    setLoadingTime(null);
    loadStartTime.current = Date.now();
    handleLoadingStates();

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 0.5;
      });
    }, 50);

    try {
      const response = await fetch("/api/mr-scanning", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: input }),
      });

      if (!response.ok) {
        throw new Error("Der opstod en fejl under oversættelsen.");
      }

      const data = await response.json();
      const endTime = Date.now();
      const timeElapsed = endTime - (loadStartTime.current || endTime);
      setLoadingTime(timeElapsed / 1000);

      setTranslation(data.translation);
      setProgress(100);
    } catch (err) {
      setError("Der opstod en fejl. Prøv venligst igen.");
    } finally {
      setIsLoading(false);
      clearInterval(progressInterval);
      setTimeout(() => {
        setProgress(0);
        setLoadingMessage("");
      }, 500);
    }
  };

  const charCount = input.length;
  const isNearLimit = charCount > MAX_CHARS * 0.9;

  // Function to handle feedback
  const handleFeedback = (isPositive: boolean) => {
    // Track the event in Google Analytics
    if (typeof window !== "undefined" && "gtag" in window) {
      (window as any).gtag("event", "mr_translation_feedback", {
        event_category: "MR Translation",
        event_action: "Feedback",
        event_label: isPositive ? "Positive" : "Negative",
      });
    }

    setHasFeedback(true);

    // If negative feedback, open survey in new tab
    if (!isPositive) {
      window.open("https://tally.so/r/3NON9l", "_blank");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {process.env.NODE_ENV === "development" && (
        <div className="flex justify-end">
          <Button
            onClick={() => setIsDebugMode(!isDebugMode)}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            {isDebugMode ? "✕ Luk Test Mode" : "⚡ Test Mode"}
          </Button>
        </div>
      )}
      <Card className="p-4 sm:p-6">
        <div className="space-y-4">
          {isDebugMode && process.env.NODE_ENV === "development" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-sm text-yellow-800">
              <div className="flex flex-col space-y-2">
                <span className="font-medium">Test Mode Aktiv</span>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => simulateLoading(3000)}
                    variant="outline"
                    size="sm"
                  >
                    Test 3s
                  </Button>
                  <Button
                    onClick={() => simulateLoading(10000)}
                    variant="outline"
                    size="sm"
                  >
                    Test 10s
                  </Button>
                  <Button
                    onClick={() => simulateLoading(20000)}
                    variant="outline"
                    size="sm"
                  >
                    Test 20s
                  </Button>
                </div>
              </div>
            </div>
          )}
          {!translation ? (
            <>
              <div className="relative">
                <Textarea
                  placeholder="Indsæt teksten fra din MR-scanning her..."
                  value={input}
                  onChange={handleInputChange}
                  className="min-h-[150px] sm:min-h-[200px] text-sm sm:text-base"
                  maxLength={MAX_CHARS}
                />
                <div
                  className={`text-xs sm:text-sm mt-2 text-right ${
                    isNearLimit ? "text-orange-500" : "text-gray-500"
                  }`}
                >
                  {charCount}/{MAX_CHARS} tegn
                </div>
              </div>
              {error && (
                <p className="text-red-500 text-xs sm:text-sm">{error}</p>
              )}
              <div className="space-y-4">
                <Button
                  onClick={handleTranslate}
                  disabled={isLoading || !input.trim() || input.length < 10}
                  className="w-full bg-logo-blue hover:bg-logo-blue/90 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Oversætter...
                    </>
                  ) : (
                    "Oversæt Rapport"
                  )}
                </Button>
                {isLoading && (
                  <div className="space-y-2">
                    <Progress
                      value={progress}
                      className="h-2 transition-all duration-300 ease-linear [&>div]:bg-logo-blue"
                    />
                    <p className="text-sm text-gray-600 text-center animate-pulse">
                      {loadingMessage}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                Dette er en AI-assisteret oversættelse af din MR-scanning
                rapport. Den er ment som en hjælp til at forstå rapporten, men
                bør ikke erstatte professionel medicinsk rådgivning. Konsulter
                altid din læge eller fysioterapeut for en komplet forståelse af
                din MR-scanning.
              </div>

              <Card className="p-4 sm:p-6">
                <div className="prose max-w-none text-sm sm:text-base space-y-4">
                  {translation.split("\n\n").map((paragraph, index) => {
                    if (paragraph.trim().startsWith("- ")) {
                      return (
                        <ul key={index} className="list-disc pl-4 space-y-2">
                          {paragraph.split("\n").map((item, itemIndex) => (
                            <li key={itemIndex} className="whitespace-pre-wrap">
                              {parseBoldText(item.replace("- ", "").trim())}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <p
                        key={index}
                        className="whitespace-pre-wrap leading-relaxed"
                      >
                        {parseBoldText(paragraph.trim())}
                      </p>
                    );
                  })}
                </div>
              </Card>

              <div className="mt-6 bg-gray-100 rounded-lg">
                {!hasFeedback ? (
                  <FeedbackForm onReset={() => setHasFeedback(true)} />
                ) : (
                  <p className="text-center text-sm text-gray-600 p-4">
                    Tak for din feedback!
                  </p>
                )}
              </div>

              <div className="mt-6 text-center">
                <Button
                  onClick={() => {
                    setTranslation("");
                    setInput("");
                    setLoadingTime(null);
                    setHasFeedback(false);
                  }}
                  variant="outline"
                  className="min-w-[200px]"
                >
                  Start forfra
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
