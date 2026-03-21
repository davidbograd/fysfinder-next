// Updated: 2026-03-17 - Added homepage-specific transparent/fixed header behavior with scroll-activated background while preserving existing auth/menu behavior
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

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const isHomePage = pathname === "/";

  useEffect(() => {
    if (!isHomePage) {
      setIsScrolled(false);
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isHomePage]);

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
    
    toggleMenu();
    router.push("/");
    router.refresh();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Prevent scrolling when menu is open
    if (!isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  };

  return (
    <>
      <header
        className={`z-50 transition-all duration-300 ${
          isHomePage
            ? `fixed inset-x-0 ${isScrolled ? "top-0 bg-[#f8f7f2]/95 backdrop-blur-sm shadow-[0px_8px_15px_rgba(11,59,60,0.1)]" : "top-0 bg-transparent"}`
            : "sticky top-0 bg-[#f8f7f2]/95 backdrop-blur-sm shadow-[0px_8px_15px_rgba(11,59,60,0.1)]"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 lg:px-8 flex flex-row justify-between items-center h-14 sm:h-16 transition-all duration-300">
          <div className="flex items-center space-x-6">
            <Link href={isLoggedIn ? "/dashboard" : "/"} className="inline-block">
              <SiteLogo />
            </Link>

            {/* Left side navigation */}
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
          </div>

          {/* Desktop Navigation - Right side CTAs */}
          <nav className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <UserMenu />
            ) : (
              <>
                <Button
                  asChild
                  className="rounded-full bg-[#0b5b43] hover:bg-[#084c39] text-white font-medium"
                >
                  <Link href="/find/fysioterapeut/danmark">Find fysioterapeut</Link>
                </Button>
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
          <nav className="flex md:hidden items-center space-x-3">
            {!isLoggedIn && (
              <Button
                asChild
                size="sm"
                className="rounded-full bg-[#0b5b43] hover:bg-[#084c39] text-white font-medium"
              >
                <Link href="/find/fysioterapeut/danmark">Find fysioterapeut</Link>
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
        <div className="fixed inset-0 z-[200] md:hidden">
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
                        className="w-full rounded-full bg-[#0b5b43] hover:bg-[#084c39] text-white font-medium"
                        onClick={toggleMenu}
                      >
                        <Link href="/find/fysioterapeut/danmark">
                          Find fysioterapeut
                        </Link>
                      </Button>
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
    </>
  );
}
