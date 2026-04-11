# Deployment Guide

## Overview

This guide covers deploying JewelFit 3D to production using various cloud providers.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Vercel    │────▶│   Render     │────▶│  PostgreSQL │
│  (Frontend) │     │  (Backend)   │     │  (Database) │
└─────────────┘     └──────────────┘     └─────────────┘
       │                    │
       │                    │
       ▼                    ▼
┌─────────────┐     ┌──────────────┐
│ CloudFront  │     │   AWS S3     │
│    (CDN)    │     │  (Storage)   │
└─────────────┘     └──────────────┘
```

## Prerequisites

- GitHub account
- Vercel account
- Render account (or Heroku/Railway)
- AWS account (for S3) or DigitalOcean Spaces
- Stripe account
- Domain name (optional)

---

## 1. Database Setup

### Option A: Render PostgreSQL

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **PostgreSQL**
3. Configure:
   - Name: `jewelfit-db`
   - Database: `jewelfit`
   - User: `jewelfit`
   - Region: Choose closest to your users
   - Plan: Starter ($7/month) or Free
4. Click **Create Database**
5. Copy the **External Database URL**

### Option B: DigitalOcean Managed Database

1. Create managed PostgreSQL database
2. Configure firewall rules
3. Copy connection string

### Option C: AWS RDS

1. Create PostgreSQL instance
2. Configure security groups
3. Copy endpoint URL

---

## 2. Storage Setup (S3)

### AWS S3 + CloudFront

1. **Create S3 Bucket**:
   ```bash
   aws s3 mb s3://jewelfit-assets
   ```

2. **Configure CORS**:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["https://jewelfit.com"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

3. **Create IAM User**:
   - Create user with programmatic access
   - Attach policy: `AmazonS3FullAccess`
   - Save Access Key ID and Secret

4. **Setup CloudFront**:
   - Create distribution
   - Origin: S3 bucket
   - Enable HTTPS
   - Copy distribution domain

### DigitalOcean Spaces (Alternative)

1. Create Space
2. Generate API keys
3. Configure CORS
4. Enable CDN

---

## 3. Backend Deployment (Render)

### Create Web Service

1. Go to Render Dashboard
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `jewelfit-api`
   - **Environment**: `Node`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `apps/api`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### Environment Variables

Add these in Render dashboard:

```env
DATABASE_URL=<your-postgres-url>
JWT_SECRET=<generate-random-string>
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET=jewelfit-assets
S3_ACCESS_KEY=<your-aws-access-key>
S3_SECRET_KEY=<your-aws-secret-key>
S3_REGION=us-east-1
S3_PUBLIC_URL=https://<cloudfront-domain>
STRIPE_SECRET_KEY=<your-stripe-secret>
STRIPE_WEBHOOK_SECRET=<your-webhook-secret>
PORT=4000
NODE_ENV=production
CORS_ORIGIN=https://jewelfit.com
```

### Database Migrations

1. Add build command:
   ```bash
   npm install && npx prisma generate && npx prisma migrate deploy && npm run build
   ```

2. Or run manually:
   ```bash
   npx prisma migrate deploy
   npm run seed
   ```

### Health Check

- Path: `/health`
- Expected response: `{"status":"ok"}`

---

## 4. Frontend Deployment (Vercel)

### Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Environment Variables

Add in Vercel dashboard:

```env
NEXT_PUBLIC_API_URL=https://jewelfit-api.onrender.com
NEXTAUTH_URL=https://jewelfit.com
NEXTAUTH_SECRET=<generate-random-string>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

### Custom Domain

1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

---

## 5. Stripe Configuration

### Setup Webhooks

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Developers → Webhooks → Add endpoint
3. Endpoint URL: `https://jewelfit-api.onrender.com/api/webhooks/stripe`
4. Events to send:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.failed`
5. Copy **Signing secret** → Add to `STRIPE_WEBHOOK_SECRET`

### Test Mode

- Use test API keys during development
- Switch to live keys for production

---

## 6. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Authorized redirect URIs:
   ```
   https://jewelfit.com/api/auth/callback/google
   ```
6. Copy Client ID and Secret

---

## 7. DNS Configuration

### Cloudflare (Recommended)

1. Add your domain to Cloudflare
2. Update nameservers at registrar
3. Configure DNS records:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   Proxy: Enabled

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   Proxy: Enabled

   Type: CNAME
   Name: api
   Value: jewelfit-api.onrender.com
   Proxy: Enabled
   ```

