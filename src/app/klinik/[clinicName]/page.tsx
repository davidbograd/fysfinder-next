import React from "react";
import { MeetTheTeam } from "@/components/features/team/MeetTheTeam";
import { createClient } from "@/app/utils/supabase/server";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Metadata } from "next";
import { ClinicSidebar } from "@/components/features/clinic/ClinicSidebar";
import { ClinicSidebarMobile } from "@/components/features/clinic/ClinicSidebarMobile";
import { redirect } from "next/navigation";
import { Clinic, TeamMember } from "@/app/types";
import { ClinicHeader } from "@/components/features/clinic/ClinicHeader";
import { ClinicPricing } from "@/components/features/clinic/ClinicPricing";
import { ClinicSpecialties } from "@/components/features/clinic/ClinicSpecialties";
import { ClinicInsurance } from "@/components/features/clinic/ClinicInsurance";
import { ClinicServices } from "@/components/features/clinic/ClinicServices";
import { ClinicHours } from "@/components/features/clinic/ClinicHours";
import { ClinicLocation } from "@/components/features/clinic/ClinicLocation";
import { ClinicAbout } from "@/components/features/clinic/ClinicAbout";

async function fetchClinicBySlug(clinicSlug: string): Promise<Clinic | null> {
  const supabase = createClient();

  try {
    const requestUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clinics?klinikNavnSlug=eq.${clinicSlug}&select=*,clinic_specialties(specialty:specialties(specialty_id,specialty_name,specialty_name_slug)),clinic_team_members(id,name,role,image_url,display_order),clinic_insurances(insurance:insurance_companies(insurance_id,insurance_name,insurance_name_slug)),clinic_services(service:extra_services(service_id,service_name,service_name_slug))`;

    const response = await fetch(requestUrl, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 86400, // Cache for 24 hours
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    const clinic = data[0];

    // Initialize empty arrays for safety
    clinic.specialties = [];
    clinic.team_members = [];
    clinic.insurances = [];
    clinic.extraServices = [];

    // Safely handle specialties
    if (clinic.clinic_specialties && Array.isArray(clinic.clinic_specialties)) {
      clinic.specialties = clinic.clinic_specialties
        .filter((item: any) => item.specialty)
        .map((item: any) => item.specialty);
      delete clinic.clinic_specialties;
    }

    // Safely handle team members
    if (
      clinic.clinic_team_members &&
      Array.isArray(clinic.clinic_team_members)
    ) {
      clinic.team_members = clinic.clinic_team_members
        .filter((member: any) => member)
        .sort(
          (a: TeamMember, b: TeamMember) => a.display_order - b.display_order
        );
      delete clinic.clinic_team_members;
    }

    // Handle insurances
    if (clinic.clinic_insurances && Array.isArray(clinic.clinic_insurances)) {
      clinic.insurances = clinic.clinic_insurances
        .filter((item: any) => item.insurance)
        .map((item: any) => item.insurance);
      delete clinic.clinic_insurances;
    }

    // Handle extra services
    if (clinic.clinic_services && Array.isArray(clinic.clinic_services)) {
      clinic.extraServices = clinic.clinic_services
        .filter((item: any) => item.service)
        .map((item: any) => item.service);
      delete clinic.clinic_services;
    }

    return clinic;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { clinicName: string };
}): Promise<Metadata> {
  const clinic = await fetchClinicBySlug(params.clinicName);

  if (!clinic) {
    redirect("/");
  }

  return {
    title: `${clinic.klinikNavn} | Se detaljer`,
    description: `Se åbningstider, priser og behandlingstyper for ${clinic.klinikNavn}, ${clinic.lokation}.`,
  };
}

interface ClinicStructuredDataProps {
  clinic: Clinic;
}

function ClinicStructuredData({ clinic }: ClinicStructuredDataProps) {
  // Calculate price ranges if available
  const priceRange =
    clinic.førsteKons && clinic.opfølgning
      ? {
          "@type": "PriceSpecification",
          price: clinic.førsteKons,
          priceCurrency: "DKK",
          description: "Første konsultation",
        }
      : undefined;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "MedicalBusiness", "PhysicalTherapist"],
    name: clinic.klinikNavn,
    url: `https://www.fysfinder.dk/klinik/${clinic.klinikNavnSlug}`,
    telephone: clinic.tlf,
    email: clinic.email,
    description: generateClinicDescription(clinic),

    // Price Information
    ...(priceRange && {
      priceRange: `${clinic.opfølgning}-${clinic.førsteKons} DKK`,
      offers: {
        "@type": "Offer",
        priceSpecification: priceRange,
      },
    }),

    // Medical Organization Details
    medicalSpecialty: [
      "Physical Therapy",
      ...clinic.specialties.map((s) => s.specialty_name),
    ],
    healthcareReportingData: {
      "@type": "HealthcareReportingData",
      hasHealthPlanNetwork: clinic.ydernummer,
    },

    // Enhanced Reviews and Ratings with more detail
    ...(clinic.avgRating && clinic.ratingCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: clinic.avgRating,
            reviewCount: clinic.ratingCount,
            bestRating: 5,
            worstRating: 1,
          },
          review: [
            {
              "@type": "Review",
              reviewRating: {
                "@type": "Rating",
                ratingValue: clinic.avgRating,
                bestRating: 5,
                worstRating: 1,
              },
              author: {
                "@type": "Organization",
                name: "Fysfinder",
              },
              publisher: {
                "@type": "Organization",
                name: "Fysfinder",
                logo: {
                  "@type": "ImageObject",
                  url: "https://www.fysfinder.dk/logo.png", // Make sure this exists
                },
              },
              reviewBody: `Gennemsnitlig bedømmelse baseret på ${clinic.ratingCount} anmeldelser`,
              datePublished: new Date().toISOString().split("T")[0],
            },
          ],
        }
      : {}),

    // Medical Services with Prices
    availableService: clinic.specialties.map((specialty) => ({
      "@type": "MedicalTherapy",
      name: specialty.specialty_name,
      description: `${specialty.specialty_name} behandling`,
      ...(clinic.ydernummer && {
        offers: {
          "@type": "Offer",
          priceSpecification: {
            "@type": "PriceSpecification",
            price: clinic.opfølgning || "Ring for pris",
            priceCurrency: "DKK",
          },
        },
      }),
    })),

    // Contact Points
    contactPoint: {
      "@type": "ContactPoint",
      telephone: clinic.tlf,
      email: clinic.email,
      contactType: "Customer Service",
      availableLanguage: ["da", "en"],
    },

    // Location Information
    address: {
      "@type": "PostalAddress",
      streetAddress: clinic.adresse,
      postalCode: clinic.postnummer,
      addressLocality: clinic.lokation,
      addressCountry: "DK",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: clinic.lokation?.split(",")[0],
      longitude: clinic.lokation?.split(",")[1],
    },

    // Opening Hours
    openingHoursSpecification: [
      clinic.mandag && {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Monday",
        opens: clinic.mandag.split("-")[0]?.trim(),
        closes: clinic.mandag.split("-")[1]?.trim(),
      },
      clinic.tirsdag && {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Tuesday",
        opens: clinic.tirsdag.split("-")[0]?.trim(),
        closes: clinic.tirsdag.split("-")[1]?.trim(),
      },
      clinic.onsdag && {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Wednesday",
        opens: clinic.onsdag.split("-")[0]?.trim(),
        closes: clinic.onsdag.split("-")[1]?.trim(),
      },
      clinic.torsdag && {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Thursday",
        opens: clinic.torsdag.split("-")[0]?.trim(),
        closes: clinic.torsdag.split("-")[1]?.trim(),
      },
      clinic.fredag && {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Friday",
        opens: clinic.fredag.split("-")[0]?.trim(),
        closes: clinic.fredag.split("-")[1]?.trim(),
      },
      clinic.lørdag && {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: clinic.lørdag.split("-")[0]?.trim(),
        closes: clinic.lørdag.split("-")[1]?.trim(),
      },
      clinic.søndag && {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: clinic.søndag.split("-")[0]?.trim(),
        closes: clinic.søndag.split("-")[1]?.trim(),
      },
    ].filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

