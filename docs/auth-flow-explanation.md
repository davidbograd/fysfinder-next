# Authentication Flow Explanation

This document explains how the authentication system works step-by-step.

## Overview

The authentication system uses **Supabase Auth** which handles all the complex security aspects (password hashing, token generation, session management) while we handle the user interface and business logic (collecting user info, creating profiles, protecting routes).

---

## 1. Sign Up Flow

### Step-by-Step Process

1. **User visits `/auth/signup`**
   - User sees the signup form with fields: email, password, full name, clinic name

2. **User submits the form**
   - Client-side validation happens (required fields, password length)
   - Form data is collected: `{ email, password, fullName, clinicName }`

3. **Frontend calls Supabase Auth**
   ```typescript
   supabase.auth.signUp({
     email: formData.email,
     password: formData.password
   })
   ```
   - Supabase creates a user in the `auth.users` table (automatically managed)
   - Password is hashed and stored securely (we never see the raw password)
   - Supabase generates a unique `user.id` (UUID)

4. **If signup succeeds, create user profile**
   ```typescript
   supabase.from("user_profiles").insert({
     id: authData.user.id,  // Links to auth.users
     email: formData.email,
     full_name: formData.fullName,
     clinic_name: formData.clinicName
   })
   ```
   - We create a record in our `user_profiles` table
   - This extends the auth user with additional info (name, clinic)
   - The `id` in `user_profiles` is the same as `auth.users.id` (foreign key)

