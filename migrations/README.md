# Custom Consultation Timing Feature

This feature allows clinics to define custom durations for their consultation types instead of using hardcoded values.

## Changes Made

### Database Changes

- Added `første_kons_minutter` column to `clinics` table (default: 60 minutes)
- Added `opfølgning_minutter` column to `clinics` table (default: 30 minutes)
- Added timing columns to `clinic_submissions_staging` table
- Updated stored procedure `process_verified_submission` to handle timing data
- Added constraints to ensure reasonable timing values (5-180 minutes)

### TypeScript Changes

- Updated `Clinic` interface in `src/app/types/index.ts` to include timing fields
- Updated `DBClinicResponse` interface to include timing fields
- Updated `ClinicPricing` component to use database timing values instead of hardcoded ones

### Migration Files

1. `add_custom_timing_columns.sql` - Main migration for clinics table
2. `add_timing_to_staging.sql` - Migration for staging table

## Running the Migrations

```sql
-- Run these migrations in order:
\i migrations/add_custom_timing_columns.sql
\i migrations/add_timing_to_staging.sql
```

## Component Usage

The `ClinicPricing` component now displays:

- "Første konsult ({clinic.første_kons_minutter || 60} min)"
- "Standard konsult ({clinic.opfølgning_minutter || 30} min)"

This ensures backward compatibility while allowing custom timing when available.
