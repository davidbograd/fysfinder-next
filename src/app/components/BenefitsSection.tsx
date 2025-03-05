/**
 * BenefitsSection.tsx
 * A component that displays the key benefits of using the FysFinder platform
 */

import { Clock, Star, CheckCircle, Shield } from "lucide-react";

interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  {
    icon: <Clock className="w-8 h-8 text-logo-blue" />,
    title: "Spar tid på at finde den rette behandler",
    description:
      "Slut med at ringe rundt til klinikker. Find og book den rette fysioterapeut på få minutter.",
  },
  {
    icon: <Star className="w-8 h-8 text-logo-blue" />,
    title: "Vælg baseret på anmeldelser fra rigtige patienter",
    description:
      "Læs ærlige anmeldelser fra andre patienter, så du kan træffe det bedste valg for din sundhed.",
  },
  {
    icon: <CheckCircle className="w-8 h-8 text-logo-blue" />,
    title: "Specialister i netop dit problem",
    description:
      "Find en fysioterapeut, der er specialiseret i præcis den type skade eller lidelse, du har brug for hjælp til.",
  },
  {
    icon: <Shield className="w-8 h-8 text-logo-blue" />,
    title: "Nem adgang til tilskudsberettiget behandling",
    description:
      "Find hurtigt klinikker, der tilbyder behandling med tilskud fra den offentlige sygesikring.",
  },
];

export function BenefitsSection() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">
          Fordele ved at bruge vores platform
        </h2>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
          Vi hjælper dig med at få den bedste behandling, så du kan komme
          tilbage til et aktivt liv uden smerter.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="p-6 bg-white rounded-lg border hover:shadow-md transition-shadow"
          >
            <div className="mb-4">{benefit.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
            <p className="text-slate-600">{benefit.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