4. SSL/TLS: Full (strict)
5. Enable Auto HTTPS Rewrites

---

## 8. Monitoring & Logging

### Sentry (Error Tracking)

1. Create Sentry project
2. Install SDK:
   ```bash
   npm install @sentry/node @sentry/nextjs
   ```
3. Configure in `apps/api/src/index.ts` and `apps/web/next.config.js`

### LogRocket (Session Replay)

1. Create LogRocket project
2. Add to frontend
3. Track user sessions

### Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- StatusCake

---

## 9. Performance Optimization

### CDN Configuration

1. **CloudFront** for S3 assets
2. **Vercel Edge Network** for frontend
3. **Cloudflare** for DNS and DDoS protection

### Caching

1. Set cache headers:
   ```
   Cache-Control: public, max-age=31536000, immutable
   ```

2. Versioned URLs for assets:
   ```
   /assets/models/necklace-v2.glb
   ```

### Image Optimization

1. Use Next.js Image component
2. Serve WebP format
3. Lazy load images

### 3D Asset Optimization

1. Compress glTF with Draco
2. Use KTX2 textures
3. Implement LOD (Level of Detail)

---

## 10. Security Checklist

- [ ] HTTPS enabled everywhere
- [ ] CORS configured correctly
- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] API rate limiting enabled
- [ ] SQL injection prevention (Prisma)
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented
- [ ] File upload validation
- [ ] Secrets not in code
- [ ] Security headers set (Helmet.js)
- [ ] Dependencies updated

---

## 11. Backup Strategy

### Database Backups

**Render**:
- Automatic daily backups (paid plans)
- Manual backups via dashboard

**Manual Backup**:
```bash
pg_dump $DATABASE_URL > backup.sql
```

### S3 Versioning

Enable versioning on S3 bucket:
```bash
aws s3api put-bucket-versioning \
  --bucket jewelfit-assets \
  --versioning-configuration Status=Enabled
```

---

## 12. CI/CD Pipeline

GitHub Actions is already configured in `.github/workflows/ci.yml`

### Automatic Deployment

**Vercel**:
- Auto-deploys on push to `main`
- Preview deployments for PRs

**Render**:
- Auto-deploys on push to `main`
- Manual deploys via dashboard

---

## 13. Post-Deployment

### Verify Deployment

1. **Frontend**: https://jewelfit.com
   - [ ] Homepage loads
   - [ ] Authentication works
   - [ ] Photo mode works
   - [ ] 3D mode works

2. **Backend**: https://api.jewelfit.com
   - [ ] Health check: `/health`
   - [ ] API endpoints respond
   - [ ] Database connected

3. **Assets**: https://cdn.jewelfit.com
   - [ ] 3D models load
   - [ ] Textures load
   - [ ] Images load

### Run Seed Data

```bash
# SSH into Render or run via dashboard
npm run seed
```

### Test Payments

1. Use Stripe test cards
2. Verify webhook receives events
3. Check order creation

---

## 14. Scaling

### Horizontal Scaling

**Render**:
- Upgrade to Standard plan
- Enable auto-scaling

**Vercel**:
- Automatically scales

### Database Scaling

- Upgrade to larger instance
- Enable read replicas
- Implement connection pooling (PgBouncer)

### CDN Scaling

- CloudFront automatically scales
- Configure cache invalidation

---

## 15. Cost Estimation

### Monthly Costs (Estimated)

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Pro | $20 |
| Render | Starter | $7 |
| PostgreSQL | Starter | $7 |
| AWS S3 | Pay-as-you-go | $5-20 |
| CloudFront | Pay-as-you-go | $10-50 |
| Stripe | Transaction fees | 2.9% + $0.30 |
| **Total** | | **$50-100/month** |

### Free Tier Options

- Vercel: Hobby (free)
- Render: Free tier available
- PostgreSQL: Free tier (limited)
- Netlify: Alternative to Vercel (free tier)

---

## 16. Rollback Procedure

### Vercel

1. Go to Deployments
2. Find previous deployment
3. Click **Promote to Production**

### Render

1. Go to Deploys
2. Find previous deploy
3. Click **Redeploy**

### Database

```bash
# Restore from backup
psql $DATABASE_URL < backup.sql
```

---

## Support

For deployment issues:
- Check logs in Vercel/Render dashboard
- Review error tracking (Sentry)
- Contact support teams

---

**Last Updated**: 2024-01-01
