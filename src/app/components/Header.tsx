import Link from "next/link";
import SiteLogo from "./Icons/SiteLogo";

export default function Header() {
  return (
    <header className="bg-white p-4 mb-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
        <Link href="/" className="inline-block">
          <SiteLogo />
        </Link>
      </div>
    </header>
  );
}
