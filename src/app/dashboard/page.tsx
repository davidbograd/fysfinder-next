import { redirect } from "next/navigation";
import { createClient } from "@/app/utils/supabase/server";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Shield } from "lucide-react";
import Link from "next/link";
import { isAdminEmail } from "@/lib/admin";
import { AdminClaimsSection } from "@/components/dashboard/AdminClaimsSection";
import { AdminStatsSection } from "@/components/dashboard/AdminStatsSection";
import { UserClaimsSection } from "@/components/dashboard/UserClaimsSection";
import { getOwnedClinics } from "@/app/actions/clinic-management";
import { ClinicCard } from "@/components/dashboard/ClinicCard";
import { getUserClaims } from "@/app/actions/user-claims";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  // Check if user is admin
  const isAdmin = isAdminEmail(user.email);

  // Get owned clinics
  const ownedClinicsResult = await getOwnedClinics();
  const ownedClinics = ownedClinicsResult.clinics || [];

  // Get user claims (only pending ones matter for display)
  const userClaimsResult = await getUserClaims();
  const userClaims = userClaimsResult.claims || [];
  const pendingClaims = userClaims.filter((c: any) => c.status === "pending");

  // Check if user has any clinics (owned or pending)
  const hasAnyClinics = ownedClinics.length > 0 || pendingClaims.length > 0;
  const totalClinicCount = ownedClinics.length + pendingClaims.length;

  return (
    <div className="py-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Velkommen {profile?.full_name || ""}
        </p>
      </div>

      {/* Admin Banner */}
      {isAdmin && (
        <div className="mb-8 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/20 p-3">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                ADMINISTRATOR
              </h2>
              <p className="text-purple-100">
                Du er logget ind som administrator med fuld adgang
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Admin Claims Section - Full Width for Admins */}
        {isAdmin && (
          <div className="md:col-span-2 lg:col-span-3">
            <AdminClaimsSection />
          </div>
        )}

        {/* Admin Stats Section - Full Width for Admins */}
        {isAdmin && (
          <div className="md:col-span-2 lg:col-span-3">
            <AdminStatsSection />
          </div>
        )}

        {/* Divider after admin sections */}
        {isAdmin && (
          <div className="md:col-span-2 lg:col-span-3">
            <hr className="border-gray-200" />
          </div>
        )}

        {/* Your Clinics Section - Full Width at Top */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Dine klinikker</CardTitle>
              {hasAnyClinics && (
                <CardDescription className="mt-1">
                  {totalClinicCount} {totalClinicCount === 1 ? "klinik" : "klinikker"}
                </CardDescription>
              )}
            </div>
            {hasAnyClinics && (
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/claim">Tilføj klinik</Link>
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {hasAnyClinics ? (
              <>
                {/* Owned Clinics */}
                {ownedClinics.map((clinic: any) => (
                  <ClinicCard key={clinic.clinics_id} clinic={clinic} />
                ))}
                {/* Pending Claims - displayed like clinic cards */}
                <UserClaimsSection claims={userClaims} />
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-600 mb-4">
                  Du har endnu ikke tilknyttet nogen klinikker til din konto.
                </p>
                <Button asChild>
                  <Link href="/dashboard/claim">Tilknyt din klinik</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upgrade to Paid Plan Section */}
        <Card>
          <CardHeader>
            <CardTitle>Opgrader til betalt plan</CardTitle>
            <CardDescription>Få mere synlighed for din klinik</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Med en betalt plan får din klinik:
            </p>
            <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
              <li>Højere placering i søgeresultater</li>
              <li>Fremhævet visning på kliniksider</li>
              <li>Bedre eksponering for potentielle patienter</li>
              <li>Prioriteret support</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="default">
              Se priser og opgrader
            </Button>
          </CardFooter>
        </Card>

        {/* Contact Section */}
        <Card>
          <CardHeader>
            <CardTitle>Kontakt</CardTitle>
            <CardDescription>Har du spørgsmål? Vi hjælper gerne</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Skriv til os, hvis du har spørgsmål eller har brug for hjælp.
              </p>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-gray-500" />
                <Link
                  href="mailto:kontakt@fysfinder.dk"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  kontakt@fysfinder.dk
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

