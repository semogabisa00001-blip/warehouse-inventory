# 🚀 Deployment Guide - Test Local, GitHub & Vercel

## 📋 STEP 1: Setup Database

**PENTING:** Setup database dulu sebelum test local!

1. **Login ke Supabase Dashboard:**
   - Go to https://supabase.com/dashboard
   - Pilih project Anda

2. **Open SQL Editor:**
   - Click "SQL Editor" → "New query"

3. **Run SQL Scripts (URUTAN PENTING!):**
   
   **a. Main Schema:**
   - Open file: `database/complete_schema.sql`
   - Copy semua content
   - Paste ke SQL Editor
   - Click "Run"

   **b. Suppliers & Destinations (NEW!):**
   - Open file: `database/add_suppliers_destinations.sql`
   - Copy semua content
   - Paste ke SQL Editor
   - Click "Run"

4. **Verify:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' ORDER BY table_name;
   ```
   Harus ada 9 tables: 
   - profiles
   - categories
   - parts
   - inbound_headers
   - inbound_details
   - outbound_headers
   - outbound_details
   - suppliers (NEW!)
   - destinations (NEW!)

**Detail lengkap:** Baca `DATABASE_SETUP.md`

---

## 🔧 STEP 2: Setup Environment Variables

Edit file `.env.local` dan isi dengan Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Cara dapat credentials:**
1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project → Settings → API
3. Copy **Project URL** dan **anon/public key**

---

## 📦 STEP 3: Install Dependencies

```bash
# Install all dependencies (termasuk yang baru)
npm install

# Dependencies baru yang ditambahkan:
# - cmdk (untuk searchable dropdown)
# - @radix-ui/react-popover (untuk dropdown UI)
```

---

## 🧪 STEP 4: Test Local

```bash
# Run development server
npm run dev
```

Open browser: http://localhost:3000

### Test Checklist - Basic Features:
- [ ] Login dengan Google berhasil
- [ ] Profile auto-created
- [ ] Dashboard muncul dengan Recent Transactions table
- [ ] Bisa add inbound transaction dengan searchable dropdown
- [ ] Bisa add outbound transaction dengan searchable dropdown
- [ ] Stock Monitor menampilkan data dengan benar
- [ ] Format tanggal dd-mm-yyyy di semua halaman

### Test Checklist - NEW Features:
- [ ] Searchable dropdown untuk Supplier (Inbound)
- [ ] Searchable dropdown untuk Destination (Outbound)
- [ ] Searchable dropdown untuk Part selection
- [ ] Dashboard Recent Transactions (Unit Level Tracking)
- [ ] Footer muncul di semua halaman
- [ ] Favicon warehouse icon muncul di browser tab
- [ ] Title "Mini Warehouse - Inventory System" di browser tab

---

## 👤 STEP 5: Create First Administrator

**Setelah login pertama kali:**

1. **Kembali ke Supabase SQL Editor**
2. **Run command:**
   ```sql
   SELECT make_first_admin('your-email@gmail.com');
   ```
   Ganti dengan email Google Anda!

3. **Logout dan Login lagi**
4. **Verify menu admin muncul:**
   - Parts Management
   - Categories
   - Suppliers (NEW!)
   - Destinations (NEW!)
   - User Management

5. **Test admin features:**
   - [ ] Edit inbound transaction
   - [ ] Delete inbound transaction
   - [ ] Edit outbound transaction
   - [ ] Delete outbound transaction
   - [ ] Manage parts (add/edit/delete)
   - [ ] Manage categories (add/edit/delete)
   - [ ] Manage suppliers (add/edit/delete) - NEW!
   - [ ] Manage destinations (add/edit/delete) - NEW!
   - [ ] Change user roles

**Jika ada error:** Check console browser dan terminal untuk error messages.

---

## 📦 STEP 6: Persiapan Push ke GitHub

**PENTING:** Pastikan `.env.local` ada di `.gitignore` agar credentials tidak ter-push ke GitHub!

**Check .gitignore:**
```bash
cat .gitignore
```

Harus ada:
```
.env*.local
.env
node_modules/
.next/
```

---

## 🔧 STEP 7: Push ke GitHub

```bash
# 1. Check status
git status

# 2. Add all changes
git add .

# 3. Commit dengan message yang jelas
git commit -m "feat: Add suppliers/destinations management, searchable dropdowns, unit tracking, and UI improvements"

# 4. Push
git push origin main
```

**Jika first time push:**
```bash
git remote add origin https://github.com/username/warehouse-inventory.git
git branch -M main
git push -u origin main
```

**Jika error "rejected":**
```bash
git pull origin main --rebase
git push origin main
```

---

## 🌐 STEP 8: Deploy ke Vercel

### Via Website:

1. **Login:** [vercel.com](https://vercel.com) → Continue with GitHub

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Pilih repository "warehouse-inventory"
   - Click "Import"

3. **Configure Project:**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: ./
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

4. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add:
     ```
     NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key-here
     ```
   - Pilih: Production, Preview, Development (all)

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-5 menit
   - Done! ✅

6. **Get URL:** `https://warehouse-inventory-xxx.vercel.app`

