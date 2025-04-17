import { NextResponse } from "next/server";
import { headers } from "next/headers";

interface RateLimitState {
  timestamp: number;
  count: number;
}

const WINDOW_SIZE = 24 * 3600 * 1000; // 24 hours in milliseconds
const MAX_REQUESTS = 40; // Maximum requests per 24 hours

const rateLimitMap = new Map<string, RateLimitState>();

export async function rateLimit(ip: string): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}> {
  const now = Date.now();
  const state = rateLimitMap.get(ip) || { timestamp: now, count: 0 };

  // Reset if window has passed
  if (now - state.timestamp > WINDOW_SIZE) {
    state.timestamp = now;
    state.count = 0;
  }

  // Increment count
  state.count++;
  rateLimitMap.set(ip, state);

  // Calculate reset time
  const reset = new Date(state.timestamp + WINDOW_SIZE);

  return {
    success: state.count <= MAX_REQUESTS,
    limit: MAX_REQUESTS,
    remaining: Math.max(0, MAX_REQUESTS - state.count),
    reset,
  };
}

export async function rateLimitMiddleware() {
  const headersList = headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";

  const result = await rateLimit(ip);

  if (!result.success) {
    const resetTime = new Date(result.reset);
    const resetTimeString = resetTime.toLocaleTimeString("da-DK", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const resetDateString = resetTime.toLocaleDateString("da-DK", {
      day: "numeric",
      month: "long",
    });

    return NextResponse.json(
      {
        error: `Du har nået grænsen for antal oversættelser. Du kan prøve igen ${resetDateString} kl. ${resetTimeString}.`,
        reset: result.reset,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": result.limit.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
          "X-RateLimit-Reset": result.reset.getTime().toString(),
        },
      }
    );
  }

  return null;
}
