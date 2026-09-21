-- Enables JSON Schema CHECK constraints, used to enforce the shape of clinics.opening_hours.
-- Kept in its own migration: CREATE EXTENSION must commit before later migrations can
-- resolve extensions.jsonb_matches_schema() in a constraint expression.

CREATE EXTENSION IF NOT EXISTS pg_jsonschema WITH SCHEMA extensions;