---

## 🔐 STEP 9: Update Google OAuth (PENTING!)

**Setelah deploy, update redirect URL di Google Console:**

1. **Go to:** [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services** → **Credentials**
3. **Edit OAuth 2.0 Client**
4. **Add Authorized redirect URIs:**
   ```
   https://your-project.supabase.co/auth/v1/callback
   https://warehouse-inventory-xxx.vercel.app/auth/callback
   ```
5. **Save**

**Detail lengkap:** Baca `GOOGLE_OAUTH_SETUP.md`

---

## ✅ STEP 10: Verify Production

### Basic Tests:
- [ ] Open production URL
- [ ] Test login dengan Google
- [ ] Dashboard loads dengan Recent Transactions
- [ ] Test add inbound dengan searchable dropdown
- [ ] Test add outbound dengan searchable dropdown
- [ ] Test export PDF/Excel

### Admin Tests:
- [ ] Test edit/delete transactions
- [ ] Test manage suppliers
- [ ] Test manage destinations
- [ ] Test manage parts & categories
- [ ] Test user role management

### UI Tests:
- [ ] Footer muncul di semua halaman
- [ ] Favicon warehouse icon muncul
- [ ] Format tanggal dd-mm-yyyy konsisten
- [ ] Searchable dropdown berfungsi dengan baik
- [ ] Recent Transactions table menampilkan unit tracking

---

## 🔄 Update Deployment (Future)

```bash
# Make changes
# Test locally: npm run dev

# Push to GitHub
git add .
git commit -m "fix: Update feature"
git push origin main

# Vercel auto-deploys! ✨
# Check deployment: vercel.com/dashboard
```

---

## 🐛 Troubleshooting

### Build Failed?
```bash
# Test build locally
npm run build

# Check for errors
# Fix errors
# Push again
```

### Environment Variables Missing?
- Vercel → Settings → Environment Variables
- Add missing variables
- Redeploy: Deployments → ... → Redeploy

### Git Push Rejected?
```bash
git pull origin main --rebase
git push origin main
```

### Searchable Dropdown Not Working?
- Check if `cmdk` and `@radix-ui/react-popover` installed
- Run: `npm install cmdk @radix-ui/react-popover`
- Rebuild: `npm run build`

### Database Tables Missing?
- Run `database/complete_schema.sql` first
- Then run `database/add_suppliers_destinations.sql`
- Verify with SQL query in Step 1

### Login Redirect Error?
- Check Google OAuth redirect URIs
- Must include Vercel production URL
- See `GOOGLE_OAUTH_SETUP.md`

---

## 📚 Additional Documentation

- **Database Setup:** `DATABASE_SETUP.md`
- **Google OAuth:** `GOOGLE_OAUTH_SETUP.md`
- **Suppliers & Destinations:** `SUPPLIERS_DESTINATIONS_SETUP.md`
- **Favicon Setup:** `FAVICON_SETUP.md`
- **Implementation Summary:** `IMPLEMENTATION_SUMMARY.md`

---

## 🎉 Done!

✅ Database setup (9 tables)  
✅ Dependencies installed  
✅ Local tested  
✅ Pushed to GitHub  
✅ Deployed to Vercel  
✅ Google OAuth configured  
✅ Production verified  

**Total time:** ~45 minutes

---

## 🆕 New Features Summary

### 1. Suppliers & Destinations Management
- Admin can manage suppliers and destinations
- Searchable dropdown in forms
- Centralized data management

### 2. Searchable Dropdowns
- Supplier selection in Inbound forms
- Destination selection in Outbound forms
- Part selection in all transaction forms
- Type to search, click to select

### 3. Dashboard Recent Transactions
- Unit-level tracking (1 row = 1 unit)
- Shows complete history from inbound to outbound
- Visual indicators (green = in stock, white = out)
- Search functionality

### 4. UI Improvements
- Footer on all pages: "© 2026 HerruRistian.dev. All rights reserved."
- Custom favicon with warehouse icon
- Browser title: "Mini Warehouse - Inventory System"
- Consistent date format: dd-mm-yyyy
- Compact table fonts for better readability

### 5. Better UX
- Clear visual feedback
- Consistent styling
- Improved navigation
- Better data organization

---

## 📞 Support

Jika ada masalah:
1. Check browser console (F12)
2. Check Vercel deployment logs
3. Check Supabase logs
4. Review documentation files

**Happy Deploying! 🚀**
