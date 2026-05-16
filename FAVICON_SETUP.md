# Favicon Setup Guide

## Current Status
✅ Title sudah diubah menjadi "Mini Warehouse - Inventory System"
✅ SVG favicon sudah dibuat di `public/favicon.svg`

## Cara Membuat Favicon ICO

### Opsi 1: Menggunakan Online Converter (Paling Mudah)
1. Buka https://favicon.io/favicon-converter/
2. Upload file `public/favicon.svg` atau buat logo warehouse
3. Download hasil konversi
4. Extract file dan copy `favicon.ico` ke folder `public/`

### Opsi 2: Menggunakan Logo Kustom
1. Buka https://favicon.io/favicon-generator/
2. Pilih:
   - Text: "MW" (Mini Warehouse)
   - Background: #16a34a (hijau)
   - Font: Bold
   - Shape: Rounded
3. Download dan extract
4. Copy semua file ke folder `public/`

### Opsi 3: Menggunakan Image Editor
1. Buat gambar 512x512px dengan logo warehouse
2. Background hijau (#16a34a)
3. Icon warehouse putih di tengah
4. Export sebagai PNG
5. Convert ke ICO menggunakan online tool

## File yang Dibutuhkan

Letakkan di folder `public/`:
- `favicon.ico` - Icon utama (16x16, 32x32, 48x48)
- `favicon.svg` - ✅ Sudah ada
- `apple-touch-icon.png` - (180x180) untuk iOS
- `favicon-16x16.png` - (16x16)
- `favicon-32x32.png` - (32x32)

## Verifikasi

Setelah menambahkan favicon:
1. Restart development server: `npm run dev`
2. Clear browser cache (Ctrl+Shift+Delete)
3. Refresh halaman
4. Cek tab browser - seharusnya muncul icon warehouse hijau

## Current Metadata

```typescript
export const metadata: Metadata = {
  title: "Mini Warehouse - Inventory System",
  description: "Warehouse Inventory Management System",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: '/apple-touch-icon.png',
  },
};
```

## Browser Support

- ✅ Modern browsers: Akan menggunakan `favicon.svg`
- ✅ Older browsers: Akan fallback ke `favicon.ico`
- ✅ iOS devices: Akan menggunakan `apple-touch-icon.png`

## Quick Fix (Temporary)

Jika ingin cepat, cukup gunakan SVG yang sudah ada:
1. File `public/favicon.svg` sudah dibuat
2. Browser modern akan langsung menggunakan SVG ini
3. Title sudah berubah menjadi "Mini Warehouse - Inventory System"

Untuk hasil terbaik, buat favicon.ico menggunakan salah satu opsi di atas.
