# Phase 6: Comprehensive Testing Checklist

**Instructions:** Test each item below manually. Check off ✅ when complete.

**Testing is organized by priority:**
- **🔴 PRIORITY 1: CRITICAL** - Core security and authentication (must test first)
- **🟡 PRIORITY 2: IMPORTANT** - Key features and workflows (test after P1)
- **🟢 PRIORITY 3: NICE-TO-HAVE** - Polish and edge cases (test when time permits)

---

# 🔴 PRIORITY 1: CRITICAL TESTS

**These must pass before shipping. Test these first.**

---

## 🔐 **1.1 Basic Authentication**

### **Signup Flow**

- [x] **Valid Signup**
  1. Go to http://localhost:3000/auth/signup
  2. Enter: Name, Clinic, Email, Password (8+ chars)
  3. Click "Opret konto"
  4. ✅ Should redirect to `/dashboard`
  5. ✅ Should show success toast

- [x] **Duplicate Email**
  1. Try to sign up with same email again
  2. ✅ Should show error: "Denne email er allerede i brug..."
  3. ✅ Email field should have red border

- [x] **Weak Password**
  1. Try password with only 5 characters
  2. ✅ Should show: "Adgangskoden skal være mindst 8 tegn"
  3. ✅ Password field should have red border

- [x] **Invalid Email**
  1. Try email without @ symbol
  2. ✅ Should show: "Ugyldig email-adresse"
  3. ✅ Email field should have red border

---

### **Signin Flow**

- [x] **Valid Signin**
  1. Go to http://localhost:3000/auth/signin
  2. Enter correct email & password
  3. Click "Log ind"
  4. ✅ Should redirect to `/dashboard`
  5. ✅ Should show success toast

- [x] **Wrong Password**
  1. Enter correct email, wrong password
  2. ✅ Should show: "Forkert email eller adgangskode"

