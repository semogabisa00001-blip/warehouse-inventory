# 🔐 Role-Based Access Control Guide

## Overview

Sistem ini sekarang memiliki **2 role**:
1. **Administrator** - Full access (add, edit, delete semua data + manage users)
2. **User** - Limited access (hanya bisa add, tidak bisa edit/delete)

---

## 📋 Permissions Matrix

| Feature | Administrator | User |
|---------|--------------|------|
| **View Dashboard** | ✅ | ✅ |
| **View Inbound** | ✅ | ✅ |
| **Add Inbound** | ✅ | ✅ |
| **Edit Inbound** | ✅ | ❌ |
| **Delete Inbound** | ✅ | ❌ |
| **View Outbound** | ✅ | ✅ |
| **Add Outbound** | ✅ | ✅ |
| **Edit Outbound** | ✅ | ❌ |
| **Delete Outbound** | ✅ | ❌ |
| **View Stock Monitor** | ✅ | ✅ |
| **View Categories** | ✅ | ✅ |
| **Add Category** | ✅ | ✅ |
| **Edit Category** | ✅ | ❌ |
| **Delete Category** | ✅ | ❌ |
| **View Parts** | ✅ | ✅ |
| **Add Part** | ✅ | ✅ |
| **Edit Part** | ✅ | ❌ |
| **Delete Part** | ✅ | ❌ |
| **User Management** | ✅ | ❌ |
| **Change User Roles** | ✅ | ❌ |

---

## 🚀 Setup Instructions

### Step 1: Run Database Schema

Pertama, jalankan schema utama (jika belum):
```sql
-- Run file: database/schema.sql
```

### Step 2: Add Role System

Jalankan SQL untuk menambahkan role system:
```sql
-- Run file: database/add_roles.sql
```

File ini akan:
- ✅ Menambahkan kolom `role` ke tabel `profiles`
- ✅ Set default role = 'user'
- ✅ Update RLS policies untuk role-based access
- ✅ Membuat function `is_administrator()`
- ✅ Membuat function `make_first_admin()`

### Step 3: Create First Administrator

**PENTING:** Setelah user pertama login dan create profile, jalankan SQL ini:

```sql
-- Ganti 'your-email@gmail.com' dengan email user pertama
SELECT make_first_admin('your-email@gmail.com');
```

**Contoh:**
```sql
SELECT make_first_admin('admin@company.com');
```

**Output:**
```
NOTICE: User admin@company.com is now an administrator
```

### Step 4: Verify First Admin

Check apakah sudah jadi admin:
```sql
SELECT email, username, role FROM profiles WHERE role = 'administrator';
```

---

## 👥 User Management (Administrator Only)

### Accessing User Management

1. Login sebagai Administrator
2. Sidebar akan menampilkan menu **"User Management"** (dengan icon Shield)
3. Klik menu tersebut
4. Anda akan melihat list semua users

### Making Another User Administrator

1. Go to **User Management** page
2. Find user yang ingin dijadikan admin
3. Klik button **"Make Admin"**
4. User tersebut sekarang jadi Administrator

### Removing Administrator Role

1. Go to **User Management** page
2. Find administrator yang ingin di-remove
3. Klik button **"Remove Admin"**
4. User tersebut kembali jadi User biasa

**Note:** Anda tidak bisa mengubah role Anda sendiri!

---

## 🎯 How It Works

### Database Level (RLS Policies)

```sql
-- Example: Only administrators can delete inbound
CREATE POLICY "Administrators can delete inbound headers" 
ON inbound_headers 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'administrator'
  )
);
```

### Application Level (UI)

```typescript
// Check user role
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()

// Show/hide buttons based on role
{profile.role === 'administrator' && (
  <Button onClick={handleDelete}>Delete</Button>
)}
```

---

## 📝 Implementation Details

### Files Modified/Created:

1. **database/add_roles.sql** - Role system SQL
2. **app/users/page.tsx** - User management page
3. **components/layout/sidebar.tsx** - Updated with admin menu
4. **components/layout/header.tsx** - Show user role badge

### Files That Need Edit/Delete Buttons:

You need to add edit/delete functionality to:
1. ✅ Inbound page
2. ✅ Outbound page  
3. ✅ Categories (in modals)
4. ✅ Parts (in modals)

---

## 🔒 Security Features

### Row Level Security (RLS)
- ✅ Enforced at database level
- ✅ Cannot be bypassed from client
- ✅ Automatic validation on every query

### Role Validation
- ✅ Checked on every protected action
- ✅ UI hides unauthorized buttons
- ✅ API rejects unauthorized requests

### Audit Trail
- ✅ `inbound_user` and `outbound_user` track who created
- ✅ Can add `updated_by` and `updated_at` if needed

---

## 🧪 Testing

### Test as Administrator:
1. Login dengan admin account
2. Verify menu "User Management" muncul
3. Try to edit/delete transactions
4. Try to manage users

### Test as Regular User:
1. Login dengan user account
2. Verify menu "User Management" TIDAK muncul
3. Verify edit/delete buttons TIDAK muncul
4. Try to add transactions (should work)

---

## 🐛 Troubleshooting

### "Access Denied" when trying to edit/delete
**Solution:** Check user role di database:
```sql
SELECT email, role FROM profiles WHERE email = 'your-email@gmail.com';
```

### First admin not working
**Solution:** Run make_first_admin again:
```sql
SELECT make_first_admin('correct-email@gmail.com');
```

### User Management page not showing
**Solution:** 
1. Check user role = 'administrator'
2. Clear browser cache
3. Logout and login again

### RLS policy errors
**Solution:** Re-run `database/add_roles.sql`

---

## 📊 Database Schema Changes

### profiles table:
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  username TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('administrator', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### New Functions:
- `is_administrator()` - Check if current user is admin
- `make_first_admin(email)` - Make user admin by email

---

## 🎓 Best Practices

### For Administrators:
1. ✅ Create at least 2 administrators (backup)
2. ✅ Don't remove your own admin role
3. ✅ Review user list regularly
4. ✅ Only give admin to trusted users

### For Developers:
1. ✅ Always check role before showing edit/delete buttons
2. ✅ Rely on RLS policies for security
3. ✅ Show appropriate error messages
4. ✅ Log important admin actions

---

## 🚀 Next Steps

After setup, you should:

1. ✅ Create first administrator
2. ✅ Test admin features
3. ✅ Create regular users
4. ✅ Test user limitations
5. ✅ Add edit/delete buttons to pages (next implementation)

---

## 📞 Quick Reference

### Make User Administrator:
```sql
SELECT make_first_admin('user@email.com');
```

### Check All Administrators:
```sql
SELECT * FROM profiles WHERE role = 'administrator';
```

### Change User Role Manually:
```sql
UPDATE profiles SET role = 'administrator' WHERE email = 'user@email.com';
UPDATE profiles SET role = 'user' WHERE email = 'user@email.com';
```

### Check Current User Role:
```sql
SELECT email, username, role FROM profiles WHERE id = auth.uid();
```

---

**🎉 Role system is now ready!**

*Next: Implement edit/delete buttons in UI*
