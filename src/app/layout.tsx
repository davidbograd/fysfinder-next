// Root layout
// Updated: 2026-03-17 - Added Manrope font setup, widened shared content container to 1440px, and removed global main top padding for flush hero alignment

import type { Metadata } from "next";
import "./globals.css";
import { Manrope } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Script from "next/script";
import { CookieConsentBanner } from "@/components/layout/CookieConsent";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/toaster";
import { EmailVerificationBanner } from "@/components/layout/EmailVerificationBanner";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Fysfinder",
  description: "Find den bedste fysioterapeut",
  metadataBase: new URL("https://www.fysfinder.dk"),
  icons: {
    icon: [
      { url: "/favicon/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon/favicon.ico",
    apple: [
      {
        url: "/favicon/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: "/favicon/site.webmanifest",
  appleWebApp: {
    title: "Fysfinder",
  },
  openGraph: {
    title: "Fysfinder - Find den bedste fysioterapeut",
    description:
      "Se anmeldelser, specialer, priser og meget mere fra danske fysioterapeuter",
    images: [
      {
        url: "/opengraph-fysfinder.jpg",
        width: 1200,
        height: 630,
        alt: "Fysfinder - Find den bedste fysioterapeut",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da" className={manrope.variable}>
      <body className="flex flex-col min-h-screen font-sans">
        <Header />
        <EmailVerificationBanner />
        <main className="flex-grow">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        <Footer />
        <CookieConsentBanner />
        <Toaster />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-BH38ZB6HYH"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-BH38ZB6HYH', {
              'consent_mode': 'advanced'
            });
          `}
        </Script>
        <SpeedInsights />
      </body>
    </html>
  );
}
