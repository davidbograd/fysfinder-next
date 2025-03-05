/**
 * NetworkSection.tsx
 * A component that displays the nationwide network of physiotherapists with region links
 */

import Link from "next/link";
import { MapIcon } from "lucide-react";
import { slugify } from "@/app/utils/slugify";

const regions: { [key: string]: { name: string; range: [number, number] } } = {
  hovedstaden: { name: "Hovedstaden", range: [1000, 2999] },
  sjaelland: { name: "Sjælland", range: [3000, 4999] },
  syddanmark: { name: "Syddanmark", range: [5000, 6999] },
  midtjylland: { name: "Midtjylland", range: [7000, 8999] },
  nordjylland: { name: "Nordjylland", range: [9000, 9999] },
};

export function NetworkSection() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">
            Landsdækkende netværk af fysioterapeuter
          </h2>
          <p className="text-slate-600 text-lg">
            Med 1900 klinikker over hele Danmark er der altid en dygtig
            fysioterapeut tæt på dig.
          </p>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(regions).map(([key, { name }]) => (
              <Link
                key={key}
                href={`#${slugify(name)}`}
                className="flex items-center space-x-2 p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
              >
                <MapIcon className="h-5 w-5 text-blue-500" />
                <span>Region {name}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="relative h-[400px] bg-slate-100 rounded-lg flex items-center justify-center">
          <div className="text-center space-y-4">
            <h3 className="text-4xl font-bold">1900 klinikker</h3>
            <p className="text-slate-600">Fordelt over hele Danmark</p>
          </div>
        </div>
      </div>
    </div>
  );
}
