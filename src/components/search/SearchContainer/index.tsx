"use client";

import React, { ReactNode } from "react";
import { SearchProvider } from "../SearchProvider";

interface SearchContainerProps {
  children: ReactNode;
  className?: string;
}

export function SearchContainer({
  children,
  className = "",
}: SearchContainerProps) {
  return (
    <SearchProvider>
      <div className={`search-container ${className}`}>{children}</div>
    </SearchProvider>
  );
}

// Export for convenience
export default SearchContainer;
