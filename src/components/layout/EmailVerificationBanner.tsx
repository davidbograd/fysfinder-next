// Client-side email verification banner
// Updated: 2025-02-14 - Made self-contained with client-side auth check
// Previously required server-side auth in root layout, which forced all pages dynamic

"use client";

import { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resendVerificationEmail } from "@/app/actions/auth";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/app/utils/supabase/client";

export const EmailVerificationBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkVerification = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && user.email && user.email_confirmed_at === null) {
        setEmail(user.email);
        setIsVisible(true);
      }
    };

    checkVerification();
  }, []);

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

  if (!isVisible || !email) return null;

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
