import type { Metadata } from "next";
import "./globals.css";
import { GeistSans } from "geist/font/sans";
import Header from "./components/Header";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "FysFinder",
  description: "Find den bedste fysioterapeut",
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
    title: "FysFinder",
    description: "Find den bedste fysioterapeut",
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
    <html lang="en" className={GeistSans.className}>
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        <Footer />
        {/* Google tag (gtag.js) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-BH38ZB6HYH"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-BH38ZB6HYH');
            `,
          }}
        />
      </body>
    </html>
  );
}
