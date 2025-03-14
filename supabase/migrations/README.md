# Database Migrations

This directory contains the database migration files for the FysFinder project.

## Structure

- `20250314_baseline.sql`: The baseline migration that represents the initial database structure
- `archive/`: Historical SQL files from previous migrations (kept for reference)
- Future migrations will follow the format: `YYYYMMDD_description.sql`

## Migration Guidelines

When creating new migrations:

1. Name the file using the format: `YYYYMMDD_description.sql`
2. Each migration should be atomic (one logical change)
3. All migrations should be idempotent (safe to run multiple times)
4. Use `IF NOT EXISTS` for creating new objects
5. Include both `UP` and `DOWN` migrations when possible
6. Document any manual steps required

## Running Migrations

Migrations are managed through Supabase and will be applied automatically when deployed.
For local development, use the Supabase CLI:

```bash
supabase db reset        # Reset the database to a clean state
supabase db push        # Push migration changes to your local development database
```
