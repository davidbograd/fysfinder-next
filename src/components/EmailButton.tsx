"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

interface EmailButtonProps {
  email: string;
  className?: string;
}

export function EmailButton({ email, className = "" }: EmailButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyEmail = async () => {
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
      className={`w-full flex items-center justify-between ${className}`}
      onClick={handleCopyEmail}
    >
      <div className="flex items-center">
        <Mail className="mr-2 h-4 w-4 text-gray-400" />
        <span className="truncate">{email}</span>
      </div>
      <span className="ml-2 text-sm text-gray-400 transition-all duration-300">
        {isCopied ? "Kopieret" : "Kopier"}
      </span>
    </Button>
  );
}