import Link from "next/link";
import SiteLogo from "./Icons/SiteLogo";

export default function Footer() {
  return (
    <footer className="bg-white py-4 mt-8 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex gap-6">
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
        </div>

        <div className="flex items-center gap-4">
          <p className="text-gray-600 text-sm">Made in Copenhagen</p>
          <SiteLogo />
        </div>
      </div>
    </footer>
  );
}
