"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

export default function NotFound() {
  const params = useParams();

  useEffect(() => {
    if (params?.suburb) {
      window.location.href = `/${params.suburb}`;
    } else {
      window.location.href = "/"; // Fallback to home if no suburb
    }
  }, [params]);

  return null;
}
