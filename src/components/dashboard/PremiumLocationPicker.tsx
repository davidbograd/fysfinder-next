// Post-payment city selection component for premium visibility.
// Updated: splits home city vs neighbor picks and adds relative activity tags.

"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { savePremiumLocationSelections, PremiumCityOption } from "@/app/actions/premium-upgrade";
import { cn } from "@/lib/utils";

interface PremiumLocationPickerProps {
  clinicId: string;
  cityOptions: PremiumCityOption[];
  initiallySelectedCityIds: string[];
}

export function PremiumLocationPicker({
  clinicId,
  cityOptions,
  initiallySelectedCityIds,
}: PremiumLocationPickerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const initialNeighborCityIds = useMemo(() => {
    const allowedNeighborIds = new Set(
      cityOptions.filter((city) => !city.isHome).map((city) => city.cityId)
    );
    return initiallySelectedCityIds.filter((cityId) => allowedNeighborIds.has(cityId));
  }, [cityOptions, initiallySelectedCityIds]);
  const [selectedNeighborCityIds, setSelectedNeighborCityIds] = useState<string[]>(
    initialNeighborCityIds
  );

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

  const toggleCity = (cityId: string) => {
    const isSelected = selectedNeighborCityIds.includes(cityId);
    if (isSelected) {
      setSelectedNeighborCityIds((prev) => prev.filter((value) => value !== cityId));
      return;
    }

    if (selectedNeighborCityIds.length >= 2) {
      toast({
        title: "Maks 2 nabobyer",
        description: "Du kan vælge op til 2 nabobyer.",
        variant: "destructive",
      });
      return;
    }

    setSelectedNeighborCityIds((prev) => [...prev, cityId]);
  };

  const saveSelections = () => {
    startTransition(async () => {
      const result = await savePremiumLocationSelections(clinicId, selectedNeighborCityIds);

      if (result.error) {
        toast({
          title: "Kunne ikke gemme byvalg",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Byvalg gemt",
        description: "Din klinik er nu synlig i de valgte byer.",
      });
      router.replace("/dashboard");
    });
  };

  return (
    <div className="space-y-5">
      {neighborsWithActivity.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">Vælg 2 nabobyer</p>
            <p className="text-xs text-gray-500">
              {selectedNeighborCityIds.length}/2 valgt
            </p>
          </div>
          {neighborsWithActivity.map((city) => {
            const checked = selectedNeighborCityIds.includes(city.cityId);
            const disabled = !checked && atNeighborLimit;
            return (
              <div
                key={city.cityId}
                className={cn(
                  "rounded-md border p-4",
                  disabled && "opacity-55 bg-muted/20 cursor-not-allowed"
                )}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={`neighbor-city-${city.cityId}`}
                    checked={checked}
                    className="rounded-none"
                    disabled={disabled}
                    onCheckedChange={() => toggleCity(city.cityId)}
                  />
                  <div className="space-y-1 w-full">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`neighbor-city-${city.cityId}`}
                        className={cn("font-medium", disabled && "cursor-not-allowed")}
                      >
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
      ) : (
        <p className="text-sm text-gray-600">Vi fandt ingen nabobyer endnu.</p>
      )}

      <div className="flex justify-start">
        <Button onClick={saveSelections} disabled={isPending}>
          {isPending ? "Gemmer..." : "Gem byvalg"}
        </Button>
      </div>
    </div>
  );
}
