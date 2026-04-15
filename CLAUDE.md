# Project: Fysfinder

A Danish physiotherapy finder platform built with Next.js (App Router). Users can search for physiotherapists by location and specialty, read educational health content, and use health calculators. Clinic owners can claim and manage their listings, with a premium tier for enhanced visibility.

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run test` — Run all tests (Jest)
- `npm run test:ci` — CI pipeline: focused-test guard + unit tests
- `npm run test:watch` — Jest in watch mode
- `npm run test:coverage` — Coverage report
- `npm run lint` — ESLint check
- `npm run stripe:listen` — Forward Stripe webhooks to localhost during development

## Architecture

**Stack:** Next.js 16 App Router, TypeScript, React 19, Tailwind CSS, Supabase (PostgreSQL), Stripe, Resend (email)

**Key directory layout:**

```
src/
  app/            # App Router pages and API routes
    actions/      # Server Actions (clinic management, auth, premium)
    api/          # API routes (Stripe webhooks, tracking, revalidation)
    find/         # Clinic search pages ([location])
    klinik/       # Individual clinic detail pages
    dashboard/    # Clinic owner dashboard
    auth/         # Auth pages
    tilmeld/      # Clinic registration flow
    ordbog/       # Medical glossary (MDX)
    blog/         # Articles (MDX)
    vaerktoejer/  # Health calculators
  components/
    ui/           # shadcn/ui base components
    layout/       # Header, Footer, Nav, Breadcrumbs
    search/       # Search interface and filters
    dashboard/    # Dashboard-specific components
    features/     # Clinic cards, FAQ, etc.
  lib/
    search-service.ts        # Clinic search (singleton)
    clinic-entitlements.ts   # Free vs. premium access logic
    stripe/                  # Stripe client + premium sync
    email.ts                 # Resend email integration
    cache-config.ts          # ISR revalidation config
  app/utils/supabase/
    server.ts    # Cookie-based SSR client (createServerClient)
    static.ts    # Static/ISR client (createStaticClient) — no cookies
    client.ts    # Browser client
supabase/
  migrations/   # All DB schema migrations
scripts/        # Data ingestion, sitemap, Google sync
```

**Data fetching patterns:**
- Default to Server Components; only add `"use client"` for interactivity
- Use `createStaticClient()` in ISR pages to avoid `cookies()` at build time
- Use `createServerClient()` in dynamic server pages and Server Actions
- Fetch in parallel with `Promise.all()` where possible
- ISR revalidation is configured in `lib/cache-config.ts`

**Content:** Blog and glossary pages use MDX via `next-mdx-remote`. Content lives in `/src/content/`.

**Premium/billing:** Stripe subscriptions gate enhanced clinic features. `clinic-entitlements.ts` is the source of truth for what free vs. premium clinics can access. Stripe webhook lives at `/api/stripe/webhook`.

## Code Style

- TypeScript strict mode — avoid `any`; the linter warns on it
- Tailwind CSS for all styling — no CSS modules or inline styles
- Brand colors: `brand-primary` (#104534), `brand-cream` (#f8f7f2), `brand-beige` (#f2f1ec)
- Font: Manrope (variable, 200–800 weight)
- shadcn/ui components for UI primitives — extend rather than recreate
- Path alias `@/*` maps to `src/*`
- Server Actions preferred over API routes for form submissions and mutations
- Do not skip focused-test guard (`test:check-focused`) — `.only` in test files blocks CI

## Important Notes

- **Language:** The app is in Danish. UI copy, routes, and content are all Danish.
- **Supabase clients:** Always use `createStaticClient()` in pages with `export const revalidate` (ISR). Using `createServerClient()` there will throw at build time because `cookies()` is unavailable.
- **Stripe local dev:** Run `npm run stripe:listen` and paste the printed webhook signing secret into `STRIPE_WEBHOOK_SECRET` in `.env.local`.
- **DB migrations:** All schema changes go in `supabase/migrations/` with a timestamped filename. Never edit existing migration files.
- **No `.only` in tests:** The `test:check-focused` script fails CI if `.only` is left in any test file.
- **Google data sync:** Clinic Google Places data is refreshed via GitHub Actions (`update-clinic-google-data.yml`) and the `npm run google:update` script — do not manually patch these fields in the DB.
- **Redirects:** Old article URL redirects are maintained in `next.config.js` — update there when restructuring content routes.
