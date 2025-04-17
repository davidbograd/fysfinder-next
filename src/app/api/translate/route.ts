import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { rateLimitMiddleware } from "./rate-limit";
import { headers } from "next/headers";

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
      service: "mr-translation",
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

    // Log the incoming request
    logTranslationRequest(ip, true, undefined, text.length);

    const systemPrompt = `
   Du er en ekspert i at forstå og forklare MR-scanningsbeskrivelser. Din opgave er at omskrive komplekse medicinske MR-beskrivelser til en kort og letforståelig tekst, som alle kan forstå – også uden medicinsk baggrund.

- Hvert fund på scanningen skal præsenteres med en letforståelig overskrift og et par linjer som uddyber med en simpel forklaring. Overskriften skal være beskrivende omkring fundet, ikke området. For eksempel brug "Ryggens Form" og ikke "Niveau L5/S1". Overskriften skal være **bold** med to stjerner på hver side.

- Fokuser kun på det mest relevante og klinisk betydningsfulde. Hold teksten kort, klar og præcis – som en opsummering til en patient.

- Brug almindeligt sprog og forklar nødvendige fagudtryk og medicinske termer.

- Bevar altid udtrykket diskus prolaps

- Forklar altid forkortelser som L5, S1 osv. første gang, de nævnes.

- Lav aldrig anbefalinger som "Konsulter din læge" eller lignende.

- Hvis input ikke virker som en MR-beskrivelse, så svar kun med "Din scanning kan ikke fortolkes. Tjek at det faktisk er en MR-scanning, og prøv igen."
    `;

    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1000,
      temperature: 0.2,
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

    return NextResponse.json({ translation });
  } catch (error) {
    const headersList = headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";

    logTranslationRequest(
      ip,
      false,
      error instanceof Error ? error.message : "Unknown error"
    );

    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Der opstod en fejl under oversættelsen" },
      { status: 500 }
    );
  }
}
