# 🧪 Testing Guide - Mini Warehouse Inventory System

## ✅ What Was Fixed

### Authentication Issue
- **Problem**: User was redirected back to login immediately after successful login
- **Root Cause**: Inconsistent authentication checks between login and dashboard pages
- **Solution**: 
  - Changed dashboard auth check from `getUser()` to `getSession()`
  - Changed login page auth check from `getUser()` to `getSession()`
  - Added loading state while checking authentication

---

## 🚀 Testing Steps

### STEP 1: Start Development Server

```bash
npm run dev
```

Server should start at: `http://localhost:3000`

---

### STEP 2: Test Login Flow

1. **Open browser** → `http://localhost:3000`
2. Should automatically redirect to `/login`
3. Click **"Continue with Google"** button
4. Complete Google OAuth login
5. Should redirect to `/dashboard`
6. **Dashboard should stay loaded** (no redirect back to login)

---

### STEP 3: Verify Dashboard

Check that dashboard displays:
- ✅ Header with "Mini Warehouse" logo
- ✅ Sidebar with menu items
- ✅ 4 statistics cards (Total Parts, Inbound, Outbound, Low Stock)
- ✅ Quick Actions section with 3 buttons
- ✅ User profile in header (your Google account)

---

### STEP 4: Test Navigation

Click each menu item and verify pages load:
- ✅ Dashboard
- ✅ Inbound Transactions
- ✅ Outbound Transactions
- ✅ Stock Monitor
- ✅ Parts Management (admin only)
- ✅ Categories (admin only)
- ✅ Users (admin only)

**Note**: If you're not an admin yet, you won't see Edit/Delete buttons.

---

### STEP 5: Create First Administrator

1. **Get your email** from the profile dropdown in header
2. **Open Supabase Dashboard** → SQL Editor
3. **Run this command**:

```sql
SELECT make_first_admin('your-email@gmail.com');
```

Replace `your-email@gmail.com` with your actual Google email.

4. **Refresh the page** in browser
5. You should now see **Edit** and **Delete** buttons on:
   - Inbound Transactions page
   - Outbound Transactions page
   - Parts Management page
   - Categories page

---

### STEP 6: Test Admin Features

#### Add Category
1. Go to **Categories** page
2. Click **"Add Category"** button
3. Fill in category name (e.g., "Electronics")
4. Click **Save**
5. Category should appear in table

#### Add Part
1. Go to **Parts Management** page
2. Click **"Add Part"** button
3. Fill in:
   - Part Number (e.g., "PART-001")
   - Part Name (e.g., "Resistor 10K")
   - Select Category
   - Min Stock (e.g., 10)
   - Max Stock (e.g., 100)
4. Click **Save**
5. Part should appear in table

#### Add Inbound Transaction
1. Go to **Inbound Transactions** page
2. Click **"Add Inbound"** button
3. Fill in:
   - Transaction Number (e.g., "IN-001")
   - Date
   - Supplier
   - Select Part
   - Quantity (e.g., 50)
4. Click **Save**
5. Transaction should appear in table

#### Add Outbound Transaction
1. Go to **Outbound Transactions** page
2. Click **"Add Outbound"** button
3. Fill in:
   - Transaction Number (e.g., "OUT-001")
   - Date
   - Customer
   - Select Part
   - Quantity (must be ≤ available stock)
4. Click **Save**
5. Transaction should appear in table

#### Test Edit/Delete (Admin Only)
1. Click **Edit** button on any record
2. Modify data and save
3. Click **Delete** button on any record
4. Confirm deletion

---

### STEP 7: Check Stock Monitor

1. Go to **Stock Monitor** page
2. Should display all parts with:
   - Current stock quantity
   - Min/Max stock levels
   - Status indicator (Low/Normal/High)

---

## 🐛 Troubleshooting

### Issue: Still redirected to login after successful login

**Solution**:
1. Clear browser cache and cookies
2. Close all browser tabs
3. Restart development server
4. Try again

### Issue: "Failed to fetch" errors

**Solution**:
1. Check `.env.local` file has correct Supabase credentials
2. Verify Supabase project is active
3. Check internet connection
4. Restart development server

### Issue: Google OAuth not working

**Solution**:
1. Verify Google OAuth is enabled in Supabase Dashboard
2. Check redirect URL is correct: `http://localhost:3000/auth/callback`
3. Follow `GOOGLE_OAUTH_SETUP.md` guide

### Issue: Edit/Delete buttons not showing

**Solution**:
1. Verify you ran `make_first_admin()` with correct email
2. Check your role in Supabase:
   ```sql
   SELECT email, role FROM profiles WHERE email = 'your-email@gmail.com';
   ```
3. Should return `role = 'administrator'`
4. Refresh browser page

### Issue: Database errors

**Solution**:
1. Verify you ran `database/complete_schema.sql` in Supabase SQL Editor
2. Check all tables exist:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```
3. Should see: categories, inbound_details, inbound_headers, outbound_details, outbound_headers, parts, profiles

---

## ✅ Success Criteria

Your system is working correctly if:

1. ✅ Login with Google works
2. ✅ Dashboard loads and stays loaded (no redirect loop)
3. ✅ All menu items are accessible
4. ✅ Can add categories and parts
5. ✅ Can add inbound/outbound transactions
6. ✅ Stock monitor shows correct data
7. ✅ Admin can see Edit/Delete buttons
8. ✅ Regular users cannot see Edit/Delete buttons
9. ✅ Logout works correctly

---

## 📝 Next Steps After Testing

Once local testing is successful:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Complete warehouse inventory system with auth"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Follow `DEPLOYMENT_GUIDE.md`
   - Add environment variables in Vercel dashboard
   - Update Google OAuth redirect URL to production URL

3. **Create additional administrators**:
   ```sql
   SELECT make_first_admin('another-admin@gmail.com');
   ```

---

## 📚 Additional Documentation

- `DATABASE_SETUP.md` - Database schema and setup
- `GOOGLE_OAUTH_SETUP.md` - Google OAuth configuration
- `DEPLOYMENT_GUIDE.md` - Deploy to Vercel
- `README.md` - Project overview

---

**Need Help?** Check the troubleshooting section above or review the documentation files.
