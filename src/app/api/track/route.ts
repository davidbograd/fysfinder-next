// API route for tracking clinic events (views, clicks)
// Uses service role to bypass RLS; validates event types server-side

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

interface TrackEventBody {
  clinicId: string;
  eventType: EventType;
  metadata?: Record<string, string>;
}

export async function POST(request: Request) {
  try {
    const body: TrackEventBody = await request.json();
    const { clinicId, eventType, metadata } = body;

    if (!clinicId || !eventType) {
      return NextResponse.json(
        { error: "clinicId and eventType are required" },
        { status: 400 }
      );
    }

    if (!VALID_EVENT_TYPES.includes(eventType)) {
      return NextResponse.json(
        { error: `Invalid eventType: ${eventType}` },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from("clinic_events").insert({
      clinic_id: clinicId,
      event_type: eventType,
      metadata: metadata || {},
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
