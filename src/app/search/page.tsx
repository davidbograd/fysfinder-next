import React from "react";
import { createClient } from "@/app/utils/supabase/server";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
    console.error("Supabase error:", error);
    throw new Error(`Failed to search clinics: ${error.message}`);
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
      console.error("Error in SearchPage:", error);
      errorMessage = (error as Error).message;
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Search Clinics</h1>
      <form className="mb-8 space-y-4">
        <Input
          type="text"
          name="q"
          defaultValue={searchTerm}
          placeholder="Search for a clinic..."
          className="w-full"
        />
        <Button type="submit" className="w-full">
          Search
        </Button>
      </form>
      {errorMessage ? (
        <p className="text-red-500">Error: {errorMessage}</p>
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
          <p>No clinics found matching &quot;{searchTerm}&quot;</p>
        )
      ) : null}
    </div>
  );
}
