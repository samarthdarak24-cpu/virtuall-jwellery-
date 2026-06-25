# 🧪 Google Sign-In Testing & Troubleshooting

## ✅ Quick Start Checklist

### 1. Prerequisites Installed
- [ ] Node.js 18+ installed
- [ ] Yarn installed
- [ ] Project dependencies installed (`yarn install`)

### 2. Google Cloud Console Setup
- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth credentials created (Client ID + Secret)
- [ ] Authorized redirect URIs added
- [ ] Test user added (your Gmail)

### 3. Environment Variables Set
- [ ] `GOOGLE_CLIENT_ID` in `.env.local`
- [ ] `GOOGLE_CLIENT_SECRET` in `.env.local`
- [ ] `NEXTAUTH_URL` set to `http://localhost:3000`
- [ ] `NEXTAUTH_SECRET` has a value

---

## 🚀 Step-by-Step Testing

### Step 1: Start Development Servers

```bash
# Terminal 1: Start API
cd apps/api
npm run dev

# Terminal 2: Start Web
cd apps/web
npm run dev
```

**Expected Output:**
```
API: ✓ Server running on port 4000
Web: ✓ Ready on http://localhost:3000
```

### Step 2: Navigate to Login Page

```
http://localhost:3000/auth/login
```

**You should see:**
- Email/password fields
- "Sign in with Google" button with Google logo
- Clean, dark-themed UI

### Step 3: Click "Sign in with Google"

**What happens:**
1. Redirects to Google account selection
2. Shows list of your Google accounts
3. Click on your account

### Step 4: Grant Permissions

**Google will ask for:**
- View your email address
- View your basic profile info

Click "Continue" or "Allow"

### Step 5: Redirect Back

**You should be redirected to:**
```
http://localhost:3000/
```

**And see:**
- Your name in the navbar (if implemented)
- Access to protected routes
- Logout option

---

## 🔍 Verification Steps

### Verify User Created in Database

```bash
# Option 1: Using Prisma Studio
cd apps/api
npx prisma studio

# Navigate to User table
# Look for your Google email
```

### Verify Session

Open browser DevTools:

**Console:**
```javascript
// Check session
fetch('/api/auth/session').then(r => r.json()).then(console.log)

// Should return:
{
  user: {
    name: "Your Name",
    email: "you@gmail.com",
    image: "https://lh3.googleusercontent.com/...",
    id: "user-id-here"
  },
  expires: "2026-07-02..."
}
```

**Application Tab:**
- Look for cookies: `next-auth.session-token`
- Should be HttpOnly, Secure (in prod), SameSite: lax

### Verify Backend API

```bash
# Test the Google auth endpoint
curl -X POST http://localhost:4000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gmail.com",
    "name": "Test User",
    "image": "https://example.com/avatar.jpg",
    "googleId": "123456789"
  }'

# Expected: User created/logged in, JWT returned
```

---

## 🐛 Common Errors & Solutions

### Error 1: "redirect_uri_mismatch"

**Symptom:**
```
Error 400: redirect_uri_mismatch
The redirect URI in the request, http://localhost:3000/api/auth/callback/google,
does not match the ones authorized for the OAuth client.
```

**Solution:**
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth client
3. Add EXACTLY: `http://localhost:3000/api/auth/callback/google`
4. Save
5. Wait 5 minutes for changes to propagate
6. Try again

### Error 2: "Access blocked: This app's request is invalid"

**Symptom:**
Google shows error page when clicking "Sign in with Google"

**Solution:**
1. Go to Google Cloud Console → OAuth consent screen
2. Add yourself as a test user
3. Verify app name is filled in
4. Verify support email is set
5. Save changes

### Error 3: "GOOGLE_CLIENT_ID is not defined"

**Symptom:**
```
TypeError: Cannot read properties of undefined
```

**Solution:**
1. Check `.env.local` file exists in `apps/web/`
2. Verify variable names are EXACTLY:
   ```
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   ```
3. NO quotes around values
4. Restart dev server: `Ctrl+C` then `npm run dev`

### Error 4: Button clicks but nothing happens

**Symptom:**
Google Sign-In button doesn't redirect

**Solution:**
1. Check browser console for errors
2. Verify NextAuth is installed:
   ```bash
   cd apps/web
   npm list next-auth
   ```
3. Clear browser cache and cookies
4. Try incognito/private window

### Error 5: "Session not found after redirect"

**Symptom:**
Redirects to homepage but not logged in

