## User Auth Release Checklist (Updated & Prioritized)

---

## 🚨 PHASE 1: CRITICAL SECURITY (Do First)

### 1. Row Level Security (RLS) Policies - CRITICAL
**Status:** RLS enabled on tables, but policies need review/testing
**Priority:** HIGHEST - Security foundation

#### 1.1 Review & Define RLS Policies
- [ ] Review existing policies on `user_profiles` table
- [ ] Review existing policies on `clinic_claims` table  
- [ ] Review existing policies on `clinic_owners` table
- [ ] Define/verify policies for `clinics` table
  - Public read access (anonymous users can view clinics)
  - Only owners can update their own clinics
  - Admins can update any clinic (service role bypass)
- [ ] Ensure admin bypass policies strictly limited to service role calls
- [ ] Check for data leakage via foreign table joins and views
- [ ] Row filters prevent enumerating other users/clinics

#### 1.2 Test RLS Policy Matrix
- [ ] Test anonymous user access (can view public clinics, can't write)
- [ ] Test authenticated user access (can only read own profile/claims)
- [ ] Test clinic owner access (can only edit own clinics)
- [ ] Test non-owner access (can't edit other clinics)
- [ ] Test admin access (can access everything via service role)

---

## 🔧 PHASE 2: DATABASE & DATA INTEGRITY

### 2. Database Constraints & Foreign Keys
**Status:** Basic structure exists, needs review
**Priority:** HIGH - Foundation for data quality

- [ ] ✅ ~~Enforce unique clinic names~~ (ALREADY DONE - unique constraint exists)
- [ ] Review all NOT NULL constraints on auth-related tables
- [ ] Verify foreign key constraints are correct:
  - `user_profiles.id` → `auth.users.id`
  - `clinic_owners.user_id` → `auth.users.id`
  - `clinic_owners.clinic_id` → `clinics.clinics_id`
  - `clinic_claims.user_id` → `auth.users.id`
  - `clinic_claims.clinic_id` → `clinics.clinics_id`
  - `clinic_claims.reviewed_by` → `auth.users.id`
- [ ] Add unique constraint on `clinic_owners` (user_id, clinic_id) to prevent duplicates
- [ ] Backfill/clean any existing data that violates constraints
- [ ] Test migrations are reversible on a copy

---

## ✅ PHASE 3: ERROR HANDLING & VALIDATION

### 3. Error Handling & User Feedback
**Status:** Basic errors, needs enhancement
**Priority:** MEDIUM-HIGH - Better UX

#### 3.1 Authentication Error Messages
- [ ] Handle duplicate email on signup (clear error message)
- [ ] Handle wrong password on signin (generic security message)
- [ ] Handle email already verified (redirect appropriately)
- [ ] Handle invalid email format
- [ ] Handle password too weak (min 8 chars already enforced)

#### 3.2 Form Validation
- [ ] Client-side validation on signup form
- [ ] Client-side validation on signin form
- [ ] Client-side validation on claim clinic form
- [ ] Show validation errors inline (not just toast)

#### 3.3 Server Action Error Handling
- [ ] Standardize error response format across all actions
- [ ] Never expose sensitive error details to client
- [ ] Log detailed errors server-side only
- [ ] Graceful handling of Supabase connection errors

---

## 📧 PHASE 4: EMAIL VERIFICATION & PASSWORD RESET

### 4. Email Verification Flow
**Status:** Not implemented
**Priority:** MEDIUM-HIGH - Anti-spam measure

- [ ] Create email verification page (`/auth/verify`)
- [ ] Handle Supabase email confirmation callback
- [ ] Show "Please verify your email" banner when not verified
- [ ] Create "Resend verification email" functionality
- [ ] Test verification flow end-to-end
- [ ] Add email verification check before allowing sensitive actions
- [ ] Update middleware to allow unverified users to access verification page

### 5. Password Reset Flow
**Status:** Not implemented
**Priority:** HIGH - Essential for production

- [ ] Add "Forgot password?" link on signin page
- [ ] Create password reset request page (`/auth/reset-password`)
- [ ] Handle Supabase password reset email sending
- [ ] Create password reset confirmation page (`/auth/update-password`)
- [ ] Handle Supabase password update callback
- [ ] Test password reset flow end-to-end
- [ ] Update middleware to allow access to reset pages

---

## ✅ PHASE 5: AUTHENTICATION REFINEMENTS - COMPLETE

### 5. Authentication & Authorization
**Status:** ✅ COMPLETE
**Priority:** MEDIUM

- [x] ✅ Email/password signup works (DONE)
- [x] ✅ Email/password login works (DONE)
- [x] ✅ Session persistence across tabs (DONE - middleware handles it)
- [x] ✅ Sign-out functionality (DONE - UserMenu component)
- [x] ✅ Protected routes with redirects (DONE - middleware)
- [x] ✅ Admin role checking (DONE - isAdminEmail function)

#### 5.1 Security Checks ✅
- [x] ✅ Review all server actions have auth checks (COMPLETE - all verified)
- [x] ✅ Review all API routes have auth checks (COMPLETE - revalidate-all fixed)
- [x] ✅ Ensure role/permission mapping consistent across app and DB (VERIFIED)
- [x] ✅ PII logging scrubbed/redacted in all logs (CLEANED UP)
- [x] ✅ No secrets in client-side console logs (VERIFIED)

**See:** `docs/phase-5-security-audit-report.md` for full security audit results

---

## 🧪 PHASE 6: COMPREHENSIVE TESTING

### 6. QA & Testing Before Launch
**Status:** Ready for manual testing
**Priority:** MEDIUM - Quality assurance

**📋 See Full Checklist:** `docs/phase-6-testing-checklist.md` (~120 test cases)

#### 6.1 Core Auth Flows
- [ ] Test signup happy path
- [ ] Test signin happy path
- [ ] Test signup with duplicate email
- [ ] Test signin with wrong password
- [ ] Test session persistence (close/reopen browser)
- [ ] Test sign-out (clears session)
- [ ] Test email verification flow
- [ ] Test password reset flow

#### 6.2 Admin Dashboard Features
- [ ] Test admin banner shows for admin users
- [ ] Test admin statistics load correctly
- [ ] Test verified clinics page loads
- [ ] Test clinic claim approval workflow
- [ ] Test clinic claim rejection workflow
- [ ] Test non-admin cannot access admin pages

#### 6.3 Clinic Management
- [ ] Test claiming a clinic (full workflow)
- [ ] Test editing owned clinic
- [ ] Test cannot edit non-owned clinic
- [ ] Test admin can edit any clinic

#### 6.4 Cross-Browser & Mobile
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on mobile (responsive design)
- [ ] Test on tablet

**Note:** Complete testing checklist is in `docs/phase-6-testing-checklist.md`

---

## 🚀 PHASE 7: PRODUCTION PREPARATION

### 7. Staging & Pre-Launch
**Status:** Not started
**Priority:** BEFORE LAUNCH

- [ ] Deploy to staging environment
- [ ] Run all tests on staging
- [ ] Test with real Supabase production instance (if different)
- [ ] Verify environment variables are set correctly
- [ ] Take full database backup
- [ ] Test database restore process
- [ ] Document rollback procedure

### 8. Production Launch
**Status:** Not started
**Priority:** LAUNCH DAY

- [ ] Seed at least one admin account in production
- [ ] Verify admin account can access admin dashboard
- [ ] Run database migrations on production
- [ ] Monitor error logs for first 24 hours
- [ ] Test critical flows in production
- [ ] Have rollback plan ready

---

## 📝 DEFERRED (Not Doing Now)

These were considered but deprioritized:

- ❌ Profile management page (users can't edit profile yet - okay for MVP)
- ❌ Password reset flow (users contact support for now)
- ❌ Change password page (users contact support for now)
- ❌ Redirect after login to intended page (nice-to-have)
- ❌ Audit logging (not critical for MVP)
- ❌ Multiple clinic owners (feature for later)
- ❌ Automated testing suite (manual QA for now)

---

## 🎯 RECOMMENDED IMPLEMENTATION ORDER

1. **RLS Policies** (Phase 1) - Security first, review together in detail
2. **Database Constraints** (Phase 2) - Clean data foundation
3. **Error Handling** (Phase 3) - Better user experience
4. **Email Verification** (Phase 4) - Anti-spam
5. **Auth Refinements** (Phase 5) - Polish remaining items
6. **Comprehensive Testing** (Phase 6) - Catch bugs
7. **Production Prep** (Phase 7-8) - Launch safely

---

## ✅ COMPLETED TASKS

Tasks completed during implementation:

### Database & Structure
- ✅ User profiles table created with RLS enabled
- ✅ Clinic claims table created
- ✅ Clinic owners table created
- ✅ Unique constraint on clinic names
- ✅ All foreign key constraints verified
- ✅ NOT NULL constraints verified
- ✅ RLS policies reviewed and cleaned up

### Authentication
- ✅ Email/password signup flow
- ✅ Email/password signin flow
- ✅ Session management via middleware
- ✅ Protected dashboard route
- ✅ Admin role checking system
- ✅ Email verification flow
- ✅ Password reset flow
- ✅ Global email verification banner

### Error Handling & Validation
- ✅ Client-side form validation (signup/signin)
- ✅ Inline error messages with field highlighting
- ✅ User-friendly Danish error messages
- ✅ Server-side error parsing and handling
- ✅ Auth errors utility library

### Admin Features
- ✅ Admin dashboard with statistics
- ✅ Admin banner for admin users
- ✅ Verified clinics list page
- ✅ Clinic claim approval/rejection workflow
- ✅ Admin-only routes with proper protection

### UI/UX
- ✅ Toaster notifications
- ✅ Loading spinners on all async operations
- ✅ Responsive design
- ✅ Consistent styling

### Security
- ✅ RLS policies on all auth tables
- ✅ Clinic owners INSERT policy removed (security fix)
- ✅ All server actions have auth checks
- ✅ API routes protected (revalidate-all fixed)
- ✅ PII logging cleaned up
- ✅ No secrets in client logs
- ✅ Webhook signature verification
- ✅ Comprehensive security audit completed

### Documentation
- ✅ Phase 5 security audit report
- ✅ Phase 6 comprehensive testing checklist (~120 test cases)
- ✅ Updated TODO with priorities

---

**Last Updated:** November 30, 2025 (Phase 5 Complete)

