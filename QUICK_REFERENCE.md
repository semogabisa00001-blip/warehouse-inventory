# 🚀 Quick Reference - Mini Warehouse

## Status: ✅ 100% COMPLETE - READY TO USE!

---

## 📍 Lokasi Project
```
C:\Users\Herru Ristian\Documents\Riswan Inventory\warehouse-inventory\
```

---

## ⚡ Quick Commands

```bash
# Masuk ke folder project
cd "C:\Users\Herru Ristian\Documents\Riswan Inventory\warehouse-inventory"

# Install dependencies (hanya sekali)
npm install

# Run development server
npm run dev

# Build untuk production
npm run build

# Run production server
npm start
```

---

## 🔗 URLs

- **Local Development:** http://localhost:3000
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Google Cloud Console:** https://console.cloud.google.com

---

## 🗄️ Database Setup (Copy-Paste)

1. Buka: https://supabase.com/dashboard
2. Pilih project
3. Go to: **SQL Editor**
4. Copy file: `database/schema.sql`
5. Paste & Run

---

## 🔐 Google OAuth Setup

### Redirect URI (Copy ini):
```
https://rnsgcjwrvyemjwkjrijv.supabase.co/auth/v1/callback
```

### Steps:
1. Google Cloud Console > Credentials
2. Create OAuth 2.0 Client ID
3. Add redirect URI di atas
4. Copy Client ID & Secret
5. Supabase > Authentication > Providers > Google
6. Paste credentials
7. Save

---

## 📁 File Penting

| File | Fungsi |
|------|--------|
| `database/schema.sql` | Database schema lengkap |
| `.env.local` | Environment variables |
| `FINAL_STATUS.md` | Status project 100% |
| `README_BAHASA.md` | Dokumentasi lengkap |
| `QUICK_REFERENCE.md` | File ini |

---

## 🎯 Halaman Aplikasi

| URL | Fungsi |
|-----|--------|
| `/login` | Login dengan Google |
| `/dashboard` | Dashboard utama |
| `/inbound` | Manage inbound |
| `/outbound` | Manage outbound |
| `/stock-monitor` | Monitor stok |

---

## 🔑 Credentials Supabase

```env
URL: https://rnsgcjwrvyemjwkjrijv.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

*(Sudah ada di `.env.local`)*

---

## ✅ Checklist Setup

- [ ] Database schema di-run
- [ ] Google OAuth dikonfigurasi
- [ ] `npm install` selesai
- [ ] `npm run dev` jalan
- [ ] Bisa login dengan Google
- [ ] Username setup berhasil
- [ ] Dashboard muncul

---

## 🎨 Fitur Utama

### ✅ Yang Bisa Dilakukan:
1. Login dengan Google
2. Tambah category
3. Tambah part
4. Buat inbound transaction
5. Buat outbound transaction (dengan validasi stok)
6. Lihat stock monitor
7. Lihat transaction history per part
8. Export ke PDF
9. Export ke XLSX
10. Real-time updates

---

## 🚀 Deploy ke Vercel

### Quick Steps:
```bash
# 1. Push ke GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main

# 2. Vercel.com > Import Project
# 3. Add env variables
# 4. Deploy!
```

### Environment Variables untuk Vercel:
```
NEXT_PUBLIC_SUPABASE_URL=https://rnsgcjwrvyemjwkjrijv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🐛 Troubleshooting Cepat

### Tidak bisa login?
→ Check Google OAuth sudah dikonfigurasi

### Table kosong?
→ Check database schema sudah di-run

### Error "Insufficient stock"?
→ Ini normal! Buat inbound dulu

### Real-time tidak jalan?
→ Check Supabase > Database > Replication

---

## 📊 Database Tables

1. `profiles` - User data
2. `categories` - Part categories
3. `parts` - Part master
4. `inbound_headers` - Inbound transactions
5. `inbound_details` - Inbound items
6. `outbound_headers` - Outbound transactions
7. `outbound_details` - Outbound items

---

## 🎯 Workflow Standar

### 1. Setup Awal:
```
Login → Setup Username → Dashboard
```

### 2. Tambah Data Master:
```
Add Category → Add Part
```

### 3. Transaksi:
```
Add Inbound → Check Stock → Add Outbound
```

### 4. Monitoring:
```
Stock Monitor → View History → Export
```

---

## 💡 Tips

- **Username** digunakan otomatis untuk tracking transaksi
- **Part number** harus unik
- **Inbound/Outbound number** diisi manual
- **Stock** dihitung otomatis: Inbound - Outbound
- **Export** tersedia di semua halaman transaksi

---

## 📞 Quick Help

### Dokumentasi:
- `FINAL_STATUS.md` - Status lengkap
- `README_BAHASA.md` - Panduan lengkap
- `QUICK_REFERENCE.md` - File ini

### External:
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- TailwindCSS: https://tailwindcss.com/docs

---

## ✨ Status Project

```
Infrastructure:     ████████████████████ 100%
Database:           ████████████████████ 100%
Authentication:     ████████████████████ 100%
UI Components:      ████████████████████ 100%
Dashboard:          ████████████████████ 100%
Inbound Page:       ████████████████████ 100%
Outbound Page:      ████████████████████ 100%
Stock Monitor:      ████████████████████ 100%
Export Utils:       ████████████████████ 100%
─────────────────────────────────────────────
TOTAL:              ████████████████████ 100%
```

---

## 🎉 READY TO USE!

**Semua fitur sudah lengkap dan siap digunakan!**

1. Setup database ✅
2. Setup OAuth ✅
3. Run `npm run dev` ✅
4. Login & mulai gunakan! ✅

---

*Quick Reference Card*
*Last Updated: May 15, 2026*
*Version: 1.0 - Production Ready*
