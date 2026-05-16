# 🔐 Google OAuth Setup Guide

## 📋 Overview

Tutorial lengkap untuk setup Google OAuth credentials untuk production deployment.

**Note:** Untuk testing local, Anda bisa skip ini dan gunakan default Supabase settings dulu.

---

## 🚀 STEP 1: Create Google Cloud Project

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com
   - Login dengan Google account Anda

2. **Create New Project:**
   - Click dropdown di top bar (next to "Google Cloud")
   - Click **"New Project"**
   - Project Name: `Mini Warehouse Inventory`
   - Organization: (leave default atau pilih organization Anda)
   - Click **"Create"**
   - Wait sampai project created (~10 seconds)

3. **Select Project:**
   - Click dropdown lagi
   - Pilih project yang baru dibuat

---

## 🔧 STEP 2: Enable Google+ API

1. **Go to APIs & Services:**
   - Click hamburger menu (☰) di top left
   - Click **"APIs & Services"** → **"Library"**

2. **Search for Google+ API:**
   - Di search box, ketik: `Google+ API`
   - Click **"Google+ API"** dari hasil

3. **Enable API:**
   - Click **"Enable"** button
   - Wait sampai enabled

---

## 🎫 STEP 3: Configure OAuth Consent Screen

1. **Go to OAuth Consent Screen:**
   - Click hamburger menu (☰)
   - **"APIs & Services"** → **"OAuth consent screen"**

2. **Choose User Type:**
   - Select **"External"** (untuk public app)
   - Click **"Create"**

3. **Fill App Information:**

   **App Information:**
   - App name: `Mini Warehouse Inventory`
   - User support email: `your-email@gmail.com`
   - App logo: (optional, bisa skip)

   **App Domain:**
   - Application home page: `https://your-app.vercel.app` (isi nanti setelah deploy)
   - Application privacy policy: (optional, bisa skip untuk testing)
   - Application terms of service: (optional, bisa skip untuk testing)

   **Authorized Domains:**
   - Add: `vercel.app` (untuk Vercel deployment)
   - Add: `supabase.co` (untuk Supabase)

   **Developer Contact Information:**
   - Email: `your-email@gmail.com`

   Click **"Save and Continue"**

4. **Scopes:**
   - Click **"Add or Remove Scopes"**
   - Select:
     - ✅ `.../auth/userinfo.email`
     - ✅ `.../auth/userinfo.profile`
     - ✅ `openid`
   - Click **"Update"**
   - Click **"Save and Continue"**

5. **Test Users (Optional):**
   - Add test users jika app masih dalam testing mode
   - Click **"Add Users"**
   - Add email addresses yang boleh login
   - Click **"Save and Continue"**

6. **Summary:**
   - Review settings
   - Click **"Back to Dashboard"**

---

## 🔑 STEP 4: Create OAuth Credentials

1. **Go to Credentials:**
   - Click hamburger menu (☰)
   - **"APIs & Services"** → **"Credentials"**

2. **Create Credentials:**
   - Click **"+ Create Credentials"** di top
   - Select **"OAuth client ID"**

3. **Configure OAuth Client:**

   **Application Type:**
   - Select: **"Web application"**

   **Name:**
   - Name: `Mini Warehouse Web Client`

   **Authorized JavaScript Origins:**
   - Click **"+ Add URI"**
   - Add: `http://localhost:3000` (untuk local testing)
   - Click **"+ Add URI"**
   - Add: `https://your-app.vercel.app` (untuk production, isi nanti)

   **Authorized Redirect URIs:**
   - Click **"+ Add URI"**
   - Add: `https://your-project.supabase.co/auth/v1/callback`
   
   **Cara dapat Supabase callback URL:**
   - Go to Supabase Dashboard
   - Authentication → Providers → Google
   - Copy **"Callback URL (for OAuth)"**
   - Paste ke Authorized Redirect URIs

   Click **"Create"**

4. **Save Credentials:**
   - Modal akan muncul dengan **Client ID** dan **Client Secret**
   - **PENTING:** Copy dan simpan kedua values ini!
   - Click **"OK"**

---

## 🔗 STEP 5: Add Credentials to Supabase

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Pilih project Anda

2. **Go to Authentication:**
   - Click **"Authentication"** → **"Providers"**
   - Scroll ke **"Google"**

3. **Enable and Configure:**
   - Toggle **"Enable Sign in with Google"** → ON
   
   **Google Client ID:**
   - Paste Client ID dari Google Cloud Console

   **Google Client Secret:**
   - Paste Client Secret dari Google Cloud Console

   Click **"Save"**

---

## ✅ STEP 6: Configure Redirect URLs

Masih di Supabase Authentication settings:

