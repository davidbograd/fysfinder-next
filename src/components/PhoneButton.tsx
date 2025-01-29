"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

export interface PhoneButtonProps {
  phoneNumber: string;
  onClick?: () => void;
}

export function PhoneButton({ phoneNumber, onClick }: PhoneButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      setIsMobile(
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent
        )
      );
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handlePhoneAction = async () => {
    // Track the interaction
    onClick?.();

    if (isMobile) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      try {
        await navigator.clipboard.writeText(phoneNumber);
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 4000);
      } catch (err) {
        console.error("Failed to copy phone number: ", err);
      }
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full flex items-center justify-between"
      onClick={handlePhoneAction}
    >
      <div className="flex items-center">
        <Phone className="mr-2 h-4 w-4 text-gray-400" />
        <span className="truncate">{phoneNumber}</span>
      </div>
      <span className="ml-2 text-sm text-gray-400 transition-all duration-300">
        {isMobile ? "Ring op" : isCopied ? "Kopieret" : "Kopier"}
      </span>
    </Button>
  );
}
