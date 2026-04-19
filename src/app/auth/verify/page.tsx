import { createClient } from "@/app/utils/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check, Mail } from "lucide-react";
import { VerifyPendingActions } from "./VerifyPendingActions";

type VerifyPageProps = {
  searchParams: Promise<{
    email?: string | string[];
    callbackError?: string | string[];
  }>;
};

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const resolved = await searchParams;
  const rawEmail = resolved.email;
  const emailFromQuery = typeof rawEmail === "string" ? rawEmail : null;
  const rawCallbackError = resolved.callbackError;
  const callbackError =
    typeof rawCallbackError === "string" ? rawCallbackError : null;
  const showLinkExpiredNotice =
    callbackError === "otp_expired" || callbackError === "access_denied";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email_confirmed_at) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50/80">
        <Card className="max-w-md w-full border-slate-200 shadow-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Check
                className="h-14 w-14 text-brand-green"
                strokeWidth={2.5}
                aria-hidden
              />
            </div>
            <CardTitle>Email bekræftet, velkommen til Fysfinder!</CardTitle>
            <div className="text-base text-slate-600 text-center space-y-2">
              <p>Din email er verificeret.</p>
              <p>
                Lad os tilføje din klinik så vi kan hjælpe med at få flere
                patienter.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              className="w-full bg-brand-green text-white hover:bg-brand-green/90"
            >
              <Link href="/dashboard/claim">Tilknyt din klinik</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayEmail = user?.email ?? emailFromQuery;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50/80">
      <Card className="max-w-md w-full border-slate-200 shadow-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <div className="rounded-full bg-brand-green/10 p-3">
              <Mail className="h-8 w-8 text-brand-green" aria-hidden />
            </div>
          </div>
          <CardTitle>Bekræft din email</CardTitle>
          <CardDescription className="text-base text-slate-600">
            {displayEmail ? (
              <>
                Vi har sendt et link til{" "}
                <strong className="text-slate-900">{displayEmail}</strong>.
                Åbn mailen og klik på linket for at aktivere din konto.
              </>
            ) : (
              <>
                Vi har sendt en bekræftelsesmail. Tjek din indbakke og klik på
                linket for at aktivere din konto.
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showLinkExpiredNotice && (
            <div
              role="alert"
              className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
            >
              <p className="font-medium">Linket virker ikke længere</p>
              <p className="mt-1 text-amber-900/90">
                Det kan ske hvis mail-programmet åbnede linket automatisk, eller
                hvis linket allerede er brugt. Brug &quot;Send bekræftelsesmail
                igen&quot; nedenfor, eller kopier linket og åbn det i et nyt
                vindue.
              </p>
            </div>
          )}
          <div className="space-y-2 text-sm text-slate-600 bg-slate-50 rounded-lg p-4 border border-slate-100">
            <p className="font-medium text-slate-800">Sådan gør du:</p>
            <ol className="list-decimal list-inside space-y-1.5 ml-0.5">
              <li>Tjek din indbakke (og evt. spam)</li>
              <li>Åbn mailen fra Fysfinder</li>
              <li>Klik på bekræftelseslinket — du logges ind og sendes videre</li>
            </ol>
          </div>

          <VerifyPendingActions
            email={displayEmail ?? null}
            hasSession={!!user}
          />

          <p className="text-xs text-center text-slate-500 pt-2">
            Forkert email?{" "}
            <Link
              href="/auth/signup"
              className="text-primary font-medium hover:underline"
            >
              Opret konto igen
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
