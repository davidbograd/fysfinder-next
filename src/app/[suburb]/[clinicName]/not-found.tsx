"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function NotFound() {
  const params = useParams();

  useEffect(() => {
    window.location.href = `/${params.suburb}`;
  }, [params.suburb]);

  return null;
}
