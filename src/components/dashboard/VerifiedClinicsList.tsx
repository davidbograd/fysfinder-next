"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getVerifiedClinics, getClinicStats } from "@/app/actions/admin-stats";
import { Mail, Phone, MapPin, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface Clinic {
  clinics_id: string;
  klinikNavn: string;
  lokation: string;
  adresse: string;
  postnummer: number;
  tlf: string | null;
  email: string | null;
  website: string | null;
  verified_klinik: boolean;
  verified_email: string | null;
  created_at: string;
  updated_at: string;
}

export const VerifiedClinicsList = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);

        // Fetch total count
        const statsResult = await getClinicStats();
        if (statsResult.error) {
          toast({
            title: "Fejl",
            description: statsResult.error,
            variant: "destructive",
          });
          return;
        }
        setTotalCount(statsResult.verifiedCount || 0);

        // Fetch first page of clinics
        const clinicsResult = await getVerifiedClinics(ITEMS_PER_PAGE, 0);
        if (clinicsResult.error) {
          toast({
            title: "Fejl",
            description: clinicsResult.error,
            variant: "destructive",
          });
          return;
        }

        const fetchedClinics = clinicsResult.clinics || [];
        setClinics(fetchedClinics);
        setHasMore(fetchedClinics.length === ITEMS_PER_PAGE);
        setOffset(ITEMS_PER_PAGE);
      } catch (error) {
        console.error("Error loading clinics:", error);
        toast({
          title: "Fejl",
          description: "Der opstod en fejl ved indlæsning af klinikker",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [toast]);

  const handleLoadMore = async () => {
    try {
      setLoadingMore(true);

      const clinicsResult = await getVerifiedClinics(ITEMS_PER_PAGE, offset);
      if (clinicsResult.error) {
        toast({
          title: "Fejl",
          description: clinicsResult.error,
          variant: "destructive",
        });
        return;
      }

      const fetchedClinics = clinicsResult.clinics || [];
      setClinics([...clinics, ...fetchedClinics]);
      setHasMore(fetchedClinics.length === ITEMS_PER_PAGE);
      setOffset(offset + ITEMS_PER_PAGE);
    } catch (error) {
      console.error("Error loading more clinics:", error);
      toast({
        title: "Fejl",
        description: "Der opstod en fejl ved indlæsning af flere klinikker",
        variant: "destructive",
      });
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[200px]">
          <Spinner size="lg" className="text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tilbage til Dashboard
          </Link>
        </Button>
      </div>

      {/* Clinics Count */}
      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{totalCount}</span> Verificerede klinikker
          </p>
        </CardContent>
      </Card>

      {/* Clinics List */}
      {clinics.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-sm text-muted-foreground text-center">
              Ingen verificerede klinikker fundet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {clinics.map((clinic) => (
            <Card key={clinic.clinics_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">
                        {clinic.klinikNavn}
                      </h3>
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        Verificeret
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      {clinic.adresse && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span>
                            {clinic.adresse}, {clinic.postnummer} {clinic.lokation}
                          </span>
                        </div>
                      )}

                      {clinic.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <a
                            href={`mailto:${clinic.email}`}
                            className="hover:underline"
                          >
                            {clinic.email}
                          </a>
                        </div>
                      )}

                      {clinic.tlf && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <a
                            href={`tel:${clinic.tlf}`}
                            className="hover:underline"
                          >
                            {clinic.tlf}
                          </a>
                        </div>
                      )}

                      {clinic.verified_email && (
                        <div className="text-xs text-gray-500 mt-2">
                          Verificeret af: {clinic.verified_email}
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        Senest opdateret:{" "}
                        {new Date(clinic.updated_at).toLocaleDateString("da-DK", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {clinic.website && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                      >
                        <a
                          href={clinic.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                    >
                      <Link href={`/dashboard/clinic/${clinic.clinics_id}/edit`}>
                        Rediger
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleLoadMore}
                disabled={loadingMore}
                variant="outline"
              >
                {loadingMore ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Indlæser...
                  </>
                ) : (
                  "Indlæs flere"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

