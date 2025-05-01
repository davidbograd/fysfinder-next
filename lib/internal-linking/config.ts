import type { LinkConfig } from "./types.js";
import { blogMappings } from "./blog.config";
import { ordbogMappings } from "./ordbog.config";
import { locationMappings } from "./location.config";
import { miscMappings } from "./misc.config";

/**
 * Loads the internal linking configuration.
 * For MVP, this returns a hardcoded configuration.
 * TODO: Implement loading from a JSON file in a future version.
 */
export function loadLinkConfig(): LinkConfig {
  // Configuration uses imported mappings
  const config: LinkConfig = {
    linkMappings: {
      ordbog: ordbogMappings,
      blog: blogMappings,
      location: locationMappings,
      misc: miscMappings,
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
