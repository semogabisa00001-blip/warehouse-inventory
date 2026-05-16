# Suppliers and Destinations Setup Guide

## Overview
Fitur baru untuk mengelola Suppliers dan Destinations dengan dropdown searchable di form Inbound dan Outbound.

## Database Setup

1. Jalankan SQL script untuk membuat tabel suppliers dan destinations:
```bash
# Buka Supabase Dashboard > SQL Editor
# Copy dan jalankan isi file: database/add_suppliers_destinations.sql
```

Script ini akan:
- Membuat tabel `suppliers` dan `destinations`
- Mengatur Row Level Security (RLS) policies
- Menambahkan data default untuk testing

## Install Dependencies

Install package yang diperlukan untuk combobox:
```bash
npm install cmdk @radix-ui/react-popover
```

## Fitur yang Ditambahkan

### 1. Suppliers Management (`/suppliers`)
- Halaman untuk mengelola daftar supplier
- Add, Edit, Delete supplier
- Search supplier
- Hanya accessible oleh Administrator

### 2. Destinations Management (`/destinations`)
- Halaman untuk mengelola daftar destination
- Add, Edit, Delete destination
- Search destination
- Hanya accessible oleh Administrator

### 3. Dropdown dengan Search
- **Inbound Form**: Field Supplier sekarang menggunakan dropdown dengan search
- **Outbound Form**: Field Destination sekarang menggunakan dropdown dengan search
- User dapat search dan select dari daftar yang ada
- Data diambil dari database (tabel suppliers dan destinations)

## File yang Dibuat/Diubah

### Database
- `database/add_suppliers_destinations.sql` - SQL script untuk setup

### Pages
- `app/suppliers/page.tsx` - Halaman management suppliers
- `app/destinations/page.tsx` - Halaman management destinations

### Components - Modals
- `components/modals/add-supplier-modal.tsx` - Modal tambah supplier
- `components/modals/edit-supplier-modal.tsx` - Modal edit supplier
- `components/modals/add-destination-modal.tsx` - Modal tambah destination
- `components/modals/edit-destination-modal.tsx` - Modal edit destination

### Components - UI
- `components/ui/combobox.tsx` - Reusable combobox component
- `components/ui/command.tsx` - Command component untuk search
- `components/ui/popover.tsx` - Popover component

### Updated Files
- `components/layout/sidebar.tsx` - Menambahkan menu Suppliers dan Destinations
- `components/modals/add-inbound-modal.tsx` - Menggunakan combobox untuk supplier
- `components/modals/edit-inbound-modal.tsx` - Menggunakan combobox untuk supplier
- `components/modals/add-outbound-modal.tsx` - Menggunakan combobox untuk destination
- `components/modals/edit-outbound-modal.tsx` - Menggunakan combobox untuk destination

## Cara Menggunakan

### Mengelola Suppliers
1. Login sebagai Administrator
2. Buka menu **Suppliers** di sidebar
3. Klik **Add New Supplier** untuk menambah supplier baru
4. Edit atau delete supplier yang ada

### Mengelola Destinations
1. Login sebagai Administrator
2. Buka menu **Destinations** di sidebar
3. Klik **Add New Destination** untuk menambah destination baru
4. Edit atau delete destination yang ada

### Menggunakan di Form Inbound
1. Buka halaman **Inbound**
2. Klik **Add New Inbound**
3. Di field **Supplier**, klik dropdown
4. Ketik untuk search atau scroll untuk memilih supplier
5. Supplier yang dipilih akan otomatis terisi

### Menggunakan di Form Outbound
1. Buka halaman **Outbound**
2. Klik **Add New Outbound**
3. Di field **Destination**, klik dropdown
4. Ketik untuk search atau scroll untuk memilih destination
5. Destination yang dipilih akan otomatis terisi

## Testing

1. **Test Database Setup**:
   - Pastikan tabel `suppliers` dan `destinations` sudah dibuat
   - Cek apakah data default sudah ada

2. **Test Suppliers Management**:
   - Tambah supplier baru
   - Edit supplier
   - Delete supplier
   - Search supplier

3. **Test Destinations Management**:
   - Tambah destination baru
   - Edit destination
   - Delete destination
   - Search destination

4. **Test Dropdown di Form**:
   - Buka form Add Inbound, pastikan dropdown supplier berfungsi
   - Buka form Edit Inbound, pastikan dropdown supplier menampilkan nilai yang benar
   - Buka form Add Outbound, pastikan dropdown destination berfungsi
   - Buka form Edit Outbound, pastikan dropdown destination menampilkan nilai yang benar

## Notes

- Suppliers dan Destinations hanya bisa dikelola oleh Administrator
- Semua user bisa melihat dan memilih dari dropdown di form Inbound/Outbound
- Data suppliers dan destinations disimpan di database Supabase
- Dropdown menggunakan search untuk memudahkan pencarian
- Format tanggal sudah diubah menjadi dd-mm-yyyy di semua halaman