function generateClinicDescription(clinic: Clinic): string {
  const parts = [];

  if (clinic.specialties?.length > 0) {
    parts.push(
      `Specialiseret i ${clinic.specialties
        .map((s) => s.specialty_name.toLowerCase())
        .join(", ")}`
    );
  }

  if (clinic.ydernummer) {
    parts.push(
      "Tilbyder behandling med tilskud fra den offentlige sygesikring"
    );
  }

  if (clinic.førsteKons) {
    parts.push(`Første konsultation fra ${clinic.førsteKons} kr`);
  }

  return parts.length > 0
    ? `${clinic.klinikNavn} i ${clinic.lokation}. ${parts.join(". ")}.`
    : `Fysioterapi klinik i ${clinic.lokation}`;
}

function BreadcrumbStructuredData({
  items,
}: {
  items: Array<{ text: string; link?: string }>;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@id": item.link ? `https://www.fysfinder.dk${item.link}` : "",
        name: item.text,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default async function ClinicPage({
  params,
}: {
  params: { clinicName: string };
}) {
  try {
    const clinic = await fetchClinicBySlug(params.clinicName);

    if (!clinic) {
      redirect("/");
    }

    const breadcrumbItems = [
      { text: "Fysfinder", link: "/" },
      {
        text: clinic.lokation,
        link: `/find/fysioterapeut/${clinic.lokationSlug}`,
      },
      { text: clinic.klinikNavn },
    ];

    return (
      <div className="container mx-auto px-4 py-8">
        <ClinicStructuredData clinic={clinic} />
        <BreadcrumbStructuredData items={breadcrumbItems} />

        <Breadcrumbs items={breadcrumbItems} />

        <ClinicHeader clinic={clinic} />

        {/* Mobile Sidebar - Top */}
        <ClinicSidebarMobile
          clinic={{
            ...clinic,
            verified_klinik: clinic.verified_klinik ?? false,
          }}
        />

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Main content (3/5 width on large screens) */}
          <div className="lg:w-3/5">
            <ClinicPricing clinic={clinic} />
            {clinic.team_members && clinic.team_members.length > 0 && (
              <MeetTheTeam
                teamMembers={clinic.team_members}
                clinicName={clinic.klinikNavn}
              />
            )}
            <ClinicSpecialties clinic={clinic} />
            <ClinicInsurance clinic={clinic} />
            <ClinicServices clinic={clinic} />
            <ClinicHours clinic={clinic} />
            <ClinicLocation clinic={clinic} />
            <ClinicAbout clinic={clinic} />
          </div>

          {/* Desktop Sidebar */}
          <ClinicSidebar
            clinic={{
              ...clinic,
              verified_klinik: clinic.verified_klinik ?? false,
            }}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return (
      <div className="text-red-500 font-bold text-center py-10">
        Error loading clinic: {(error as Error).message}
      </div>
    );
  }
}
