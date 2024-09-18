"use client";

import { useState } from "react";
import fysioKlikker from "../../data/clinicsData";
import { slugify } from "../../utils/slugify";
import Image from "next/image";
import { StarIcon } from "@heroicons/react/24/solid";
import { PhoneIcon } from "@heroicons/react/24/outline";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import GoogleMap from "../../components/GoogleMap";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { MapPinIcon, GlobeAltIcon } from "@heroicons/react/24/outline";

export default function ClinicDetailsPage({
  params,
}: {
  params: { suburb: string; clinicName: string };
}) {
  const { suburb, clinicName } = params;
  const [showAllTherapists, setShowAllTherapists] = useState(false);

  const clinic = fysioKlikker.find(
    (c) =>
      slugify(c.lokation) === suburb && slugify(c.klinikNavn) === clinicName
  );

  if (!clinic) {
    return <div className="text-center mt-10">Clinic not found</div>;
  }

  const breadcrumbItems = [
    { text: "Forside", link: "/" },
    { text: clinic.lokation, link: `/${suburb}` },
    { text: clinic.klinikNavn },
  ];

  const numberOfTherapists = parseInt(clinic.antalBehandlere) || 0;

  // Generate mock therapists based on the number of behandlere
  const therapists = Array.from({ length: numberOfTherapists }, (_, index) => ({
    name: `Therapist ${index + 1}`,
    specialty: `Specialty ${index + 1}`,
  }));

  const displayedTherapists = showAllTherapists
    ? therapists
    : therapists.slice(0, 8);

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />

      <h1 className="text-3xl font-bold mb-2">{clinic.klinikNavn}</h1>
      <div className="flex items-center mb-6">
        <StarIcon className="h-6 w-6 text-amber-500 mr-1" />
        <span className="font-semibold mr-2">
          {clinic.avgRating.toFixed(1)}
        </span>
        <span className="text-gray-500">
          ({clinic.ratingCount} anmeldelser)
        </span>
      </div>

      <div className="mb-6">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <MapPinIcon className="h-6 w-6 text-gray-400 mr-2" />
            <p>
              {clinic.adresse}, {clinic.lokation}
            </p>
          </div>
          <div className="flex items-center">
            <GlobeAltIcon className="h-6 w-6 text-gray-400 mr-2" />
            <a
              href={clinic.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-logo-blue hover:underline"
            >
              {clinic.website}
            </a>
          </div>
          <div className="flex items-center">
            <PhoneIcon className="h-6 w-6 text-gray-400 mr-2" />
            <span>{clinic.tlf}</span>
          </div>
          <div className="flex items-center">
            <EnvelopeIcon className="h-6 w-6 text-gray-400 mr-2" />
            <span>{clinic.email}</span>
          </div>
        </div>
      </div>

      <div className="mb-16">
        <Carousel className="w-full max-w-5xl mx-auto">
          <CarouselContent className="-ml-2 md:-ml-4">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/3">
                <Card>
                  <CardContent className="flex items-center justify-center p-2">
                    <div
                      className="bg-gray-300 w-full h-[200px] rounded-lg"
                      aria-label={`Placeholder for clinic image ${index}`}
                    />
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div>
          <h2 className="text-2xl font-semibold mb-6">Priser</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex-grow pr-4 max-w-[calc(100%-120px)]">
                Første konsult (60 min)
              </span>
              <span className="font-semibold">{clinic.førsteKons} kr</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex-grow pr-4 max-w-[calc(100%-120px)]">
                Standard konsult (60 min)
              </span>
              <span className="font-semibold">{clinic.opfølgning} kr</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex-grow pr-4 max-w-[calc(100%-120px)]">
                Andet (30 min)
              </span>
              <span className="font-semibold">300 kr</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-6">Åbningstider</h2>
          <div className="space-y-2">
            {[
              "Mandag",
              "Tirsdag",
              "Onsdag",
              "Torsdag",
              "Fredag",
              "Lørdag",
              "Søndag",
            ].map((day) => (
              <div key={day} className="flex items-center justify-between">
                <span>{day}</span>
                <span className="font-semibold">
                  {clinic[day.toLowerCase() as keyof typeof clinic]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-6">Andet</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-3/5">Parkering</span>
              <span className="w-2/5 text-right font-semibold">
                {clinic.parkering}
              </span>
            </div>
            <div className="flex items-center">
              <span className="w-3/5">Handicap adgang</span>
              <span className="w-2/5 text-right font-semibold">
                {clinic.handicapadgang}
              </span>
            </div>
            <div className="flex items-center">
              <span className="w-3/5">Holdtræning</span>
              <span className="w-2/5 text-right font-semibold">
                {clinic.holdtræning}
              </span>
            </div>
            <div className="flex items-center">
              <span className="w-3/5">Hjemmetræning</span>
              <span className="w-2/5 text-right font-semibold">
                {clinic.hjemmetræning}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-semibold mb-6">Behandlere</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {displayedTherapists.map((therapist, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow h-full">
              <h3 className="font-semibold">{therapist.name}</h3>
              <p className="text-sm text-gray-600">{therapist.specialty}</p>
            </div>
          ))}
          {!showAllTherapists && therapists.length > 8 && (
            <Button
              onClick={() => setShowAllTherapists(true)}
              className="bg-black text-white p-4 rounded-lg shadow flex items-center justify-center h-full"
            >
              Vis flere
            </Button>
          )}
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-semibold mb-6">Lokation</h2>
        <GoogleMap address={`${clinic.adresse}, ${clinic.lokation}`} />
      </div>
    </div>
  );
}
