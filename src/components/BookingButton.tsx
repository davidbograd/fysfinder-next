"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export interface BookingButtonProps {
  bookingLink: string;
  onClick?: () => void;
}

export function BookingButton({ bookingLink, onClick }: BookingButtonProps) {
  const addUtmParameters = (url: string): string => {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set("utm_source", "fysfinder-dk");
      urlObj.searchParams.set("utm_medium", "referral");
      return urlObj.toString();
    } catch (e) {
      return url;
    }
  };

  return (
    <Button
      className="w-full mb-4 bg-logo-blue hover:bg-logo-blue/90"
      variant="default"
      asChild
    >
      <a
        href={addUtmParameters(bookingLink)}
        target="_blank"
        rel="noopener"
        onClick={onClick}
      >
        Book tid
      </a>
    </Button>
  );
}
