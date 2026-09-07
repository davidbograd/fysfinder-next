// Added: 2026-09-07 - Three-step patient journey and the health disclaimer for /symptomer.

import type { JourneyStep } from "@/lib/symptomer/types";

interface PatientJourneyStepsProps {
  steps: JourneyStep[];
}

export function PatientJourneySteps({ steps }: PatientJourneyStepsProps) {
  return (
    <ol className="mt-8 grid gap-4 md:grid-cols-3">
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="rounded-2xl border border-[#dfe3de] bg-white p-5"
        >
          <span
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10 text-[17px] font-medium tabular-nums text-brand-primary"
          >
            {index + 1}
          </span>
          <h3 className="mt-4 text-[18px] font-medium leading-snug text-[#1f2b28]">
            {step.title}
          </h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#3f4b48]">
            {step.description}
          </p>
        </li>
      ))}
    </ol>
  );
}

interface MedicalDisclaimerProps {
  text: string;
  className?: string;
}

export function MedicalDisclaimer({ text, className }: MedicalDisclaimerProps) {
  return (
    <p
      className={`mt-6 rounded-2xl bg-brand-beige px-5 py-4 text-[15px] leading-relaxed text-[#3f4b48] ${className ?? ""}`}
    >
      {text}
    </p>
  );
}
