// Added: 2026-09-07 - Data attributes for patient-journey click tracking. Links stay plain server-rendered anchors; a single delegated listener forwards clicks to GA4.

export type SymptomEventName =
  | "symptom_body_area_click"
  | "condition_click"
  | "exercise_click"
  | "find_physio_click";

export const SYMPTOM_EVENT_ATTRIBUTE = "data-symptom-event";

export interface SymptomEventProps {
  bodyArea?: string;
  condition?: string;
  exercise?: string;
  destination?: string;
}

/**
 * Spread onto the clickable element. `SymptomJourneyAnalytics` picks these up
 * via event delegation, so tracking never affects link semantics or SSR output.
 */
export function symptomEventAttributes(
  event: SymptomEventName,
  props: SymptomEventProps = {}
): Record<string, string> {
  const attributes: Record<string, string> = {
    [SYMPTOM_EVENT_ATTRIBUTE]: event,
  };

  if (props.bodyArea) attributes["data-symptom-body-area"] = props.bodyArea;
  if (props.condition) attributes["data-symptom-condition"] = props.condition;
  if (props.exercise) attributes["data-symptom-exercise"] = props.exercise;
  if (props.destination) {
    attributes["data-symptom-destination"] = props.destination;
  }

  return attributes;
}
