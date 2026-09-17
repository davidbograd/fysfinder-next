// API route for tool feedback on the værktøjer pages.
// Thumbs up stores a 1-5 star rating that feeds the published aggregateRating.
// Thumbs down stores free-text feedback and emails the admins instead.

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getToolBySlug, isToolSlug, ToolSlug } from "@/lib/tools/registry";
import { sendToolFeedbackNotificationToAdmins } from "@/lib/email";
import { BEST_RATING, WORST_RATING } from "@/lib/tools/tool-ratings";

type Sentiment = "up" | "down";

interface ToolRatingBody {
  toolSlug?: unknown;
  sentiment?: unknown;
  rating?: unknown;
  feedbackText?: unknown;
  clientId?: unknown;
}

const ALLOWED_ORIGIN_HOSTNAMES = new Set([
  "fysfinder.dk",
  "www.fysfinder.dk",
  "localhost",
  "127.0.0.1",
]);
const RATE_LIMIT_WINDOW_MS = 60 * 60_000;
const RATE_LIMIT_MAX_SUBMISSIONS_PER_WINDOW = 10;
const FEEDBACK_MAX_LENGTH = 2000;
const CLIENT_ID_PATTERN = /^[a-zA-Z0-9_-]{8,64}$/;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function isAllowedOrigin(originHeader: string | null): boolean {
  if (!originHeader) return true;

  try {
    const hostname = new URL(originHeader).hostname.toLowerCase();
    return (
      ALLOWED_ORIGIN_HOSTNAMES.has(hostname) || hostname.endsWith(".fysfinder.dk")
    );
  } catch {
    return false;
  }
}

function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() || realIp?.trim();
  if (ipAddress) return ipAddress;
  return `ua:${(request.headers.get("user-agent") || "unknown").slice(0, 64)}`;
}

function isRateLimited(rateLimitKey: string): boolean {
  const now = Date.now();
  const existing = rateLimitStore.get(rateLimitKey);

  if (!existing || now >= existing.resetAt) {
    rateLimitStore.set(rateLimitKey, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  if (existing.count >= RATE_LIMIT_MAX_SUBMISSIONS_PER_WINDOW) {
    return true;
  }

  existing.count += 1;
  rateLimitStore.set(rateLimitKey, existing);
  return false;
}

function parseRating(value: unknown): { rating?: number; error?: string } {
  if (value === undefined || value === null) {
    return {};
  }
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < WORST_RATING ||
    value > BEST_RATING
  ) {
    return { error: "rating must be a whole number between 1 and 5" };
  }
  return { rating: value };
}

function parseFeedbackText(value: unknown): {
  feedbackText?: string;
  error?: string;
} {
  if (value === undefined || value === null) {
    return {};
  }
  if (typeof value !== "string") {
    return { error: "feedbackText must be a string" };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return {};
  }
  if (trimmed.length > FEEDBACK_MAX_LENGTH) {
    return { error: "feedbackText is too long" };
  }

  return { feedbackText: trimmed };
}

export async function POST(request: Request) {
  let body: ToolRatingBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    if (!isAllowedOrigin(request.headers.get("origin"))) {
      return NextResponse.json({ error: "Origin not allowed" }, { status: 403 });
    }

    if (!isToolSlug(body.toolSlug)) {
      return NextResponse.json({ error: "Invalid toolSlug" }, { status: 400 });
    }
    const toolSlug: ToolSlug = body.toolSlug;

    if (body.sentiment !== "up" && body.sentiment !== "down") {
      return NextResponse.json({ error: "Invalid sentiment" }, { status: 400 });
    }
    const sentiment: Sentiment = body.sentiment;

    if (
      typeof body.clientId !== "string" ||
      !CLIENT_ID_PATTERN.test(body.clientId)
    ) {
      return NextResponse.json({ error: "Invalid clientId format" }, { status: 400 });
    }

    const ratingResult = parseRating(body.rating);
    if (ratingResult.error) {
      return NextResponse.json({ error: ratingResult.error }, { status: 400 });
    }

    const feedbackResult = parseFeedbackText(body.feedbackText);
    if (feedbackResult.error) {
      return NextResponse.json({ error: feedbackResult.error }, { status: 400 });
    }

    if (sentiment === "up" && ratingResult.rating === undefined) {
      return NextResponse.json(
        { error: "rating is required for a positive response" },
        { status: 400 }
      );
    }

    if (isRateLimited(getClientKey(request))) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Upserting keeps one row per visitor per tool, and lets the thumbs-down flow
    // record the sentiment immediately and attach the written feedback afterwards.
    const { error } = await supabase.from("tool_ratings").upsert(
      {
        tool_slug: toolSlug,
        sentiment,
        rating: ratingResult.rating ?? null,
        feedback_text: feedbackResult.feedbackText ?? null,
        client_id: body.clientId,
      },
      { onConflict: "tool_slug,client_id" }
    );

    if (error) {
      console.error("Failed to store tool rating:", error);
      return NextResponse.json(
        { error: "Failed to store tool rating" },
        { status: 500 }
      );
    }

    if (sentiment === "down" && feedbackResult.feedbackText) {
      const tool = getToolBySlug(toolSlug);
      await sendToolFeedbackNotificationToAdmins({
        tool_title: tool.title,
        tool_href: tool.href,
        feedback_text: feedbackResult.feedbackText,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error storing tool rating:", error);
    return NextResponse.json({ error: "Failed to store tool rating" }, { status: 500 });
  }
}
