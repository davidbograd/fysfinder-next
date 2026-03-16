"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/app/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { parseAuthError, validateEmail } from "@/lib/auth-errors";

export const SignInForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: "",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setFieldErrors({});

    // Basic validation
    const errors: Record<string, string> = {};
    
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;
    
    if (!formData.password) {
      errors.password = "Adgangskode er påkrævet";
    }

    // If validation errors, show them and return
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        const parsedError = parseAuthError(error);
        
        if (parsedError.field) {
          setFieldErrors({ [parsedError.field]: parsedError.message });
        }
        
        toast({
          title: "Fejl ved login",
          description: parsedError.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Wait a moment for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 100));

      // Success - redirect to dashboard or the redirect URL if provided
      const redirectTo = searchParams?.get("redirect") || "/dashboard";
      toast({
        title: "Logget ind",
        description: "Velkommen tilbage!",
      });
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      const parsedError = parseAuthError(error);
      toast({
        title: "Uventet fejl",
        description: parsedError.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="din@email.dk"
              disabled={isLoading}
              className={fieldErrors.email ? "border-red-500" : ""}
            />
            {fieldErrors.email && (
              <p className="text-sm text-red-600">{fieldErrors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Adgangskode</Label>
              <Link
                href="/auth/reset-password"
                className="text-sm text-primary hover:underline"
              >
                Glemt adgangskode?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Din adgangskode"
              disabled={isLoading}
              className={fieldErrors.password ? "border-red-500" : ""}
            />
            {fieldErrors.password && (
              <p className="text-sm text-red-600">{fieldErrors.password}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Logger ind..." : "Log ind"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Har du ikke en konto?{" "}
            <Link
              href="/auth/signup"
              className="text-primary hover:underline"
            >
              Opret konto
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
};

