// Checkout trigger button for premium upgrade flow.
// Added: starts Stripe Checkout and redirects user to hosted payment page.

"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PremiumCityOption } from "@/app/actions/premium-upgrade";
import { normalizePremiumNeighborCityIds } from "@/lib/stripe/premium-locations";
import { PremiumNeighborCitySelector } from "@/components/dashboard/PremiumNeighborCitySelector";

interface PremiumCheckoutButtonProps {
  clinicId: string;
  cityOptions: PremiumCityOption[];
  initiallySelectedCityIds?: string[];
}

export function PremiumCheckoutButton({
  clinicId,
  cityOptions,
  initiallySelectedCityIds = [],
}: PremiumCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const neighborCities = useMemo(() => cityOptions.filter((city) => !city.isHome), [cityOptions]);
  const allowedNeighborCityIds = useMemo(
    () => new Set(neighborCities.map((city) => city.cityId)),
    [neighborCities]
  );
  const initialSelectedNeighbors = useMemo(
    () =>
      normalizePremiumNeighborCityIds({
        homeCityId: cityOptions.find((city) => city.isHome)?.cityId || null,
        selectedCityIds: initiallySelectedCityIds,
        allowedCityIds: allowedNeighborCityIds,
      }),
    [allowedNeighborCityIds, cityOptions, initiallySelectedCityIds]
  );
  const [selectedNeighborCityIds, setSelectedNeighborCityIds] = useState<string[]>(
    initialSelectedNeighbors
  );

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clinicId,
          selectedCityIds: selectedNeighborCityIds,
        }),
      });

      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Kunne ikke starte betaling");
      }

      window.location.assign(payload.url);
    } catch (error) {
      toast({
        title: "Kunne ikke starte betaling",
        description:
          error instanceof Error
            ? error.message
            : "Prøv igen om et øjeblik.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleToggleCity = (cityId: string) => {
    if (isLoading) return;

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

  return (
    <div className="space-y-5">
      <PremiumNeighborCitySelector
        cityOptions={cityOptions}
        selectedNeighborCityIds={selectedNeighborCityIds}
        idPrefix="pre-checkout-neighbor-city"
        disabledAll={isLoading}
        onToggleCity={handleToggleCity}
      />

      <Button
        onClick={handleCheckout}
        disabled={isLoading}
        className="w-full sm:w-auto bg-brand-green hover:bg-brand-green/90 text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Starter betaling...
          </>
        ) : (
          "Fortsæt til betaling"
        )}
      </Button>
    </div>
  );
}
