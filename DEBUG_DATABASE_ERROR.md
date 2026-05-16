# 🔍 Debug: Database Error Saving New User

## Error yang Terjadi:
```
Database error saving new user
```

Ini berarti trigger `handle_new_user()` gagal ketika user baru login.

---

## 🔧 SOLUSI STEP-BY-STEP

### STEP 1: Check Database Setup

Di Supabase SQL Editor, run:

```sql
-- File: database/debug_check.sql
```

Copy & paste isi file `database/debug_check.sql` dan run.

**Yang harus ada**:
- ✅ 7 tables (profiles, categories, parts, dll)
- ✅ Trigger: `on_auth_user_created`
- ✅ Function: `handle_new_user`

---

### STEP 2: Fix Trigger dengan Permissions

Di Supabase SQL Editor, run:

```sql
-- File: database/fix_trigger.sql
```

Copy & paste isi file `database/fix_trigger.sql` dan run.

Ini akan:
- Drop trigger lama
- Create trigger baru dengan error handling lebih baik
- Grant semua permissions yang diperlukan

---

### STEP 3: Delete User Lama (Jika Ada)

Jika Anda sudah pernah coba login sebelumnya, user mungkin sudah ada di `auth.users` tapi tidak ada di `profiles`.

Run query ini:

```sql
-- Check users yang tidak punya profile
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;
```

Jika ada user yang muncul, delete user tersebut:

```sql
-- HATI-HATI: Ini akan delete user dari auth.users
-- Ganti 'your-email@gmail.com' dengan email Anda
DELETE FROM auth.users 
WHERE email = 'your-email@gmail.com';
```

---

### STEP 4: Test Trigger Manually

Test apakah trigger bisa jalan:

```sql
-- Test insert ke profiles secara manual
DO $$
DECLARE
  test_id UUID := gen_random_uuid();
  test_email TEXT := 'test@example.com';
BEGIN
  -- Try to insert
  INSERT INTO profiles (id, email, username, role)
  VALUES (test_id, test_email, 'testuser', 'user');
  
  RAISE NOTICE 'Success! Profile created.';
  
  -- Clean up
  DELETE FROM profiles WHERE id = test_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
END $$;
```

Jika muncul "Success! Profile created." berarti table profiles OK.

---

### STEP 5: Check RLS Policies

Pastikan RLS tidak blocking insert:

```sql
-- Temporarily disable RLS for testing
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Try login again, then re-enable:
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

**ATAU** tambahkan policy untuk service_role:

```sql
-- Allow service_role to insert profiles
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  TO service_role
  WITH CHECK (true);
```

---

### STEP 6: Clear Browser & Test Login

1. **Clear browser cookies & cache** (Ctrl+Shift+Delete)
2. **Close ALL browser windows**
3. **Restart dev server**:
   ```bash
   npm run dev
   ```
4. **Open Incognito mode** → `http://localhost:3000`
5. **Login dengan Google**
6. **Harus berhasil!** ✅

---

## 🐛 Troubleshooting Lanjutan

### Jika Masih Error: Check Supabase Logs

1. Buka Supabase Dashboard
2. Klik **"Logs"** di sidebar
3. Pilih **"Postgres Logs"**
4. Cari error message saat Anda coba login
5. Screenshot dan beritahu saya error lengkapnya

### Alternative: Disable Trigger Sementara

Jika trigger terus bermasalah, kita bisa disable dan buat profile manual:

```sql
-- Disable trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Setelah login, buat profile manual:
-- (Ganti dengan ID dan email Anda dari auth.users)
INSERT INTO profiles (id, email, username, role)
SELECT 
  id,
  email,
  SPLIT_PART(email, '@', 1) as username,
  'administrator' as role
FROM auth.users
WHERE email = 'your-email@gmail.com'
ON CONFLICT (id) DO NOTHING;
```

---

## 📋 Checklist Debug

- [ ] Run `debug_check.sql` - verify tables & trigger exist
- [ ] Run `fix_trigger.sql` - fix trigger dengan permissions
- [ ] Delete old user jika ada (yang tidak punya profile)
- [ ] Test trigger manually - pastikan bisa insert ke profiles
- [ ] Check RLS policies - pastikan tidak blocking
- [ ] Clear browser cookies & cache
- [ ] Restart dev server
- [ ] Test login di Incognito mode
- [ ] Check Supabase Postgres Logs jika masih error

---

## 🎯 Quick Fix (Jika Semua Gagal)

Jika semua cara di atas gagal, gunakan cara ini:

1. **Disable trigger**:
   ```sql
   DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
   ```

2. **Login dengan Google** (akan berhasil tapi tidak ada profile)

3. **Buat profile manual**:
   ```sql
   INSERT INTO profiles (id, email, username, role)
   SELECT 
     id,
     email,
     SPLIT_PART(email, '@', 1),
     'administrator'
   FROM auth.users
   WHERE email = 'your-email@gmail.com';
   ```

4. **Refresh browser** - sekarang harus bisa akses dashboard

5. **Enable trigger kembali** untuk user berikutnya:
   ```sql
   -- Run fix_trigger.sql lagi
   ```

---

**Silakan coba step-by-step di atas!** 🚀

Jika masih error, screenshot:
1. Hasil dari `debug_check.sql`
2. Error di Supabase Postgres Logs
3. Error di browser console
