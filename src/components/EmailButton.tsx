"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export interface EmailButtonProps {
  email: string;
  onClick?: () => void;
}

export function EmailButton({ email, onClick }: EmailButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleEmailAction = async () => {
    // Track the interaction
    onClick?.();

    try {
      await navigator.clipboard.writeText(email);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 4000);
    } catch (err) {
      console.error("Failed to copy email: ", err);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full flex items-center justify-between gap-2"
      onClick={handleEmailAction}
    >
      <div className="flex items-center min-w-0 flex-1">
        <Mail className="shrink-0 mr-2 h-4 w-4 text-gray-400" />
        <span className="truncate">{email}</span>
      </div>
      <span className="shrink-0 text-sm text-gray-400 transition-all duration-300">
        {isCopied ? "Kopieret" : "Kopier"}
      </span>
    </Button>
  );
}
