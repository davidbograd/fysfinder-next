# Authentication Implementation Plan

## Overview
This document outlines the plan for implementing user authentication for the FysFinder platform, allowing users to sign up with email, password, full name, and clinic name.

## Current Setup
- ✅ Next.js 15 (App Router)
- ✅ Supabase configured (auth enabled in `config.toml`)
- ✅ `@supabase/ssr` package installed
- ✅ Server-side Supabase client utility exists
- ✅ Database schema for clinics, cities, specialties already established

## Database Schema

### 1. User Profiles Table (`user_profiles`)
Extends Supabase's built-in `auth.users` table with additional user information:

```sql
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  clinic_name TEXT NOT NULL,
  email TEXT NOT NULL, -- Denormalized from auth.users for easier queries
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);
```

**Note**: Supabase's `auth.users` table handles email/password automatically.

### 2. Relationship with Existing Tables
Consider if users should be linked to existing `clinics` table:
- Should users be associated with an existing clinic?
- Or is `clinic_name` just a text field for now?
- Future: Allow users to claim/verify clinic ownership?

## Authentication Flow

### Sign Up Flow
1. User enters: email, password, full name, clinic name
2. Create user in Supabase Auth (`auth.signUp()`)
3. On successful signup, create profile record in `user_profiles` table
4. Handle email verification (if enabled in Supabase config)
5. Redirect to dashboard/home after signup

### Sign In Flow
1. User enters: email, password
2. Authenticate with Supabase (`auth.signInWithPassword()`)
3. Supabase handles session management (cookies)
4. Redirect to dashboard/home

### Sign Out Flow
1. Call `auth.signOut()`
2. Clear session cookies
3. Redirect to home/login

## Components to Build

### 1. Client-side Supabase Utility
Create `src/app/utils/supabase/client.ts` for client-side auth operations.

### 2. Auth Pages
- `/auth/signup` - Sign up page
- `/auth/signin` - Sign in page
- `/auth/forgot-password` - Password reset (if needed)
- `/auth/verify-email` - Email verification handler

### 3. Auth UI Components
- `<SignUpForm />` - Form component for signup
- `<SignInForm />` - Form component for signin
- `<AuthGuard />` - Wrapper to protect routes
- `<UserMenu />` - User dropdown in header (shows name, sign out)

### 4. Protected Routes Middleware
Update `src/middleware.ts` to:
- Check authentication status
- Redirect unauthenticated users to signin
- Protect routes like `/dashboard`, `/profile`, etc.

### 5. Server Actions/API Routes
- Server actions for signup/signin (optional, can use client-side)
- API route to create user profile after signup (webhook or direct call)

## Key Features to Implement

### Required (MVP)
- ✅ Email/password authentication
- ✅ User signup with email, password, full name, clinic name
- ✅ User signin
- ✅ User signout
- ✅ Protected routes
- ✅ Session persistence (handled by Supabase)

### Recommended
- ⚠️ Email verification (currently disabled in config - should we enable?)
- ⚠️ Password reset functionality
- ⚠️ "Remember me" functionality
- ⚠️ Loading states and error handling
- ⚠️ Form validation (email format, password strength)
- ⚠️ Success/error toast notifications

### Future Enhancements
- Profile editing (update name, clinic name, email)
- Password change
- Account deletion
- Link user profile to existing clinic record
- Clinic ownership verification

## Technical Implementation Details

### 1. Client-side Auth Utility
```typescript
// src/app/utils/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
```

### 2. Session Management
- Supabase handles session via HTTP-only cookies
- Automatic token refresh
- Middleware refreshes expired sessions

### 3. Protected Route Pattern
```typescript
// In a Server Component or Route Handler
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  redirect('/auth/signin')
}
```

## Questions to Clarify

### Critical Questions
1. **Email Verification**: Should users verify their email before accessing the platform?
   - Current config: `enable_confirmations = false`
   - Recommendation: Enable for production, disable for dev

2. **Clinic Relationship**: 
   - Is `clinic_name` just a text field for now?
   - Or should users be linked to existing clinic records in your `clinics` table?
   - Should users be able to claim/verify ownership of an existing clinic?

3. **Protected Routes**: Which routes should require authentication?
   - Dashboard?
   - Profile page?
   - Future features?

4. **Password Requirements**: 
   - Current minimum: 6 characters (quite weak)
   - Should we enforce stronger passwords? (uppercase, numbers, symbols)
   - Should we show password strength indicator?

5. **User Roles**: Do you need different user types?
   - Regular users
   - Clinic owners/admins
   - Platform admins
   - (For now, probably just "users")

### Nice-to-Have Questions
6. **Social Login**: Should we support Google/Apple login later?
7. **Two-Factor Authentication**: Needed for clinic owners?
8. **Session Timeout**: How long should sessions last? (Default: 1 hour)

## Implementation Steps

### Phase 1: Foundation
1. Create database migration for `user_profiles` table
2. Create client-side Supabase utility
3. Create server-side Supabase utility (already exists, may need updates)
4. Update middleware for auth checks

### Phase 2: Auth Pages
5. Create `/auth/signup` page with form
6. Create `/auth/signin` page with form
7. Implement signup logic (auth + profile creation)
8. Implement signin logic
9. Implement signout functionality

### Phase 3: Protected Routes & UI
10. Create `<AuthGuard />` component
11. Update middleware for route protection
12. Add user menu to Header component
13. Create basic dashboard/profile page

### Phase 4: Polish & Security
14. Add form validation
15. Add error handling and user feedback
16. Enable email verification (if desired)
17. Add password reset flow
18. Add loading states
19. Test session persistence and refresh

## Security Considerations

1. **Row Level Security (RLS)**: ✅ Included in schema above
2. **Password Hashing**: ✅ Handled by Supabase
3. **Session Security**: ✅ HTTP-only cookies via Supabase SSR
4. **CSRF Protection**: ✅ Handled by Next.js
5. **Rate Limiting**: Consider adding for signup/signin endpoints
6. **Email Verification**: Recommend enabling for production

## Testing Checklist

- [ ] User can sign up successfully
- [ ] User profile is created after signup
- [ ] User can sign in with correct credentials
- [ ] User cannot sign in with wrong credentials
- [ ] User can sign out
- [ ] Protected routes redirect to signin when not authenticated
- [ ] Authenticated users can access protected routes
- [ ] Session persists across page refreshes
- [ ] Session expires correctly
- [ ] User can update their profile (future)

## Implementation Status ✅

All core authentication features have been implemented:

1. ✅ Database migration created (`20250115000000_add_user_profiles.sql`)
2. ✅ Client-side Supabase utility created
3. ✅ Middleware updated for session refresh and route protection
4. ✅ Signup page and form created (`/auth/signup`)
5. ✅ Signin page and form created (`/auth/signin`)
6. ✅ Protected dashboard page created (`/dashboard`)
7. ✅ User menu added to Header component
8. ✅ Supabase config updated (password minimum: 8 characters)
9. ✅ Toast notifications added to layout

## Next Steps (Future Enhancements)

1. Add admin role functionality
2. Profile editing page
3. Password change functionality
4. Link user profiles to clinics table (clinic claiming)
5. Additional protected routes as needed

