# 🚀 Complete Setup Guide

This guide will walk you through setting up the Virtual Jewelry Try-On Platform from scratch.

## 📋 Prerequisites

### Required Software
- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **Yarn**: v1.22.0 or higher (`npm install -g yarn`)
- **Git**: Latest version ([Download](https://git-scm.com/))
- **Python**: 3.8+ (optional, for ML service)

### Optional Tools
- **Docker Desktop**: For containerized deployment
- **VS Code**: Recommended IDE with extensions:
  - ESLint
  - Prettier
  - Prisma
  - Tailwind CSS IntelliSense

---

## 🔧 Step-by-Step Setup

### 1️⃣ Clone the Repository

#### Windows (PowerShell)
```powershell
git clone https://github.com/samarthdarak24-cpu/virtuall-jwellery-.git
cd virtuall-jwellery-
```

#### Linux/Mac (Bash)
```bash
git clone https://github.com/samarthdarak24-cpu/virtuall-jwellery-.git
cd virtuall-jwellery-
```

---

### 2️⃣ Install Dependencies

```bash
# Install all workspace dependencies
yarn install
```

This will install dependencies for:
- Root workspace
- API backend (`apps/api`)
- Web frontend (`apps/web`)
- Shared types package (`packages/@jewelfit/types`)

**Expected time**: 2-5 minutes depending on internet speed

---

### 3️⃣ Environment Configuration

#### API Environment Setup

1. Navigate to API directory:
   ```bash
   cd apps/api
   ```

2. Copy the example environment file:
   
   **Windows (PowerShell)**:
   ```powershell
   Copy-Item .env.example .env
   ```
   
   **Linux/Mac**:
   ```bash
   cp .env.example .env
   ```

3. Edit `apps/api/.env` with your values:

```env
# Database (SQLite for development)
DATABASE_URL=file:./prisma/dev.db

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Server Configuration
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Optional: S3/MinIO for file storage
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=jewelfit-assets
S3_ACCESS_KEY=minioaccess
S3_SECRET_KEY=miniosecret
S3_REGION=us-east-1

# Optional: Stripe for payments
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### Web Environment Setup

1. Navigate to web directory:
   ```bash
   cd ../web
   ```

2. Copy the example environment file:
   
   **Windows (PowerShell)**:
   ```powershell
   Copy-Item .env.example .env.local
   ```
   
   **Linux/Mac**:
   ```bash
   cp .env.example .env.local
   ```

3. Edit `apps/web/.env.local`:

```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:4000

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-minimum-32-characters-long

# Optional: Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

**🔐 Security Note**: 
- Never commit `.env` or `.env.local` files to git
- Use strong, unique secrets for production
- Generate secrets using: `openssl rand -base64 32`

---

### 4️⃣ Database Setup

Return to the root directory and run migrations:

```bash
cd ../..  # Back to root

# Generate Prisma client
cd apps/api
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database with sample data
npm run seed
```

**What this does**:
- Creates SQLite database at `apps/api/prisma/dev.db`
- Sets up all tables (User, Product, Order, etc.)
- Populates with sample jewelry products
- Creates test user accounts

**Default Test Accounts**:
- Admin: `admin@jewelfit.com` / `admin123`
- User: `user@jewelfit.com` / `user123`

---

### 5️⃣ Start Development Servers

#### Option A: Start All Services (Recommended)

From the root directory:

```bash
yarn dev
```

This starts:
- ✅ API server on `http://localhost:4000`
- ✅ Web server on `http://localhost:3000`

#### Option B: Start Services Individually

**Terminal 1 - API Server**:
```bash
yarn dev:api
```

**Terminal 2 - Web Server**:
```bash
yarn dev:web
```

---

### 6️⃣ Verify Installation

1. **Check API Health**:
   - Open: `http://localhost:4000`
   - Should see: API welcome message

2. **Check Web Application**:
   - Open: `http://localhost:3000`
   - Should see: Homepage with jewelry catalog

3. **Test Login**:
   - Navigate to: `http://localhost:3000/auth/login`
   - Use test credentials: `admin@jewelfit.com` / `admin123`

4. **Access Admin Dashboard**:
   - Navigate to: `http://localhost:3000/admin`
   - Should see: Admin dashboard with analytics

---

## 🐍 Optional: Python Try-On Service

If you want to use the Python-based ML service:

### Setup

1. Navigate to Python directory:
   ```bash
   cd apps/python_tryon
   ```

2. Create virtual environment:
   
   **Windows**:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```
   
   **Linux/Mac**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the service:
   ```bash
   python main.py
   ```

---

## 🐳 Docker Deployment (Alternative)

If you prefer Docker:

### Prerequisites
- Docker Desktop installed and running

### Steps

1. **Build and start all services**:
   ```bash
   docker-compose up --build
   ```

2. **Access services**:
   - Web: `http://localhost:3000`
   - API: `http://localhost:4000`

3. **Stop services**:
   ```bash
   docker-compose down
   ```

---

## 📁 Project Structure Overview

```
virtuall-jwellery-/
├── apps/
│   ├── api/                    # Express.js REST API
│   │   ├── prisma/            # Database schema & migrations
│   │   ├── src/               # Source code
│   │   └── .env               # API environment variables
│   │
│   ├── web/                    # Next.js frontend
│   │   ├── src/               # Source code
│   │   │   ├── components/   # React components
│   │   │   ├── pages/        # Next.js pages
│   │   │   └── styles/       # CSS styles
│   │   └── .env.local         # Web environment variables
│   │
│   └── python_tryon/          # Python ML service (optional)
│
├── packages/
│   └── @jewelfit/types/       # Shared TypeScript types
│
├── infra/                      # Docker configurations
├── package.json               # Root package.json
└── README.md                  # Project documentation
```

---

## 🧪 Running Tests

### Unit Tests
```bash
# Run all tests
yarn test

# Run API tests only
cd apps/api && npm test

# Run web tests only
cd apps/web && npm test
```

### E2E Tests (Playwright)
```bash
cd apps/web
npm run test:e2e
```

---

## 🔨 Building for Production

### Build All Services
```bash
yarn build
```

### Build Individually

**API**:
```bash
cd apps/api
npm run build
npm start
```

**Web**:
```bash
cd apps/web
npm run build
npm start
```

---

## 🐛 Troubleshooting

### Issue: Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:

**Windows**:
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Linux/Mac**:
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
```

---

### Issue: Database Connection Error

**Error**: `Can't reach database server`

**Solution**:
1. Ensure `DATABASE_URL` in `.env` is correct
2. Run migrations: `cd apps/api && npx prisma migrate dev`
3. Check database file exists: `apps/api/prisma/dev.db`

---

### Issue: Module Not Found

**Error**: `Cannot find module '@jewelfit/types'`

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules
yarn install

# Rebuild TypeScript
yarn build
```

---

### Issue: Prisma Client Not Generated

**Error**: `@prisma/client did not initialize yet`

**Solution**:
```bash
cd apps/api
npx prisma generate
```

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change all default secrets in `.env` files
- [ ] Use strong JWT secrets (minimum 32 characters)
- [ ] Enable HTTPS/SSL certificates
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Enable rate limiting
- [ ] Review and update security headers
- [ ] Use environment-specific API keys
- [ ] Enable logging and monitoring

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Three.js Documentation](https://threejs.org/docs)
- [MediaPipe Documentation](https://google.github.io/mediapipe/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 🆘 Getting Help

If you encounter issues:

1. Check this setup guide thoroughly
2. Review the [README.md](./README.md)
3. Check existing GitHub issues
4. Create a new issue with:
   - Your OS and Node version
   - Complete error message
   - Steps to reproduce

---

## 🎉 Success!

If you've completed all steps, you should now have:
- ✅ API server running on port 4000
- ✅ Web application running on port 3000
- ✅ Database with sample data
- ✅ Admin dashboard accessible
- ✅ 3D and photo try-on features working

**Next Steps**:
- Explore the admin dashboard
- Try uploading a jewelry product
- Test the 3D viewer
- Test the photo try-on feature
- Customize the application for your needs

Happy coding! 💎✨
