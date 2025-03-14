# Scripts Documentation

This directory contains various utility scripts for managing and maintaining the application. Below is a comprehensive list of all available scripts and their purposes.

## Data Import Scripts

### `import-clinics.ts`

- **Purpose**: Imports clinic data into the database
- **Usage**: `npm run import:clinics`

### `import-specialties.ts`

- **Purpose**: Imports medical specialties data
- **Usage**: `npm run import:specialties`

### `ingest-ordbog-articles.ts`

- **Purpose**: Ingests articles from ordbog into the system
- **Usage**: `npm run ingest:articles`

### `fetch-physiotherapists-google-maps.ts`

- **Purpose**: Fetches physiotherapist data from Google Maps
- **Usage**: `npm run fetch:physio`

## SEO and Sitemap Scripts

### `generate-sitemap.ts`

- **Purpose**: Generates the website sitemap
- **Usage**: `npm run generate:sitemap`

## Utility Scripts

### `update-imports.mjs`

- **Purpose**: Updates import statements across the codebase
- **Usage**: `npm run update:imports`

### `revalidate.js`

- **Purpose**: Handles revalidation of pages/cache
- **Usage**: `npm run revalidate`

### `populate-postal-codes.ts`

- **Purpose**: Populates postal code data in the database
- **Usage**: `npm run populate:postal`

### `utils.ts`

- **Purpose**: Shared utility functions used by other scripts
- **Note**: This is a helper module imported by other scripts

## Running Scripts

All scripts can be run using npm commands. For TypeScript scripts, ensure you have ts-node installed:

```bash
npm install -g ts-node
```

For the most up-to-date list of available npm scripts, check the scripts section in package.json.
