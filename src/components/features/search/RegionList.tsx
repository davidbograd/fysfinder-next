"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { slugify } from "@/app/utils/slugify";

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

function CityGrid({
  cities,
  limit,
}: {
  cities: CityWithCount[];
  limit?: number;
}) {
  const displayedCities = limit ? cities.slice(0, limit) : cities;
  const hiddenCities = limit ? cities.slice(limit) : [];

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

      {/* Hidden links that are visible to search engines but hidden from users */}
      <div className="hidden">
        {hiddenCities.map((city) => (
          <Link key={city.id} href={`/find/fysioterapeut/${city.bynavn_slug}`}>
            {city.bynavn}
          </Link>
        ))}
      </div>

      {/* Visible grid for expanded state */}
      {!limit && hiddenCities.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {hiddenCities.map((city) => (
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
      )}
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
  isExpanded,
  onToggleExpand,
}: {
  region: RegionData;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const INITIAL_CITY_COUNT = 9;
  const hasMoreCities = region.cities.length > INITIAL_CITY_COUNT;

  return (
    <section id={slugify(region.name)} className="mb-12">
      <h2 className="text-2xl font-bold mb-4">{region.name}</h2>
      <CityGrid
        cities={region.cities}
        limit={isExpanded ? undefined : INITIAL_CITY_COUNT}
      />
      {hasMoreCities && (
        <ExpandButton
          isExpanded={isExpanded}
          onClick={onToggleExpand}
          totalCount={region.cities.length}
          regionName={region.name}
        />
      )}
    </section>
  );
}

export function RegionList({ regions }: { regions: RegionData[] }) {
  const [expandedRegions, setExpandedRegions] = React.useState<ExpandedRegions>(
    {}
  );

  const toggleRegion = (regionName: string) => {
    setExpandedRegions((prev) => ({
      ...prev,
      [regionName]: !prev[regionName],
    }));
  };

  return (
    <>
      {regions.map((region) => (
        <RegionSection
          key={region.name}
          region={region}
          isExpanded={!!expandedRegions[region.name]}
          onToggleExpand={() => toggleRegion(region.name)}
        />
      ))}
    </>
  );
}
