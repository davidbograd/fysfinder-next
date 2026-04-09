"use client";

// Updated: 2026-04-06 - Replaced clinic search flow with the new three-step "Sådan gør du" section.
import { Search, MapPin, Handshake } from "lucide-react";
import type { ComponentType } from "react";

interface Step {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: Search,
    title: "1. Opret din klinik",
    description:
      "Opret en gratis konto på Fysfinder og få adgang til at claim og opdatere din klinikprofil.",
  },
  {
    icon: MapPin,
    title: "2. Bliv fundet lokalt",
    description:
      "Din klinik vises, når patienter søger efter fysioterapi i dit område.",
  },
  {
    icon: Handshake,
    title: "3. Få nye patienter",
    description:
      "Patienter finder og kontakter dig direkte - uden at du skal bruge tid på marketing.",
  },
];

export function ClinicSearch() {
  return (
    <section id="sadan-gor-du" className="w-full bg-background py-16 md:py-20">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-[2rem] font-semibold leading-tight text-[#1f2b28]">
            Sådan bliver du fundet i dit lokalområde
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article
                key={step.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                style={{
                  animationName: "stepFadeIn",
                  animationDuration: "700ms",
                  animationTimingFunction: "ease-out",
                  animationFillMode: "both",
                  animationDelay: `${index * 150}ms`,
                }}
              >
                <div className="mb-4 inline-flex rounded-full bg-logo-blue p-3 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </article>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes stepFadeIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
