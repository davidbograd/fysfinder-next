// Shared hero datapoints used across homepage and mobile search overlay.
import { BookHeart, HouseHeart, UserRound } from "lucide-react";
import { FORMATTED_MONTHLY_VISITORS_DK } from "@/lib/siteMetrics";

interface HeroDataPointsProps {
  totalClinics: number;
  specialtyCount: number;
  className?: string;
}

export function HeroDataPoints({
  totalClinics,
  specialtyCount,
  className = "",
}: HeroDataPointsProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-16 pt-1 ${className}`}
    >
      <div className="shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-11 w-11 shrink-0 rounded-full bg-[#1f2b28]/10 flex items-center justify-center">
            <HouseHeart className="h-6 w-6 text-[#4b5754]" aria-hidden="true" />
          </div>
          <p className="text-[20px] font-medium text-[#1f2b28] leading-snug">
            {totalClinics.toLocaleString("da-DK")}
            <span className="ml-2 text-[18px] font-normal text-brand-label sm:ml-0 sm:block">
              klinikker
            </span>
          </p>
        </div>
      </div>
      <div className="shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-11 w-11 shrink-0 rounded-full bg-[#1f2b28]/10 flex items-center justify-center">
            <BookHeart className="h-6 w-6 text-[#4b5754]" aria-hidden="true" />
          </div>
          <p className="text-[20px] font-medium text-[#1f2b28] leading-snug">
            {specialtyCount}
            <span className="ml-2 text-[18px] font-normal text-brand-label sm:ml-0 sm:block">
              forskellige specialer
            </span>
          </p>
        </div>
      </div>
      <div className="shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-11 w-11 shrink-0 rounded-full bg-[#1f2b28]/10 flex items-center justify-center">
            <UserRound className="h-6 w-6 text-[#4b5754]" aria-hidden="true" />
          </div>
          <p className="text-[20px] font-medium text-[#1f2b28] leading-snug">
            Over {FORMATTED_MONTHLY_VISITORS_DK}
            <span className="ml-2 text-[18px] font-normal text-brand-label sm:ml-0 sm:block">
              bruger Fysfinder månedligt
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
