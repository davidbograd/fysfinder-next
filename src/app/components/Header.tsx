import Link from "next/link";
import SiteLogo from "./Icons/SiteLogo";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-row justify-between items-center h-14 sm:h-16">
        <div className="flex justify-start">
          <Link href="/" className="inline-block">
            <SiteLogo />
          </Link>
        </div>
        <nav className="flex justify-end items-center space-x-4 sm:space-x-6">
          <Link
            href="/find/fysioterapeut/danmark"
            className="text-sm sm:text-base text-gray-600 hover:text-gray-900"
          >
            Find fysioterapeut
          </Link>
          <Link
            href="/ordbog"
            className="text-sm sm:text-base text-gray-600 hover:text-gray-900"
          >
            Ordbog
          </Link>
        </nav>
      </div>
    </header>
  );
}
