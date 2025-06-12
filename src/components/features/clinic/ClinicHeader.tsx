import { StarIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import { Clinic } from "@/app/types";
import VerifiedCheck from "@/assets/icons/verified-check.svg";
import Image from "next/image";
import { FaWheelchair } from "react-icons/fa";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ClinicHeaderProps {
  clinic: Clinic;
}

export function ClinicHeader({ clinic }: ClinicHeaderProps) {
  return (
    <div className="border-b border-gray-200 pb-6 mb-8">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 leading-normal">
        {clinic.klinikNavn}
        {clinic.verified_klinik && (
          <TooltipProvider delayDuration={50}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Image
                  src={VerifiedCheck}
                  alt="Verified clinic"
                  width={32}
                  height={32}
                  className="w-5 md:w-6 lg:w-8 h-5 md:h-6 lg:h-8 inline-block align-middle ml-2 -mt-1"
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="font-normal">
                <p>Denne klinik er verificeret af Fysfinder.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </h1>

      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
        {/* Review Section */}
        <div className="flex items-center">
          <StarIcon className="h-6 w-6 text-amber-500 mr-2" />
          <span className="font-semibold mr-2">
            {clinic.avgRating != null ? clinic.avgRating.toFixed(1) : "N/A"}
          </span>
          <span className="text-gray-500">
            ({clinic.ratingCount} anmeldelser)
          </span>
        </div>

        {/* Address Section */}
        <p className="text-gray-500">
          {clinic.adresse}, {clinic.postnummer} {clinic.lokation}
        </p>

        {/* Icons Section */}
        {(clinic.handicapadgang || clinic.god_adgang_verificeret) && (
          <div className="flex items-center gap-2">
            {clinic.handicapadgang && (
              <TooltipProvider delayDuration={50}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <FaWheelchair className="w-4 h-4 text-logo-blue" />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="font-normal">
                    <p>Kørestolsvenlig indgang</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {clinic.god_adgang_verificeret && (
              <TooltipProvider delayDuration={50}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <img
                      src="/images/klinik/god-adgang-badge.png"
                      alt="God Adgang badge"
                      className="w-4 h-4 cursor-pointer"
                    />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="font-normal">
                    <p>Klinik er registret hos God Adgang</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
