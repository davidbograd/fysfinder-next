## User Auth Release Checklist

### Database & Data Integrity
- [ ] Enforce unique clinic names (DB unique index on `clinics.name`)
- [ ] Review all constraints (FKs, NOT NULLs) for auth-related tables
- [ ] Backfill/clean existing data that violates new constraints
- [ ] Migrations reviewed, reversible, and tested on a staging copy

### Security & RLS (Supabase)
- [ ] RLS enabled on all user-related tables (verify none left OFF)
- [ ] Define policies for: `clinics`, `profiles/users`, `appointments`, `images`, logs
- [ ] Ensure only owners/admins can read/write their data; public reads only where intended
- [ ] Admin bypass policies strictly limited to admin role
- [ ] Avoid data leakage via foreign table joins and views
- [ ] Test policy matrix (anonymous, authenticated, owner, non-owner, admin)
- [ ] Row filters prevent enumerating other users/clinics

### Authentication Flows
- [ ] Email/password signup and login happy paths
- [ ] Email verification and resend verification
- [ ] Password reset (request + complete)
- [ ] Session persistence, refresh, and sign-out across tabs/devices

### Application Integration
- [ ] Protect server actions and API routes with auth checks
- [ ] Client-side guards for protected routes; graceful redirects
- [ ] Role/permission mapping (user, clinic-owner, admin) is consistent across app and DB
- [ ] Use `+45` UI prefix but store phone without `+45` (confirmed)
- [ ] PII logging scrubbed/redacted; no secrets in client logs

### QA & Testing
- [ ] QA testing on everything before launch

### Release & Rollout
- [ ] Staging sign-off checklist completed
- [ ] Backups taken before migration; restore tested
- [ ] Seed at least one admin account; validate admin-only views
