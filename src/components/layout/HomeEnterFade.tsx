// Updated: 2026-11-11 - Fade the whole front page in together, including the nav.
"use client";

import { usePathname } from "next/navigation";

interface HomeEnterFadeProps {
  children: React.ReactNode;
}

export const HomeEnterFade = ({ children }: HomeEnterFadeProps) => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  if (!isHomePage) {
    return children;
  }

  return (
    <div className="home-fade-in flex min-h-screen w-full flex-1 flex-col">
      {children}
    </div>
  );
};
