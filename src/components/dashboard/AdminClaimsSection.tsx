"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getPendingClaims,
  approveClaim,
  rejectClaim,
  getPendingClinicCreationRequests,
  approveClinicCreationRequest,
  rejectClinicCreationRequest,
} from "@/app/actions/admin-claims";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X, Calendar, MapPin, Globe } from "lucide-react";

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
  }[] | null;
}

interface ClinicCreationRequest {
  id: string;
  requester_name: string;
  requester_email: string;
  requester_phone: string | null;
  requester_role: string;
  clinic_name: string;
  address: string;
  postal_code: string;
  city_name: string;
  website: string | null;
  description: string | null;
  status: string;
  created_at: string;
}

export const AdminClaimsSection = () => {
  const { toast } = useToast();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [creationRequests, setCreationRequests] = useState<ClinicCreationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingKey, setProcessingKey] = useState<string | null>(null);
  /** Optional Google Maps URL per pending item (claim id or creation request id). */
  const [googleMapsUrlByItemId, setGoogleMapsUrlByItemId] = useState<Record<string, string>>({});

  const loadClaims = async () => {
    setIsLoading(true);
    try {
      const [claimResult, requestResult] = await Promise.all([
        getPendingClaims(),
        getPendingClinicCreationRequests(),
      ]);

      if (claimResult.error) {
        toast({
          title: "Fejl",
          description: claimResult.error,
          variant: "destructive",
        });
        setClaims([]);
      } else {
        setClaims(claimResult.claims || []);
      }

      if (requestResult.error) {
        toast({
          title: "Fejl",
          description: requestResult.error,
          variant: "destructive",
        });
        setCreationRequests([]);
      } else {
        setCreationRequests(requestResult.requests || []);
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

  const handleGoogleMapsUrlChange = (itemId: string, value: string) => {
    setGoogleMapsUrlByItemId((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleApprove = async (claimId: string) => {
    const key = `claim-${claimId}`;
    setProcessingKey(key);
    try {
      const trimmedMaps = googleMapsUrlByItemId[claimId]?.trim();
      const result = await approveClaim(claimId, {
        googleMapsUrl: trimmedMaps || undefined,
      });
      if ("error" in result) {
        toast({
          title: "Fejl",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Anmodning godkendt",
          description:
            result.googleSync?.ok === true
              ? "Ejerskabet er blevet tildelt. Google-data er opdateret."
              : "Ejerskabet er blevet tildelt.",
        });
        if (result.googleSync && !result.googleSync.ok) {
          toast({
            title: "Google-synk",
            description: result.googleSync.message,
            variant: "destructive",
          });
        }
        setGoogleMapsUrlByItemId((prev) => {
          const next = { ...prev };
          delete next[claimId];
          return next;
        });
        await loadClaims();
      }
    } catch (error) {
      toast({
        title: "Uventet fejl",
        description: "Kunne ikke godkende anmodning",
        variant: "destructive",
      });
    } finally {
      setProcessingKey(null);
    }
  };

  const handleReject = async (claimId: string) => {
    const reason = window.prompt(
      "Angiv en afvisningsårsag til ejeren (påkrævet):"
    );
    if (reason === null) {
      return;
    }
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      toast({
        title: "Afvisningsårsag mangler",
        description: "Du skal skrive en afvisningsårsag, før anmodningen kan afvises.",
        variant: "destructive",
      });
      return;
    }

    const key = `claim-${claimId}`;
    setProcessingKey(key);
    try {
      const result = await rejectClaim(claimId, trimmedReason);
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
        await loadClaims();
      }
    } catch (error) {
      toast({
        title: "Uventet fejl",
        description: "Kunne ikke afvise anmodning",
        variant: "destructive",
      });
    } finally {
      setProcessingKey(null);
    }
  };

  const handleApproveCreationRequest = async (requestId: string) => {
    const key = `create-${requestId}`;
    setProcessingKey(key);
    try {
      const trimmedMaps = googleMapsUrlByItemId[requestId]?.trim();
      const result = await approveClinicCreationRequest(requestId, {
        googleMapsUrl: trimmedMaps || undefined,
      });
      if ("error" in result) {
        toast({
          title: "Fejl",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Anmodning godkendt",
          description:
            result.googleSync?.ok === true
              ? "Klinikken er oprettet og ejerskab er tildelt. Google-data er opdateret."
              : "Klinikken er oprettet og ejerskab er tildelt",
        });
        if (result.googleSync && !result.googleSync.ok) {
          toast({
            title: "Google-synk",
            description: result.googleSync.message,
            variant: "destructive",
          });
        }
        setGoogleMapsUrlByItemId((prev) => {
          const next = { ...prev };
          delete next[requestId];
          return next;
        });
        await loadClaims();
      }
    } catch (error) {
      toast({
        title: "Uventet fejl",
        description: "Kunne ikke godkende oprettelses-anmodning",
        variant: "destructive",
      });
    } finally {
      setProcessingKey(null);
    }
  };

  const handleRejectCreationRequest = async (requestId: string) => {
    const reason = window.prompt(
      "Angiv en afvisningsårsag til ejeren (påkrævet):"
    );
    if (reason === null) {
      return;
    }
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      toast({
        title: "Afvisningsårsag mangler",
        description:
          "Du skal skrive en afvisningsårsag, før oprettelses-anmodningen kan afvises.",
        variant: "destructive",
      });
      return;
    }

    const key = `create-${requestId}`;
    setProcessingKey(key);
    try {
      const result = await rejectClinicCreationRequest(requestId, trimmedReason);
      if (result.error) {
        toast({
          title: "Fejl",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Anmodning afvist",
          description: "Oprettelses-anmodningen er blevet afvist",
        });
        await loadClaims();
      }
    } catch (error) {
      toast({
        title: "Uventet fejl",
        description: "Kunne ikke afvise oprettelses-anmodning",
        variant: "destructive",
      });
    } finally {
      setProcessingKey(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ventende anmodninger</CardTitle>
          <CardDescription>
            Administrer både ejerskabs-anmodninger og oprettelse af nye klinikker
          </CardDescription>
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
        <CardTitle>Ventende anmodninger</CardTitle>
        <CardDescription>
          {claims.length + creationRequests.length === 0
            ? "Ingen ventende anmodninger"
            : `${claims.length + creationRequests.length} ventende anmodning(er)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {claims.length === 0 && creationRequests.length === 0 ? (
          <p className="text-sm text-gray-600">Alle anmodninger er blevet behandlet</p>
        ) : (
          <div className="space-y-6">
            {claims.map((claim) => {
              const clinic = Array.isArray(claim.clinics) ? claim.clinics[0] : claim.clinics;
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
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div>
                      <Badge className="mb-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800 hover:bg-blue-100">
                        Klinik claim
                      </Badge>
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

                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold">Klinik detaljer</CardTitle>
                        <CardDescription className="text-xs">
                          Nuværende oplysninger på Fysfinder
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

                  <div className="space-y-2 pt-2">
                    <Label htmlFor={`google-maps-claim-${claim.id}`} className="text-sm font-medium">
                      Google Maps-link (valgfri)
                    </Label>
                    <Input
                      id={`google-maps-claim-${claim.id}`}
                      type="url"
                      inputMode="url"
                      autoComplete="off"
                      placeholder="https://maps.app.goo.gl/... eller fuldt maps-link"
                      value={googleMapsUrlByItemId[claim.id] ?? ""}
                      onChange={(e) => handleGoogleMapsUrlChange(claim.id, e.target.value)}
                      disabled={processingKey === `claim-${claim.id}` || !!clinic?.verified_klinik}
                      aria-label="Google Maps-link til klinikken efter godkendelse"
                    />
                    <p className="text-xs text-gray-500">
                      Hvis du indsætter et link, hentes åbningstider, telefon m.m. fra Google med det
                      samme (kun tomme felter opdateres).
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => handleApprove(claim.id)}
                      disabled={processingKey === `claim-${claim.id}` || !!clinic?.verified_klinik}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      size="lg"
                    >
                      {processingKey === `claim-${claim.id}` ? (
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
                      disabled={processingKey === `claim-${claim.id}`}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      size="lg"
                    >
                      {processingKey === `claim-${claim.id}` ? (
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

            {creationRequests.map((request) => {
              const submissionDate = new Date(request.created_at).toLocaleString("da-DK", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={request.id}
                  className="border rounded-lg bg-white space-y-4 p-6"
                >
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div>
                      <Badge className="mb-2 rounded-full bg-fuchsia-100 px-3 py-1 text-sm font-semibold text-fuchsia-800 hover:bg-fuchsia-100">
                        Ny klinik
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {submissionDate}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold">{request.clinic_name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-gray-700">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="size-5 mr-2 flex-shrink-0 stroke-2" />
                          <span>
                            {request.address}, {request.postal_code} {request.city_name}
                          </span>
                        </div>
                        {request.website && (
                          <div className="flex items-center text-gray-600">
                            <Globe className="size-5 mr-2 flex-shrink-0 stroke-2" />
                            <span>{request.website}</span>
                          </div>
                        )}
                        {request.description && (
                          <p>
                            <span className="font-medium">Beskrivelse:</span> {request.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                    <Card className="bg-blue-50/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold">Anmoder detaljer</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-gray-700">
                        <p>
                          <span className="font-medium">Navn:</span> {request.requester_name}
                        </p>
                        <p>
                          <span className="font-medium">Rolle:</span> {request.requester_role}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span> {request.requester_email}
                        </p>
                        <p>
                          <span className="font-medium">Telefon:</span> {request.requester_phone || "Ikke angivet"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label htmlFor={`google-maps-create-${request.id}`} className="text-sm font-medium">
                      Google Maps-link (valgfri)
                    </Label>
                    <Input
                      id={`google-maps-create-${request.id}`}
                      type="url"
                      inputMode="url"
                      autoComplete="off"
                      placeholder="https://maps.app.goo.gl/... eller fuldt maps-link"
                      value={googleMapsUrlByItemId[request.id] ?? ""}
                      onChange={(e) => handleGoogleMapsUrlChange(request.id, e.target.value)}
                      disabled={processingKey === `create-${request.id}`}
                      aria-label="Google Maps-link til ny klinik efter godkendelse"
                    />
                    <p className="text-xs text-gray-500">
                      Hvis du indsætter et link, hentes åbningstider, telefon m.m. fra Google med det
                      samme (kun tomme felter opdateres).
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => handleApproveCreationRequest(request.id)}
                      disabled={processingKey === `create-${request.id}`}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      size="lg"
                    >
                      {processingKey === `create-${request.id}` ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Behandler...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-5 w-5" />
                          Godkend og opret klinik
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleRejectCreationRequest(request.id)}
                      disabled={processingKey === `create-${request.id}`}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      size="lg"
                    >
                      {processingKey === `create-${request.id}` ? (
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

