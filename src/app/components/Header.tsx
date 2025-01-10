import Link from "next/link";
import SiteLogo from "./Icons/SiteLogo";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="bg-white p-2 sm:p-4 mb-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex justify-center sm:justify-start">
          <Link href="/" className="inline-block">
            <SiteLogo />
          </Link>
        </div>
        <nav className="flex justify-center sm:justify-start items-center space-x-4 sm:space-x-6">
          <Link
            href="/"
            className="text-sm sm:text-base text-gray-600 hover:text-gray-900"
          >
            Lokationer
          </Link>
          <Link
            href="/specialer"
            className="text-sm sm:text-base text-gray-600 hover:text-gray-900"
          >
            Specialer
          </Link>
          <Link
            href="/fysioterapeut-artikler"
            className="text-sm sm:text-base text-gray-600 hover:text-gray-900"
          >
            Artikler
          </Link>
        </nav>
      </div>
    </header>
  );
}
