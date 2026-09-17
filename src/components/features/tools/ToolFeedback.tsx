"use client";

import { useCallback, useEffect, useState } from "react";
import { Star, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getToolBySlug, ToolSlug } from "@/lib/tools/registry";
import {
  TOOL_COMPLETED_EVENT,
  ToolCompletedDetail,
} from "@/lib/tools/tool-completion";
import {
  getClientId,
  rememberFeedbackResponse,
  shouldAskForFeedback,
} from "@/lib/tools/tool-feedback-storage";
import { BEST_RATING } from "@/lib/tools/tool-ratings";

type Step = "ask" | "stars" | "improve" | "done";

interface ToolFeedbackProps {
  toolSlug: ToolSlug;
  /**
   * `completion` waits for the tool to announce a result; `mount` is for tools
   * whose result lives on its own page, where arriving already means completion.
   */
  revealOn?: "completion" | "mount";
  className?: string;
}

const REVEAL_DELAY_MS = { completion: 1500, mount: 600 } as const;
const STAR_VALUES = Array.from({ length: BEST_RATING }, (_, index) => index + 1);
const EASE = "cubic-bezier(0.2, 0, 0, 1)";

function trackFeedbackEvent(toolSlug: ToolSlug, sentiment: "up" | "down") {
  if (typeof window === "undefined") return;
  window.gtag?.("event", "tool_feedback", {
    event_category: "Tools",
    event_label: toolSlug,
    sentiment,
  });
}

