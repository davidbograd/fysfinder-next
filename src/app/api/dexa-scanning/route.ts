import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { rateLimitMiddleware } from "./rate-limit";
import { headers } from "next/headers";

export const runtime = "edge";

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is not set");
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Simple logging function - in production, use a proper logging service
function logTranslationRequest(
  ip: string,
  success: boolean,
  error?: string,
  inputLength?: number
) {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      ip,
      success,
      error,
      inputLength,
      service: "dexa-translation",
    })
  );
}

export async function POST(request: Request) {
  try {
    // Check rate limit
    const rateLimitResult = await rateLimitMiddleware();
    if (rateLimitResult) return rateLimitResult;

    const { text } = await request.json();
    const headersList = headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";

    if (!text) {
      logTranslationRequest(ip, false, "No text provided");
      return NextResponse.json(
        { error: "Ingen tekst blev modtaget" },
        { status: 400 }
      );
    }

    const systemPrompt = `
   Du er en ekspert i at forstå og forklare DEXA-scanningsbeskrivelser (knogleskanning). Din opgave er at omskrive komplekse medicinske DEXA-beskrivelser til en kort og letforståelig tekst, som alle kan forstå – også uden medicinsk baggrund. Fokuser primært på knogletæthed (T-score, Z-score) og eventuelle brudrisici.

- Hvert relevant fund på scanningen (f.eks. T-score for hoften, T-score for lænderyggen, overordnet vurdering) skal præsenteres med en letforståelig overskrift og et par linjer som uddyber med en simpel forklaring. Overskriften skal være **bold** med to stjerner på hver side.

- Fokuser kun på det mest relevante og klinisk betydningsfulde. Hold teksten kort, klar og præcis – som en opsummering til en patient.

- Brug almindeligt sprog og forklar nødvendige fagudtryk som T-score og Z-score, og hvad de betyder (normal, osteopeni, osteoporose).

- Forklar altid forkortelser, hvis de bruges.

- Lav aldrig anbefalinger som "Konsulter din læge" eller lignende.

- Hvis input ikke virker som en DEXA-beskrivelse, så svar kun med "Din scanning kan ikke fortolkes. Tjek at det faktisk er en DEXA-scanning, og prøv igen."
    `;

    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 750,
      temperature: 0.1,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: text,
        },
      ],
    });

    if (
      !message.content[0] ||
      typeof message.content[0] !== "object" ||
      !("type" in message.content[0])
    ) {
      throw new Error("Unexpected response format from Claude API");
    }

    const contentBlock = message.content[0];
    const translation = contentBlock.type === "text" ? contentBlock.text : "";

    if (!translation) {
      throw new Error("No translation received from Claude API");
    }

    // Add logging here after successful translation
    logTranslationRequest(ip, true, undefined, text.length);

    return NextResponse.json({ translation });
  } catch (error) {
    const headersList = headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorDetails = error instanceof Error ? error.stack : String(error);

    console.error("Translation error:", {
      message: errorMessage,
      details: errorDetails,
      timestamp: new Date().toISOString(),
      ip,
      service: "dexa-translation",
    });

    logTranslationRequest(ip, false, errorMessage);

    return NextResponse.json(
      {
        error: "Der opstod en fejl under oversættelsen",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
