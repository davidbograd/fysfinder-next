import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    template: "Fysfinder - %s",
    default: "Dashboard",
  },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return children;
}
