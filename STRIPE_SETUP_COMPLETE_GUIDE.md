# 🔐 Stripe Payment Setup - Complete Guide

## ✅ Current Status: Demo Mode Active

Your checkout now works in **DEMO MODE** without Stripe keys! 

**What happens in demo mode:**
- ✅ Shopping cart works
- ✅ Checkout page works
- ✅ Order is created in database
- ✅ Success page displays
- ❌ No real payment processing (demo only)

---

## 🚀 Quick Test (Demo Mode - No Setup Required)

### Test Checkout NOW:
1. ✅ Visit: http://localhost:3000/products
2. ✅ Click "Add to Cart" on products
3. ✅ Go to cart: http://localhost:3000/cart
4. ✅ Click "Proceed to Checkout"
5. ✅ Click "Place Order"
6. ✅ See success page with order confirmation

**This works immediately without any Stripe setup!**

---

## 💳 Enable Real Payments (Optional)

### Why Add Stripe?
- Accept real credit card payments
- Process live transactions
- Professional payment flow
- Secure hosted checkout

### When to Add Stripe?
- **Now:** If you want to test with Stripe's test cards
- **Later:** When ready for real payments
- **Never:** If staying in demo mode is fine

---

## 📋 Stripe Setup Steps

### Step 1: Create Stripe Account (5 minutes)

1. **Sign up at Stripe:**
   - Go to: https://stripe.com
   - Click "Sign up"
   - Fill in details
   - Verify email

2. **Access Dashboard:**
   - Login to: https://dashboard.stripe.com
   - You'll see your Dashboard

---

### Step 2: Get API Keys (2 minutes)

1. **Navigate to API Keys:**
   - Dashboard → Developers → API keys
   - Or visit: https://dashboard.stripe.com/test/apikeys

2. **Copy Test Keys:**
   ```
   Publishable key: pk_test_xxxxxxxxxxxxx
   Secret key: sk_test_xxxxxxxxxxxxx
   ```

   **Important:** Use TEST keys (start with `pk_test_` and `sk_test_`)
   - Test keys = Free, safe testing
   - Live keys = Real money (don't use yet!)

---

### Step 3: Configure Backend (1 minute)

**File:** `apps/api/.env`

```bash
# Find these lines (around line 20):
# STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
# STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Replace with:
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY_HERE
# STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret  # Keep commented for now
```

**Example:**
```bash
STRIPE_SECRET_KEY=sk_test_51J2xjKH6BtAzP9qL3xYZ...
```

---

### Step 4: Configure Frontend (1 minute)

**File:** `apps/web/.env.local`

Add at the end of file:
```bash
# Stripe (add this line)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
```

**Example:**
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51J2xjKH6BtAzP9qL...
```

---

### Step 5: Restart Servers (30 seconds)

```bash
# Stop servers (Ctrl+C in terminal)

# Restart
npm run dev
```

**Done!** Stripe is now configured.

---

## 🧪 Testing with Stripe

### Test Cards (Use These):

**Successful Payment:**
```
Card: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/34)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

**Declined Payment:**
```
Card: 4000 0000 0000 0002
(Same expiry, CVC, ZIP as above)
```

**Requires Authentication:**
```
Card: 4000 0025 0000 3155
(Same expiry, CVC, ZIP as above)
```

### Test Flow:
1. Add items to cart
2. Go to checkout
3. Click "Place Order"
4. **Redirected to Stripe checkout page**
5. Enter test card: `4242 4242 4242 4242`
6. Click "Pay"
7. Redirected back to success page ✅

---

## 🔄 Comparison: Demo vs Stripe

### Demo Mode (Current - No Setup):
```
Cart → Checkout → Click "Place Order" → Success Page
                    ↓
              Order created
              (No payment)
```

**Pros:**
- ✅ Works immediately
- ✅ No setup needed
- ✅ Good for testing UI/UX
- ✅ Good for demos/presentations

**Cons:**
- ❌ No real payment
- ❌ Can't test payment flow
- ❌ Not production-ready

### Stripe Mode (With Keys):
```
Cart → Checkout → Click "Place Order" → Stripe Page → Enter Card → Success
                                            ↓
                                    Real payment processing
                                    Secure hosted checkout
```

**Pros:**
- ✅ Real payment processing
- ✅ Professional checkout
- ✅ Test with Stripe test cards
- ✅ Production-ready

**Cons:**
- ❌ Requires Stripe account
- ❌ Need to configure keys
- ❌ More complex testing

---

## 🎯 Which Mode Should You Use?

### Use Demo Mode If:
- ✅ Testing shopping cart functionality
- ✅ Demonstrating to stakeholders
- ✅ Developing other features
- ✅ Not ready for payment integration
- ✅ Quick testing needed

### Use Stripe Mode If:
- ✅ Testing payment flow
- ✅ Preparing for production
- ✅ Want professional checkout
- ✅ Need real payment processing
- ✅ Interview/presentation requires it

---

## 🐛 Troubleshooting

### Issue: "Failed to create checkout session"

**If in Demo Mode:**
- Check browser console for errors
- Check terminal for backend errors
- Verify you're logged in

**If in Stripe Mode:**
- Verify `STRIPE_SECRET_KEY` is set in `apps/api/.env`
- Check key starts with `sk_test_`
- Restart servers after adding keys
- Check backend terminal for Stripe errors

### Issue: Redirected to Stripe but error occurs

**Check:**
- Is `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` set?
- Does it match the secret key (same account)?
- Are you using TEST keys (not live)?
- Restart frontend after adding key

### Issue: Payment succeeds but no order created

