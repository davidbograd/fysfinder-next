"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  resendSignupVerificationForEmail,
  resendVerificationEmail,
} from "@/app/actions/auth";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

type VerifyPendingActionsProps = {
  email: string | null;
  hasSession: boolean;
};

export const VerifyPendingActions = ({
  email,
  hasSession,
}: VerifyPendingActionsProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleResend = async () => {
    setIsLoading(true);

    if (hasSession) {
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
      return;
    }

    if (!email) {
      toast({
        title: "Mangler email",
        description: "Gå tilbage til oprettelse og brug den samme email, eller log ind.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const result = await resendSignupVerificationForEmail(email);
    if (result.error) {
      toast({
        title: "Fejl",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email sendt",
        description: "Vi har sendt en ny verificeringsmail.",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-3 pt-4 border-t">
      <p className="text-sm text-gray-600 mb-1">
        Har du ikke modtaget emailen?
      </p>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start"
        onClick={handleResend}
        disabled={isLoading}
      >
        {isLoading ? "Sender..." : "Send bekræftelsesmail igen"}
      </Button>
      <Button asChild variant="ghost" className="w-full justify-start text-gray-600">
        <Link href="/auth/signin">Allerede bekræftet? Log ind</Link>
      </Button>
    </div>
  );
};