- [x] **Wrong Email**
  1. Enter non-existent email
  2. ✅ Should show: "Forkert email eller adgangskode"
  3. ✅ Same message (don't reveal which is wrong)

---

### **Session Persistence**

- [x] **Browser Refresh**
  1. Sign in
  2. Go to dashboard
  3. Refresh page (F5 or Cmd+R)
  4. ✅ Should stay logged in

- [x] **Multiple Tabs**
  1. Sign in on Tab 1
  2. Open Tab 2 → Go to dashboard
  3. ✅ Should be logged in on both tabs
  4. Sign out on Tab 1
  5. Refresh Tab 2
  6. ✅ Tab 2 should also be logged out

---

### **Signout**

- [x] **Basic Signout**
  1. Click user menu (top right)
  2. Click "Log ud"
  3. ✅ Should redirect to homepage
  4. Try to access `/dashboard`
  5. ✅ Should redirect to `/auth/signin?redirect=/dashboard`

---

## 🛡️ **1.2 Protected Routes & Authorization**

### **Dashboard Protection**

- [x] **Not Logged In**
  1. Sign out
  2. Try to visit `/dashboard`
  3. ✅ Should redirect to `/auth/signin?redirect=/dashboard`
  4. After signin
  5. ✅ Should redirect back to `/dashboard`

- [x] **Admin Routes (Non-Admin)**
  1. Sign in as regular user (non-admin email)
  2. Try to visit `/dashboard/admin/clinics`
  3. ✅ Should redirect to `/dashboard`
  4. ✅ Should NOT see admin sections on dashboard

- [x] **Admin Routes (Admin)**
  1. Sign in as admin (email in ADMIN_EMAILS)
  2. Visit `/dashboard`
  3. ✅ Should see purple admin banner
  4. ✅ Should see admin stats section
  5. Visit `/dashboard/admin/clinics`
  6. ✅ Should work and show clinics list

---

### **Owner Can Only Edit Own Clinics**

- [x] **Cannot Access Others' Clinics**
  1. Sign in as User A (with owned clinic)
  2. Copy clinic ID of clinic you don't own
  3. Try to visit `/dashboard/clinic/[other-clinic-id]/edit`
  4. ✅ Should show error or redirect
  5. ✅ Should NOT be able to edit

- [] **Admin Can Edit Any Clinic**
  1. Sign in as admin
  2. Go to `/dashboard/admin/clinics`
  3. Click "Rediger" on any clinic
  4. ✅ Should be able to edit

---

## 🔐 **1.3 Security Testing**

### **Cannot Inject SQL**

- [ ] Try entering SQL in clinic search: `'; DROP TABLE clinics; --`
  - ✅ Should just search for that text (parameterized queries)

---

### **Cannot Execute XSS**

- [ ] Try entering script in clinic name: `<script>alert('xss')</script>`
  - ✅ Should display as text, not execute (React escapes)

---

### **Service Role Protected**

- [ ] Open browser devtools
- [ ] Check Network tab for API calls
- [ ] ✅ SUPABASE_SERVICE_ROLE_KEY should NEVER appear in responses
- [ ] ✅ Should only see NEXT_PUBLIC_* keys

---

### **RLS Policies Work**

- [ ] **User Profiles:**
  - Sign in as User A
  - Use Supabase client to try reading User B's profile
  - ✅ Should fail (RLS blocks)

- [ ] **Clinic Owners:**
  - Try to insert yourself as owner of random clinic
  - ✅ Should fail (no INSERT policy)

- [ ] **Clinics:**
  - Try to update clinic you don't own
  - ✅ Should fail (RLS blocks)

---

## 🏥 **1.4 Basic Clinic Management**

### **Claiming a Clinic**

- [x] **Submit Claim (User)**
  1. Sign in as regular user
  2. Go to `/dashboard/claim`
  3. Search for a clinic
  4. Fill out claim form (name, job title, email, phone)
  5. Click submit
  6. ✅ Should show success message
  7. Go to dashboard → scroll to "Your Claims"
  8. ✅ Should see your claim with "Pending" status

- [ ] **View Own Claims Only**
  1. User A creates claim
  2. Sign in as User B
  3. Check "Your Claims" section
  4. ✅ User B should NOT see User A's claim

---

### **Approving Claims (Admin)**

- [x] **Approve Claim**
  1. Sign in as admin
  2. Go to dashboard → "Ventende anmodninger"
  3. Click "Godkend anmodning" on a claim
  4. ✅ Should show loading state
  5. ✅ Should show success toast
  6. ✅ Claim should disappear from pending list

- [x] **Reject Claim**
  1. Click "Afvis anmodning"
  2. ✅ Should show confirmation dialog
  3. Confirm rejection
  4. ✅ Should show success toast
  5. ✅ Claim should disappear

---

### **Editing Owned Clinic**

- [x] **Access Own Clinic**
  1. Sign in as clinic owner
  2. Go to dashboard
  3. Under "Dine klinikker"
  4. ✅ Should see your clinic(s)
  5. Click "Rediger"
  6. ✅ Should go to `/dashboard/clinic/[id]/edit`

- [x **Update Clinic Info**
  1. Change clinic address
  2. Change phone number
  3. Click "Gem ændringer"
  4. ✅ Should show success toast

---

## 📝 **1.5 Data Integrity**

### **Database Constraints**

- [ ] **Foreign Keys**
  1. Check you can't create orphaned records
  2. Delete a user → Associated claims/ownerships cascade
  3. ✅ Data integrity maintained

- [ ] **NOT NULL Constraints**
  1. Try to create profile without name
  2. ✅ Should fail validation

---

**🔴 Priority 1 Complete When:**
- [ ] All P1 tests pass ✅
- [ ] No critical security issues
- [ ] Auth flows work correctly
- [ ] Basic features functional

---

---

# 🟡 PRIORITY 2: IMPORTANT TESTS

**Test these after P1 passes. Important workflows and features.**

---

## 📧 **2.1 Email Verification**

### **Verification Banner**

- [ ] **Banner Shows When Unverified**
  1. Sign up new user
  2. Check dashboard
  3. ✅ Yellow banner should show at top
  4. ✅ Shows your email address
  5. ✅ Has "Send email igen" button
  6. ✅ Has dismiss (X) button

- [ ] **Dismiss Banner**
  1. Click X to dismiss
  2. ✅ Banner disappears
  3. Refresh page
  4. ✅ Banner shows again (not permanently dismissed)

- [ ] **Resend Email**
  1. Click "Send email igen"
  2. ✅ Should show loading state
  3. ✅ Should show toast: "Email sendt"

- [ ] **Already Verified**
  1. Try to resend verification email
  2. ✅ Should show error: "Email er allerede verificeret"

---

## 🔑 **2.2 Password Reset**

### **Request Reset**

- [ ] **Valid Email**
  1. Go to `/auth/signin`
  2. Click "Glemt adgangskode?"
  3. Enter your email
  4. Click "Send nulstillingslink"
  5. ✅ Should show success screen
  6. ✅ Should show: "Tjek din email"

- [ ] **Invalid Email Format**
  1. Enter "notanemail"
  2. Try to submit
  3. ✅ Should show validation error
  4. ✅ Email field should have red border

- [ ] **Email for Non-Existent User**
  1. Enter email that doesn't exist
  2. ✅ Should still show success (security: don't reveal if email exists)

---

### **Update Password**

- [ ] **Click Reset Link** (requires email)
  1. Click link in reset email
  2. ✅ Should go to `/auth/update-password`
  3. ✅ Should see password fields

- [ ] **Weak Password**
  1. Enter password with 5 characters
  2. Try to submit
  3. ✅ Should show: "Adgangskoden skal være mindst 8 tegn"

- [ ] **Passwords Don't Match**
  1. Enter different passwords in two fields
  2. Try to submit
  3. ✅ Should show: "Adgangskoderne matcher ikke"
  4. ✅ Confirm password field should have red border

- [ ] **Valid Password Update**
  1. Enter matching passwords (8+ chars)
  2. Click "Opdater adgangskode"
  3. ✅ Should show success screen with checkmark
  4. ✅ Should auto-redirect to dashboard (2 sec)

- [ ] **Test New Password**
  1. Sign out
  2. Try to sign in with old password
  3. ✅ Should fail
  4. Sign in with new password
  5. ✅ Should work

---

## 📊 **2.3 Admin Dashboard Features**

### **Admin Banner**

- [ ] **Shows for Admin**
  1. Sign in as admin
  2. ✅ Purple gradient banner should show
  3. ✅ Shows "ADMINISTRATOR"
  4. ✅ Shows shield icon

- [ ] **Doesn't Show for Regular Users**
  1. Sign in as non-admin
  2. ✅ No admin banner should appear

---

### **Admin Statistics**

- [ ] **Stats Load Correctly**
  1. Sign in as admin
  2. Check "Verificerede klinikker" card
  3. ✅ Number should match database count
  4. Check "Betalte abonnementer" card
  5. ✅ Should show premium count

- [ ] **"Se klinikker" Button**
  1. Click "Se klinikker"
  2. ✅ Should go to `/dashboard/admin/clinics`
  3. ✅ Should show total count
  4. ✅ Should load clinics list

---

### **Verified Clinics Page**

- [ ] **Page Loads**
  1. Visit `/dashboard/admin/clinics`
  2. ✅ Should show spinner while loading
  3. ✅ Should show total count (e.g., "1918 Verificerede klinikker")
  4. ✅ Should show first 20 clinics

- [ ] **Clinic Cards**
  1. Each clinic should show:
     - ✅ Clinic name
     - ✅ Green "Verificeret" badge
     - ✅ Address
     - ✅ Email (clickable mailto)
     - ✅ Phone (clickable tel)
     - ✅ Last updated date

- [ ] **Load More**
  1. If you have 20+ verified clinics
  2. ✅ "Indlæs flere" button should appear
  3. Click it
  4. ✅ Should show spinner on button
  5. ✅ Should load next 20 clinics
  6. ✅ Total count stays the same

- [ ] **Back Button**
  1. Click "Tilbage til Dashboard"
  2. ✅ Should return to `/dashboard`

---

## 🏪 **2.4 Clinic Ownership Workflow**

### **End-to-End Claim Process**

- [ ] **Step 1: User Claims**
  1. User signs up
  2. Goes to `/dashboard/claim`
  3. Searches for clinic
  4. Fills out form completely
  5. Submits
  6. ✅ Shows in "Your Claims" as pending

- [ ] **Step 2: Admin Reviews**
  1. Admin logs in
  2. Sees claim in "Ventende anmodninger"
  3. Reviews information
  4. ✅ Can see clinic details
  5. ✅ Can see requester details

- [ ] **Step 3: Admin Approves**
  1. Admin clicks "Godkend anmodning"
  2. ✅ Shows loading state
  3. ✅ Claim disappears from pending
  4. ✅ User becomes owner

- [ ] **Step 4: User Has Access**
  1. User refreshes dashboard
  2. ✅ Clinic now appears in "Dine klinikker"
  3. ✅ Claim shows "Approved" status
  4. Click "Rediger" on clinic
  5. ✅ Can now edit clinic

- [ ] **Step 5: Verify Database Changes**
  1. Check Supabase Studio after approval
  2. `clinic_claims` → status should be "approved"
  3. `clinic_owners` → new row should exist
  4. `clinics` → `verified_klinik` should be true

---

## 🎨 **2.5 UI/UX Testing**

### **Loading States**

- [ ] Dashboard stats
  - ✅ Shows spinner while loading (not just text)

- [ ] Verified clinics page
  - ✅ Shows spinner while loading

- [ ] Admin claims section
  - ✅ Shows spinner while loading

- [ ] "Load More" button
  - ✅ Shows spinner + "Indlæser..." when loading

---

### **Error States**

- [ ] Invalid data
  - ✅ Shows inline validation errors
  - ✅ Fields have red borders

- [ ] Server error (if you can trigger)
  - ✅ Shows toast notification
  - ✅ Doesn't crash the app

---

### **Empty States**

- [ ] No clinics owned
  - ✅ Shows helpful message + CTA

- [ ] No pending claims (admin)
  - ✅ Shows "Alle anmodninger er blevet behandlet"

---

## 🏥 **2.6 Extended Clinic Features**

- [ ] **Cannot Claim Verified Clinic**
  1. Try to claim a clinic that's already verified
  2. ✅ Should show error: "Denne klinik er allerede verificeret"

- [ ] **Update Specialties**
  1. Select up to 10 specialties
  2. Save
  3. ✅ Should succeed
  4. Try to select 11 specialties
  5. ✅ Should show error: "Maksimum 10 specialiteter"

- [ ] **Profile Created in Database**
  1. After signup, check Supabase Studio
  2. Go to Table Editor → `user_profiles`
  3. ✅ Should see new row with your data

---

**🟡 Priority 2 Complete When:**
- [ ] All P2 tests pass ✅
- [ ] Email flows work
- [ ] Password reset works
- [ ] Admin features functional
- [ ] UI/UX polished

---

---

# 🟢 PRIORITY 3: NICE-TO-HAVE TESTS

**Test these when time permits. Polish and cross-platform compatibility.**

---

## 📱 **3.1 Responsive Design**

### **Desktop (1920x1080)**

- [ ] Signup page looks good
- [ ] Signin page looks good
- [ ] Dashboard layout proper
- [ ] Admin sections visible
- [ ] Forms are usable
- [ ] Buttons not cut off

---

### **Tablet (768x1024)**

- [ ] Navigation menu works
- [ ] Forms are readable
- [ ] Stats cards stack properly
- [ ] Clinic cards readable
- [ ] Buttons accessible

---

### **Mobile (375x667 - iPhone SE)**

- [ ] Header menu works
- [ ] Forms fit on screen
- [ ] Inputs not hidden by keyboard
- [ ] Buttons are tappable (not too small)
- [ ] Verification banner readable
- [ ] Admin banner readable
- [ ] Clinic cards stack properly

---

## 🌐 **3.2 Cross-Browser Testing**

### **Chrome**

- [ ] Signup works
- [ ] Signin works
- [ ] Dashboard loads
- [ ] Email verification works
- [ ] Password reset works

---

### **Firefox**

- [ ] Signup works
- [ ] Signin works
- [ ] Dashboard loads
- [ ] Forms functional

---

### **Safari**

- [ ] Signup works
- [ ] Signin works
- [ ] Dashboard loads
- [ ] Forms functional
- [ ] No layout issues

---

## 🔄 **3.3 Email Flows**

### **Verification Email**

- [ ] **Email Received**
  1. Sign up new user
  2. Check inbox
  3. ✅ Verification email received
  4. ✅ From correct sender
  5. ✅ Contains verification link

- [ ] **Verification Link Works**
  1. Click link in email
  2. ✅ Redirects to your site
  3. ✅ Email gets verified
  4. ✅ Banner disappears on dashboard

- [ ] **Resend Works**
  1. Click "Send email igen" on banner
  2. ✅ New email received
  3. ✅ New link works

---

### **Password Reset Email**

- [ ] **Email Received**
  1. Request password reset
  2. Check inbox
  3. ✅ Reset email received
  4. ✅ From correct sender
  5. ✅ Contains reset link

- [ ] **Reset Link Works**
  1. Click link in email
  2. ✅ Goes to `/auth/update-password`
  3. ✅ Can set new password
  4. ✅ Redirects to dashboard

- [ ] **Old Link Expires**
  1. Reset password → Get email
  2. Complete reset → Password changed
  3. Try to use same link again
  4. ✅ Should be invalid/expired

---

## 🎯 **3.4 Edge Cases**

- [ ] **Simultaneous Admin Actions**
  - Two admins approve same claim at once
  - ✅ One succeeds, other shows "already processed"

- [ ] **Close & Reopen Browser**
  1. Sign in
  2. Close browser completely
  3. Reopen and go to dashboard
  4. ✅ Should still be logged in

- [ ] **Very Long Clinic Name**
  - Enter 500 character clinic name
  - ✅ Either truncates or shows validation error

- [ ] **Special Characters**
  - Clinic name with: `Æ Ø Å & / \ " '`
  - ✅ Saves and displays correctly

- [ ] **Network Error Testing**
  - Turn off wifi during form submission
  - ✅ Shows appropriate error message

- [ ] **Empty Form Fields**
  1. Leave various fields empty on signup
  2. ✅ Shows validation for all required fields

- [ ] **Unique Constraint on Clinic Names**
  1. Try to create clinic with duplicate name
  2. ✅ Should be prevented by database

---

**🟢 Priority 3 Complete When:**
- [ ] All P3 tests pass ✅
- [ ] Works on all browsers
- [ ] Responsive on all devices
- [ ] Edge cases handled

---

---

# ✅ **OVERALL TESTING COMPLETE**

## **Phase 6 is complete when:**

### **🔴 Priority 1 (MUST PASS):**
- [ ] All P1 critical tests pass ✅
- [ ] No security vulnerabilities
- [ ] Authentication works correctly
- [ ] Protected routes secure
- [ ] Basic features functional

### **🟡 Priority 2 (SHOULD PASS):**
- [ ] All P2 important tests pass ✅
- [ ] Email verification works
- [ ] Password reset works
- [ ] Admin dashboard functional
- [ ] UI/UX polished

### **🟢 Priority 3 (NICE TO PASS):**
- [ ] All P3 nice-to-have tests pass ✅
- [ ] Cross-browser compatible
- [ ] Responsive design works
- [ ] Edge cases handled

---

## 📊 **Bug Tracking Template**

When you find a bug, document it like this:

```
Bug #1: [Title]
- Severity: Critical/High/Medium/Low
- Priority: P1/P2/P3
- Steps to reproduce: 
  1. ...
  2. ...
- Expected: ...
- Actual: ...
- Screenshot: (if relevant)
- Status: Found / Fixed / Verified
```

---

## 🎉 **After Testing**

### **Minimum for Launch:**
- ✅ All Priority 1 tests pass (critical)
- ✅ No critical or high-severity bugs

### **Recommended for Launch:**
- ✅ All Priority 1 tests pass
- ✅ All Priority 2 tests pass
- ⚪ Priority 3 can be done post-launch

### **Once Testing Complete:**
1. Document any unfixed bugs (with priority)
2. Decide if any bugs are blocking launch
3. Ready for Phase 7 (Staging) if P1 + P2 pass!

---

**Test Summary:**
- 🔴 **Priority 1:** ~40 critical tests (~45 minutes)
- 🟡 **Priority 2:** ~50 important tests (~1 hour)
- 🟢 **Priority 3:** ~30 nice-to-have tests (~45 minutes)
- **Total:** ~120 test cases (~2.5 hours thorough testing)

**Good luck with testing! 🚀**
