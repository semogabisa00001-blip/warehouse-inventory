# 🎉 Mini Warehouse - Sistem Manajemen Inventori

## ✅ STATUS: 100% SELESAI - SIAP PRODUCTION!

Sistem manajemen inventori warehouse yang modern dan lengkap dengan Next.js 15, TypeScript, Supabase, dan TailwindCSS.

---

## 🚀 Fitur Lengkap

### ✅ Authentication
- Login dengan Google OAuth
- Setup username unik
- Session management
- Protected routes
- Logout

### ✅ Dashboard
- Tampilan gabungan transaksi inbound & outbound
- Search dan filter
- Pagination (20 item per halaman)
- Real-time updates

### ✅ Inbound Management
- List semua transaksi inbound
- Tambah inbound dengan multiple items
- Tambah part baru on-the-fly
- Tambah category baru on-the-fly
- Export ke PDF dan XLSX
- Real-time updates

### ✅ Outbound Management
- List semua transaksi outbound
- Validasi stok otomatis
- Hanya tampilkan part yang ada stoknya
- Cegah qty melebihi stok tersedia
- Export ke PDF dan XLSX
- Real-time updates

### ✅ Stock Monitor
- Tampilan stok real-time semua part
- Total inbound dan outbound per part
- Current stock calculation
- Transaction history per part
- Running balance
- Export ke PDF dan XLSX

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **UI Components:** Custom components (shadcn-style)
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth (Google OAuth)
- **Forms:** React Hook Form + Zod
- **Tables:** TanStack Table
- **Export:** jsPDF + xlsx
- **Icons:** Lucide React

---

## 📋 Prerequisites

- Node.js 18+
- Akun Supabase
- Google Cloud Console (untuk OAuth)

---

## 🚀 Cara Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project Anda
3. Go to **SQL Editor**
4. Copy seluruh isi file `database/schema.sql`
5. Paste dan **Run**

Ini akan membuat:
- 7 tabel (profiles, categories, parts, inbound/outbound headers & details)
- Row Level Security policies
- Indexes untuk performa
- Functions untuk kalkulasi stok
- Triggers untuk validasi stok
- Views untuk dashboard

### 3. Setup Google OAuth

#### Di Google Cloud Console:

1. Buka https://console.cloud.google.com
2. Buat project baru atau pilih yang ada
3. Enable **Google+ API**
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Create OAuth Client ID (Web application)
7. Tambahkan Authorized redirect URI:
   ```
   https://rnsgcjwrvyemjwkjrijv.supabase.co/auth/v1/callback
   ```
8. Copy **Client ID** dan **Client Secret**

#### Di Supabase Dashboard:

1. Go to **Authentication** > **Providers**
2. Cari **Google** dan klik untuk expand
3. Toggle **Enable Sign in with Google**
4. Paste **Client ID** Anda
5. Paste **Client Secret** Anda
6. Klik **Save**

### 4. Environment Variables

File `.env.local` sudah dikonfigurasi dengan credentials Supabase Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=https://rnsgcjwrvyemjwkjrijv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Run Development Server

```bash
npm run dev
```

Buka http://localhost:3000

---

## 📁 Struktur Project

```
warehouse-inventory/
├── app/
│   ├── auth/              # Authentication routes
│   ├── dashboard/         # Dashboard page
│   ├── inbound/           # Inbound management
│   ├── outbound/          # Outbound management
│   ├── stock-monitor/     # Stock monitoring
│   └── login/             # Login page
│
├── components/
│   ├── layout/            # Layout components
│   ├── modals/            # Modal components
│   └── ui/                # UI components
│
├── lib/
│   ├── supabase/          # Supabase config
│   ├── export-utils.ts    # PDF & XLSX export
│   └── stock-utils.ts     # Stock calculations
│
├── database/
│   └── schema.sql         # Database schema
│
└── .env.local             # Environment variables
```

---

## 🎯 Cara Menggunakan

### Login Pertama Kali

1. Buka http://localhost:3000
2. Klik **Sign in with Google**
3. Authorize dengan akun Google Anda
4. Masukkan username unik (akan digunakan untuk tracking transaksi)
5. Klik **Continue**
6. Anda akan diarahkan ke Dashboard

### Membuat Category

1. Go to **Inbound** page
2. Klik **Add New Inbound**
3. Klik **Add New Part**
4. Klik **Add New Category** (tombol + di samping dropdown category)
5. Masukkan nama category (contoh: Electronics, Mechanical, dll)
6. Klik **Save**

### Membuat Part

1. Dari modal Add Part
2. Masukkan part number (contoh: P502480)
3. Masukkan description
4. Pilih category
5. Klik **Save**

### Membuat Transaksi Inbound

1. Go to **Inbound** page
2. Klik **Add New Inbound**
3. Masukkan inbound number (contoh: INB-001)
4. Pilih tanggal
5. Masukkan nama supplier
6. Tambah items:
   - Pilih part dari dropdown
   - Masukkan quantity
   - Klik **Add Item** untuk menambah baris baru
7. Klik **Save Inbound**

### Membuat Transaksi Outbound

1. Go to **Outbound** page
2. Klik **Add New Outbound**
3. Masukkan outbound number (contoh: OUT-001)
4. Pilih tanggal
5. Masukkan destination
6. Tambah items:
   - Pilih part (hanya part dengan stok > 0 yang muncul)
   - Masukkan quantity (tidak boleh melebihi stok tersedia)
   - Sistem akan validasi otomatis
7. Klik **Save Outbound**

### Melihat Stock

