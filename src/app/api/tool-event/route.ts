// API route for counting tool interactions on the værktøjer pages, such as
// downloading a result image. Each call stores one row in tool_events.

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getToolBySlug, isToolSlug } from "@/lib/tools/registry";
import { sendToolDownloadNotificationToAdmins } from "@/lib/email";
import { TOOL_EVENT_TYPES, ToolEventType } from "@/lib/tools/tool-events";

interface ToolEventBody {
  toolSlug?: unknown;
  eventType?: unknown;
  variant?: unknown;
  clientId?: unknown;
}

const ALLOWED_ORIGIN_HOSTNAMES = new Set([
  "fysfinder.dk",
  "www.fysfinder.dk",
  "localhost",
  "127.0.0.1",
]);
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_EVENTS_PER_WINDOW = 30;
const CLIENT_ID_PATTERN = /^[a-zA-Z0-9_-]{8,64}$/;
const VARIANT_PATTERN = /^[a-z0-9-]{1,32}$/;
const VARIANT_LABELS: Record<string, string> = { loeb: "løb", plan: "løbeplan" };
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

  if (existing.count >= RATE_LIMIT_MAX_EVENTS_PER_WINDOW) {
    return true;
  }

  existing.count += 1;
  rateLimitStore.set(rateLimitKey, existing);
  return false;
}

function isToolEventType(value: unknown): value is ToolEventType {
  return TOOL_EVENT_TYPES.includes(value as ToolEventType);
}

export async function POST(request: Request) {
  let body: ToolEventBody;

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

    if (!isToolEventType(body.eventType)) {
      return NextResponse.json({ error: "Invalid eventType" }, { status: 400 });
    }

    if (
      body.variant !== undefined &&
      body.variant !== null &&
      (typeof body.variant !== "string" || !VARIANT_PATTERN.test(body.variant))
    ) {
      return NextResponse.json({ error: "Invalid variant" }, { status: 400 });
    }

    if (
      typeof body.clientId !== "string" ||
      !CLIENT_ID_PATTERN.test(body.clientId)
    ) {
      return NextResponse.json({ error: "Invalid clientId format" }, { status: 400 });
    }

    if (isRateLimited(getClientKey(request))) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from("tool_events").insert({
      tool_slug: body.toolSlug,
      event_type: body.eventType,
      variant: body.variant ?? null,
      client_id: body.clientId,
    });

    if (error) {
      console.error("Failed to store tool event:", error);
      return NextResponse.json({ error: "Failed to store tool event" }, { status: 500 });
    }

    if (body.eventType === "result_download") {
      const tool = getToolBySlug(body.toolSlug);
      const variant = typeof body.variant === "string" ? body.variant : undefined;
      await sendToolDownloadNotificationToAdmins({
        tool_title: tool.title,
        tool_href: tool.href,
        variant_label: variant ? VARIANT_LABELS[variant] ?? variant : undefined,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error storing tool event:", error);
    return NextResponse.json({ error: "Failed to store tool event" }, { status: 500 });
  }
}
