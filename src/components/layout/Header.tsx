// Updated: 2026-03-25 - Uses homepage-equivalent clinic/specialty counts passed from layout for mobile overlay datapoints
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import SiteLogo from "@/components/ui/Icons/SiteLogo";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { UserMenu } from "@/components/auth/UserMenu";
import { createClient } from "@/app/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { HeaderSearchBar } from "@/components/layout/HeaderSearchBar";
import { SearchInterface } from "@/components/search/SearchInterface";
import { HeroDataPoints } from "@/components/features/search/HeroDataPoints";

interface HeaderProps {
  totalClinics: number;
  specialtyCount: number;
}

export default function Header({ totalClinics, specialtyCount }: HeaderProps) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const isHomePage = pathname === "/";
  const isSearchFirstDesktopVariant =
    pathname.startsWith("/ordbog") ||
    pathname.startsWith("/vaerktoejer") ||
    pathname.startsWith("/mr-scanning") ||
    pathname.startsWith("/dexa-scanning") ||
    pathname.startsWith("/blog") ||
    pathname.startsWith("/om-os");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsMobileSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow =
      isMenuOpen || isMobileSearchOpen ? "hidden" : "unset";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen, isMobileSearchOpen]);

  useEffect(() => {
    if (!isMobileSearchOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileSearchOpen]);

  useEffect(() => {
    const supabase = createClient();

    // Check initial auth state and fetch profile
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);

        if (user) {
          // Fetch profile for display name
          const { data, error } = await supabase
            .from("user_profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();
          
          if (error) {
            // Profile might not exist yet or temporary issue - use email as fallback
            setUserDisplayName(user.email?.split("@")[0] || "Bruger");
          } else {
            setUserDisplayName(data?.full_name || user.email?.split("@")[0] || "Bruger");
          }
        } else {
          setUserDisplayName(null);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        // Fail gracefully
        setIsLoggedIn(false);
        setUserDisplayName(null);
      }
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session?.user);
      
      // Force a re-check after state change to ensure sync
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setTimeout(() => {
          checkAuth();
        }, 100);
      }
    });

    // Also check auth when page becomes visible (handles tab switching)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuth();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    
    // Wait a moment for auth state to propagate
    await new Promise(resolve => setTimeout(resolve, 100));
    
    toast({
      title: "Logget ud",
      description: "Du er nu logget ud.",
    });
    
    setIsMenuOpen(false);
    setIsMobileSearchOpen(false);
    router.push("/");
    router.refresh();
  };

  const toggleMenu = () => {
    setIsMenuOpen((previous) => !previous);
  };

  const openMobileSearchOverlay = () => {
    setIsMenuOpen(false);
    setIsMobileSearchOpen(true);
  };

  const closeMobileSearchOverlay = () => {
    setIsMobileSearchOpen(false);
  };

  return (
    <>
      <header
        className={`z-50 transition-all duration-300 ${
          isHomePage
            ? `fixed inset-x-0 ${isScrolled ? "top-0 bg-[#f8f7f2]/95 backdrop-blur-sm shadow-[0px_8px_15px_rgba(11,59,60,0.1)]" : "top-0 bg-transparent"}`
            : `sticky top-0 bg-[#f8f7f2]/95 backdrop-blur-sm ${isScrolled ? "shadow-[0px_8px_15px_rgba(11,59,60,0.1)]" : ""}`
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 lg:px-8 flex flex-row justify-between items-center h-14 sm:h-16 transition-all duration-300">
          <div className="flex items-center gap-4">
            <Link href={isLoggedIn ? "/dashboard" : "/"} className="inline-block">
              <SiteLogo />
            </Link>

            {/* Left side navigation */}
            {isSearchFirstDesktopVariant ? (
              <HeaderSearchBar className="hidden min-[1241px]:block" />
            ) : (
              <nav className="hidden md:flex items-center space-x-6">
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className="text-sm text-[#3c4946] hover:text-[#1f2b28] transition-colors"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/ordbog"
                      className="text-sm text-[#3c4946] hover:text-[#1f2b28] transition-colors"
                    >
                      Ordbog
                    </Link>
                    <Link
                      href="/vaerktoejer"
                      className="text-sm text-[#3c4946] hover:text-[#1f2b28] transition-colors"
                    >
                      Værktøjer
                    </Link>
                    <Link
                      href="/blog"
                      className="text-sm text-[#3c4946] hover:text-[#1f2b28] transition-colors"
                    >
                      Blog
                    </Link>
                    <Link
                      href="/om-os"
                      className="text-sm text-[#3c4946] hover:text-[#1f2b28] transition-colors"
                    >
                      Om os
                    </Link>
                  </>
                )}
              </nav>
            )}
          </div>

          {/* Desktop Navigation - Right side CTAs */}
          <nav
            className={`items-center space-x-3 ${
              isSearchFirstDesktopVariant
                ? "hidden min-[1241px]:flex"
                : "hidden md:flex"
            }`}
          >
            {isSearchFirstDesktopVariant ? (
              <>
                {!isLoggedIn && (
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full border-[#cfd4d2] bg-[#f8f7f2] font-medium text-[#23302d] hover:bg-[#efeee8]"
                  >
                    <Link href="/tilmeld">For klinikker</Link>
                  </Button>
                )}
                <UserMenu />
              </>
            ) : isLoggedIn ? (
              <UserMenu />
            ) : (
              <>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-[#cfd4d2] bg-[#f8f7f2] font-medium text-[#23302d] hover:bg-[#efeee8]"
                >
                  <Link href="/tilmeld">For klinikker</Link>
                </Button>
                <UserMenu />
              </>
            )}
          </nav>

          {/* Mobile Navigation */}
          <nav
            className={`flex items-center space-x-3 ${
              isSearchFirstDesktopVariant
                ? "min-[1241px]:hidden"
                : "md:hidden"
            }`}
          >
            {!isLoggedIn && isSearchFirstDesktopVariant && (
              <Button
                size="sm"
                className="rounded-full bg-[#0b5b43] hover:bg-[#084c39] text-white font-medium"
                onClick={openMobileSearchOverlay}
              >
                Find fysioterapeut
              </Button>
            )}
            <button
              onClick={toggleMenu}
              className="p-2 text-[#3c4946] hover:text-[#1f2b28]"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay - Moved outside header */}
      {isMenuOpen && (
        <div
          className={`fixed inset-0 z-[200] ${
            isSearchFirstDesktopVariant ? "min-[1241px]:hidden" : "md:hidden"
          }`}
        >
          {/* Semi-transparent background overlay */}
          <div className="absolute inset-0 bg-[#f8f7f2]" />

          {/* Menu content */}
          <div className="relative h-full bg-[#f8f7f2]">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center px-4 py-2 border-b border-[#e3e1d8]">
                  <Link href={isLoggedIn ? "/dashboard" : "/"} className="inline-block" onClick={toggleMenu}>
                    <SiteLogo />
                  </Link>
                  <button
                    onClick={toggleMenu}
                    className="p-2 text-[#3c4946] hover:text-[#1f2b28]"
                    aria-label="Close menu"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="flex flex-col flex-1">
                  {isLoggedIn ? (
                    <div className="flex flex-col space-y-4 p-4">
                      <Link
                        href="/dashboard"
                        className="text-lg font-medium text-[#1f2b28] py-2"
                        onClick={toggleMenu}
                      >
                        Dashboard
                      </Link>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-4 p-4">
                      <Link
                        href="/ordbog"
                        className="text-lg font-medium text-[#1f2b28] py-2"
                        onClick={toggleMenu}
                      >
                        Ordbog
                      </Link>
                      <Link
                        href="/vaerktoejer"
                        className="text-lg font-medium text-[#1f2b28] py-2"
                        onClick={toggleMenu}
                      >
                        Værktøjer
                      </Link>
                      <Link
                        href="/blog"
                        className="text-lg font-medium text-[#1f2b28] py-2"
                        onClick={toggleMenu}
                      >
                        Blog
                      </Link>
                      <Link
                        href="/om-os"
                        className="text-lg font-medium text-[#1f2b28] py-2"
                        onClick={toggleMenu}
                      >
                        Om os
                      </Link>
                    </div>
                  )}
                {/* Bottom buttons */}
                <div className="mt-auto p-4 space-y-3 border-t border-[#e3e1d8]">
                  <Button
                    className="w-full rounded-full bg-[#0b5b43] hover:bg-[#084c39] text-white font-medium"
                    onClick={openMobileSearchOverlay}
                  >
                    Find fysioterapeut
                  </Button>
                  {isLoggedIn ? (
                    <>
                      {/* User info display */}
                      <div className="flex items-center space-x-3 py-2">
                        <User className="h-5 w-5 text-[#3c4946]" />
                        <span className="text-base font-medium text-[#1f2b28]">
                          {userDisplayName}
                        </span>
                      </div>
                      {/* Direct logout button */}
                      <Button
                        variant="outline"
                        className="w-full rounded-full border-[#cfd4d2] bg-[#f8f7f2] font-medium text-[#23302d] hover:bg-[#efeee8]"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Log ud
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full rounded-full border-[#cfd4d2] bg-[#f8f7f2] font-medium text-[#23302d] hover:bg-[#efeee8]"
                        onClick={toggleMenu}
                      >
                        <Link href="/tilmeld">For klinikker</Link>
                      </Button>
                      <div onClick={toggleMenu}>
                        <UserMenu fullWidth />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {isMobileSearchOpen && (
        <div
          className={`fixed inset-0 z-[250] ${
            isSearchFirstDesktopVariant ? "min-[1241px]:hidden" : "md:hidden"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Søg efter fysioterapeut"
        >
          <div className="absolute inset-0 bg-[#f8f7f2]" />
          <div className="relative h-full bg-[#f8f7f2]">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-[#e3e1d8] px-4 py-2">
                <Link
                  href={isLoggedIn ? "/dashboard" : "/"}
                  className="inline-block"
                  onClick={closeMobileSearchOverlay}
                >
                  <SiteLogo />
                </Link>
                <button
                  onClick={closeMobileSearchOverlay}
                  className="p-2 text-[#3c4946] hover:text-[#1f2b28]"
                  aria-label="Luk søgning"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="mx-auto flex min-h-full w-full max-w-xl flex-col">
                  <div>
                    <h2 className="mb-4 text-xl font-semibold text-[#1f2b28]">
                      Find fysioterapeut
                    </h2>
                    <SearchInterface
                      specialties={[]}
                      defaultSearchValue=""
                      citySlug="danmark"
                      showFilters={false}
                      initialFilters={{}}
                    />
                  </div>
                  <HeroDataPoints
                    totalClinics={totalClinics}
                    specialtyCount={specialtyCount}
                    className="mt-auto pt-6 sm:gap-3"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