export function ToolFeedback({
  toolSlug,
  revealOn = "completion",
  className,
}: ToolFeedbackProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [step, setStep] = useState<Step>("ask");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!shouldAskForFeedback(toolSlug)) return;

    let revealTimer: ReturnType<typeof setTimeout>;

    const reveal = () => {
      revealTimer = setTimeout(() => setIsMounted(true), REVEAL_DELAY_MS[revealOn]);
    };

    if (revealOn === "mount") {
      reveal();
      return () => clearTimeout(revealTimer);
    }

    const handleCompleted = (event: Event) => {
      const detail = (event as CustomEvent<ToolCompletedDetail>).detail;
      if (detail?.slug !== toolSlug) return;
      window.removeEventListener(TOOL_COMPLETED_EVENT, handleCompleted);
      reveal();
    };

    window.addEventListener(TOOL_COMPLETED_EVENT, handleCompleted);
    return () => {
      window.removeEventListener(TOOL_COMPLETED_EVENT, handleCompleted);
      clearTimeout(revealTimer);
    };
  }, [revealOn, toolSlug]);

  useEffect(() => {
    if (!isMounted) return;
    const frame = requestAnimationFrame(() => setHasEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [isMounted]);

  const submit = useCallback(
    async (payload: {
      sentiment: "up" | "down";
      rating?: number;
      text?: string;
    }) => {
      try {
        await fetch("/api/tool-rating", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toolSlug,
            sentiment: payload.sentiment,
            rating: payload.rating,
            feedbackText: payload.text,
            clientId: getClientId(),
          }),
        });
      } catch {
        // A failed rating must never surface as an error to the visitor.
      }
    },
    [toolSlug]
  );

  const handleThumbsUp = () => {
    trackFeedbackEvent(toolSlug, "up");
    setStep("stars");
  };

  const handleThumbsDown = () => {
    trackFeedbackEvent(toolSlug, "down");
    setStep("improve");
    // Recorded up front so the negative signal survives an abandoned text box.
    void submit({ sentiment: "down" });
  };

  const handleStarSelect = async (rating: number) => {
    setIsSubmitting(true);
    await submit({ sentiment: "up", rating });
    rememberFeedbackResponse(toolSlug, "submitted");
    setIsSubmitting(false);
    setStep("done");
  };

  const handleSendFeedback = async () => {
    const text = feedbackText.trim();
    if (!text) return;
    setIsSubmitting(true);
    await submit({ sentiment: "down", text });
    rememberFeedbackResponse(toolSlug, "submitted");
    setIsSubmitting(false);
    setStep("done");
  };

  const handleDismiss = () => {
    rememberFeedbackResponse(toolSlug, "dismissed");
    setHasEntered(false);
    setTimeout(() => setIsMounted(false), 200);
  };

  if (!isMounted) return null;

  return (
    <section
      aria-label="Vurder værktøjet"
      className={cn(
        "rounded-2xl bg-brand-beige p-5 sm:p-6",
        "shadow-[0_1px_2px_rgba(16,69,52,0.06),0_8px_24px_-12px_rgba(16,69,52,0.18)]",
        "transition-[opacity,translate] duration-300 motion-reduce:transition-none",
        hasEntered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        className
      )}
      style={{ transitionTimingFunction: EASE }}
    >
      {step === "done" ? (
        <p className="text-center text-sm font-medium text-brand-primary text-pretty">
          Tak for din vurdering — det hjælper os med at gøre værktøjet bedre.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-base font-semibold text-brand-primary text-balance">
              {step === "ask" && `Hjalp ${getToolBySlug(toolSlug).feedbackName} dig?`}
              {step === "stars" && "Dejligt! Hvor mange stjerner vil du give?"}
              {step === "improve" && "Hvad kunne være bedre?"}
            </p>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Luk"
              className="-m-2 shrink-0 rounded-full p-2 text-brand-primary/50 transition-colors hover:text-brand-primary motion-reduce:transition-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {step === "ask" && (
            <div
              className="flex gap-3 transition-[opacity] duration-300 motion-reduce:transition-none"
              style={{ transitionDelay: "100ms", transitionTimingFunction: EASE }}
            >
              <Button
                variant="outline"
                onClick={handleThumbsUp}
                className="flex-1 gap-2 bg-white"
              >
                <ThumbsUp className="h-4 w-4" />
                Ja
              </Button>
              <Button
                variant="outline"
                onClick={handleThumbsDown}
                className="flex-1 gap-2 bg-white"
              >
                <ThumbsDown className="h-4 w-4" />
                Nej
              </Button>
            </div>
          )}

          {step === "stars" && (
            <div
              role="group"
              aria-label="Stjernevurdering"
              className="flex justify-center gap-1"
              onMouseLeave={() => setHoveredStar(0)}
            >
              {STAR_VALUES.map((value) => (
                <button
                  key={value}
                  type="button"
                  disabled={isSubmitting}
                  onMouseEnter={() => setHoveredStar(value)}
                  onFocus={() => setHoveredStar(value)}
                  onClick={() => void handleStarSelect(value)}
                  aria-label={`Giv ${value} ${value === 1 ? "stjerne" : "stjerner"}`}
                  className="flex h-11 w-11 items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-[0.96] disabled:pointer-events-none motion-reduce:transition-none"
                >
                  <Star
                    className={cn(
                      "h-7 w-7 transition-colors motion-reduce:transition-none",
                      value <= hoveredStar
                        ? "fill-amber-400 text-amber-400"
                        : "fill-transparent text-brand-primary/35"
                    )}
                  />
                </button>
              ))}
            </div>
          )}

          {step === "improve" && (
            <div className="flex flex-col gap-3">
              <Textarea
                value={feedbackText}
                onChange={(event) => setFeedbackText(event.target.value)}
                maxLength={2000}
                rows={3}
                placeholder="Fortæl os kort, hvad der manglede eller var forvirrende."
                aria-label="Hvad kunne være bedre?"
                className="resize-none rounded-xl border-brand-primary/15 bg-white"
              />
              <div className="flex justify-end">
                <Button
                  onClick={() => void handleSendFeedback()}
                  disabled={isSubmitting || !feedbackText.trim()}
                  className="bg-brand-primary hover:bg-brand-primary/90"
                >
                  {isSubmitting ? "Sender…" : "Send"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
