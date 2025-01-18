"use client";

import { StarIcon } from "@heroicons/react/24/solid";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { EmailButton } from "@/components/EmailButton";
import { PhoneButton } from "@/components/PhoneButton";

interface ClinicSidebarProps {
  clinic: {
    klinikNavn: string;
    avgRating: number;
    ratingCount: number;
    website: string | null;
    tlf: string | null;
    email: string | null;
    northstar: boolean;
  };
}

export function ClinicSidebar({ clinic }: ClinicSidebarProps) {
  // Helper function to check if a string is empty or null
  const hasValue = (str: string | null): boolean => {
    return str !== null && str.trim() !== "";
  };

  const hasWebsite = hasValue(clinic.website);
  const hasPhone = hasValue(clinic.tlf);
  const hasEmail = hasValue(clinic.email);
  const hasAnyContactInfo = hasWebsite || hasPhone || hasEmail;

  return (
    <div className="lg:w-2/5">
      <div
        id="contact-info"
        className="sticky top-4 bg-white p-6 rounded-lg shadow-md"
      >
        <div className="flex items-center mb-4">
          {clinic.northstar && (
            <Image
              src="/fysiopuls-logo.jpg"
              alt="Clinic logo"
              width={64}
              height={64}
              className="rounded-lg flex-shrink-0 mr-4"
            />
          )}
          <div>
            <p className="text-2xl font-semibold mb-4">{clinic.klinikNavn}</p>
            <div className="flex items-center mt-1">
              <StarIcon className="h-5 w-5 text-amber-500 mr-2" />
              <span className="font-semibold mr-2">
                {clinic.avgRating != null ? clinic.avgRating.toFixed(1) : "N/A"}
              </span>
              <span className="text-gray-500 text-sm">
                ({clinic.ratingCount} anmeldelser)
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-4 mt-6">
          {clinic.northstar && (
            <Button className="w-full mb-4" variant="default" asChild>
              <a
                href="https://application.complimentawork.dk/CamClientPortal/CamClientPortal.html?clinic=00000A00CA04000007D404000000016B027EE85F66BAA6BB"
                target="_blank"
                rel="noopener"
              >
                Book tid
              </a>
            </Button>
          )}
          <div className="space-y-2">
            {hasAnyContactInfo ? (
              <>
                {hasWebsite && (
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-start"
                    asChild
                  >
                    <a
                      href={clinic.website!}
                      target="_blank"
                      rel="noopener nofollow"
                    >
                      <Globe className="mr-2 h-4 w-4 text-gray-400" />
                      <span>{clinic.website}</span>
                    </a>
                  </Button>
                )}
                {hasPhone && <PhoneButton phoneNumber={clinic.tlf!} />}
                {hasEmail && <EmailButton email={clinic.email!} />}
              </>
            ) : (
              <p className="text-gray-500 text-center py-2">
                Vi har ingen kontakt oplysninger på denne klinik.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
