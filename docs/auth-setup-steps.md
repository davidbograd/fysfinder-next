# Authentication Setup Steps

Follow these steps to get authentication working:

## ✅ Step 1: Apply Database Migration

The migration creates the `user_profiles` table. Run:

```bash
# If using local Supabase
supabase migration up

# Or if you want to reset and apply all migrations
supabase db reset
```

**What this does:**
- Creates the `user_profiles` table
- Sets up Row Level Security (RLS) policies
- Creates policies so users can only see/edit their own profile

---

## ✅ Step 2: Verify Environment Variables

Make sure you have these in your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**To get your anon key (if using local Supabase):**
```bash
# Start Supabase locally if not running
supabase start

# The anon key will be shown in the output
# Or get it from: http://127.0.0.1:54323 (Supabase Studio)
# Go to Settings → API → anon/public key
```

---

## ✅ Step 3: Start Supabase (if not already running)

```bash
supabase start
```

This should show you:
- Local Supabase URL (usually `http://127.0.0.1:54321`)
- Anon key
- Database connection info

---

## ✅ Step 4: Start Your Next.js App

```bash
npm run dev
```

---

## ✅ Step 5: Test It!

1. **Visit signup page:** http://localhost:3000/auth/signup
   - Fill out the form
   - Click "Opret konto"
   - Should redirect to `/dashboard`

2. **Check your user in Supabase Studio:**
   - Go to http://127.0.0.1:54323
   - Navigate to **Authentication → Users**
   - You should see your new user
   - Navigate to **Table Editor → user_profiles**
   - You should see your profile with full_name and clinic_name

3. **Test signin:**
   - Sign out (click user menu → "Log ud")
   - Go to http://localhost:3000/auth/signin
   - Sign in with your credentials
   - Should redirect to `/dashboard`

4. **Test protected route:**
   - Sign out
   - Try to visit http://localhost:3000/dashboard directly
   - Should redirect to `/auth/signin?redirect=/dashboard`

---

## 🔍 Troubleshooting

### Migration fails?
```bash
# Check migration status
supabase migration list

# If needed, reset database (⚠️ deletes all data)
supabase db reset
```

### "Missing environment variables?
- Check `.env.local` file exists
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Restart your Next.js dev server after adding env vars

### Can't see user_profiles table?
- Make sure migration ran successfully
- Check Supabase Studio → Table Editor
- Try `supabase migration up` again

### Auth works but profile isn't created?
- Check browser console for errors
- Check Supabase Studio → Table Editor → user_profiles
- Verify RLS policies are applied (should be automatic from migration)

### Session not persisting?
- Clear browser cookies and try again
- Check that middleware is running (check Network tab for requests)
- Verify Supabase is running (`supabase status`)

---

## 📋 Quick Checklist

- [ ] Migration applied (`supabase migration up`)
- [ ] Environment variables set in `.env.local`
- [ ] Supabase running locally (`supabase start`)
- [ ] Next.js dev server running (`npm run dev`)
- [ ] Tested signup flow
- [ ] Tested signin flow
- [ ] Tested protected route (dashboard)
- [ ] Tested signout

---

## 🎉 That's It!

Once these steps are complete, your authentication system should be fully functional!

If you run into any issues, check the troubleshooting section above or let me know.

