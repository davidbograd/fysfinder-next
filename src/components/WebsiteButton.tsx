"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { getDisplayUrl } from "@/components/features/clinic/utils";

export interface WebsiteButtonProps {
  website: string;
  onClick?: () => void;
}

export function WebsiteButton({ website, onClick }: WebsiteButtonProps) {
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
      variant="outline"
      className="w-full flex items-center justify-between gap-2"
      asChild
    >
      <a
        href={addUtmParameters(website)}
        target="_blank"
        rel="noopener nofollow"
        onClick={onClick}
      >
        <div className="flex items-center min-w-0 flex-1">
          <Globe className="shrink-0 mr-2 h-4 w-4 text-gray-400" />
          <span className="truncate">{getDisplayUrl(website)}</span>
        </div>
      </a>
    </Button>
  );
}
