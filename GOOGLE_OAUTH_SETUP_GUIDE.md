# 🔐 Google OAuth Setup Guide

## Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project** (or select existing)
   - Click "Select a project" → "New Project"
   - Name: "JewelFit Virtual Try-On"
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search "Google+ API"
   - Click "Enable"

4. **Create OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Select "External" → Click "Create"
   - Fill in:
     - App name: JewelFit Virtual Try-On
     - User support email: your-email@gmail.com
     - Developer contact: your-email@gmail.com
   - Click "Save and Continue"
   - Scopes: Click "Add or Remove Scopes"
     - Select: `.../auth/userinfo.email`
     - Select: `.../auth/userinfo.profile`
   - Click "Save and Continue"
   - Test users: Add your Gmail address
   - Click "Save and Continue"

5. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "JewelFit Web Client"
   - Authorized JavaScript origins:
     - http://localhost:3000
     - http://localhost:3001 (if needed)
   - Authorized redirect URIs:
     - http://localhost:3000/api/auth/callback/google
     - http://localhost:3001/api/auth/callback/google (if needed)
   - Click "Create"

6. **Copy Credentials**
   - You'll get:
     - Client ID (looks like: `123456789-abc123.apps.googleusercontent.com`)
     - Client Secret (looks like: `GOCSPX-abc123xyz`)
   - ⚠️ Keep these secret!

---

## Step 2: Update Environment Variables

Update both `.env` files:

### Backend: `apps/api/.env`
```bash
# Add these lines
GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-client-secret-here"
```

### Frontend: `apps/web/.env.local`
```bash
# Already exists
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-change-in-production

# Add these new lines
GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-client-secret-here"
```

---

## Step 3: Update NextAuth Configuration

The file `apps/web/src/pages/api/auth/[...nextauth].ts` is already configured!

Just make sure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are in your `.env.local` file.

---

## Step 4: Test Google Sign-In

1. **Start your development servers:**
```bash
yarn dev
```

2. **Visit the login page:**
```
http://localhost:3000/auth/login
```

3. **Click "Sign in with Google"**

4. **You should see:**
   - Google account selection screen
   - Permission request screen
   - Redirect back to your app (homepage)

---

## Troubleshooting

### Error: "redirect_uri_mismatch"
**Solution:** Make sure the redirect URI in Google Console exactly matches:
```
http://localhost:3000/api/auth/callback/google
```

### Error: "Access blocked: This app's request is invalid"
**Solution:** 
1. OAuth consent screen not configured
2. Add yourself as a test user
3. Enable Google+ API

### Error: "GOOGLE_CLIENT_ID is not defined"
**Solution:** 
1. Make sure `.env.local` has the credentials
2. Restart your dev server: `Ctrl+C` then `yarn dev`
3. Don't use quotes in .env file (just the value)

### Google Sign-In button doesn't work
**Solution:**
1. Check browser console for errors
2. Verify NextAuth is installed: `npm list next-auth`
3. Clear browser cache and cookies

---

## Production Deployment

For production, update:

1. **Google Cloud Console:**
   - Add production domains to Authorized JavaScript origins:
     - https://yourdomain.com
   - Add to Authorized redirect URIs:
     - https://yourdomain.com/api/auth/callback/google

2. **Environment Variables:**
   - Set in your hosting platform (Vercel, Railway, etc.)
   - Use the same Client ID and Secret
   - Update `NEXTAUTH_URL=https://yourdomain.com`

---

## Security Best Practices

✅ **Never commit credentials to Git**
- Already in `.gitignore`: `.env`, `.env.local`

✅ **Use different credentials for dev/prod**
- Recommended but not required

✅ **Rotate secrets regularly**
- Every 3-6 months

✅ **Limit OAuth scopes**
- Only request email and profile

---

## Testing Checklist

- [ ] Environment variables set
- [ ] Google Console configured
- [ ] Dev server restarted
- [ ] Login page loads
- [ ] Google button visible
- [ ] Click redirects to Google
- [ ] Account selection works
- [ ] Redirect back to app works
- [ ] User session created
- [ ] Can access protected routes

---

**Done! Your Google Sign-In should now work! 🎉**

