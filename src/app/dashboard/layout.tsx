// Updated: 2026-04-20 - Added dashboard viewport config to prevent touch-device focus zoom on form fields.

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    template: "Fysfinder - %s",
    default: "Dashboard",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return children;
}
