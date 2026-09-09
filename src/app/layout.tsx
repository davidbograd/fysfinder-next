// Root layout
// Updated: 2026-09-10 - Load used Manrope weights, load Analytics with Consent Mode, and pass specialties into the header.

import type { Metadata } from "next";
import "./globals.css";
import { Manrope } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CookieConsentBanner } from "@/components/layout/CookieConsent";
import { GoogleAnalytics } from "@/components/layout/GoogleAnalytics";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/toaster";
import { EmailVerificationBanner } from "@/components/layout/EmailVerificationBanner";
import { fetchCitiesWithCounts, fetchSpecialties } from "@/app/utils/cityUtils";
import AgentationDevtools from "@/components/dev/AgentationDevtools";

const manrope = Manrope({
  subsets: ["latin"],
  // 200 and 800 are unused; keep 300 (footer/partner labels) through 700 (headings).
  weight: ["300", "400", "500", "600", "700"],
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let totalClinics = 0;
  let specialtyCount = 0;
  let specialties: Awaited<ReturnType<typeof fetchSpecialties>> = [];

  try {
    const [cities, fetchedSpecialties] = await Promise.all([
      fetchCitiesWithCounts(),
      fetchSpecialties(),
    ]);

    totalClinics = cities.reduce((sum, city) => sum + city.clinic_count, 0);
    specialties = fetchedSpecialties || [];
    specialtyCount = specialties.length;
  } catch (error) {
    console.error("Layout metrics fetch error:", error);
  }

  return (
    <html lang="da" className={manrope.variable}>
      <body className="flex flex-col min-h-screen font-sans">
        <Header
          totalClinics={totalClinics}
          specialtyCount={specialtyCount}
          specialties={specialties}
        />
        <EmailVerificationBanner />
        <main className="flex-grow overflow-x-clip">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        <Footer />
        <CookieConsentBanner />
        <Toaster />
        <GoogleAnalytics />
        <AgentationDevtools />
        <SpeedInsights />
      </body>
    </html>
  );
}
