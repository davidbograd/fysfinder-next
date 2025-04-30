/** Represents a single keyword-to-destination mapping. */
export interface LinkMapping {
  keywords: string[];
  destination: string;
  // No 'priority' in MVP
}

/** Represents the overall configuration structure for link mappings. */
export interface LinkConfig {
  linkMappings: {
    [category: string]: LinkMapping[]; // e.g., "anatomy", "conditions"
  };
  // No 'settings' object in MVP
}
