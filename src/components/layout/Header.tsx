"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteLogo from "@/components/ui/Icons/SiteLogo";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { UserMenu } from "@/components/auth/UserMenu";
import { createClient } from "@/app/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Header() {
  const router = useRouter();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Check initial auth state and fetch profile
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);

      if (user) {
        // Fetch profile for display name
        const { data } = await supabase
          .from("user_profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        
        setUserDisplayName(data?.full_name || user.email?.split("@")[0] || "Bruger");
      } else {
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
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-row justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-6">
            <Link href={isLoggedIn ? "/dashboard" : "/"} className="inline-block">
              <SiteLogo />
            </Link>

            {/* Left side navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="text-base text-gray-600 hover:text-gray-900"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/ordbog"
                    className="text-base text-gray-600 hover:text-gray-900"
                  >
                    Ordbog
                  </Link>
                  <Link
                    href="/vaerktoejer"
                    className="text-base text-gray-600 hover:text-gray-900"
                  >
                    Værktøjer
                  </Link>
                  <Link
                    href="/blog"
                    className="text-base text-gray-600 hover:text-gray-900"
                  >
                    Blog
                  </Link>
                  <Link
                    href="/om-os"
                    className="text-base text-gray-600 hover:text-gray-900"
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
                  className="bg-logo-blue hover:bg-logo-blue/90 text-white font-normal"
                >
                  <Link href="/find/fysioterapeut/danmark">Find fysioterapeut</Link>
                </Button>
                <Button asChild variant="outline" className="font-normal">
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
                className="bg-logo-blue hover:bg-logo-blue/90 text-white font-normal"
              >
                <Link href="/find/fysioterapeut/danmark">Find fysioterapeut</Link>
              </Button>
            )}
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-600 hover:text-gray-900"
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
          <div className="absolute inset-0 bg-white" />

          {/* Menu content */}
          <div className="relative h-full bg-white">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center px-4 py-2 border-b">
                  <Link href={isLoggedIn ? "/dashboard" : "/"} className="inline-block" onClick={toggleMenu}>
                    <SiteLogo />
                  </Link>
                  <button
                    onClick={toggleMenu}
                    className="p-2 text-gray-600 hover:text-gray-900"
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
                        className="text-lg font-medium text-gray-900 py-2"
                        onClick={toggleMenu}
                      >
                        Dashboard
                      </Link>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-4 p-4">
                      <Link
                        href="/ordbog"
                        className="text-lg font-medium text-gray-900 py-2"
                        onClick={toggleMenu}
                      >
                        Ordbog
                      </Link>
                      <Link
                        href="/vaerktoejer"
                        className="text-lg font-medium text-gray-900 py-2"
                        onClick={toggleMenu}
                      >
                        Værktøjer
                      </Link>
                      <Link
                        href="/blog"
                        className="text-lg font-medium text-gray-900 py-2"
                        onClick={toggleMenu}
                      >
                        Blog
                      </Link>
                      <Link
                        href="/om-os"
                        className="text-lg font-medium text-gray-900 py-2"
                        onClick={toggleMenu}
                      >
                        Om os
                      </Link>
                    </div>
                  )}
                {/* Bottom buttons */}
                <div className="mt-auto p-4 space-y-3 border-t">
                  {isLoggedIn ? (
                    <>
                      {/* User info display */}
                      <div className="flex items-center space-x-3 py-2">
                        <User className="h-5 w-5 text-gray-600" />
                        <span className="text-base font-medium text-gray-900">
                          {userDisplayName}
                        </span>
                      </div>
                      {/* Direct logout button */}
                      <Button
                        variant="outline"
                        className="w-full font-normal"
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
                        className="w-full bg-logo-blue hover:bg-logo-blue/90 text-white font-normal"
                        onClick={toggleMenu}
                      >
                        <Link href="/find/fysioterapeut/danmark">
                          Find fysioterapeut
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full font-normal"
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
