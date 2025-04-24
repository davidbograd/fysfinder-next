/**
 * BenefitsSection.tsx
 * A component that displays the key benefits using an Apple-style bento grid layout
 */

import { Clock, BookHeart, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

const benefits: Benefit[] = [
  {
    icon: <Clock className="w-8 h-8 text-logo-blue" />,
    title: "Spar tid på at finde den rette behandler",
    description:
      "Slut med at ringe rundt til klinikker. Find og book den rette fysioterapeut på få minutter.",
    className: "md:col-start-1 md:row-start-1",
  },
  {
    icon: <BookHeart className="w-8 h-8 text-logo-blue" />,
    title: "Specialister i netop dit problem",
    description:
      "Find en fysioterapeut, der er specialiseret i præcis den type skade eller lidelse, du har brug for hjælp til.",
    className: "md:col-start-1 md:row-start-2",
  },
  {
    icon: <Shield className="w-8 h-8 text-logo-blue" />,
    title: "Nem adgang til tilskudsberettiget behandling",
    description:
      "Find hurtigt klinikker, der tilbyder behandling med tilskud fra den offentlige sygesikring. Tjek for klinikker med ydernummer.",
    className: "md:col-start-2 md:row-start-1 md:row-span-2",
  },
];

export function BenefitsSection() {
  return (
    <div className="w-full py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Find den rette fysioterapeut, lettere
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Vi hjælper dig med at få den bedste behandling, så du kan komme
            tilbage til et aktivt liv uden smerter.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-4">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={cn(
                "p-8 bg-[#FAFAFA] rounded-lg",
                "flex flex-col justify-between",
                benefit.className
              )}
            >
              <div>
                <div className="mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-slate-600 text-base">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
