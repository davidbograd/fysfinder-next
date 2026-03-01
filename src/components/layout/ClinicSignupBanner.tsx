// Public top banner for clinic acquisition messaging.
// Updated: 2026-03-01 - Only shows to logged-out users and hides on /tilmeld.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/app/utils/supabase/client";

function shouldHideBanner(pathname: string): boolean {
  return pathname === "/tilmeld" || pathname.startsWith("/tilmeld/");
}

export function ClinicSignupBanner() {
  const pathname = usePathname() || "";
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsLoggedIn(Boolean(user));
    };

    checkUser();
  }, []);

  if (isLoggedIn === null || isLoggedIn || shouldHideBanner(pathname)) {
    return null;
  }

  return (
    <div className="border-b border-logo-blue/30 bg-logo-blue">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-1.5 sm:px-6 lg:px-8">
        <p className="text-xs font-normal text-white sm:text-sm">
          Er du klinikejer? Bliv fundet af patienter, der aktivt søger
          fysioterapi.
        </p>
        <Link
          href="/tilmeld"
          className="shrink-0 rounded-md border border-white bg-transparent px-3 py-1.5 text-xs font-normal text-white transition-colors hover:bg-white/10 sm:text-sm"
        >
          Kom gratis igang
        </Link>
      </div>
    </div>
  );
}
