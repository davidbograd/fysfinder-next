/**
 * Tokenized unsubscribe for monthly clinic summary emails.
 * Marks the Resend contact as unsubscribed and shows a Danish confirmation.
 */

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  normalizeUnsubscribeEmail,
  verifyUnsubscribeToken,
} from "@/lib/email-unsubscribe";

function htmlPage(title: string, body: string, status = 200): NextResponse {
  return new NextResponse(
    `<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:48px 16px;background:#f8f7f2;font-family:Arial,Helvetica,sans-serif;color:#104534;">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;padding:32px 24px;border-radius:16px;">
    <h1 style="margin:0 0 16px 0;font-size:22px;">${title}</h1>
    <p style="margin:0;font-size:16px;line-height:1.6;color:#333333;">${body}</p>
  </div>
</body>
</html>`,
    {
      status,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }
  );
}

export async function GET(request: NextRequest) {
  const emailParam = request.nextUrl.searchParams.get("email") || "";
  const token = request.nextUrl.searchParams.get("token") || "";
  const email = normalizeUnsubscribeEmail(emailParam);

  if (!email || !verifyUnsubscribeToken(email, token)) {
    return htmlPage(
      "Linket virker ikke",
      "Afmeldingslinket er ugyldigt eller udløbet. Svar på mailen, hvis I stadig vil afmeldes.",
      400
    );
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error("Unsubscribe failed: RESEND_API_KEY is not set");
    return htmlPage(
      "Noget gik galt",
      "Vi kunne ikke afmelde jer lige nu. Svar på mailen, så hjælper vi.",
      500
    );
  }

  try {
    const resend = new Resend(resendApiKey);
    const { error: updateError } = await resend.contacts.update({
      email,
      unsubscribed: true,
    });

    if (updateError) {
      const { error: createError } = await resend.contacts.create({
        email,
        unsubscribed: true,
      });
      if (createError) {
        console.error("Unsubscribe contact update/create failed", {
          updateError,
          createError,
        });
        return htmlPage(
          "Noget gik galt",
          "Vi kunne ikke afmelde jer lige nu. Svar på mailen, så hjælper vi.",
          500
        );
      }
    }
  } catch (error) {
    console.error("Unsubscribe error", error);
    return htmlPage(
      "Noget gik galt",
      "Vi kunne ikke afmelde jer lige nu. Svar på mailen, så hjælper vi.",
      500
    );
  }

  return htmlPage(
    "I er afmeldt",
    "I får ikke længere den månedlige opsummering fra Fysfinder. I kan stadig logge ind på dashboardet og se jeres tal der."
  );
}
