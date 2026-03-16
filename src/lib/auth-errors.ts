/**
 * Auth error handling utilities
 * Converts Supabase error messages to user-friendly Danish messages
 */

export interface AuthError {
  field?: string;
  message: string;
}

/**
 * Parse Supabase auth errors and return user-friendly messages
 */
export const parseAuthError = (error: any): AuthError => {
  const errorMessage = error?.message?.toLowerCase() || "";
  const errorCode = error?.code || "";

  // Duplicate email
  if (
    errorMessage.includes("user already registered") ||
    errorMessage.includes("email already exists") ||
    errorMessage.includes("duplicate") ||
    errorCode === "23505"
  ) {
    return {
      field: "email",
      message: "Denne email er allerede i brug. Prøv at logge ind i stedet.",
    };
  }

  // Invalid email format
  if (
    errorMessage.includes("invalid email") ||
    errorMessage.includes("email format")
  ) {
    return {
      field: "email",
      message: "Ugyldig email-adresse. Tjek venligst din email.",
    };
  }

  // Wrong password on signin
  if (
    errorMessage.includes("invalid login credentials") ||
    errorMessage.includes("invalid password") ||
    errorMessage.includes("email not confirmed")
  ) {
    return {
      field: "password",
      message: "Forkert email eller adgangskode.",
    };
  }

  // Weak password
  if (
    errorMessage.includes("password") &&
    (errorMessage.includes("weak") ||
      errorMessage.includes("short") ||
      errorMessage.includes("6 characters"))
  ) {
    return {
      field: "password",
      message: "Adgangskoden skal være mindst 8 tegn.",
    };
  }

  // Rate limiting
  if (
    errorMessage.includes("rate limit") ||
    errorMessage.includes("too many requests")
  ) {
    return {
      message: "For mange forsøg. Vent venligst et øjeblik og prøv igen.",
    };
  }

  // Network/connection errors
  if (
    errorMessage.includes("network") ||
    errorMessage.includes("fetch") ||
    errorMessage.includes("connection")
  ) {
    return {
      message:
        "Kunne ikke oprette forbindelse. Tjek din internetforbindelse.",
    };
  }

  // Default fallback
  return {
    message: "Der opstod en fejl. Prøv igen eller kontakt support.",
  };
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): string | null => {
  if (!email) {
    return "Email er påkrævet";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Ugyldig email-adresse";
  }

  return null;
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return "Adgangskode er påkrævet";
  }

  if (password.length < 8) {
    return "Adgangskoden skal være mindst 8 tegn";
  }

  return null;
};

/**
 * Validate full name
 */
export const validateFullName = (name: string): string | null => {
  if (!name) {
    return "Fulde navn er påkrævet";
  }

  if (name.trim().length < 2) {
    return "Navnet skal være mindst 2 tegn";
  }

  return null;
};

/**
 * Validate clinic name
 */
export const validateClinicName = (name: string): string | null => {
  if (!name) {
    return "Kliniknavn er påkrævet";
  }

  if (name.trim().length < 2) {
    return "Kliniknavnet skal være mindst 2 tegn";
  }

  return null;
};

