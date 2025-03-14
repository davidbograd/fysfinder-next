import Link from "next/link";
import SiteLogo from "@/components/ui/Icons/SiteLogo";

export default function Footer() {
  return (
    <footer className="bg-white py-4 mt-8 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex flex-wrap gap-4 justify-center w-full sm:w-auto mb-4 sm:mb-0">
            <Link
              href="/om-os"
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              Om os
            </Link>
            <Link
              href="/samarbejdspartnere"
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              Samarbejdspartnere
            </Link>
            <Link
              href="/privatlivspolitik"
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              Privatlivspolitik
            </Link>
            <Link
              href="/om-os#kontakt"
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              Kontakt
            </Link>
          </div>

          <div className="flex flex-col items-center sm:flex-row-reverse sm:items-center gap-2 sm:gap-4">
            <SiteLogo />
            <p className="text-gray-600 text-sm">Made in Copenhagen</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
