"use client";

import React, { useMemo, useState } from "react";
import { Calculator, Rabbit, Gauge, Clock } from "lucide-react";

const presetDistances = [
  { label: "1 km", value: 1 },
  { label: "5 km", value: 5 },
  { label: "10 km", value: 10 },
  { label: "Halvmarathon (21,1)", value: 21.1 },
  { label: "Marathon (42,2)", value: 42.2 },
];

const pad2 = (n: number): string => {
  return n.toString().padStart(2, "0");
};

const timeToSeconds = (h: number, m: number, s: number): number => {
  const hh = Number(h) || 0;
  const mm = Number(m) || 0;
  const ss = Number(s) || 0;
  return hh * 3600 + mm * 60 + ss;
};

const secondsToHMS = (totalSec: number): { h: number; m: number; s: number } => {
  if (!isFinite(totalSec) || totalSec <= 0) return { h: 0, m: 0, s: 0 };
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.round(totalSec % 60);
  return { h, m, s };
};

const secondsToPace = (totalSecPerKm: number): { m: number; s: number } => {
  if (!isFinite(totalSecPerKm) || totalSecPerKm <= 0) return { m: 0, s: 0 };
  const m = Math.floor(totalSecPerKm / 60);
  const s = Math.round(totalSecPerKm % 60);
  return { m, s };
};

const paceToSecPerKm = (min: number, sec: number): number => {
  const m = Number(min) || 0;
  const s = Number(sec) || 0;
  const total = m * 60 + s;
  return total > 0 ? total : NaN;
};

const formatPace = (m: number, s: number): { time: string; unit: string } => {
  return { time: `${pad2(m)}:${pad2(s)}`, unit: "min/km" };
};

const formatHMS = (h: number, m: number, s: number): string => {
  const parts: string[] = [];
  if (h > 0) {
    parts.push(`${h}t`);
  }
  parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
};

const formatHMSTable = (h: number, m: number, s: number): string => {
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
};

// Convert Danish format (comma) to number for calculations
const parseDanishNumber = (value: string): number => {
  if (!value) return 0;
  return parseFloat(value.replace(",", ".")) || 0;
};

// Convert number to Danish format (comma) for display
const formatDanishNumber = (value: number, decimals: number = 1): string => {
  if (!isFinite(value)) return "";
  return value.toFixed(decimals).replace(".", ",");
};

interface ResultCardProps {
  title: string;
  value: string | { main: string; suffix?: string };
  icon?: React.ReactNode;
}

const ResultCard = ({ title, value, icon }: ResultCardProps) => {
  const displayValue =
    typeof value === "string" ? (
      <span className="text-2xl font-semibold text-gray-900">{value}</span>
    ) : (
      <span className="text-2xl font-semibold text-gray-900">
        {value.main}
        {value.suffix && (
          <span className="text-base font-normal text-gray-500 ml-1">
            {value.suffix}
          </span>
        )}
      </span>
    );

  return (
    <div className="rounded-lg border bg-gray-50 p-4">
      <div className="text-sm text-gray-600 flex items-center gap-2">
        {icon && <span className="text-gray-500">{icon}</span>}
        {title}
      </div>
      <div className="mt-1">{displayValue}</div>
    </div>
  );
};

