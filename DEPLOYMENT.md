# 🚀 Deployment Guide

Complete guide for deploying the Virtual Jewelry Try-On Platform to production.

## 📋 Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Configuration](#environment-configuration)
- [Deployment Options](#deployment-options)
- [Database Migration](#database-migration)
- [Security Hardening](#security-hardening)
- [Monitoring & Logging](#monitoring--logging)
- [Backup Strategy](#backup-strategy)

---

## ✅ Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (`yarn test`)
- [ ] No linting errors (`yarn lint`)
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Version bumped in package.json

### Security
- [ ] All secrets rotated (no development secrets in production)
- [ ] Environment variables properly configured
- [ ] HTTPS/SSL certificates obtained
- [ ] CORS origins restricted
- [ ] Rate limiting configured
- [ ] Security headers enabled

### Performance
- [ ] Build optimized (`yarn build`)
- [ ] Images optimized
- [ ] Database indexed
- [ ] Caching strategy implemented
- [ ] CDN configured for static assets

### Monitoring
- [ ] Error tracking configured (e.g., Sentry)
- [ ] Performance monitoring enabled
- [ ] Logging configured
- [ ] Uptime monitoring set up
- [ ] Alerts configured

---

## 🔐 Environment Configuration

### Production Environment Variables

#### API (.env)

```env
# Database - Use PostgreSQL in production
DATABASE_URL=postgresql://user:password@host:5432/jewelfit_prod

# JWT Secret - Generate with: openssl rand -base64 32
JWT_SECRET=your-production-jwt-secret-minimum-32-characters

# Server
PORT=4000
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com

# S3/Storage
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET=jewelfit-prod-assets
S3_ACCESS_KEY=your-aws-access-key
S3_SECRET_KEY=your-aws-secret-key
S3_REGION=us-east-1
S3_PUBLIC_URL=https://cdn.yourdomain.com

# Stripe
STRIPE_SECRET_KEY=sk_live_your_live_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Google OAuth
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

#### Web (.env.production)

```env
# API
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-nextauth-secret-minimum-32-characters

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-production-google-client-id

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

---

## 🌐 Deployment Options

### Option 1: Vercel + Railway (Recommended for Quick Deploy)

#### Deploy Web App to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   cd apps/web
   vercel --prod
   ```

3. **Configure Environment Variables** in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.production`

#### Deploy API to Railway

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Initialize**:
   ```bash
   railway login
   railway init
   ```

3. **Deploy**:
   ```bash
   cd apps/api
   railway up
   ```

4. **Add Environment Variables** in Railway Dashboard

5. **Set up PostgreSQL**:
   - Add PostgreSQL plugin in Railway
   - Copy `DATABASE_URL` to environment variables

---

### Option 2: AWS (Production-Grade)

#### Architecture
```
┌─────────────┐
│   Route 53  │ (DNS)
└──────┬──────┘
       │
┌──────▼──────┐
│ CloudFront  │ (CDN)
└──────┬──────┘
       │
┌──────▼──────┐
│     ALB     │ (Load Balancer)
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
┌──▼──┐ ┌──▼──┐
│ ECS │ │ ECS │ (Containers)
└─────┘ └─────┘
   │       │
   └───┬───┘
       │
┌──────▼──────┐
│     RDS     │ (PostgreSQL)
└─────────────┘
```

#### Steps

1. **Build Docker Images**:
   ```bash
   # Build API
   docker build -f infra/Dockerfile.api -t jewelfit-api:latest .
   
   # Build Web
   docker build -f infra/Dockerfile.web -t jewelfit-web:latest .
   ```

2. **Push to ECR**:
   ```bash
   # Authenticate
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URI
   
   # Tag and push
   docker tag jewelfit-api:latest YOUR_ECR_URI/jewelfit-api:latest
   docker push YOUR_ECR_URI/jewelfit-api:latest
   
   docker tag jewelfit-web:latest YOUR_ECR_URI/jewelfit-web:latest
   docker push YOUR_ECR_URI/jewelfit-web:latest
   ```

3. **Set up RDS PostgreSQL**:
   - Create RDS instance
   - Configure security groups
   - Note connection string

4. **Create ECS Cluster**:
   - Create Fargate cluster
   - Define task definitions
   - Create services
   - Configure auto-scaling

5. **Set up Application Load Balancer**:
   - Create ALB
   - Configure target groups
   - Set up health checks
   - Configure SSL certificate

6. **Configure CloudFront**:
   - Create distribution
   - Set ALB as origin
   - Configure caching rules
   - Add custom domain

---

### Option 3: DigitalOcean App Platform

1. **Connect Repository**:
   - Go to DigitalOcean App Platform
   - Connect GitHub repository

2. **Configure Components**:
   
   **Web Component**:
   - Type: Web Service
   - Source: `apps/web`
   - Build Command: `yarn build`
   - Run Command: `yarn start`
   - Port: 3000

   **API Component**:
   - Type: Web Service
   - Source: `apps/api`
   - Build Command: `yarn build`
   - Run Command: `yarn start`
   - Port: 4000

3. **Add Database**:
   - Add PostgreSQL database
   - Note connection string

4. **Configure Environment Variables**:
   - Add all production environment variables

5. **Deploy**:
   - Click "Deploy"

---

### Option 4: Docker Compose (VPS/Self-Hosted)

#### Prerequisites
- VPS with Docker installed (Ubuntu 22.04 recommended)
- Domain name pointed to VPS IP
- SSL certificate (Let's Encrypt)

#### Steps

1. **Update docker-compose.yml for production**:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: jewelfit_prod
      POSTGRES_USER: jewelfit
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  api:
    build:
      context: .
      dockerfile: infra/Dockerfile.api
    environment:
      DATABASE_URL: postgresql://jewelfit:${DB_PASSWORD}@db:5432/jewelfit_prod
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    depends_on:
      - db
    restart: always

  web:
    build:
      context: .
      dockerfile: infra/Dockerfile.web
    environment:
      NEXT_PUBLIC_API_URL: https://api.yourdomain.com
      NEXTAUTH_URL: https://yourdomain.com
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
    depends_on:
      - api
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./infra/nginx.conf:/etc/nginx/nginx.conf
      - ./infra/ssl:/etc/nginx/ssl
    depends_on:
      - web
      - api
    restart: always

volumes:
  postgres_data:
```

2. **Create nginx.conf**:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:4000;
    }

    upstream web {
        server web:3000;
    }

    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location /api {
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location / {
            proxy_pass http://web;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

3. **Deploy**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

---

## 🗄️ Database Migration

### PostgreSQL Setup

1. **Create Production Database**:
   ```sql
   CREATE DATABASE jewelfit_prod;
   CREATE USER jewelfit WITH ENCRYPTED PASSWORD 'your-password';
   GRANT ALL PRIVILEGES ON DATABASE jewelfit_prod TO jewelfit;
   ```

2. **Run Migrations**:
   ```bash
   cd apps/api
   DATABASE_URL="postgresql://..." npx prisma migrate deploy
   ```

3. **Seed Production Data** (if needed):
   ```bash
   npm run seed
   ```

### Backup Before Migration

```bash
# Backup current database
pg_dump -U jewelfit jewelfit_prod > backup_$(date +%Y%m%d).sql

# Restore if needed
psql -U jewelfit jewelfit_prod < backup_20240502.sql
```

---

## 🔒 Security Hardening

### 1. Environment Variables

- Never commit `.env` files
- Use secrets management (AWS Secrets Manager, HashiCorp Vault)
- Rotate secrets regularly

### 2. HTTPS/SSL

```bash
# Get Let's Encrypt certificate
certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com
```

### 3. Security Headers

Add to API middleware:

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### 4. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 5. Database Security

- Use connection pooling
- Enable SSL for database connections
- Implement row-level security
- Regular security audits

---

## 📊 Monitoring & Logging

### Error Tracking (Sentry)

```typescript
// apps/api/src/index.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// apps/web/src/pages/_app.tsx
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Logging

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

### Uptime Monitoring

- Use services like UptimeRobot, Pingdom, or StatusCake
- Set up alerts for downtime
- Monitor API response times

---

## 💾 Backup Strategy

### Database Backups

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U jewelfit jewelfit_prod | gzip > /backups/db_$DATE.sql.gz

# Keep only last 30 days
find /backups -name "db_*.sql.gz" -mtime +30 -delete
```

### File Storage Backups

- Enable versioning on S3 bucket
- Set up lifecycle policies
- Regular backup verification

### Disaster Recovery Plan

1. Document recovery procedures
2. Test recovery process regularly
3. Maintain off-site backups
4. Define RTO (Recovery Time Objective)
5. Define RPO (Recovery Point Objective)

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: yarn install
      - run: yarn test
      - run: yarn lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          # Your deployment commands
```

---

## 📞 Post-Deployment

### Verification Checklist

- [ ] Website accessible via HTTPS
- [ ] API endpoints responding
- [ ] Database connections working
- [ ] Authentication functioning
- [ ] File uploads working
- [ ] 3D viewer loading
- [ ] Photo try-on functional
- [ ] Admin dashboard accessible
- [ ] Email notifications working (if configured)
- [ ] Payment processing working (if configured)

### Performance Testing

```bash
# Load testing with Apache Bench
ab -n 1000 -c 10 https://yourdomain.com/

# Or use k6
k6 run load-test.js
```

---

## 🆘 Troubleshooting

### Common Issues

**Issue**: 502 Bad Gateway
- Check if services are running
- Verify network connectivity
- Check logs for errors

**Issue**: Database connection timeout
- Verify DATABASE_URL
- Check security groups/firewall
- Verify database is running

**Issue**: Static assets not loading
- Check CDN configuration
- Verify CORS settings
- Check file permissions

---

## 📚 Additional Resources

- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [12 Factor App](https://12factor.net/)
- [OWASP Security Guidelines](https://owasp.org/)

---

**Deployment completed successfully! 🎉**

Monitor your application closely for the first 24-48 hours after deployment.
