"use client";

import { useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resendVerificationEmail } from "@/app/actions/auth";
import { useToast } from "@/hooks/use-toast";

interface EmailVerificationBannerProps {
  email: string;
}

export const EmailVerificationBanner = ({ email }: EmailVerificationBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleResend = async () => {
    setIsLoading(true);

    const result = await resendVerificationEmail();

    if (result.error) {
      toast({
        title: "Fejl",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email sendt",
        description: "Vi har sendt en ny verificeringslink til din email",
      });
    }

    setIsLoading(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900">
                Verificer venligst din email-adresse
              </p>
              <p className="text-sm text-yellow-700">
                Vi har sendt en verificeringslink til <strong>{email}</strong>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleResend}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="bg-white hover:bg-yellow-50 border-yellow-300"
            >
              {isLoading ? "Sender..." : "Send email igen"}
            </Button>
            <button
              onClick={handleDismiss}
              className="text-yellow-600 hover:text-yellow-800 p-1"
              aria-label="Luk banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