export function PaceCalculator() {
  // Inputs for mode 1: distance + time -> pace & km/t
  const [distanceKm, setDistanceKm] = useState<string>("");
  const [hh, setHh] = useState<string>("");
  const [mm, setMm] = useState<string>("");
  const [ss, setSs] = useState<string>("");

  // Inputs for mode 2: pace + distance -> sluttid
  const [paceMin, setPaceMin] = useState<string>("");
  const [paceSec, setPaceSec] = useState<string>("");
  const [paceDistance, setPaceDistance] = useState<string>("");

  // Tempo-beregner – uafhængige pace-inputs til tabellen
  const [tablePaceMin, setTablePaceMin] = useState<string>("5");
  const [tablePaceSec, setTablePaceSec] = useState<string>("");

  // Calculations for mode 1
  const distanceKmNum = useMemo(() => parseDanishNumber(distanceKm), [distanceKm]);
  const hhNum = useMemo(() => parseInt(hh) || 0, [hh]);
  const mmNum = useMemo(() => parseInt(mm) || 0, [mm]);
  const ssNum = useMemo(() => parseInt(ss) || 0, [ss]);
  const totalTimeSec = useMemo(() => timeToSeconds(hhNum, mmNum, ssNum), [hhNum, mmNum, ssNum]);
  const secPerKm = useMemo(
    () => (distanceKmNum > 0 ? totalTimeSec / distanceKmNum : NaN),
    [totalTimeSec, distanceKmNum]
  );
  const pace = useMemo(() => secondsToPace(secPerKm), [secPerKm]);
  const speedKmh = useMemo(
    () => (secPerKm > 0 ? 3600 / secPerKm : NaN),
    [secPerKm]
  );

  // Calculations for mode 2
  const paceMinNum = useMemo(() => parseInt(paceMin) || 0, [paceMin]);
  const paceSecNum = useMemo(() => parseInt(paceSec) || 0, [paceSec]);
  const paceDistanceNum = useMemo(() => parseDanishNumber(paceDistance), [paceDistance]);
  const secPerKmFromPace = useMemo(
    () => paceToSecPerKm(paceMinNum, paceSecNum),
    [paceMinNum, paceSecNum]
  );
  const expectedFinishSec = useMemo(
    () =>
      isFinite(secPerKmFromPace) && paceDistanceNum > 0
        ? secPerKmFromPace * paceDistanceNum
        : NaN,
    [secPerKmFromPace, paceDistanceNum]
  );
  const expectedFinish = useMemo(
    () => secondsToHMS(expectedFinishSec),
    [expectedFinishSec]
  );

  // Pace i sekunder til tempo-beregnerens tabel
  const tablePaceMinNum = useMemo(() => parseInt(tablePaceMin) || 0, [tablePaceMin]);
  const tablePaceSecNum = useMemo(() => parseInt(tablePaceSec) || 0, [tablePaceSec]);
  const secPerKmTable = useMemo(
    () => paceToSecPerKm(tablePaceMinNum, tablePaceSecNum),
    [tablePaceMinNum, tablePaceSecNum]
  );

  // Mini table times for presets based on current pace
  const tableRows = useMemo(() => {
    return presetDistances.map((p) => {
      const sec = (secPerKmTable || 0) * p.value;
      const t = secondsToHMS(sec);
      return { ...p, time: t };
    });
  }, [secPerKmTable]);

  const handlePaceDistancePreset = (value: number) => {
    setPaceDistance(formatDanishNumber(value, 1));
  };

  const handleDistanceChange = (value: string) => {
    // Allow only numbers, comma, and empty string
    const cleaned = value.replace(/[^\d,]/g, "");
    // Ensure only one comma
    const parts = cleaned.split(",");
    if (parts.length > 2) return;
    setDistanceKm(cleaned);
  };

  const handlePaceDistanceChange = (value: string) => {
    // Allow only numbers, comma, and empty string
    const cleaned = value.replace(/[^\d,]/g, "");
    // Ensure only one comma
    const parts = cleaned.split(",");
    if (parts.length > 2) return;
    setPaceDistance(cleaned);
  };

  const handleTablePacePreset = (m: number, s: number) => {
    setTablePaceMin(m.toString());
    setTablePaceSec(s.toString());
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-12">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-6 h-6 text-logo-blue" />
        <h2 className="text-2xl font-semibold text-gray-900">Pace beregner</h2>
      </div>

      {/* MODE 1: Distance + Time -> Pace & Speed */}
      <section className="space-y-4" aria-labelledby="mode1-title">
        <h3
          id="mode1-title"
          className="text-lg md:text-xl font-semibold text-gray-900"
        >
          Beregn pace ud fra distance og tid
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Distance */}
          <div>
            <label
              htmlFor="distance"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Distance
            </label>
            <div className="relative">
              <input
                id="distance"
                type="text"
                inputMode="decimal"
                className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-logo-blue focus:border-transparent"
                value={distanceKm}
                onChange={(e) => handleDistanceChange(e.target.value)}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                km
              </span>
            </div>
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tid
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  className="w-full px-3 py-2 pr-14 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-logo-blue focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={hh}
                  onChange={(e) => setHh(e.target.value)}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-sm">
                  timer
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={59}
                  maxLength={2}
                  className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-logo-blue focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={mm}
                  onChange={(e) => setMm(e.target.value)}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-sm">
                  min
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={59}
                  maxLength={2}
                  className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-logo-blue focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={ss}
                  onChange={(e) => setSs(e.target.value)}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-sm">
                  sek
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <ResultCard
            title="Pace"
            icon={<Rabbit className="w-4 h-4" />}
            value={
              isFinite(secPerKm)
                ? (() => {
                    const paceFormatted = formatPace(pace.m, pace.s);
                    return {
                      main: paceFormatted.time,
                      suffix: paceFormatted.unit,
                    };
                  })()
                : "—"
            }
          />
          <ResultCard
            title="Hastighed"
            icon={<Gauge className="w-4 h-4" />}
            value={
              isFinite(speedKmh)
                ? {
                    main: formatDanishNumber(speedKmh, 2),
                    suffix: "km/t",
                  }
                : "—"
            }
          />
          <ResultCard
            title="Total tid"
            icon={<Clock className="w-4 h-4" />}
            value={formatHMS(hhNum, mmNum, ssNum)}
          />
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200"></div>

      {/* MODE 2: Pace + Distance -> Expected finish */}
      <section className="space-y-4" aria-labelledby="mode2-title">
        <h3
          id="mode2-title"
          className="text-lg md:text-xl font-semibold text-gray-900"
        >
          Beregn forventet sluttid ud fra pace
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pace */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pace
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  maxLength={2}
                  className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-logo-blue focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={paceMin}
                  onChange={(e) => setPaceMin(e.target.value)}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-sm">
                  min
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={59}
                  maxLength={2}
                  className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-logo-blue focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={paceSec}
                  onChange={(e) => setPaceSec(e.target.value)}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-sm">
                  sek
                </span>
              </div>
            </div>
          </div>

          {/* Distance */}
          <div>
            <label
              htmlFor="pace-distance"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Distance
            </label>
            <div className="relative">
              <input
                id="pace-distance"
                type="text"
                inputMode="decimal"
                className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-logo-blue focus:border-transparent"
                value={paceDistance}
                onChange={(e) => handlePaceDistanceChange(e.target.value)}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                km
              </span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <ResultCard
            title="Forventet tid"
            icon={<Clock className="w-4 h-4" />}
            value={
              isFinite(expectedFinishSec)
                ? formatHMS(
                    expectedFinish.h,
                    expectedFinish.m,
                    expectedFinish.s
                  )
                : "—"
            }
          />
          <ResultCard
            title="Hastighed"
            icon={<Gauge className="w-4 h-4" />}
            value={
              isFinite(secPerKmFromPace)
                ? {
                    main: formatDanishNumber(3600 / secPerKmFromPace, 2),
                    suffix: "km/t",
                  }
                : "—"
            }
          />
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200"></div>

      {/* Mini table: tempo-beregner for standard distancer */}
      <section className="space-y-4" aria-labelledby="table-title">
        <h3
          id="table-title"
          className="text-lg md:text-xl font-semibold text-gray-900"
        >
          Tempo beregner: Sluttider for populære distancer
        </h3>

        {/* Uafhængig pace-input for tabellen */}
        <div className="mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pace
            </label>
            <div className="grid grid-cols-2 gap-2 max-w-xs">
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  maxLength={2}
                  className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-logo-blue focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={tablePaceMin}
                  onChange={(e) => setTablePaceMin(e.target.value)}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-sm">
                  min
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={59}
                  maxLength={2}
                  className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-logo-blue focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={tablePaceSec}
                  onChange={(e) => setTablePaceSec(e.target.value)}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-sm">
                  sek
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-sm font-semibold text-gray-900">
                  Distance
                </th>
                <th className="p-3 text-sm font-semibold text-gray-900">
                  Tid (tt:mm:ss)
                </th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr key={row.label} className="border-b last:border-0">
                  <td className="p-3 text-gray-700">{row.label}</td>
                  <td className="p-3 text-gray-900 font-medium">
                    {formatHMSTable(row.time.h, row.time.m, row.time.s)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