5. **Supabase creates a session**
   - Supabase automatically creates a session (JWT token)
   - This token is stored in HTTP-only cookies (secure, can't be accessed by JavaScript)
   - The session includes user info and expiration time

6. **User is redirected to `/dashboard`**
   - Middleware checks the session and allows access
   - User sees their dashboard

---

## 2. Sign In Flow

### Step-by-Step Process

1. **User visits `/auth/signin`**
   - User sees the signin form with email and password fields
   - If they came from a protected route, the redirect URL is saved in the URL params

2. **User submits the form**
   - Form data: `{ email, password }`

3. **Frontend calls Supabase Auth**
   ```typescript
   supabase.auth.signInWithPassword({
     email: formData.email,
     password: formData.password
   })
   ```
   - Supabase looks up the user in `auth.users` by email
   - Verifies the password hash matches
   - If incorrect: returns error (shown to user)
   - If correct: creates a new session

4. **Supabase creates a session**
   - New JWT token generated
   - Token stored in HTTP-only cookies
   - Session includes user info

5. **User is redirected**
   - To `/dashboard` (default)
   - Or to the original protected route they tried to access (`?redirect=/dashboard`)

---

## 3. Session Management

### How Sessions Work

1. **Session Storage**
   - Sessions are stored in **HTTP-only cookies**
   - Cookies are automatically sent with every request to your domain
   - JavaScript cannot access them (prevents XSS attacks)

2. **Session Refresh (Automatic)**
   - Every request goes through `middleware.ts`
   - Middleware calls `supabase.auth.getUser()` which:
     - Reads the session cookie
     - Checks if it's expired
     - If expired but refresh token is valid: automatically refreshes it
     - If refresh token expired: user needs to sign in again

3. **Session Expiration**
   - Default: 1 hour (configured in `supabase/config.toml`)
   - After 1 hour of inactivity, user is logged out
   - But refresh tokens allow automatic re-login (within a longer window)

### Where Sessions Are Checked

1. **Middleware** (`src/middleware.ts`)
   - Runs on **every request** (before page loads)
   - Refreshes session automatically
   - Protects routes (redirects to signin if not authenticated)

2. **Server Components** (like Dashboard)
   ```typescript
   const supabase = await createClient(); // Server-side client
   const { data: { user } } = await supabase.auth.getUser();
   
   if (!user) {
     redirect("/auth/signin");
   }
   ```
   - Double-checks authentication on protected pages
   - Can access user data from the session

3. **Client Components** (like UserMenu)
   ```typescript
   const supabase = createClient(); // Client-side client
   const { data: { user } } = await supabase.auth.getUser();
   ```
   - Checks if user is logged in for UI purposes
   - Shows "Log ind" button or user menu accordingly

---

## 4. Protected Routes

### How Routes Are Protected

1. **Middleware Protection** (`src/middleware.ts`)
   ```typescript
   if (request.nextUrl.pathname.startsWith("/dashboard")) {
     const { data: { user } } = await supabase.auth.getUser();
     
     if (!user) {
       // Redirect to signin with redirect param
       return NextResponse.redirect("/auth/signin?redirect=/dashboard");
     }
   }
   ```
   - Checks **before** the page loads
   - If not authenticated: redirects to signin
   - Saves where they wanted to go (`redirect` param)

2. **Server Component Protection** (Double-check)
   ```typescript
   // In dashboard/page.tsx
   const { data: { user } } = await supabase.auth.getUser();
   if (!user) {
     redirect("/auth/signin");
   }
   ```
   - Extra safety check in the page itself
   - Ensures even if middleware somehow fails, page is still protected

### What Happens When User Tries to Access Protected Route

1. User types `/dashboard` in browser or clicks link
2. Request hits middleware **before** page loads
3. Middleware checks: "Is there a valid session cookie?"
4. **If no session:**
   - Redirects to `/auth/signin?redirect=/dashboard`
   - User signs in
   - After signin, redirects back to `/dashboard`
5. **If session exists:**
   - Middleware refreshes it if needed
   - Allows request to continue
   - Page loads normally

---

## 5. Sign Out Flow

### Step-by-Step Process

1. **User clicks "Log ud" in UserMenu**
   ```typescript
   await supabase.auth.signOut();
   ```

2. **Supabase clears the session**
   - Deletes the session cookies
   - Invalidates the JWT token

3. **User is redirected to home page**
   - `router.push("/")` - goes to homepage
   - `router.refresh()` - forces page to reload and check auth status

4. **UI updates automatically**
   - Header now shows "Log ind" button instead of user menu
   - Because `UserMenu` component checks auth status and shows appropriate UI

---

## 6. Database Structure

### Tables Involved

1. **`auth.users`** (Managed by Supabase - we never touch this directly)
   - `id` (UUID) - unique user identifier
   - `email` - user's email address
   - `encrypted_password` - hashed password (we never see this)
   - `created_at` - when account was created
   - Other Supabase-managed fields

2. **`user_profiles`** (Our custom table)
   - `id` (UUID) - **references `auth.users.id`** (foreign key)
   - `email` - denormalized for easier queries
   - `full_name` - user's full name
   - `clinic_name` - clinic name (text, not linked to clinics table yet)
   - `created_at`, `updated_at` - timestamps

### Relationship
```
auth.users (1) ────────< (1) user_profiles
    id                          id (references auth.users.id)
```

- One user in `auth.users` = One profile in `user_profiles`
- If user is deleted from `auth.users`, profile is automatically deleted (CASCADE)

### Row Level Security (RLS)

Our `user_profiles` table has RLS enabled:
- **Users can only read/update their own profile**
  - Policy checks: `auth.uid() = id`
  - `auth.uid()` returns the current logged-in user's ID
  - So users can only access records where `id` matches their user ID

---

## 7. Client vs Server Components

### Server Components (Dashboard, etc.)
```typescript
// src/app/utils/supabase/server.ts
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(/* reads from cookies */);
}
```
- Runs on the server
- Can access cookies directly
- Used for initial page loads, data fetching
- More secure (credentials never exposed to browser)

### Client Components (Forms, UserMenu)
```typescript
// src/app/utils/supabase/client.ts
export const createClient = () => {
  return createBrowserClient(/* uses cookies automatically */);
};
```
- Runs in the browser
- Supabase SSR package handles cookie reading/writing automatically
- Used for interactive features (forms, real-time updates)
- Still secure (uses HTTP-only cookies)

---

## 8. Complete Request Flow Example

### User visits `/dashboard` while NOT logged in:

1. **Browser requests `/dashboard`**
2. **Middleware intercepts request**
   - Reads cookies → finds no session
   - Checks route → it's protected (`/dashboard`)
   - Redirects to `/auth/signin?redirect=/dashboard`
3. **User signs in successfully**
   - Supabase creates session → sets cookies
   - Redirects to `/dashboard` (from `redirect` param)
4. **Browser requests `/dashboard` again**
5. **Middleware intercepts again**
   - Reads cookies → finds valid session
   - Refreshes session if needed
   - Allows request to continue
6. **Server renders Dashboard page**
   - Server component calls `createClient()`
   - Gets user from session
   - Fetches user profile from database
   - Renders page with user data
7. **Page loads in browser**
   - Client components (like UserMenu) check auth
   - Show user menu because user is logged in

---

## 9. Security Features

### What Supabase Handles for Us

✅ **Password Hashing** - Passwords are never stored in plain text
✅ **Session Management** - Secure token generation and validation
✅ **Cookie Security** - HTTP-only cookies prevent XSS attacks
✅ **CSRF Protection** - Built into Next.js and Supabase
✅ **Token Expiration** - Sessions expire after 1 hour
✅ **Rate Limiting** - Supabase prevents brute force attacks

### What We Handle

✅ **Row Level Security** - Users can only access their own data
✅ **Route Protection** - Middleware prevents unauthorized access
✅ **Input Validation** - Forms validate required fields
✅ **Error Handling** - User-friendly error messages

---

## 10. Key Files and Their Roles

| File | Purpose |
|------|---------|
| `middleware.ts` | Session refresh, route protection, redirects |
| `supabase/client.ts` | Client-side Supabase client (for browser) |
| `supabase/server.ts` | Server-side Supabase client (for server) |
| `auth/signup/page.tsx` | Signup page |
| `auth/signin/page.tsx` | Signin page |
| `components/auth/SignUpForm.tsx` | Signup form logic |
| `components/auth/SignInForm.tsx` | Signin form logic |
| `components/auth/UserMenu.tsx` | User menu in header |
| `dashboard/page.tsx` | Protected dashboard page |
| `migrations/..._add_user_profiles.sql` | Database schema |

---

## Summary: Authentication Flow Diagram

```
┌─────────────────┐
│  User Signs Up  │
│  /auth/signup   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Supabase Auth   │
│ Creates User    │
│ in auth.users   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Create Profile  │
│ in user_profiles│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Session Created │
│ (HTTP Cookies)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Redirect to     │
│ /dashboard      │
└─────────────────┘
         │
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│ Every Request   │──────▶│ Middleware   │
│                 │      │ Checks Auth  │
└─────────────────┘      └──────┬───────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
            ┌───────────────┐      ┌──────────────┐
            │ Valid Session │      │ No Session   │
            │ Allow Request │      │ Redirect to  │
            └───────────────┘      │ /auth/signin  │
                                   └──────────────┘
```

This is how the complete authentication system works! The key is that Supabase handles all the complex security stuff, while we just need to:
1. Call Supabase functions (signUp, signIn, signOut, getUser)
2. Create/manage our user profiles table
3. Protect routes with middleware
4. Show appropriate UI based on auth status

