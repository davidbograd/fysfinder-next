const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
  "UPDATE_WAIT_TIME_API_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "REVALIDATE_TOKEN",
] as const;

type EnvVar = (typeof requiredEnvVars)[number];

export function validateEnv() {
  const missingVars: EnvVar[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missingVars.join("\n")}\n` +
        "Please check your .env.local file and ensure all required variables are set."
    );
  }
}

// Export validated environment variables with types
export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env
    .NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env
    .NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  UPDATE_WAIT_TIME_API_KEY: process.env.UPDATE_WAIT_TIME_API_KEY as string,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  REVALIDATE_TOKEN: process.env.REVALIDATE_TOKEN as string,
} as const;
