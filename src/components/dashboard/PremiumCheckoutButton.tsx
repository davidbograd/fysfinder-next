// Checkout trigger button for premium upgrade flow.
// Added: starts Stripe Checkout and redirects user to hosted payment page.

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PremiumCheckoutButtonProps {
  clinicId: string;
}

export function PremiumCheckoutButton({ clinicId }: PremiumCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clinicId }),
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

  return (
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
        "Gå til betaling"
      )}
    </Button>
  );
}
