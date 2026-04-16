"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PremiumCityOption } from "@/app/actions/premium-upgrade";
import { cn } from "@/lib/utils";

interface PremiumNeighborCitySelectorProps {
  cityOptions: PremiumCityOption[];
  selectedNeighborCityIds: string[];
  idPrefix: string;
  disabledAll?: boolean;
  heading?: string;
  onToggleCity: (cityId: string) => void;
}

export function PremiumNeighborCitySelector({
  cityOptions,
  selectedNeighborCityIds,
  idPrefix,
  disabledAll = false,
  heading = "Vælg 2 nabobyer",
  onToggleCity,
}: PremiumNeighborCitySelectorProps) {
  const neighborCities = useMemo(
    () => cityOptions.filter((city) => !city.isHome),
    [cityOptions]
  );

  const getActivityScore = (city: PremiumCityOption) => city.leadClicks * 3 + city.views;

  const getRelativeActivityLabel = (rank: number, total: number) => {
    if (total <= 1) return "Højt";
    if (total === 2) return rank === 0 ? "Højt" : "Middel";
    const topCutoff = Math.ceil(total / 3);
    const middleCutoff = Math.ceil((2 * total) / 3);
    if (rank < topCutoff) return "Højt";
    if (rank < middleCutoff) return "Middel";
    return "Lavt";
  };

  const neighborsWithActivity = useMemo(() => {
    const ranked = [...neighborCities].sort(
      (cityA, cityB) => getActivityScore(cityB) - getActivityScore(cityA)
    );
    return ranked.map((city, index) => ({
      ...city,
      activityLabel: getRelativeActivityLabel(index, ranked.length),
    }));
  }, [neighborCities]);

  const atNeighborLimit = selectedNeighborCityIds.length >= 2;

  const getActivityTagClassName = (activityLabel: string) => {
    if (activityLabel === "Højt") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (activityLabel === "Middel") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-red-50 text-red-700 border-red-200";
  };

  if (neighborsWithActivity.length === 0) {
    return (
      <div className="pt-4">
        <p className="text-sm text-gray-600">Vi fandt ingen nabobyer endnu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-4">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-gray-900">{heading}</p>
        <p className="text-xs text-gray-500">{selectedNeighborCityIds.length}/2 valgt</p>
      </div>
      <p className="text-sm text-gray-600">Vælg de nabobyer hvor du vil vises.</p>
      {neighborsWithActivity.map((city) => {
        const checked = selectedNeighborCityIds.includes(city.cityId);
        const disabled = (!checked && atNeighborLimit) || disabledAll;
        const inputId = `${idPrefix}-${city.cityId}`;
        return (
          <div
            key={city.cityId}
            className={cn("rounded-md border p-4", disabled && "opacity-55 bg-muted/20 cursor-not-allowed")}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                id={inputId}
                checked={checked}
                className="rounded-none"
                disabled={disabled}
                onCheckedChange={() => onToggleCity(city.cityId)}
              />
              <div className="space-y-1 w-full">
                <div className="flex items-center gap-2">
                  <Label htmlFor={inputId} className={cn("font-medium", disabled && "cursor-not-allowed")}>
                    {city.cityName}
                  </Label>
                  <Badge
                    variant="outline"
                    className={cn("text-xs", getActivityTagClassName(city.activityLabel))}
                  >
                    {city.activityLabel} aktivitetsniveau
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
