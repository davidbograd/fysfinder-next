"use client";

import React, { useMemo, useState } from "react";
import { Weight } from "lucide-react";

// Percentage table for 1–10 RM (approximate values)
const PERCENT_TABLE: Record<number, number> = {
  1: 100,
  2: 95,
  3: 93,
  4: 90,
  5: 87,
  6: 85,
  7: 83,
  8: 80,
  9: 77,
  10: 75,
};

const parseNumber = (value: string): number => {
  if (!value) return NaN;
  // Support Danish comma
  const normalized = value.toString().replace(",", ".");
  const n = Number(normalized);
  return isNaN(n) ? NaN : n;
};

const formatKg = (value: number): string => {
  if (!isFinite(value) || value <= 0) return "—";
  const rounded = Math.round(value * 10) / 10;
  return `${rounded.toString().replace(".", ",")} kg`;
};

interface RmRow {
  reps: number;
  percent: number;
  load: number;
}

interface ResultCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
}

const ResultCard = ({ title, value, icon }: ResultCardProps) => {
  return (
    <div className="rounded-2xl border bg-gray-50 p-4">
      <div className="text-sm text-gray-600 flex items-center gap-2">
        {icon && <span className="text-gray-500">{icon}</span>}
        {title}
      </div>
      <div className="text-2xl font-semibold mt-1 text-gray-900">{value}</div>
    </div>
  );
};

export function RmBeregner() {
  const [weightInput, setWeightInput] = useState("");
  const [repsInput, setRepsInput] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);

  const parsedWeight = useMemo(() => parseNumber(weightInput), [weightInput]);
  const parsedReps = useMemo(
    () => (repsInput ? parseInt(repsInput, 10) : NaN),
    [repsInput]
  );

  const { oneRm, rmRows } = useMemo(() => {
    if (!parsedWeight || !parsedReps || parsedWeight <= 0 || parsedReps <= 0) {
      return { oneRm: NaN, rmRows: [] };
    }

    let estimatedOneRm: number;

    // If we have a percentage for the specific rep count, use it
    if (PERCENT_TABLE[parsedReps]) {
      const basePercent = PERCENT_TABLE[parsedReps] / 100;
      estimatedOneRm = parsedWeight / basePercent;
    } else {
      // Fallback – Epley formula for "odd" reps
      // 1RM ≈ weight * (1 + reps / 30)
      estimatedOneRm = parsedWeight * (1 + parsedReps / 30);
    }

    const roundedOneRm = Math.round(estimatedOneRm * 10) / 10;

    const rows: RmRow[] = Object.entries(PERCENT_TABLE).map(([reps, pct]) => {
      const load = (roundedOneRm * pct) / 100;
      return {
        reps: Number(reps),
        percent: pct,
        load: Math.round(load * 10) / 10,
      };
    });

    return {
      oneRm: roundedOneRm,
      rmRows: rows,
    };
  }, [parsedWeight, parsedReps]);

  const showError =
    hasInteracted &&
    (!parsedWeight || !parsedReps || parsedWeight <= 0 || parsedReps <= 0);

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Convert dot to comma for Danish format
    const withComma = value.replace(/\./g, ",");
    // Allow only numbers, comma, and empty string
    const cleaned = withComma.replace(/[^\d,]/g, "");
    // Ensure only one comma
    const parts = cleaned.split(",");
    if (parts.length > 2) return;
    setWeightInput(cleaned);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <section className="bg-white border rounded-2xl shadow-sm p-4 md:p-6" aria-labelledby="rm-input-title">
        <h3
          id="rm-input-title"
          className="text-lg md:text-xl font-semibold mb-4 text-gray-900"
        >
          Beregn din 1RM ud fra vægt og gentagelser
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Vægt */}
          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="rm-weight">
              Vægt løftet
            </label>
            <div className="relative">
              <input
                id="rm-weight"
                type="text"
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-logo-blue mt-1"
                placeholder="Fx 80"
                value={weightInput}
                onChange={handleWeightChange}
                onBlur={() => setHasInteracted(true)}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                kg
              </span>
            </div>
          </div>

          {/* Reps */}
          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="rm-reps">
              Gentagelser
            </label>
            <div className="relative">
              <input
                id="rm-reps"
                type="number"
                min={1}
                max={20}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 pr-16 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-logo-blue [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none mt-1"
                placeholder="Fx 5"
                value={repsInput}
                onChange={(e) => setRepsInput(e.target.value)}
                onBlur={() => setHasInteracted(true)}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                reps
              </span>
            </div>
          </div>
        </div>

        {showError && (
          <p className="text-xs text-red-600 mt-2">
            Indtast venligst både vægt (kg) og antal gentagelser &gt; 0 for at
            beregne din 1RM.
          </p>
        )}

        <div className="mt-6">
          <ResultCard
            title="Estimeret 1RM (one rep max)"
            value={formatKg(oneRm)}
            icon={<Weight className="w-4 h-4" />}
          />
        </div>

        <p className="text-xs text-gray-500 mt-3 mb-6">
          Din 1RM er et estimat baseret på din indtastede vægt og antal
          gentagelser. Brug det som pejlemærke til at styre træningsintensitet –
          ikke som en opfordring til at maksløfte hver gang du træner.
        </p>

        <h3
          className="text-lg md:text-xl font-semibold mb-4 text-gray-900"
        >
          1–10 RM: Anbefalet vægt ud fra din 1RM
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="p-3 text-sm font-medium text-gray-700 bg-gray-50">Reps</th>
                <th className="p-3 text-sm font-medium text-gray-700 bg-gray-50">% af 1RM (ca.)</th>
                <th className="p-3 text-sm font-medium text-gray-700 bg-gray-50">Anbefalet vægt</th>
              </tr>
            </thead>
            <tbody>
              {rmRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="p-4 text-sm text-gray-400 text-center"
                  >
                    Indtast vægt og gentagelser for at se dine 1–10 RM.
                  </td>
                </tr>
              ) : (
                rmRows.map((row) => (
                  <tr
                    key={row.reps}
                    className={`border-b last:border-0 border-gray-100 ${
                      row.reps === 1
                        ? "bg-[#1894e0]/10 font-semibold"
                        : ""
                    }`}
                  >
                    <td className={`p-3 text-sm border-t border-gray-100 ${
                      row.reps === 1 ? "text-logo-blue" : ""
                    }`}>
                      {row.reps} RM
                    </td>
                    <td className={`p-3 text-sm border-t border-gray-100 ${
                      row.reps === 1 ? "text-logo-blue" : ""
                    }`}>
                      {row.percent}%
                    </td>
                    <td className={`p-3 text-sm border-t border-gray-100 ${
                      row.reps === 1 ? "text-logo-blue font-semibold" : ""
                    }`}>
                      {formatKg(row.load)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Bemærk: Beregningerne er estimater og kan variere fra person til
          person afhængigt af erfaring, teknik og dagsform. Løft altid med
          kontrol og tilpas vægten efter, hvordan kroppen føles.
        </p>
      </section>
    </div>
  );
}

