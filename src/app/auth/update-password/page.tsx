/**
 * Update Password Page
 * 
 * Destination page after user clicks password reset link from email.
 * Allows users to set a new password after successful password reset request.
 * Validates password strength and confirmation, then updates via Supabase Auth.
 * Redirects to dashboard after successful password update.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { validatePassword } from "@/lib/auth-errors";
import { CheckCircle2 } from "lucide-react";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setFieldErrors({});

    // Validate password
    const errors: Record<string, string> = {};
    
    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;
    
    if (password !== confirmPassword) {
      errors.confirmPassword = "Adgangskoderne matcher ikke";
    }

    // If validation errors, show them and return
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    const supabase = createClient();

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast({
          title: "Fejl",
          description: "Kunne ikke opdatere adgangskode. Prøv igen.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Success
      setIsSuccess(true);
      toast({
        title: "Adgangskode opdateret",
        description: "Din adgangskode er blevet opdateret",
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      toast({
        title: "Uventet fejl",
        description: "Der opstod en fejl. Prøv igen senere.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-center">Adgangskode opdateret</CardTitle>
            <CardDescription className="text-center">
              Din adgangskode er blevet opdateret. Du bliver omdirigeret til dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Opret ny adgangskode</CardTitle>
          <CardDescription>
            Indtast din nye adgangskode
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Ny adgangskode</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors({ ...fieldErrors, password: "" });
                  }
                }}
                placeholder="Minimum 8 tegn"
                disabled={isLoading}
                className={fieldErrors.password ? "border-red-500" : ""}
              />
              {fieldErrors.password ? (
                <p className="text-sm text-red-600">{fieldErrors.password}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Minimum 8 tegn
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Bekræft adgangskode</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors({ ...fieldErrors, confirmPassword: "" });
                  }
                }}
                placeholder="Gentag adgangskode"
                disabled={isLoading}
                className={fieldErrors.confirmPassword ? "border-red-500" : ""}
              />
              {fieldErrors.confirmPassword && (
                <p className="text-sm text-red-600">{fieldErrors.confirmPassword}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Opdaterer..." : "Opdater adgangskode"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

