// Post-payment city selection component for premium visibility.
// Updated: splits home city vs neighbor picks and adds relative activity tags.

"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { savePremiumLocationSelections, PremiumCityOption } from "@/app/actions/premium-upgrade";
import { PremiumNeighborCitySelector } from "@/components/dashboard/PremiumNeighborCitySelector";

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
      <PremiumNeighborCitySelector
        cityOptions={cityOptions}
        selectedNeighborCityIds={selectedNeighborCityIds}
        idPrefix="neighbor-city"
        onToggleCity={toggleCity}
      />

      <div className="flex justify-start">
        <Button onClick={saveSelections} disabled={isPending}>
          {isPending ? "Gemmer..." : "Gem byvalg"}
        </Button>
      </div>
    </div>
  );
}