**Solution:**
1. Check `NEXTAUTH_SECRET` is set in `.env.local`
2. Verify `NEXTAUTH_URL=http://localhost:3000`
3. Check browser allows third-party cookies
4. Try different browser

### Error 6: "Invalid callback URL"

**Symptom:**
NextAuth shows error page

**Solution:**
1. Verify `[...nextauth].ts` file exists in `apps/web/src/pages/api/auth/`
2. File name must be EXACTLY: `[...nextauth].ts` (with brackets)
3. Restart dev server

---

## 🧪 Testing Scenarios

### Scenario 1: New User Sign-Up

**Steps:**
1. Use Gmail not registered in your app
2. Click "Sign in with Google"
3. Select account
4. Grant permissions

**Expected:**
- New user created in database
- Password field is NULL
- Avatar URL saved from Google
- Redirected to homepage
- Logged in automatically

### Scenario 2: Existing User Login

**Steps:**
1. Use Gmail already registered (via email/password)
2. Click "Sign in with Google"
3. Select account

**Expected:**
- Finds existing user by email
- Updates avatar if not set
- Logs in successfully
- No duplicate user created

### Scenario 3: Logout and Re-login

**Steps:**
1. Click logout
2. Session cleared
3. Navigate to login page
4. Click "Sign in with Google" again

**Expected:**
- No permission request (already granted)
- Instant login
- Session restored

### Scenario 4: Multiple Accounts

**Steps:**
1. Sign in with Account A
2. Logout
3. Sign in with Account B

**Expected:**
- Both accounts work independently
- No session mixing
- Correct user data for each

---

## 📊 Debugging Tools

### Enable NextAuth Debug Mode

Already enabled in development! Check terminal output:

```
[next-auth][debug] ...
```

### Check Database

```bash
cd apps/api
npx prisma studio
```

View tables:
- User: See all registered users
- Check email, avatarUrl, password (should be NULL for Google users)

### Network Tab (Browser DevTools)

1. Open DevTools → Network tab
2. Click "Sign in with Google"
3. Watch requests:
   - `/api/auth/signin/google` → Should be 302 redirect
   - Google OAuth → Should be 200
   - `/api/auth/callback/google` → Should be 302 redirect
   - `/` → Should be 200 (homepage)

### Console Logs

Add to `[...nextauth].ts` for debugging:

```typescript
callbacks: {
  async signIn({ user, account, profile }) {
    console.log('🔐 Sign In Callback:', { user, account, profile });
    return true;
  },
  async jwt({ token, user, account }) {
    console.log('🎫 JWT Callback:', { token, user, account });
    return token;
  },
  async session({ session, token }) {
    console.log('👤 Session Callback:', { session, token });
    return session;
  },
}
```

---

## ✅ Success Indicators

Your Google Sign-In is working when:

1. ✅ Button visible on login page
2. ✅ Click redirects to Google
3. ✅ Account selection works
4. ✅ Permission grant successful
5. ✅ Redirects back to your app
6. ✅ User data visible in session
7. ✅ Can access protected routes
8. ✅ User in database
9. ✅ Logout works
10. ✅ Re-login works without permission request

---

## 🔒 Security Checklist

- [ ] Credentials not committed to Git
- [ ] `.env.local` in `.gitignore`
- [ ] HTTPS in production
- [ ] Production redirect URIs set
- [ ] Test users list is limited
- [ ] OAuth scopes are minimal (email, profile only)

---

## 📱 Mobile Testing

**React Native / Mobile Browser:**

Update redirect URIs in Google Console:
```
# For React Native
myapp://auth/callback/google

# For mobile browser
https://yourdomain.com/api/auth/callback/google
```

---

## 🎓 Further Reading

- [NextAuth.js Google Provider Docs](https://next-auth.js.org/providers/google)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [OAuth Consent Screen](https://support.google.com/cloud/answer/10311615)

---

## 💡 Pro Tips

1. **Use Incognito for Testing**
   - Avoid cached sessions
   - Test fresh user flow

2. **Check Expiry Dates**
   - Sessions expire after 7 days
   - Tokens need refresh

3. **Monitor Quota**
   - Google OAuth has rate limits
   - 10,000 requests/day (free tier)

4. **Use Correct Environment**
   - Dev: `http://localhost:3000`
   - Prod: `https://yourdomain.com`
   - Don't mix them!

---

**Your Google Sign-In should now work perfectly! 🎉**

If you still have issues, check the logs and reach out for support.

