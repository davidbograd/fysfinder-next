// Added: 2026-10-06 - Interactive calculator showing clinics the revenue in their empty calendar spots.
"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  OPEN_SPOTS_DEFAULT,
  OPEN_SPOTS_MAX,
  OPEN_SPOTS_MIN,
  APPOINTMENT_VALUE_DEFAULT,
  APPOINTMENT_VALUE_MAX,
  APPOINTMENT_VALUE_MIN,
  APPOINTMENT_VALUE_STEP,
  calculateRevenuePotential,
  formatDkk,
} from "./revenue-calculator";

interface CalculatorSliderProps {
  label: string;
  displayValue: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

function CalculatorSlider({
  label,
  displayValue,
  value,
  min,
  max,
  step,
  onChange,
}: CalculatorSliderProps) {
  const id = useId();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-[0_6px_20px_rgba(15,23,42,0.06)]">
      <label htmlFor={id} className="text-sm text-gray-600">
        {label}
      </label>
      <p className="mt-1 text-3xl font-semibold tabular-nums text-[#1f2b28]">
        {displayValue}
      </p>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-4 w-full cursor-pointer accent-logo-blue"
      />
    </div>
  );
}

export function RevenueCalculatorSection() {
  const [openSpots, setOpenSpots] = useState(OPEN_SPOTS_DEFAULT);
  const [appointmentValue, setAppointmentValue] = useState(
    APPOINTMENT_VALUE_DEFAULT,
  );

  const { appointmentsPerMonth, monthlyRevenue, yearlyRevenue } =
    calculateRevenuePotential(openSpots, appointmentValue);

  return (
    <section id="beregner" className="w-full bg-background py-16 md:py-20">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#f3f1ea] px-6 py-12 md:px-10 md:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-[2rem] font-semibold leading-tight text-[#1f2b28]">
              Hvad koster de tomme tider i din kalender?
            </h2>
            <p className="mt-3 text-gray-600">
              Træk i sliderne og se, hvad du kan tjene ved at fylde dem.
            </p>
          </div>

          <div className="mt-10 text-center">
            <p className="flex flex-wrap items-baseline justify-center gap-x-3">
              <span
                data-testid="monthly-revenue"
                className="text-5xl font-bold tabular-nums tracking-tight text-logo-blue md:text-7xl"
              >
                {formatDkk(monthlyRevenue)} kr.
              </span>
              <span className="text-xl text-gray-600">/måned</span>
            </p>
            <p className="mt-2 text-sm text-gray-600">i ekstra omsætning</p>

            <p className="mt-6 inline-flex flex-wrap items-baseline justify-center gap-x-2 rounded-full bg-white px-6 py-3 shadow-[0_6px_20px_rgba(15,23,42,0.06)]">
              <span className="text-gray-600">Det svarer til</span>
              <strong
                data-testid="yearly-revenue"
                className="text-2xl font-bold tabular-nums tracking-tight text-logo-blue md:text-3xl"
              >
                {formatDkk(yearlyRevenue)} kr.
              </strong>
              <span className="text-gray-600">om året</span>
            </p>

            <p className="mt-4 text-sm text-gray-600">
              <strong className="tabular-nums text-[#1f2b28]">
                {formatDkk(appointmentsPerMonth)}
              </strong>{" "}
              ekstra behandlinger pr. måned
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl gap-4 md:grid-cols-2">
            <CalculatorSlider
              label="Ledige tider i kalenderen pr. uge"
              displayValue={String(openSpots)}
              value={openSpots}
              min={OPEN_SPOTS_MIN}
              max={OPEN_SPOTS_MAX}
              step={1}
              onChange={setOpenSpots}
            />
            <CalculatorSlider
              label="Gennemsnitlig værdi pr. behandling"
              displayValue={`${formatDkk(appointmentValue)} kr.`}
              value={appointmentValue}
              min={APPOINTMENT_VALUE_MIN}
              max={APPOINTMENT_VALUE_MAX}
              step={APPOINTMENT_VALUE_STEP}
              onChange={setAppointmentValue}
            />
          </div>

          <div className="mt-10 flex justify-center">
            <Button
              className="h-auto bg-logo-blue px-7 py-3 text-base text-white hover:bg-logo-blue/90"
              asChild
            >
              <Link href="/auth/signup">
                Fyld din kalender gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
