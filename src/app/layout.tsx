import type { Metadata } from "next";
import "./globals.css";
import { GeistSans } from "geist/font/sans";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Script from "next/script";
import { CookieConsentBanner } from "@/components/layout/CookieConsent";

export const metadata: Metadata = {
  title: "FysFinder",
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
    title: "FysFinder",
  },
  openGraph: {
    title: "FysFinder - Find den bedste fysioterapeut",
    description:
      "Se anmeldelser, specialer, priser og meget mere fra danske fysioterapeuter",
    images: [
      {
        url: "/opengraph-fysfinder.jpg",
        width: 1200,
        height: 630,
        alt: "FysFinder - Find den bedste fysioterapeut",
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
    <html lang="da" className={GeistSans.className}>
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-6 sm:pt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        <Footer />
        <CookieConsentBanner />
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
      </body>
    </html>
  );
}
