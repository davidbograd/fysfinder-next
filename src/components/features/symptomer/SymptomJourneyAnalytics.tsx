// Added: 2026-09-07 - Single delegated click listener that forwards patient-journey link clicks to GA4, keeping every symptom link a plain server-rendered anchor.

"use client";

import { useEffect } from "react";
import { SYMPTOM_EVENT_ATTRIBUTE } from "@/lib/symptomer/analytics";

type Gtag = (
  command: "event",
  eventName: string,
  params: Record<string, string>
) => void;

export function SymptomJourneyAnalytics() {
  useEffect(() => {
    function handleClick(nativeEvent: MouseEvent) {
      const target = nativeEvent.target;
      if (!(target instanceof Element)) return;

      const trigger = target.closest(`[${SYMPTOM_EVENT_ATTRIBUTE}]`);
      if (!(trigger instanceof HTMLElement)) return;

      const eventName = trigger.dataset.symptomEvent;
      if (!eventName) return;

      const gtag = (window as unknown as { gtag?: Gtag }).gtag;
      if (!gtag) return;

      const params: Record<string, string> = {
        source_page: window.location.pathname,
      };
      if (trigger.dataset.symptomBodyArea) {
        params.body_area = trigger.dataset.symptomBodyArea;
      }
      if (trigger.dataset.symptomCondition) {
        params.condition = trigger.dataset.symptomCondition;
      }
      if (trigger.dataset.symptomExercise) {
        params.exercise = trigger.dataset.symptomExercise;
      }
      if (trigger.dataset.symptomDestination) {
        params.destination = trigger.dataset.symptomDestination;
      }

      gtag("event", eventName, params);
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
