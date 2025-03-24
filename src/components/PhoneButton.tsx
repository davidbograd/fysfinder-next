"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Eye } from "lucide-react";

export interface PhoneButtonProps {
  phoneNumber: string;
  onClick?: () => void;
}

export function PhoneButton({ phoneNumber, onClick }: PhoneButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

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

  const maskPhoneNumber = (number: string) => {
    // Show first 6 digits, mask only the last 2 with XX
    const cleanNumber = number.replace(/\s/g, ""); // Remove any spaces
    const visiblePart = cleanNumber
      .slice(0, 6)
      .replace(/(.{2})/g, "$1 ")
      .trim(); // Add space after every 2 digits
    return `${visiblePart} XX...`;
  };

  const handlePhoneAction = async () => {
    if (!isRevealed) {
      // First click - reveal number and track
      setIsRevealed(true);
      onClick?.();
      return;
    }

    // Second click - handle mobile call or copy
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

  const getButtonText = () => {
    if (!isRevealed) {
      return (
        <span className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          Vis nummer
        </span>
      );
    }
    if (isMobile) {
      return "Ring op";
    }
    return isCopied ? "Kopieret" : "Kopier";
  };

  return (
    <Button
      variant="outline"
      className="w-full flex items-center justify-between"
      onClick={handlePhoneAction}
    >
      <div className="flex items-center">
        <Phone className="mr-2 h-4 w-4 text-gray-400" />
        <span className="truncate">
          {isRevealed ? phoneNumber : maskPhoneNumber(phoneNumber)}
        </span>
      </div>
      <span className="ml-2 text-sm text-gray-400 transition-all duration-300">
        {getButtonText()}
      </span>
    </Button>
  );
}
