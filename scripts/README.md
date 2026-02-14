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

- **Purpose**: Fetches physiotherapist data from Google Maps (legacy – for initial discovery)
- **Usage**: `npm run fetch:physio`

## Google Places Data Refresh

These scripts keep clinic data fresh by syncing with Google Maps via the Places API (New).

**Prerequisites:** Enable the "Places API (New)" in your Google Cloud project:
https://console.developers.google.com/apis/api/places.googleapis.com/overview

### `backfill-google-place-ids.ts`

- **Purpose**: One-time backfill to find and store Google Place IDs for all clinics. Uses Text Search to match each clinic by name + address + postal code. Resumable – only processes clinics without a `google_place_id`.
- **Usage**: `npm run google:backfill` or with options:
  ```bash
  npm run google:backfill -- --dry-run          # Preview without DB writes
  npm run google:backfill -- --limit 50         # Process only 50 clinics
  npm run google:backfill -- --dry-run --limit 10  # Combined
  ```
- **Cost**: Text Search Pro – free for first 5,000 calls/month (all ~1,916 clinics = $0)

### `update-clinic-google-data.ts`

- **Purpose**: Monthly update – refreshes ratings, opening hours, phone, website, and Google Maps URL for all clinics that have a Place ID. Respects verified clinics (only updates ratings + Maps URL for those).
- **Usage**: `npm run google:update` or with options:
  ```bash
  npm run google:update -- --dry-run          # Preview without DB writes
  npm run google:update -- --limit 50         # Process only 50 clinics
  ```
- **Cost**: Place Details Enterprise – $20/1,000 calls (first 1,000 free). ~$18/month for ~1,916 clinics.
- **Schedule**: Runs automatically on the 1st of every month at 3 AM UTC via GitHub Actions (`.github/workflows/update-clinic-google-data.yml`). Can also be triggered manually from the Actions tab.
- **Email Report**: After each run, sends a summary email to all admin recipients (via Resend) with stats, change breakdown, permanently closed clinics, and API cost. Requires `RESEND_API_KEY` and `ADMIN_EMAILS` environment variables.

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
