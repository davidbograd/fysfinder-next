// Updated: 2026-03-17 - Adjusted footer column grouping to add larger separation between left navigation columns and right aligned meta label
import Link from "next/link";
import SiteLogo from "@/components/ui/Icons/SiteLogo";

export default function Footer() {
  return (
    <footer className="bg-[#0b5b43] mt-12 rounded-t-[32px]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-8 md:flex-row md:flex-wrap md:items-start md:gap-x-32 lg:gap-x-40 md:gap-y-0">
            <div className="w-fit shrink-0">
            <p className="text-[14px] text-white/60 mb-3">
              Værktøjer
            </p>
            <div className="space-y-2">
              <Link href="/vaerktoejer/kalorieberegner" className="block text-[18px] font-light leading-tight text-white hover:text-white/85">
                Kalorieberegner
              </Link>
              <Link href="/vaerktoejer/fedtprocent-beregner" className="block text-[18px] font-light leading-tight text-white hover:text-white/85">
                Fedtprocent beregner
              </Link>
              <Link href="/vaerktoejer/pace-beregner" className="block text-[18px] font-light leading-tight text-white hover:text-white/85">
                Pace beregner
              </Link>
              <Link href="/vaerktoejer" className="block text-[18px] font-light leading-tight text-white hover:text-white/85">
                Alle værktøjer
              </Link>
            </div>
            </div>
            <div className="w-fit shrink-0">
            <p className="text-[14px] text-white/60 mb-3">
              Lær mere
            </p>
            <div className="space-y-2">
              <Link href="/ordbog" className="block text-[18px] font-light leading-tight text-white hover:text-white/85">
                Ordbog
              </Link>
              <Link href="/vaerktoejer" className="block text-[18px] font-light leading-tight text-white hover:text-white/85">
                Værktøjer
              </Link>
              <Link href="/blog" className="block text-[18px] font-light leading-tight text-white hover:text-white/85">
                Blog
              </Link>
            </div>
            </div>
            <div className="w-fit shrink-0">
            <p className="text-[14px] text-white/60 mb-3">
              Fysfinder
            </p>
            <div className="space-y-2">
              <Link href="/om-os" className="block text-[18px] font-light leading-tight text-white hover:text-white/85">
                Om os
              </Link>
              <Link href="/samarbejdspartnere" className="block text-[18px] font-light leading-tight text-white hover:text-white/85">
                Samarbejdspartnere
              </Link>
              <Link href="/om-os#kontakt" className="block text-[18px] font-light leading-tight text-white hover:text-white/85">
                Kontakt
              </Link>
            </div>
            </div>
          </div>
          <div className="md:text-right md:pl-12 lg:pl-20">
            <p className="text-[18px] font-light leading-tight text-white">
              Made in Copenhagen
            </p>
          </div>
        </div>
        <div className="mt-10 pt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="[&_svg]:h-[80px] [&_svg]:w-auto [&_svg_path:last-child]:fill-white [&_svg_path:first-child]:fill-white/90">
            <SiteLogo />
          </div>
          <div className="flex items-center gap-4 text-xs text-[#99c3b5]">
            <p>© 2026 Fysfinder</p>
            <Link href="/privatlivspolitik" className="hover:text-[#d4e6df]">
              Privatlivspolitik
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
