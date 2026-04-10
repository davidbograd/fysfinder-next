"use client";

// Updated: 2026-04-06 - Replaced clinic search flow with the new three-step "Sådan gør du" section.
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface Step {
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    title: "Opret din klinik",
    description:
      "Opret dig gratis på Fysfinder og verificér din klinik.",
  },
  {
    title: "Bliv fundet lokalt",
    description:
      "Din klinik vises, når patienter søger efter fysioterapi i dit område.",
  },
  {
    title: "Få nye patienter",
    description:
      "Patienter finder og kontakter dig - uden at du skal bruge tid på marketing.",
  },
];

export function ClinicSearch() {
  return (
    <section id="sadan-gor-du" className="w-full bg-background py-16 md:py-20">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8">
        <div className="grid items-start gap-8 lg:grid-cols-[4fr_6fr] lg:gap-12">
          <div>
            <div className="space-y-2">
              <h2 className="text-[2rem] font-semibold leading-tight text-[#1f2b28]">
                Sådan bliver du fundet i dit lokalområde
              </h2>
              <p className="text-gray-600">
                Tre enkle trin til flere patienter gennem Fysfinder.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {steps.map((step, index) => {
                const isLast = index === steps.length - 1;

                return (
                  <article key={step.title} className="flex gap-4">
                    <div className="relative flex w-10 shrink-0 justify-center">
                      <div className="z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f3f1ea] text-[#1f2b28]">
                        <span className="text-base font-semibold">{index + 1}</span>
                      </div>
                      {!isLast ? (
                        <span
                          className="absolute top-10 h-[calc(100%+0.75rem)] w-px bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                    </div>
                    <div className="pb-2">
                      <h3 className="mb-1 text-lg font-semibold text-[#1f2b28]">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </article>
                );
              })}

              <div className="pt-1">
                <Button
                  className="h-auto bg-logo-blue px-7 py-3 text-base text-white hover:bg-logo-blue/90"
                  asChild
                >
                  <Link href="/auth/signup">Tilmeld din klinik gratis</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <Image
              src="/images/tilmeld/klinik-example.jpg"
              alt="Eksempel på klinikprofil og kortvisning"
              width={1400}
              height={700}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

    </section>
  );
}
