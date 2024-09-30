import Link from "next/link";
import SiteLogo from "./Icons/SiteLogo";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="bg-white p-4 mb-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link href="/" className="inline-block">
          <SiteLogo />
        </Link>
        <nav className="flex items-center space-x-6">
          {/* <Link href="/om-os" className="text-gray-600 hover:text-gray-900">
            Om os
          </Link>
          <Button variant="default" asChild>
            <Link href="/tilfoej-klinik">Tilføj din klinik</Link>
          </Button> */}
        </nav>
      </div>
    </header>
  );
}
