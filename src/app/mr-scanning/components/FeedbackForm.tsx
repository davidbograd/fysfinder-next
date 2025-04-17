"use client";

import { Button } from "@/components/ui/button";

interface FeedbackFormProps {
  onReset: () => void;
}

export function FeedbackForm({ onReset }: FeedbackFormProps) {
  const handleFeedback = (isPositive: boolean) => {
    // Track the event in Google Analytics
    if (typeof window !== "undefined" && "gtag" in window) {
      (window as any).gtag("event", "mr_scanning_feedback", {
        event_category: "MR Scanning",
        event_action: "Feedback",
        event_label: isPositive ? "Positive" : "Negative",
      });
    }

    // If negative feedback, open Typeform in new tab
    if (!isPositive) {
      window.open("https://tally.so/r/3NON9l", "_blank");
    }

    // Show thank you message and reset after a delay
    setTimeout(() => {
      onReset();
    }, 2000);
  };

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="space-y-1">
        <p className="text-center text-sm text-gray-500">Bedøm dit resultat</p>
        <p className="text-center font-bold text-gray-800">
          Forstår du din MR-scanning bedre?
        </p>
      </div>
      <div className="flex justify-center gap-8">
        <Button
          variant="ghost"
          size="lg"
          onClick={() => handleFeedback(true)}
          className="hover:bg-white/50 transition-colors text-3xl p-8"
        >
          👍
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={() => handleFeedback(false)}
          className="hover:bg-white/50 transition-colors text-3xl p-8"
        >
          👎
        </Button>
      </div>
    </div>
  );
}
