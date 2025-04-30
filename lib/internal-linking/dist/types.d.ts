/** Represents a single keyword-to-destination mapping. */
export interface LinkMapping {
    keywords: string[];
    destination: string;
}
/** Represents the overall configuration structure for link mappings. */
export interface LinkConfig {
    linkMappings: {
        [category: string]: LinkMapping[];
    };
}
//# sourceMappingURL=types.d.ts.map