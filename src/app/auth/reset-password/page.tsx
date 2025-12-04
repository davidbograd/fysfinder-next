"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/app/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { validateEmail } from "@/lib/auth-errors";
import { ArrowLeft, Mail } from "lucide-react";

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setFieldError("");

    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      setFieldError(emailError);
      return;
    }

    setIsLoading(true);

    const supabase = createClient();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) {
        toast({
          title: "Fejl",
          description: "Kunne ikke sende nulstillingsmail. Prøv igen senere.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Success - show confirmation
      setEmailSent(true);
      toast({
        title: "Email sendt",
        description: "Vi har sendt en nulstillingslink til din email",
      });
    } catch (error) {
      toast({
        title: "Uventet fejl",
        description: "Der opstod en fejl. Prøv igen senere.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <Mail className="h-16 w-16 text-blue-600" />
            </div>
            <CardTitle className="text-center">Tjek din email</CardTitle>
            <CardDescription className="text-center">
              Vi har sendt en nulstillingslink til <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-gray-600">
              <p>For at nulstille din adgangskode:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Tjek din indbakke</li>
                <li>Åbn email fra FysFinder</li>
                <li>Klik på nulstillingslinket</li>
                <li>Indtast din nye adgangskode</li>
              </ol>
            </div>
            
            <div className="pt-4 border-t">
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/signin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Tilbage til login
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Nulstil adgangskode</CardTitle>
          <CardDescription>
            Indtast din email for at modtage en nulstillingslink
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldError) setFieldError("");
                }}
                placeholder="din@email.dk"
                disabled={isLoading}
                className={fieldError ? "border-red-500" : ""}
              />
              {fieldError && (
                <p className="text-sm text-red-600">{fieldError}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Sender..." : "Nulstil adgangskode"}
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/auth/signin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tilbage til login
              </Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

