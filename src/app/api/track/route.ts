// API route for tracking clinic events (views, clicks).
// Updated: validates origin/payload and applies lightweight request throttling before writes.

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const VALID_EVENT_TYPES = [
  "profile_view",
  "list_impression",
  "phone_click",
  "website_click",
  "email_click",
  "booking_click",
] as const;

type EventType = (typeof VALID_EVENT_TYPES)[number];
type MetadataValue = string | number | boolean | null;

interface TrackEventBody {
  clinicId: string;
  eventType: EventType;
  metadata?: Record<string, MetadataValue>;
  eventId?: string;
}

const ALLOWED_ORIGIN_HOSTNAMES = new Set([
  "fysfinder.dk",
  "www.fysfinder.dk",
  "localhost",
  "127.0.0.1",
]);
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_EVENTS_PER_WINDOW = 120;
const METADATA_MAX_KEYS = 20;
const METADATA_MAX_KEY_LENGTH = 50;
const METADATA_MAX_STRING_LENGTH = 250;
const CLINIC_ID_PATTERN = /^[a-zA-Z0-9_-]{6,64}$/;
const EVENT_ID_PATTERN = /^[a-zA-Z0-9_-]{8,64}$/;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

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

function sanitizeMetadata(metadata: unknown): {
  data?: Record<string, MetadataValue>;
  error?: string;
} {
  if (metadata === undefined) {
    return { data: {} };
  }
  if (!isPlainObject(metadata)) {
    return { error: "metadata must be an object" };
  }

  const entries = Object.entries(metadata);
  if (entries.length > METADATA_MAX_KEYS) {
    return { error: "metadata has too many keys" };
  }

  const sanitized: Record<string, MetadataValue> = {};
  for (const [rawKey, rawValue] of entries) {
    const key = rawKey.trim();
    if (!key || key.length > METADATA_MAX_KEY_LENGTH) {
      return { error: "metadata key is invalid" };
    }

    if (
      rawValue !== null &&
      typeof rawValue !== "string" &&
      typeof rawValue !== "number" &&
      typeof rawValue !== "boolean"
    ) {
      return { error: "metadata value type is invalid" };
    }

    if (typeof rawValue === "string" && rawValue.length > METADATA_MAX_STRING_LENGTH) {
      return { error: "metadata string value is too long" };
    }

    if (typeof rawValue === "number" && !Number.isFinite(rawValue)) {
      return { error: "metadata number value is invalid" };
    }

    sanitized[key] = rawValue;
  }

  return { data: sanitized };
}

export async function POST(request: Request) {
  try {
    if (!isAllowedOrigin(request.headers.get("origin"))) {
      return NextResponse.json({ error: "Origin not allowed" }, { status: 403 });
    }

    const body: TrackEventBody = await request.json();
    const { clinicId, eventType, metadata, eventId } = body;

    if (!clinicId || !eventType) {
      return NextResponse.json(
        { error: "clinicId and eventType are required" },
        { status: 400 }
      );
    }

    if (typeof clinicId !== "string" || !CLINIC_ID_PATTERN.test(clinicId.trim())) {
      return NextResponse.json({ error: "Invalid clinicId format" }, { status: 400 });
    }

    if (!VALID_EVENT_TYPES.includes(eventType)) {
      return NextResponse.json(
        { error: `Invalid eventType: ${eventType}` },
        { status: 400 }
      );
    }

    if (
      eventId &&
      (typeof eventId !== "string" || !EVENT_ID_PATTERN.test(eventId))
    ) {
      return NextResponse.json({ error: "Invalid eventId format" }, { status: 400 });
    }

    const metadataResult = sanitizeMetadata(metadata);
    if (metadataResult.error) {
      return NextResponse.json({ error: metadataResult.error }, { status: 400 });
    }

    const clientKey = getClientKey(request);
    if (isRateLimited(`${clientKey}:${eventType}`)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const sanitizedMetadata = metadataResult.data || {};
    if (eventId && !("event_id" in sanitizedMetadata)) {
      sanitizedMetadata.event_id = eventId;
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from("clinic_events").insert({
      clinic_id: clinicId.trim(),
      event_type: eventType,
      metadata: sanitizedMetadata,
    });

    if (error) {
      console.error("Failed to track event:", error);
      return NextResponse.json(
        { error: "Failed to track event" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