1. **Site URL:**
   - Development: `http://localhost:3000`
   - Production: `https://your-app.vercel.app`

2. **Redirect URLs:**
   - Add: `http://localhost:3000/auth/callback` (local)
   - Add: `https://your-app.vercel.app/auth/callback` (production)

Click **"Save"**

---

## 🧪 STEP 7: Test OAuth Flow

### Local Testing:

1. **Run dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser:**
   - Go to http://localhost:3000
   - Click "Continue with Google"
   - Select Google account
   - Grant permissions
   - Should redirect to dashboard

### Production Testing:

1. **After deploy to Vercel:**
   - Go to your production URL
   - Click "Continue with Google"
   - Should work sama seperti local

---

## 🔄 STEP 8: Update URLs After Deployment

**Setelah deploy ke Vercel:**

1. **Update Google Cloud Console:**
   - Go to Credentials
   - Edit OAuth client
   - Update Authorized JavaScript Origins:
     - Add: `https://your-actual-app.vercel.app`
   - Update Authorized Redirect URIs:
     - Verify Supabase callback URL correct
   - Save

2. **Update Supabase:**
   - Go to Authentication settings
   - Update Site URL: `https://your-actual-app.vercel.app`
   - Update Redirect URLs: `https://your-actual-app.vercel.app/auth/callback`
   - Save

---

## 📝 Important URLs Reference

### Google Cloud Console:
- **Console:** https://console.cloud.google.com
- **APIs & Services:** https://console.cloud.google.com/apis
- **Credentials:** https://console.cloud.google.com/apis/credentials
- **OAuth Consent:** https://console.cloud.google.com/apis/credentials/consent

### Supabase:
- **Dashboard:** https://supabase.com/dashboard
- **Auth Settings:** Project → Authentication → Providers

### Your App:
- **Local:** http://localhost:3000
- **Production:** https://your-app.vercel.app (after deployment)

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"

**Solution:**
1. Check Authorized Redirect URIs di Google Cloud Console
2. Must match exactly: `https://your-project.supabase.co/auth/v1/callback`
3. No trailing slash!

### Error: "Access blocked: This app's request is invalid"

**Solution:**
1. Check OAuth Consent Screen configured
2. Add your email as test user
3. Verify scopes added (email, profile, openid)

### Error: "Unsupported provider"

**Solution:**
1. Enable Google provider di Supabase
2. Add Client ID and Secret
3. Save settings

### Error: "Invalid client"

**Solution:**
1. Verify Client ID and Secret correct
2. Check no extra spaces when copy-paste
3. Regenerate credentials if needed

---

## 🔒 Security Best Practices

1. **Never commit credentials:**
   - Client Secret harus di Supabase only
   - Jangan simpan di code atau .env

2. **Use environment-specific URLs:**
   - Different OAuth clients untuk dev/prod
   - Or use same client dengan multiple redirect URIs

3. **Restrict domains:**
   - Only add domains you own
   - Remove test domains sebelum production

4. **Monitor usage:**
   - Check Google Cloud Console untuk API usage
   - Set up billing alerts

5. **Rotate secrets:**
   - Regenerate Client Secret periodically
   - Update di Supabase setelah rotate

---

## 📊 Verification Checklist

### Google Cloud Console:
- [ ] Project created
- [ ] Google+ API enabled
- [ ] OAuth Consent Screen configured
- [ ] OAuth Client ID created
- [ ] Authorized JavaScript Origins added
- [ ] Authorized Redirect URIs added
- [ ] Client ID and Secret saved

### Supabase:
- [ ] Google provider enabled
- [ ] Client ID added
- [ ] Client Secret added
- [ ] Site URL configured
- [ ] Redirect URLs added
- [ ] Settings saved

### Testing:
- [ ] Local login works
- [ ] Production login works (after deploy)
- [ ] User profile created
- [ ] Redirect to dashboard works

---

## 💡 Quick Setup (For Testing Only)

**Jika hanya untuk testing local:**

1. **Supabase only:**
   - Enable Google provider
   - Use default settings (no Client ID/Secret)
   - Add redirect URL: `http://localhost:3000/auth/callback`
   - Save

2. **Test:**
   - Run `npm run dev`
   - Click "Continue with Google"
   - Should work dengan Supabase default OAuth

**Note:** Default settings hanya untuk development. Untuk production, HARUS setup Google OAuth credentials sendiri!

---

## 🎉 Done!

Setelah setup complete:
- ✅ Users bisa login dengan Google
- ✅ OAuth flow secure
- ✅ Works di local dan production
- ✅ Profile auto-created di database

**Next:** Deploy to Vercel dan update production URLs!

---

**Last Updated:** 2026-05-16  
**Status:** ✅ COMPLETE
