"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { getPendingClaims, approveClaim, rejectClaim } from "@/app/actions/admin-claims";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X, Mail, Phone, Briefcase, Calendar, User } from "lucide-react";

interface Claim {
  id: string;
  clinic_id: string;
  klinik_navn: string;
  job_titel: string;
  fulde_navn: string;
  email: string;
  telefon: string;
  status: string;
  created_at: string;
  clinics: {
    clinics_id: string;
    klinikNavn: string;
    adresse: string | null;
    postnummer: number | null;
    lokation: string | null;
    verified_klinik: boolean;
    email: string | null;
    tlf: string | null;
  } | null;
}

export const AdminClaimsSection = () => {
  const { toast } = useToast();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadClaims = async () => {
    setIsLoading(true);
    try {
      const result = await getPendingClaims();
      if (result.error) {
        toast({
          title: "Fejl",
          description: result.error,
          variant: "destructive",
        });
        setClaims([]);
      } else {
        setClaims(result.claims || []);
      }
    } catch (error) {
      console.error("Error loading claims:", error);
      toast({
        title: "Uventet fejl",
        description: "Kunne ikke indlæse anmodninger",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, []);

  const handleApprove = async (claimId: string) => {
    setProcessingId(claimId);
    try {
      const result = await approveClaim(claimId);
      if (result.error) {
        toast({
          title: "Fejl",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Anmodning godkendt",
          description: "Ejerskabet er blevet tildelt",
        });
        // Reload claims
        await loadClaims();
      }
    } catch (error) {
      toast({
        title: "Uventet fejl",
        description: "Kunne ikke godkende anmodning",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (claimId: string) => {
    if (!confirm("Er du sikker på, at du vil afvise denne anmodning?")) {
      return;
    }

    setProcessingId(claimId);
    try {
      const result = await rejectClaim(claimId);
      if (result.error) {
        toast({
          title: "Fejl",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Anmodning afvist",
          description: "Anmodningen er blevet afvist",
        });
        // Reload claims
        await loadClaims();
      }
    } catch (error) {
      toast({
        title: "Uventet fejl",
        description: "Kunne ikke afvise anmodning",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ventende anmodninger om ejerskab</CardTitle>
          <CardDescription>Administrer anmodninger om ejerskab af klinikker</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Spinner size="lg" className="text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventende anmodninger om ejerskab</CardTitle>
        <CardDescription>
          {claims.length === 0
            ? "Ingen ventende anmodninger"
            : `${claims.length} ventende anmodning(er)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {claims.length === 0 ? (
          <p className="text-sm text-gray-600">Alle anmodninger er blevet behandlet</p>
        ) : (
          <div className="space-y-6">
            {claims.map((claim) => {
              const clinic = claim.clinics;
              const originalAddress = clinic
                ? [
                    clinic.adresse,
                    clinic.postnummer && clinic.lokation
                      ? `${clinic.postnummer} ${clinic.lokation}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(", ")
                : null;

              const submissionDate = new Date(claim.created_at).toLocaleString("da-DK", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={claim.id}
                  className="border rounded-lg bg-white space-y-4 p-6"
                >
                  {/* Header with clinic name */}
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {claim.klinik_navn}
                      </h3>
                      {clinic?.verified_klinik && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mt-1">
                          Allerede verificeret
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {submissionDate}
                    </div>
                  </div>

                  {/* Top Section: Klinik Detaljer and Verifikationsinformation */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Klinik Detaljer - Original Clinic Info */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold">Klinik detaljer</CardTitle>
                        <CardDescription className="text-xs">
                          Nuværende oplysninger på FysFinder
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {clinic?.klinikNavn || "Ikke fundet"}
                          </p>
                        </div>
                        {originalAddress && (
                          <div className="text-sm text-gray-600">
                            <p>{originalAddress}</p>
                          </div>
                        )}
                        {clinic?.email && (
                          <div className="text-sm text-gray-600">
                            <p>{clinic.email}</p>
                          </div>
                        )}
                        {clinic?.tlf && (
                          <div className="text-sm text-gray-600">
                            <p>{clinic.tlf}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Verifikationsinformation - Form Submission Details */}
                    <Card className="bg-yellow-50/50 border-yellow-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold">Verifikationsinformation</CardTitle>
                        <CardDescription className="text-xs">
                          Oplysninger indsendt i formularen
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <span className="text-xs text-gray-500 block mb-1">Klinik navn</span>
                          <p className="font-medium text-gray-900">{claim.klinik_navn}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 block mb-1">Fulde navn</span>
                          <p className="font-medium text-gray-900">{claim.fulde_navn}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 block mb-1">Email</span>
                          <p className="font-medium text-gray-900">{claim.email}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 block mb-1">Job titel</span>
                          <p className="font-medium text-gray-900">{claim.job_titel}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 block mb-1">Tlf nummer</span>
                          <p className="font-medium text-gray-900">{claim.telefon}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Anmoder Detaljer - User who submitted */}
                  <Card className="bg-blue-50/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold">Anmoder detaljer</CardTitle>
                      <CardDescription className="text-xs">
                        Brugeren der har indsendt anmodningen
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-6">
                        <div>
                          <p className="text-xs text-gray-500">Navn</p>
                          <p className="font-medium text-gray-900">{claim.fulde_navn}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="font-medium text-gray-900">{claim.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Telefon</p>
                          <p className="font-medium text-gray-900">{claim.telefon}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Job titel</p>
                          <p className="font-medium text-gray-900">{claim.job_titel}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => handleApprove(claim.id)}
                      disabled={processingId === claim.id || !!clinic?.verified_klinik}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      size="lg"
                    >
                      {processingId === claim.id ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Behandler...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-5 w-5" />
                          Godkend anmodning
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleReject(claim.id)}
                      disabled={processingId === claim.id}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      size="lg"
                    >
                      {processingId === claim.id ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Behandler...
                        </>
                      ) : (
                        <>
                          <X className="mr-2 h-5 w-5" />
                          Afvis anmodning
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

