"use client";

import { StarIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import { EmailButton } from "@/components/EmailButton";
import { PhoneButton } from "@/components/PhoneButton";
import { WebsiteButton } from "@/components/WebsiteButton";
import { BookingButton } from "@/components/BookingButton";
import { useClinicAnalytics } from "@/app/hooks/useClinicAnalytics";
import { VerifyClinicModal } from "./VerifyClinicModal";

interface ClinicSidebarProps {
  clinic: {
    klinikNavn: string;
    avgRating: number;
    ratingCount: number;
    website: string | null;
    tlf: string | null;
    email: string | null;
    id?: string;
    verified_klinik: boolean;
    premium_listing?: {
      booking_link: string | null;
      start_date: string;
      end_date: string;
    } | null;
  };
}

export function ClinicSidebar({ clinic }: ClinicSidebarProps) {
  const {
    trackWebsiteClick,
    trackPhoneClick,
    trackEmailClick,
    trackBookingClick,
  } = useClinicAnalytics({
    clinicName: clinic.klinikNavn,
    clinicId: clinic.id,
  });

  // Helper function to check if a string is empty or null
  const hasValue = (str: string | null): boolean => {
    return str !== null && str.trim() !== "";
  };

  const hasWebsite = hasValue(clinic.website);
  const hasPhone = hasValue(clinic.tlf);
  const hasEmail = hasValue(clinic.email);
  const hasAnyContactInfo = hasWebsite || hasPhone || hasEmail;

  // Check if clinic is premium and has booking link
  const isPremium =
    clinic.premium_listing &&
    new Date(clinic.premium_listing.start_date) <= new Date() &&
    new Date(clinic.premium_listing.end_date) > new Date();
  const hasBookingLink =
    isPremium &&
    clinic.premium_listing?.booking_link &&
    hasValue(clinic.premium_listing.booking_link);

  return (
    <div className="order-first lg:order-none lg:w-2/5">
      <div className="lg:sticky lg:top-20 sm:top-16">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div>
              <p className="text-2xl font-semibold mb-4">{clinic.klinikNavn}</p>
              <div className="flex items-center mt-1">
                <StarIcon className="h-5 w-5 text-amber-500 mr-2" />
                <span className="font-semibold mr-2">
                  {clinic.avgRating != null
                    ? clinic.avgRating.toFixed(1)
                    : "N/A"}
                </span>
                <span className="text-gray-500 text-sm">
                  ({clinic.ratingCount} anmeldelser)
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-4 mt-6">
            {hasBookingLink && (
              <BookingButton
                bookingLink={clinic.premium_listing!.booking_link!}
                onClick={trackBookingClick}
              />
            )}
            <div className="space-y-2">
              {hasAnyContactInfo ? (
                <>
                  {hasWebsite && (
                    <WebsiteButton
                      website={clinic.website!}
                      onClick={trackWebsiteClick}
                    />
                  )}
                  {hasPhone && (
                    <PhoneButton
                      phoneNumber={clinic.tlf!}
                      onClick={trackPhoneClick}
                    />
                  )}
                  {hasEmail && (
                    <EmailButton
                      email={clinic.email!}
                      onClick={trackEmailClick}
                    />
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-center py-2">
                  Vi har ingen kontakt oplysninger på denne klinik.
                </p>
              )}
            </div>
          </div>
        </div>

        {!clinic.verified_klinik && (
          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-sm text-gray-600">Ejer du denne klinik?</p>
            <VerifyClinicModal>
              <Button
                variant="outline"
                size="sm"
                className="whitespace-nowrap"
              >
                Verificer klinik
              </Button>
            </VerifyClinicModal>
          </div>
        )}
      </div>
    </div>
  );
}
