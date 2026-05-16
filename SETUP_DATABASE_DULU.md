# ⚠️ ERROR: Database Belum Di-Setup!

## 🔴 Error yang Anda Alami:

```
error=server_error
error_description=Database error saving new user
```

**Penyebab**: Database tables dan triggers belum dibuat di Supabase.

---

## ✅ SOLUSI: Setup Database Dulu

### STEP 1: Buka Supabase Dashboard

1. Buka browser → https://supabase.com/dashboard
2. Login dengan akun Supabase Anda
3. Pilih project: **rnsgcjwrvyemjwkjrijv**

### STEP 2: Buka SQL Editor

1. Di sidebar kiri, klik **"SQL Editor"**
2. Klik **"New query"** (tombol hijau)

### STEP 3: Copy & Paste SQL Schema

1. Buka file: `database/complete_schema.sql`
2. **Copy SEMUA isi file** (Ctrl+A, Ctrl+C)
3. **Paste** ke SQL Editor di Supabase (Ctrl+V)

### STEP 4: Run SQL

1. Klik tombol **"Run"** (atau tekan F5)
2. Tunggu sampai selesai (sekitar 5-10 detik)
3. Harus muncul pesan: **"Success. No rows returned"**

### STEP 5: Verify Tables Created

Run query ini untuk verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Harus muncul 7 tables:
- ✅ categories
- ✅ inbound_details
- ✅ inbound_headers
- ✅ outbound_details
- ✅ outbound_headers
- ✅ parts
- ✅ profiles

### STEP 6: Test Login Lagi

1. **Clear browser cookies & cache** (Ctrl+Shift+Delete)
2. **Restart dev server**:
   ```bash
   npm run dev
   ```
3. Buka browser → `http://localhost:3000`
4. Login dengan Google
5. **Sekarang harus berhasil!** ✅

---

## 🎯 Setelah Login Berhasil

### Buat Administrator Pertama:

1. Buka Supabase Dashboard → SQL Editor
2. Run command ini:

```sql
SELECT make_first_admin('your-email@gmail.com');
```

**Ganti** `your-email@gmail.com` dengan email Google Anda yang tadi dipakai login.

3. Refresh halaman dashboard
4. Sekarang Anda administrator! Edit/Delete buttons akan muncul.

---

## 📋 Quick Checklist

- [ ] Buka Supabase Dashboard
- [ ] Buka SQL Editor
- [ ] Copy semua isi `database/complete_schema.sql`
- [ ] Paste ke SQL Editor
- [ ] Run (F5)
- [ ] Verify 7 tables created
- [ ] Clear browser cookies
- [ ] Restart dev server
- [ ] Login lagi
- [ ] Berhasil masuk dashboard!
- [ ] Run `make_first_admin()` dengan email Anda
- [ ] Refresh page
- [ ] Test admin features

---

## 🐛 Troubleshooting

### Error: "relation already exists"

**Artinya**: Sebagian tables sudah ada tapi tidak lengkap.

**Solusi**: Drop semua tables dulu, lalu run ulang:

```sql
-- Drop all tables
DROP TABLE IF EXISTS outbound_details CASCADE;
DROP TABLE IF EXISTS outbound_headers CASCADE;
DROP TABLE IF EXISTS inbound_details CASCADE;
DROP TABLE IF EXISTS inbound_headers CASCADE;
DROP TABLE IF EXISTS parts CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS is_administrator() CASCADE;
DROP FUNCTION IF EXISTS make_first_admin(TEXT) CASCADE;
DROP FUNCTION IF EXISTS validate_outbound_stock() CASCADE;
```

Lalu run `complete_schema.sql` lagi.

### Error: "permission denied"

**Solusi**: Pastikan Anda owner project di Supabase.

---

## 📚 File Referensi

- **`database/complete_schema.sql`** ← SQL yang harus di-run
- **`DATABASE_SETUP.md`** ← Panduan lengkap
- **`FIX_AUTH_REDIRECT.md`** ← Setelah database setup

---

**Setup database dulu, baru bisa login!** 🚀