**Check:**
- Webhook handler needs configuration (advanced)
- For now, order created when clicking "Place Order"
- Check database with: `npx prisma studio` (in apps/api)

---

## 📊 Environment Variable Checklist

### Backend (.env in apps/api/):
```bash
# Required (already set):
✅ DATABASE_URL
✅ JWT_SECRET
✅ PORT
✅ CORS_ORIGIN

# For Stripe (optional):
⚠️ STRIPE_SECRET_KEY=sk_test_...        # Add this
⚠️ STRIPE_WEBHOOK_SECRET=whsec_...     # Add later (advanced)
```

### Frontend (.env.local in apps/web/):
```bash
# Required (already set):
✅ NEXTAUTH_URL
✅ NEXTAUTH_SECRET
✅ GOOGLE_CLIENT_ID
✅ GOOGLE_CLIENT_SECRET

# For Stripe (optional):
⚠️ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Add this
```

---

## 🔐 Security Notes

### Test vs Live Keys:

**Test Keys (Safe to use):**
- Start with: `pk_test_` and `sk_test_`
- No real money
- Can share in development
- Use for testing only

**Live Keys (Real money!):**
- Start with: `pk_live_` and `sk_live_`
- Real credit cards
- Real money transactions
- **Never commit to git!**
- Use only in production

### Best Practices:
- ✅ Use test keys for development
- ✅ Keep .env in .gitignore
- ✅ Never commit keys to git
- ✅ Rotate keys if exposed
- ✅ Use environment variables

---

## 🚀 Going Live (Future)

### When Ready for Production:

1. **Complete Stripe Account Setup:**
   - Add business details
   - Add bank account
   - Verify identity

2. **Switch to Live Keys:**
   - Get live keys from Dashboard
   - Update .env files
   - Test thoroughly

3. **Setup Webhooks:**
   - Add webhook endpoint
   - Configure events
   - Test webhook locally first

4. **Test in Production:**
   - Use small amounts
   - Test refunds
   - Monitor dashboard

5. **Go Live:**
   - Update documentation
   - Monitor transactions
   - Handle customer support

---

## 📚 Additional Resources

### Stripe Documentation:
- **Getting Started:** https://stripe.com/docs
- **Testing:** https://stripe.com/docs/testing
- **Test Cards:** https://stripe.com/docs/testing#cards
- **Checkout:** https://stripe.com/docs/payments/checkout

### Your Documentation:
- **Shopping Cart Guide:** `SHOPPING_CART_IMPLEMENTATION.md`
- **Quick Start:** `CART_QUICK_START.md`
- **Project Status:** `PROJECT_STATUS_UPDATE.md`

---

## ✅ Quick Setup Summary

### For Demo Mode (Current - Works Now):
```bash
# No setup needed!
# Just use the app as-is
✅ Shopping cart works
✅ Checkout works
✅ Orders created
❌ No real payment
```

### For Stripe Mode (10 minutes):
```bash
1. Create Stripe account
2. Get test API keys
3. Add to apps/api/.env:
   STRIPE_SECRET_KEY=sk_test_xxx
4. Add to apps/web/.env.local:
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
5. Restart servers: npm run dev
6. Test with card: 4242 4242 4242 4242
```

---

## 🎉 Success Indicators

### Demo Mode Working:
- ✅ Can add items to cart
- ✅ Cart badge updates
- ✅ Can view cart page
- ✅ Can go to checkout
- ✅ Clicking "Place Order" shows success page
- ✅ Order appears in database

### Stripe Mode Working:
- ✅ Everything above, PLUS:
- ✅ Redirected to Stripe checkout page
- ✅ Can enter test card
- ✅ Payment processes
- ✅ Redirected back to success page
- ✅ No errors in console/terminal

---

## 💡 Pro Tips

### For Testing:
- Use demo mode for fast testing
- Use Stripe mode for realistic testing
- Clear cart between tests (browser localStorage)
- Test with different quantities
- Test with multiple items

### For Development:
- Start with demo mode
- Add Stripe when needed
- Test with test cards only
- Monitor Stripe dashboard
- Check terminal for errors

### For Production:
- Complete Stripe verification
- Switch to live keys
- Setup webhooks properly
- Test thoroughly
- Monitor transactions

---

## 🆘 Need Help?

### Common Questions:

**Q: Do I need Stripe to test the cart?**
A: No! Demo mode works perfectly for testing cart functionality.

**Q: How do I know if I'm in demo mode?**
A: Check backend terminal - you'll see "DEMO MODE" message when placing order.

**Q: Can I use real cards in test mode?**
A: No! Only use Stripe test cards in test mode. Real cards won't work.

**Q: How do I switch from demo to Stripe?**
A: Just add the API keys to .env files and restart servers.

**Q: Is demo mode production-ready?**
A: No, demo mode is for testing only. Use Stripe for production.

---

## 🎯 What to Do Now

### Option 1: Stay in Demo Mode
**Best if:** Just testing, not ready for payments yet
```bash
# Do nothing! It already works.
✅ Test the cart
✅ Test checkout
✅ See success page
```

### Option 2: Setup Stripe
**Best if:** Want realistic payment testing
```bash
1. Follow "Step 2: Get API Keys" above
2. Add keys to .env files
3. Restart servers
4. Test with test card
```

### Option 3: Hybrid Approach
**Best if:** Want both options
```bash
# Can switch between modes easily:
- Remove STRIPE_SECRET_KEY = Demo mode
- Add STRIPE_SECRET_KEY = Stripe mode
- Just restart servers to switch
```

---

**Your checkout is working in demo mode right now!** 🎉

Test it at: http://localhost:3000/cart

*Stripe Setup Guide*  
*Version: 1.0.0*  
*Date: June 26, 2026*
