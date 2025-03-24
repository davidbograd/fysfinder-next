"use client";

import Link from "next/link";
import SiteLogo from "@/components/ui/Icons/SiteLogo";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <Link href="/" className="inline-block">
              <SiteLogo />
            </Link>

            {/* Left side navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/ordbog"
                className="text-base text-gray-600 hover:text-gray-900"
              >
                Ordbog
              </Link>
              <Link
                href="/om-os"
                className="text-base text-gray-600 hover:text-gray-900"
              >
                Om os
              </Link>
              <Link
                href="/om-os#kontakt"
                className="text-base text-gray-600 hover:text-gray-900"
              >
                Kontakt
              </Link>
            </nav>
          </div>

          {/* Desktop Navigation - Right side CTAs */}
          <nav className="hidden sm:flex items-center space-x-4">
            <Button
              asChild
              className="bg-logo-blue hover:bg-logo-blue/90 text-white font-normal"
            >
              <Link href="/find/fysioterapeut/danmark">Find fysioterapeut</Link>
            </Button>
            <Button asChild variant="outline" className="font-normal">
              <Link href="/tilmeld">For klinikker</Link>
            </Button>
          </nav>

          {/* Mobile Navigation */}
          <nav className="flex sm:hidden items-center space-x-3">
            <Button
              asChild
              size="sm"
              className="bg-logo-blue hover:bg-logo-blue/90 text-white font-normal"
            >
              <Link href="/find/fysioterapeut/danmark">Find fysioterapeut</Link>
            </Button>
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
                <Link href="/" className="inline-block" onClick={toggleMenu}>
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
                <div className="flex flex-col space-y-4 p-4">
                  <Link
                    href="/ordbog"
                    className="text-lg font-medium text-gray-900 py-2"
                    onClick={toggleMenu}
                  >
                    Ordbog
                  </Link>
                  <Link
                    href="/om-os"
                    className="text-lg font-medium text-gray-900 py-2"
                    onClick={toggleMenu}
                  >
                    Om os
                  </Link>
                  <Link
                    href="/kontakt"
                    className="text-lg font-medium text-gray-900 py-2"
                    onClick={toggleMenu}
                  >
                    Kontakt
                  </Link>
                </div>
                {/* Bottom buttons */}
                <div className="mt-auto p-4 space-y-3 border-t">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
