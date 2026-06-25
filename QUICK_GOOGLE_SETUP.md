# ⚡ Quick Google Sign-In Setup (5 Minutes)

## 🎯 What You Need

1. Google account
2. Your project running locally
3. 5 minutes

---

## 📝 Step 1: Get Google Credentials (2 minutes)

1. **Go to**: https://console.cloud.google.com/
2. **Create project**: Click "New Project" → Name it "JewelFit"
3. **OAuth Consent**:
   - Click "APIs & Services" → "OAuth consent screen"
   - Choose "External" → Click "Create"
   - App name: `JewelFit`
   - Your email in both fields
   - Click "Save and Continue" (3 times)
4. **Create Credentials**:
   - Click "Credentials" → "Create Credentials" → "OAuth client ID"
   - Type: "Web application"
   - Name: "JewelFit Web"
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
   - Click "Create"
5. **Copy** your Client ID and Client Secret

---

## 🔧 Step 2: Update Environment Variables (1 minute)

Edit `apps/web/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=any-random-string-here-change-in-production

# Add these lines with YOUR credentials:
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-YOUR_SECRET
```

**Important:** Replace `YOUR_CLIENT_ID` and `YOUR_SECRET` with the values you copied!

---

## 🚀 Step 3: Test It (2 minutes)

```bash
# Start your servers
yarn dev

# Or separately:
cd apps/api && npm run dev
cd apps/web && npm run dev
```

1. Visit: http://localhost:3000/auth/login
2. Click "Sign in with Google"
3. Choose your Google account
4. Click "Continue" to grant permissions
5. You should be redirected to the homepage, logged in! ✅

---

## ✅ Verification

**You're signed in if you see:**
- Your name/email in the navbar
- Can access your account page
- Session persists after page refresh

**Check database:**
```bash
cd apps/api
npx prisma studio
# Open User table → Your Google email should be there
```

---

## 🐛 Not Working?

### Error: "redirect_uri_mismatch"
- Double-check redirect URI in Google Console is EXACTLY:
  ```
  http://localhost:3000/api/auth/callback/google
  ```
- No trailing slash!

### Error: "GOOGLE_CLIENT_ID is not defined"
- Restart dev servers (Ctrl+C, then `yarn dev`)
- Check `.env.local` file exists in `apps/web/` folder
- No quotes around values in .env file

### Button doesn't work
- Clear browser cache
- Try incognito/private window
- Check browser console for errors

---

## 📚 Full Documentation

For detailed setup and troubleshooting:
- 📖 `GOOGLE_OAUTH_SETUP_GUIDE.md` - Complete setup guide
- 🧪 `GOOGLE_SIGNIN_TESTING.md` - Testing & debugging

---

## 🎉 Done!

Your Google Sign-In is now working! Users can:
- ✅ Sign up with Google (1 click)
- ✅ Login with Google (1 click)
- ✅ No password needed
- ✅ Avatar automatically imported

**Next Steps:**
- Add Google Sign-In to registration page
- Test with multiple accounts
- Deploy to production (update redirect URIs)

---

**Need help?** Check the detailed guides or look at error messages in:
- Browser DevTools → Console tab
- Terminal output (API & Web)

