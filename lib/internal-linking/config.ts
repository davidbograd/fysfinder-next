import type { LinkConfig } from "./types.js";

/**
 * Loads the internal linking configuration.
 * For MVP, this returns a hardcoded configuration.
 * TODO: Implement loading from a JSON file in a future version.
 */
export function loadLinkConfig(): LinkConfig {
  // Hardcoded configuration based on PRD example
  const config: LinkConfig = {
    linkMappings: {
      ordbog: [
        {
          keywords: ["ryg", "ryggen", "rygge"],
          destination: "/ordbog/ryg",
        },
      ],
      blog: [
        {
          keywords: ["diskusprolaps"],
          destination: "/blog/diskusprolaps-6-myter",
        },
      ],
    },
  };

  // Basic validation (ensure linkMappings exists)
  if (
    !config ||
    typeof config.linkMappings !== "object" ||
    config.linkMappings === null
  ) {
    throw new Error(
      "Invalid internal linking configuration: linkMappings is missing or not an object."
    );
  }

  // TODO: Add more robust validation in the future (e.g., check keywords/destination format)

  return config;
}
