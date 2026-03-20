// Updated: 2026-03-17 - Converted region list to accordion panels while preserving city "show all" behavior and always-rendered SEO links
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { slugify } from "@/app/utils/slugify";
import { ChevronDown } from "lucide-react";

interface CityWithCount {
  id: string;
  bynavn: string;
  bynavn_slug: string;
  postal_codes: string[];
  clinic_count: number;
}

interface RegionData {
  name: string;
  cities: CityWithCount[];
}

interface ExpandedRegions {
  [key: string]: boolean;
}

interface OpenRegions {
  [key: string]: boolean;
}

function CityGrid({
  cities,
  limit,
}: {
  cities: CityWithCount[];
  limit?: number;
}) {
  const displayedCities = limit ? cities.slice(0, limit) : cities;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedCities.map((city) => (
          <Link
            key={city.id}
            href={`/find/fysioterapeut/${city.bynavn_slug}`}
            className="block bg-white border p-4 rounded-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-slate-800">
                {city.bynavn}
              </span>
              <span className="text-slate-600">
                {city.clinic_count} klinikker
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ExpandButton({
  isExpanded,
  onClick,
  totalCount,
  regionName,
}: {
  isExpanded: boolean;
  onClick: () => void;
  totalCount: number;
  regionName: string;
}) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="w-full mt-4 text-slate-600 hover:text-slate-800"
    >
      {isExpanded
        ? "Vis færre byer"
        : `Vis alle ${totalCount} byer i ${regionName}`}
    </Button>
  );
}

function RegionSection({
  region,
  isOpen,
  onToggleOpen,
  isExpanded,
  onToggleExpand,
}: {
  region: RegionData;
  isOpen: boolean;
  onToggleOpen: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const INITIAL_CITY_COUNT = 9;
  const hasMoreCities = region.cities.length > INITIAL_CITY_COUNT;

  return (
    <section
      id={slugify(region.name)}
      className="mb-3 rounded-xl border border-[#e2e1dc] bg-[#f7f6f1]"
    >
      <button
        type="button"
        onClick={onToggleOpen}
        className="w-full p-5 flex items-center justify-between text-left"
        aria-expanded={isOpen}
        aria-controls={`region-panel-${slugify(region.name)}`}
      >
        <span className="flex items-center gap-3">
          <h2 className="text-lg md:text-xl font-medium text-[#2a3734]">
            {region.name}
          </h2>
          <span className="text-[#6a7471]">{region.cities.length} byer</span>
        </span>
        <ChevronDown
          className={`h-5 w-5 text-[#6a7471] transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          id={`region-panel-${slugify(region.name)}`}
          className="px-5 pb-5 border-t border-[#e2e1dc]"
        >
          <div className="pt-4">
            <CityGrid
              cities={region.cities}
              limit={isExpanded ? undefined : INITIAL_CITY_COUNT}
            />
          </div>
          {hasMoreCities && (
            <ExpandButton
              isExpanded={isExpanded}
              onClick={onToggleExpand}
              totalCount={region.cities.length}
              regionName={region.name}
            />
          )}
        </div>
      )}
    </section>
  );
}

export function RegionList({ regions }: { regions: RegionData[] }) {
  const [expandedRegions, setExpandedRegions] = React.useState<ExpandedRegions>(
    {}
  );
  const [openRegions, setOpenRegions] = React.useState<OpenRegions>(() =>
    regions.reduce((acc, region) => {
      acc[region.name] = false;
      return acc;
    }, {} as OpenRegions)
  );

  const toggleRegion = (regionName: string) => {
    setExpandedRegions((prev) => ({
      ...prev,
      [regionName]: !prev[regionName],
    }));
  };

  const toggleOpenRegion = (regionName: string) => {
    setOpenRegions((prev) => ({
      ...prev,
      [regionName]: !prev[regionName],
    }));
  };

  return (
    <div>
      {regions.map((region) => (
        <RegionSection
          key={region.name}
          region={region}
          isOpen={!!openRegions[region.name]}
          onToggleOpen={() => toggleOpenRegion(region.name)}
          isExpanded={!!expandedRegions[region.name]}
          onToggleExpand={() => toggleRegion(region.name)}
        />
      ))}

      {/* Keep all city links present for SEO even when accordion panels are collapsed */}
      <div className="hidden" aria-hidden="true">
        {regions.map((region) =>
          region.cities.map((city) => (
            <Link key={`${region.name}-${city.id}`} href={`/find/fysioterapeut/${city.bynavn_slug}`}>
              {city.bynavn}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
