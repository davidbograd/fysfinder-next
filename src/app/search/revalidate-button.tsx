"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function RevalidateButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleRevalidate = async () => {
    setIsLoading(true);
    setMessage(null);
    setIsError(false);

    try {
      const response = await fetch("/api/revalidate-all", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to revalidate");
      }

      setMessage("Successfully revalidated all pages");
      setIsError(false);
    } catch (error) {
      console.error("Revalidation error:", error);
      setMessage("Failed to revalidate pages");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <Button onClick={handleRevalidate} disabled={isLoading} variant="outline">
        {isLoading ? "Revalidating..." : "Revalidate All Pages"}
      </Button>
      {message && (
        <p className={`text-sm ${isError ? "text-red-500" : "text-green-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
