import { redirect } from "next/navigation";
import { createClient } from "@/app/utils/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default async function VerifyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not logged in, redirect to signin
  if (!user) {
    redirect("/auth/signin");
  }

  // Check if email is already verified
  const isVerified = user.email_confirmed_at !== null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        {isVerified ? (
          <>
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
              <CardTitle className="text-center">Email Verificeret</CardTitle>
              <CardDescription className="text-center">
                Din email er allerede verificeret
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/dashboard">Gå til Dashboard</Link>
              </Button>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-center">Verificer din email</CardTitle>
              <CardDescription className="text-center">
                Vi har sendt en verificeringslink til <strong>{user.email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-gray-600">
                <p>For at færdiggøre din konto, skal du:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Tjek din indbakke</li>
                  <li>Åbn email fra FysFinder</li>
                  <li>Klik på verificeringslinket</li>
                </ol>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-3">
                  Har du ikke modtaget emailen?
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard">Gå til Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}

