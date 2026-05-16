# 🗄️ Database Setup Guide

## 📋 STEP 1: Run SQL Script

1. **Login ke Supabase Dashboard:**
   - Go to https://supabase.com/dashboard
   - Pilih project Anda

2. **Open SQL Editor:**
   - Click **"SQL Editor"** di sidebar
   - Click **"New query"**

3. **Copy & Paste SQL:**
   - Open file: `database/complete_schema.sql`
   - Copy semua content
   - Paste ke SQL Editor

4. **Run SQL:**
   - Click **"Run"** atau tekan `Ctrl + Enter`
   - Wait sampai selesai (biasanya 5-10 detik)
   - Check output: harus ada "Success" messages

---

## ✅ STEP 2: Verify Tables Created

Di SQL Editor, run query ini untuk verify:

```sql
-- Check all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected tables:**
- ✅ profiles
- ✅ categories
- ✅ parts
- ✅ inbound_headers
- ✅ inbound_details
- ✅ outbound_headers
- ✅ outbound_details

---

## 👤 STEP 3: Create First Administrator

1. **Login ke aplikasi** dengan Google account Anda
2. **Setup username** (jika diminta)
3. **Kembali ke Supabase SQL Editor**
4. **Run command ini:**

```sql
SELECT make_first_admin('your-email@gmail.com');
```

**Ganti `your-email@gmail.com` dengan email Google Anda!**

Example:
```sql
SELECT make_first_admin('herruristian@gmail.com');
```

5. **Verify:**

```sql
SELECT email, username, role 
FROM profiles 
WHERE role = 'administrator';
```

Harus muncul email Anda dengan role = 'administrator'

---

## 🔄 STEP 4: Refresh Aplikasi

1. **Logout** dari aplikasi
2. **Login** lagi dengan Google account yang sama
3. **Verify** menu admin muncul:
   - Parts Management
   - Categories
   - User Management

---

## 🎯 What This SQL Does:

### Creates Tables:
- ✅ **profiles** - User data dengan role system
- ✅ **categories** - Product categories
- ✅ **parts** - Parts/products master data
- ✅ **inbound_headers** - Inbound transaction headers
- ✅ **inbound_details** - Inbound transaction details
- ✅ **outbound_headers** - Outbound transaction headers
- ✅ **outbound_details** - Outbound transaction details

### Creates Functions:
- ✅ **handle_new_user()** - Auto create profile saat signup
- ✅ **is_administrator()** - Check if user is admin
- ✅ **make_first_admin()** - Make user administrator
- ✅ **validate_outbound_stock()** - Prevent negative stock

### Creates Triggers:
- ✅ **on_auth_user_created** - Auto create profile
- ✅ **validate_outbound_stock_trigger** - Stock validation

### Creates RLS Policies:
- ✅ **View policies** - Everyone can view data
- ✅ **Insert policies** - Authenticated users can add
- ✅ **Update policies** - Only administrators can edit
- ✅ **Delete policies** - Only administrators can delete

---

## 🐛 Troubleshooting

### Error: "relation already exists"

**Solution:** Tables sudah ada, skip error ini atau drop tables dulu:

```sql
-- Drop all tables (HATI-HATI! Data akan hilang)
DROP TABLE IF EXISTS outbound_details CASCADE;
DROP TABLE IF EXISTS outbound_headers CASCADE;
DROP TABLE IF EXISTS inbound_details CASCADE;
DROP TABLE IF EXISTS inbound_headers CASCADE;
DROP TABLE IF EXISTS parts CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Then run complete_schema.sql again
```

### Error: "permission denied"

**Solution:** Make sure you're logged in as project owner di Supabase.

### Profile not created after login

**Solution:** 
1. Check trigger exists:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

2. Manually create profile:
```sql
INSERT INTO profiles (id, email, username)
VALUES (
  'your-user-id',
  'your-email@gmail.com',
  'your-username'
);
```

---

## ✅ Verification Checklist

- [ ] All tables created
- [ ] All functions created
- [ ] All triggers created
- [ ] RLS enabled on all tables
- [ ] All policies created
- [ ] First admin created
- [ ] Can login to app
- [ ] Admin menu visible

---

## 🎉 Done!

Database setup complete! Sekarang Anda bisa:
- ✅ Login dengan Google
- ✅ Add transactions
- ✅ Edit/Delete (as admin)
- ✅ Manage parts & categories
- ✅ Manage users

**Next:** Test local dengan `npm run dev`
