import React from "react";
import { createClient } from "@/app/utils/supabase/server";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from "next";

export const metadata: Metadata = {
  robots: "noindex",
};

interface Clinic {
  clinics_id: string;
  klinikNavn: string;
  lokationSlug: string;
  klinikNavnSlug: string;
}

async function searchClinics(searchTerm: string): Promise<Clinic[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("clinics")
    .select("clinics_id, klinikNavn, lokationSlug, klinikNavnSlug")
    .ilike("klinikNavn", `%${searchTerm}%`)
    .order("klinikNavn", { ascending: true });

  if (error) {
    console.error("Supabase fejl:", error);
    throw new Error(`Kunne ikke søge efter klinikker: ${error.message}`);
  }

  return data || [];
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const searchTerm = searchParams.q || "";
  let clinics: Clinic[] = [];
  let errorMessage: string | null = null;

  if (searchTerm) {
    try {
      clinics = await searchClinics(searchTerm);
    } catch (error) {
      console.error("Fejl i SøgeSide:", error);
      errorMessage = (error as Error).message;
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Søg efter klinikker</h1>
      <form className="mb-8 space-y-4">
        <Input
          type="text"
          name="q"
          defaultValue={searchTerm}
          placeholder="Søg efter en klinik..."
          className="w-full"
        />
        <Button type="submit" className="w-full">
          Søg
        </Button>
      </form>
      {errorMessage ? (
        <p className="text-red-500">Fejl: {errorMessage}</p>
      ) : searchTerm ? (
        clinics.length > 0 ? (
          <div className="space-y-4">
            {clinics.map((clinic) => (
              <Card key={clinic.clinics_id}>
                <CardHeader>
                  <CardTitle>
                    <Link
                      href={`/${clinic.lokationSlug}/${clinic.klinikNavnSlug}`}
                      className="text-blue-500 hover:underline"
                    >
                      {clinic.klinikNavn}
                    </Link>
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <p>Ingen klinikker fundet der matcher &quot;{searchTerm}&quot;</p>
        )
      ) : null}
    </div>
  );
}