1. Go to **Stock Monitor** page
2. Lihat current stock semua part
3. Klik part number untuk melihat transaction history
4. Export ke PDF atau XLSX jika diperlukan

---

## 📊 Database Schema

### Tables

1. **profiles** - User profiles dengan username unik
2. **categories** - Kategori part
3. **parts** - Master data part
4. **inbound_headers** - Header transaksi inbound
5. **inbound_details** - Detail items inbound
6. **outbound_headers** - Header transaksi outbound
7. **outbound_details** - Detail items outbound

### Business Logic

**Kalkulasi Stok:**
```
Current Stock = Total Inbound Qty - Total Outbound Qty
```

**Validasi Stok:**
- Outbound tidak bisa melebihi stok tersedia
- Trigger database mencegah stok negatif
- Real-time validation di UI

---

## 🔐 Security Features

- ✅ Row Level Security (RLS) di semua tabel
- ✅ Protected routes via middleware
- ✅ Secure authentication flow
- ✅ Environment variables tidak di-commit
- ✅ Stock validation mencegah negative inventory
- ✅ Username uniqueness enforcement

---

## 🎨 Design Features

- ✅ Green warehouse theme
- ✅ Responsive design (desktop & mobile)
- ✅ Modern ERP-style interface
- ✅ Clean spreadsheet-like tables
- ✅ Floating modals untuk forms
- ✅ Professional enterprise look

---

## ⚡ Performance Features

- ✅ Optimized database indexes
- ✅ Efficient queries dengan joins
- ✅ Real-time subscriptions
- ✅ Pagination untuk large datasets
- ✅ Lazy loading

---

## 📤 Export Features

### PDF Export
- Professional printable layout
- Company header: "Mini Warehouse — Inventory Management System"
- Transaction details
- Generated timestamp
- User information

### XLSX Export
- Proper column widths
- Styled headers
- Multiple rows support
- Compatible dengan Excel dan Google Sheets

---

## 🚀 Deployment ke Vercel

### 1. Push ke GitHub

```bash
git init
git add .
git commit -m "Complete warehouse inventory system"
git remote add origin https://github.com/username/warehouse-inventory.git
git push -u origin main
```

### 2. Deploy ke Vercel

1. Buka https://vercel.com
2. Klik **Import Project**
3. Pilih repository GitHub Anda
4. Configure project:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Tambahkan Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://rnsgcjwrvyemjwkjrijv.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
6. Klik **Deploy**

### 3. Update OAuth Redirect URLs

Setelah deploy, tambahkan production URL ke:

**Google Cloud Console:**
```
https://your-app.vercel.app/auth/callback
```

**Supabase Dashboard:**
- Go to Authentication > URL Configuration
- Add Site URL: `https://your-app.vercel.app`
- Add Redirect URL: `https://your-app.vercel.app/auth/callback`

---

## 🐛 Troubleshooting

### Google OAuth tidak bekerja
- Verify redirect URL di Google Console sesuai dengan Supabase callback URL
- Check Google provider enabled di Supabase
- Clear browser cache dan cookies

### "Username already taken"
- Pilih username yang berbeda
- Username harus unik untuk semua user

### "Insufficient stock" error
- Ini adalah behavior yang benar
- Tidak bisa membuat outbound yang melebihi stok tersedia
- Check stock levels di Stock Monitor page
- Buat inbound transaction dulu untuk menambah stok

### Table tidak menampilkan data
- Verify database schema sudah di-run dengan benar
- Check Supabase logs untuk errors
- Verify RLS policies sudah dibuat
- Check browser console untuk JavaScript errors

### Real-time updates tidak bekerja
- Go to Supabase Dashboard > Database > Replication
- Pastikan tables enabled untuk replication
- Check browser console untuk WebSocket errors

---

## 📚 Documentation Files

- **FINAL_STATUS.md** - Status lengkap project (100% complete)
- **README.md** - Technical documentation (English)
- **README_BAHASA.md** - Dokumentasi lengkap (Bahasa Indonesia) - File ini
- **database/schema.sql** - Complete database schema

---

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com)
- [jsPDF](https://github.com/parallax/jsPDF)
- [xlsx](https://github.com/SheetJS/sheetjs)

---

## 🎉 Selamat!

Anda sekarang memiliki **production-ready warehouse inventory management system** yang lengkap!

### Yang Sudah Selesai:
- ✅ Complete infrastructure
- ✅ Database dengan security
- ✅ Authentication system
- ✅ All pages (Dashboard, Inbound, Outbound, Stock Monitor)
- ✅ All modals (Add Category, Add Part, Add Inbound, Add Outbound)
- ✅ Export functionality (PDF & XLSX)
- ✅ Stock validation
- ✅ Real-time updates
- ✅ Responsive design

### Siap Untuk:
- ✅ Dijalankan di local
- ✅ Di-deploy ke production
- ✅ Digunakan untuk manage inventory
- ✅ Di-push ke GitHub
- ✅ Di-deploy ke Vercel

---

## 📞 Support

Jika ada pertanyaan atau issues:
1. Check dokumentasi files
2. Review database schema
3. Check browser console untuk errors
4. Review Supabase logs

---

## 📝 License

This project is proprietary and confidential.

---

## 🙏 Credits

Built with modern web technologies for efficient warehouse management.

**Tech Stack:**
- Next.js 15
- React 19
- TypeScript 5
- Supabase
- TailwindCSS
- jsPDF & xlsx

---

**🎊 SELAMAT MENGGUNAKAN! 🎊**

*Project Status: 100% Complete - Production Ready*
*Last Updated: May 15, 2026*
