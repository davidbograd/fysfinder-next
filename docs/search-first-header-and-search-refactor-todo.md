# Search-First Header + Search Refactor TODO

Last updated: 2026-03-24  
Status: In progress implementation

## Objective

Ship a desktop search-first header on selected pages and refactor search logic to a single, reliable flow before rollout.

## Scope

- Include search-first desktop header on:
  - `/ordbog`
  - `/ordbog/[term]`
  - `/vaerktoejer`
  - `/vaerktoejer/*`
- Keep current header behavior on:
  - `/`
  - `/find/fysioterapeut/*`
- Keep mobile header/menu unchanged in v1.

## Execution Order

## Phase 0 - Alignment

- [x] Confirm route scope for search-first desktop header.
- [x] Confirm canonical search URL strategy (`/find/fysioterapeut/...`).
- [x] Confirm handling of legacy/dev `search-v2` logic (isolate or retire).

## Phase 1 - Search Logic Unification (Do First)

### 1.1 Shared URL Builder

- [x] Create shared search target URL utility (single source of truth).
- [ ] Ensure behavior covers:
  - [x] location + specialty
  - [x] location only
  - [x] specialty only (`danmark` fallback)
  - [x] no input fallback (`/find/fysioterapeut/danmark`)
- [x] Ensure filter params are canonicalized consistently.

### 1.2 Remove Duplicated Submit Logic

- [x] Update `src/components/search/SearchButton.tsx` to use shared URL utility.
- [x] Update inline submit logic in `src/components/search/SearchInterface.tsx` to use shared URL utility.
- [x] Update or deprecate `src/components/search/SearchButton/SearchButton.tsx` to prevent divergence.

### 1.3 Normalize v1/v2 Route Usage

- [x] Audit all `buildSearchV2Url` usage.
- [x] Keep production search interactions on canonical route only.
- [x] Isolate dev-only routes/components clearly if retained.

### 1.4 Strengthen SearchProvider API Boundaries

- [ ] Replace raw reducer `dispatch` calls in input components with provider helper methods where possible.
- [ ] Keep reducer internals centralized in provider.

## Phase 2 - Header Component Refactor (No UX Change Yet)

- [ ] Split `Header` into modular pieces:
  - [ ] `HeaderShell`
  - [ ] `HeaderDefaultDesktop`
  - [ ] `HeaderMobileMenu`
  - [ ] shared logo/auth action pieces
- [ ] Keep existing behavior unchanged after split.
- [ ] Add route matcher utility for header variant selection.
- [ ] Add tests for matcher behavior.

## Phase 3 - Build Search-First Desktop Variant

- [x] Create compact `HeaderSearchBar` component.
- [x] Reuse existing location/specialty input primitives via provider.
- [x] Wire submit action to shared search URL utility.
- [ ] Create `HeaderSearchDesktop` variant:
  - [x] logo
  - [x] search-first primary CTA
  - [x] minimal secondary actions (`For klinikker`, `UserMenu`)
- [x] Reduce/de-emphasize non-primary links in this variant.
- [x] Wire variant condition in `Header` based on pathname.

## Phase 4 - Performance + UX Hardening

- [x] Reduce repeated specialties fetch overhead (cache/prefetch strategy).
- [x] Verify consistent focus/clear behavior across header and page search.
- [x] Improve combobox accessibility semantics where needed.

## Phase 5 - Testing and QA

### 5.1 Unit Tests

- [ ] Add URL builder tests for all routing combinations.
- [ ] Add filter canonicalization assertions.
- [ ] Add header variant matcher tests for route matrix.

### 5.2 Component/Integration Tests

- [ ] Header renders search-first variant on `/ordbog*`.
- [ ] Header renders search-first variant on `/vaerktoejer*`.
- [ ] Header renders default variant on `/` and `/find/fysioterapeut/*`.

### 5.3 Manual QA

- [ ] Logged-out desktop path checks pass.
- [ ] Logged-in desktop path checks pass.
- [ ] Header search navigates correctly for all input combinations.
- [ ] Mobile menu behavior unchanged.
- [ ] No auth/menu regressions.

## Phase 6 - Release Plan

- [ ] PR 1: Search logic unification and tests.
- [ ] PR 2: Header variant refactor and route rollout.
- [ ] Keep quick rollback path (route matcher forced to default).
- [ ] Monitor CTR to search pages and bounce impact on tool/dictionary pages.

## Suggested Working Cadence

- [ ] Complete Phase 1 before any visual header changes.
- [ ] Merge in small, reviewable increments.
- [ ] Re-run QA matrix after each merged phase.

## Notes

- Prefer reusable logic over per-component routing logic.
- Avoid introducing route behavior differences between header search and page search.
- Keep v1 mobile unchanged to reduce rollout risk.
