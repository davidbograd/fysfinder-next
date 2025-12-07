"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/app/utils/supabase/client";
import { createUserProfile } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  parseAuthError,
  validateEmail,
  validatePassword,
  validateFullName,
} from "@/lib/auth-errors";

export const SignUpForm = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
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

    // Validate all fields
    const errors: Record<string, string> = {};
    
    const fullNameError = validateFullName(formData.fullName);
    if (fullNameError) errors.fullName = fullNameError;
    
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;

    // If validation errors, show them and return
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast({
        title: "Ugyldige felter",
        description: "Ret venligst fejlene i formularen",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const supabase = createClient();

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        const parsedError = parseAuthError(authError);
        
        if (parsedError.field) {
          setFieldErrors({ [parsedError.field]: parsedError.message });
        }
        
        toast({
          title: "Fejl ved oprettelse",
          description: parsedError.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        toast({
          title: "Fejl ved oprettelse",
          description: "Kunne ikke oprette bruger. Prøv igen.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Check if we have a session
      if (!authData.session) {
        toast({
          title: "Email bekræftelse påkrævet",
          description: "Tjek din email for at bekræfte din konto.",
          variant: "destructive",
        });
        setIsLoading(false);
        router.push("/auth/verify");
        return;
      }

      // Create user profile using server action
      try {
        const profileResult = await createUserProfile({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.fullName,
        });

        if (profileResult?.error) {
          toast({
            title: "Fejl ved oprettelse af profil",
            description: profileResult.error,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      } catch (profileError) {
        // Profile creation failed, but user is already created and logged in
        // Continue to dashboard anyway - profile might already exist or temporary issue
        console.warn("Profile creation error:", profileError);
      }

      // Success - show message and redirect
      toast({
        title: "Konto oprettet!",
        description: "Velkommen til FysFinder!",
      });
      
      setIsLoading(false);
      
      // Use window.location for a clean page load with the new session
      window.location.href = "/dashboard";
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
      <CardHeader>
        <CardTitle>Opret konto</CardTitle>
        <CardDescription>
          Indtast dine oplysninger for at oprette en konto
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Fulde navn</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Dit fulde navn"
              disabled={isLoading}
              className={fieldErrors.fullName ? "border-red-500" : ""}
            />
            {fieldErrors.fullName && (
              <p className="text-sm text-red-600">{fieldErrors.fullName}</p>
            )}
          </div>
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
            <Label htmlFor="password">Adgangskode</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={handleChange}
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
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Opretter..." : "Opret konto"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Har du allerede en konto?{" "}
            <Link
              href="/auth/signin"
              className="text-primary hover:underline"
            >
              Log ind
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
};

