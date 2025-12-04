# Admin Dashboard Setup

The admin dashboard provides statistics and management tools for clinic administrators.

## Features

### 1. **Admin Statistics Section**
Displays key metrics for administrators:
- **Total Verified Clinics**: Count of all clinics with `verified_klinik = true`
- **Paid Subscriptions**: Count of clinics with active premium listings
- **Recent Verified Clinics**: List of the 10 most recently verified clinics with "Load More" functionality

### 2. **Clinic List Display**
Each clinic in the list shows:
- Clinic name with verification badge
- Full address (street, postal code, city)
- Contact information (email, phone)
- Verified by email
- Last updated date
- Quick action buttons:
  - External link to clinic website
  - Edit button to manage clinic details

---

## Environment Variables Required

Make sure you have these environment variables set in your `.env.local` file:

```bash
# Public Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Admin Configuration (Required for admin dashboard)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

### Getting Your Service Role Key

**For Local Development (Supabase CLI):**
```bash
# Start Supabase
supabase start

# The service role key will be shown in the output
# Or get it from: http://127.0.0.1:54323 (Supabase Studio)
# Go to Settings → API → service_role key
```

**For Production (Supabase Cloud):**
1. Go to your project on https://supabase.com
2. Navigate to Settings → API
3. Copy the `service_role` key (⚠️ Keep this secret!)

### Setting Admin Emails

Add comma-separated admin emails to the `ADMIN_EMAILS` environment variable:

```bash
ADMIN_EMAILS=admin@fysfinder.dk,david@fysfinder.dk
```

Users with these email addresses will see:
- Admin Statistics Section
- Admin Claims Section (for approving clinic claims)
- Additional management tools

---

## File Structure

```
src/
├── app/
│   ├── actions/
│   │   └── admin-stats.ts          # Server actions for fetching admin statistics
│   └── dashboard/
│       └── page.tsx                # Main dashboard page (includes admin sections)
├── components/
│   └── dashboard/
│       └── AdminStatsSection.tsx   # Admin statistics component
└── lib/
    └── admin.ts                    # Admin utility functions (email checking)
```

---

## How It Works

### 1. **Admin Detection**
The system checks if a user is an admin by comparing their email against the `ADMIN_EMAILS` environment variable:

```typescript
import { isAdminEmail } from "@/lib/admin";

const isAdmin = isAdminEmail(user.email);
```

### 2. **Server Actions**
Two main server actions power the admin dashboard:

**`getClinicStats()`**
- Fetches total count of verified clinics
- Fetches count of clinics with active premium subscriptions
- Uses service role client to bypass RLS

**`getVerifiedClinics(limit, offset)`**
- Fetches paginated list of verified clinics
- Ordered by `updated_at` (newest first)
- Supports "Load More" pagination

### 3. **Row Level Security (RLS) Bypass**
Admin actions use the service role key to bypass RLS policies:

```typescript
const serviceSupabase = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

⚠️ **Security Note**: Always verify the user is an admin BEFORE using the service role client!

---

## Testing the Admin Dashboard

### 1. **Set Up Admin Access**
Add your email to `.env.local`:
```bash
ADMIN_EMAILS=your-email@example.com
```

### 2. **Restart Your Dev Server**
```bash
# Stop the server (Ctrl+C)
npm run dev
```

### 3. **Sign In**
1. Go to http://localhost:3000/auth/signin
2. Sign in with an admin email
3. You should be redirected to `/dashboard`

### 4. **Verify Admin Sections Appear**
You should see:
- **Admin Statistics Section** (at the top)
  - Two stat cards: Verified Clinics & Paid Subscriptions
  - List of recent verified clinics
  - "Load More" button if there are more than 10 clinics
- **Admin Claims Section** (below stats)
  - Pending clinic ownership claims

### 5. **Test Load More**
If you have more than 10 verified clinics:
- Click "Indlæs flere" (Load More)
- Should load the next 10 clinics
- Button should disappear when no more clinics are available

---

## Troubleshooting

### Admin sections not showing?
- Check `ADMIN_EMAILS` is set in `.env.local`
- Verify your email matches exactly (case-insensitive)
- Restart your dev server after changing env vars

### Service role errors?
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check the key is correct (from Supabase dashboard)
- Make sure you're using the service_role key, not the anon key

### No clinics showing?
- Check if you have any verified clinics: `verified_klinik = true`
- Verify the clinics table has data
- Check browser console for errors

### Stats showing 0 but clinics exist?
- Check the query in `admin-stats.ts`
- Verify RLS policies aren't blocking the service role (they shouldn't)
- Check Supabase logs for errors

---

## Security Considerations

⚠️ **Important Security Notes:**

1. **Never expose service role key to client**: The service role key is only used in server actions
2. **Always verify admin status**: Check `isAdminEmail()` before using service role
3. **Keep admin emails private**: Don't commit `.env.local` to git
4. **Rotate keys if exposed**: If service role key is leaked, rotate it immediately in Supabase dashboard

---

## Future Enhancements

Potential improvements for the admin dashboard:

- [ ] Search/filter clinics by name, location, or email
- [ ] Export clinic data to CSV
- [ ] Bulk actions (verify multiple, delete, etc.)
- [ ] Analytics charts and graphs
- [ ] Subscription management interface
- [ ] Activity logs and audit trail
- [ ] Email notifications for new claims
- [ ] Admin user management (add/remove admins)

---

## Support

If you encounter any issues with the admin dashboard:
1. Check the troubleshooting section above
2. Review the browser console for errors
3. Check Supabase logs in the dashboard
4. Review the implementation in the files listed in the File Structure section

