# Pre-Testing Improvements

**Date:** November 30, 2025  
**Status:** ✅ Complete

---

## 🎯 **Tasks Completed**

### **Task 1: Check Clinic Name Uniqueness on Claim Submission** ✅

**Problem:** Users could submit claims for clinic names that already exist in the database, violating the unique constraint.

**Solution:** Added validation in `submitClinicClaim()` to check if a clinic with the submitted name already exists.

**File Changed:** `src/app/actions/claim-clinic.ts`

**Changes:**
- Added check before allowing claim submission
- If clinic name exists: Shows error "En klinik med dette navn eksisterer allerede i databasen. Vælg venligst et andet navn."
- Also added duplicate claim prevention (user can't claim same clinic twice)

```typescript
// Check if a clinic with this name already exists in the database
const { data: existingClinic, error: nameCheckError } = await supabase
  .from("clinics")
  .select("clinics_id, klinikNavn")
  .eq("klinikNavn", data.klinik_navn)
  .maybeSingle();

if (existingClinic) {
  return { 
    error: "En klinik med dette navn eksisterer allerede i databasen. Vælg venligst et andet navn." 
  };
}
```

---

### **Task 2: Update Signup Form - Remove Clinic Name, Add Checkbox** ✅

**Problem:** Forcing users to enter a clinic name during signup was too restrictive. Not all users own clinics.

**Solution:** 
- Removed "Kliniknavn" text field
- Added "Ejer du en klinik?" checkbox at the end of the form
- Updated database to store boolean instead of clinic name

**Files Changed:**
1. `src/components/auth/SignUpForm.tsx`
2. `src/app/actions/auth.ts`
3. `supabase/migrations/20250130000000_change_clinic_name_to_owns_clinic.sql`

**Changes:**

**SignUpForm.tsx:**
- Removed `clinicName` field from form
- Added `ownsClinic` boolean checkbox
- Updated form validation (removed `validateClinicName`)
- Added Checkbox component import

**Before:**
```tsx
<Label htmlFor="clinicName">Kliniknavn</Label>
<Input
  id="clinicName"
  name="clinicName"
  required
  ...
/>
```

**After:**
```tsx
<div className="flex items-center space-x-2 pt-2">
  <Checkbox
    id="ownsClinic"
    checked={formData.ownsClinic}
    onCheckedChange={handleCheckboxChange}
  />
  <Label htmlFor="ownsClinic" className="text-sm font-normal cursor-pointer">
    Ejer du en klinik?
  </Label>
</div>
```

**auth.ts:**
- Updated `createUserProfile()` to accept `owns_clinic: boolean` instead of `clinic_name: string`

**Database Migration:**
- Added `owns_clinic BOOLEAN DEFAULT false` column
- Migrated existing data (set true if clinic_name was not empty)
- Dropped `clinic_name` column
- Made `owns_clinic` NOT NULL with default false

---

### **Task 3: Update Header When Logged In** ✅

**Problem:** Header showed "Find fysioterapeut" and "For klinikker" buttons even when logged in, which was unnecessary.

**Solution:** 
- Header now detects auth state
- When logged in: Only shows "Dashboard" link
- When logged out: Shows original buttons

**File Changed:** `src/components/layout/Header.tsx`

**Changes:**

**Added Auth State Detection:**
```tsx
const [isLoggedIn, setIsLoggedIn] = useState(false);

useEffect(() => {
  const checkAuth = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    setIsLoggedIn(!!user);
  };

  checkAuth();

  // Listen for auth changes
  const supabase = createClient();
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    setIsLoggedIn(!!session?.user);
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

**Desktop Navigation (Before):**
```tsx
<Button asChild>
  <Link href="/find/fysioterapeut/danmark">Find fysioterapeut</Link>
</Button>
<Button asChild variant="outline">
  <Link href="/tilmeld">For klinikker</Link>
</Button>
<UserMenu />
```

**Desktop Navigation (After):**
```tsx
{isLoggedIn ? (
  <>
    <Link href="/dashboard">Dashboard</Link>
    <UserMenu />
  </>
) : (
  <>
    <Button asChild>
      <Link href="/find/fysioterapeut/danmark">Find fysioterapeut</Link>
    </Button>
    <Button asChild variant="outline">
      <Link href="/tilmeld">For klinikker</Link>
    </Button>
    <UserMenu />
  </>
)}
```

**Mobile Navigation:** Updated with same conditional logic

---

## 📋 **Files Changed Summary**

| File | Change Type | Description |
|------|-------------|-------------|
| `src/app/actions/claim-clinic.ts` | Modified | Added clinic name uniqueness check |
| `src/components/auth/SignUpForm.tsx` | Modified | Removed clinic name field, added checkbox |
| `src/app/actions/auth.ts` | Modified | Changed profile creation to use `owns_clinic` |
| `src/components/layout/Header.tsx` | Modified | Conditional navigation based on auth state |
| `supabase/migrations/20250130000000_change_clinic_name_to_owns_clinic.sql` | Created | Database schema update |

---

## 🧪 **Testing Checklist Updates**

These changes affect the following test cases in Phase 6:

### **Priority 1 Tests to Update:**

**1. Signup Flow:**
- ✅ Update: "Valid Signup" - Now expects checkbox instead of clinic name field
- ✅ Update: Remove "clinicName" validation tests
- ✅ Add: Test "Ejer du en klinik?" checkbox (check/uncheck)

**2. Database Tests:**
- ✅ Update: Check `user_profiles` table has `owns_clinic` boolean instead of `clinic_name` text

### **Priority 2 Tests to Update:**

**3. Header Navigation:**
- ✅ Add: Test logged-in header shows only "Dashboard" link
- ✅ Add: Test logged-out header shows "Find fysioterapeut" and "For klinikker"
- ✅ Add: Test header updates when user logs in/out

**4. Clinic Claims:**
- ✅ Add: Test claim rejected if clinic name already exists
- ✅ Add: Test user cannot submit duplicate claims

---

## 🚀 **Next Steps**

1. **Run Migration:**
   ```bash
   supabase db push
   # Or if using Supabase CLI locally:
   supabase migration up
   ```

2. **Test Changes:**
   - Sign up new user with checkbox
   - Check header changes when logging in/out
   - Try to claim clinic with duplicate name

3. **Proceed with Phase 6 Testing**
   - Use updated testing checklist
   - Focus on affected areas first

---

## ⚠️ **Important Notes**

### **Breaking Changes:**
- **Database Schema Change:** The `user_profiles` table no longer has `clinic_name` column
- **Existing Users:** Migration will set `owns_clinic = true` for users who had a clinic name, `false` for others
- **Signup Flow:** Users are no longer required to provide clinic name upfront

### **Migration Safety:**
- Migration handles existing data gracefully
- No data loss - existing clinic names are converted to boolean
- Reversible if needed (would need to create rollback migration)

---

**Summary Created:** November 30, 2025  
**All Tasks:** ✅ Complete  
**Ready For:** Phase 6 Testing

