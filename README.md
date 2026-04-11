# 🎨 JewelFit 3D - Virtual Jewelry Try-On Platform

A production-ready, full-stack web application featuring dual-mode virtual jewelry try-on: **Photo Mode** with AI-powered landmark detection and **3D Model Mode** with photorealistic PBR materials.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-18.x-green.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)

## ✨ Features

### 📸 Photo Mode
- **Real-time landmark detection** using MediaPipe (Face, Hands, Pose)
- **Automatic jewelry positioning** with intelligent transform calculations
- **Manual adjustment controls** (drag, rotate, scale)
- **Realistic blending** with ambient color sampling and soft shadows
- **Camera & upload support** for maximum flexibility
- **Save & share** your virtual try-on results

### 🎨 3D Model Mode
- **Photorealistic rendering** with Three.js and React Three Fiber
- **PBR materials** (Physically Based Rendering) with metalness/roughness
- **Real-time material editor** with metal presets (Gold, Rose Gold, Platinum, Silver)
- **HDRI environment lighting** with multiple presets (Studio, Daylight, Indoor)
- **360° rotation** with orbit controls
- **Jewelry anchors** for precise attachment to 3D human models

### 🔐 Authentication & User Management
- Email/password authentication with bcrypt
- Google OAuth integration via NextAuth
- JWT sessions with HTTP-only cookies
- User account with saved try-ons and order history

### 👑 Admin Dashboard
- Product CRUD operations
- Asset management (2D images, 3D models, PBR textures)
- Presigned S3 uploads for secure file handling
- Publish/unpublish products
- Analytics dashboard

### 🛒 E-Commerce Features
- Product catalog with filtering
- Material customization (save to cart)
- Stripe checkout integration (test mode)
- Order management
- Try-on event analytics

### 🔒 Privacy & GDPR
- Client-side photo processing by default
- Opt-in image saving with user consent
- Delete saved images anytime
- Analytics opt-out support

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **3D**: Three.js + @react-three/fiber + @react-three/drei
- **Photo Mode**: MediaPipe (Face Mesh, Hands, Pose)
- **Animation**: Framer Motion
- **State**: Zustand
- **Auth**: NextAuth.js

### Backend
- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Storage**: S3-compatible (AWS S3 / MinIO)
- **Payments**: Stripe
- **Auth**: JWT + bcrypt

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Testing**: Jest + Playwright
- **Linting**: ESLint + TypeScript

## 📁 Project Structure

```
jewelfit-3d/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── src/
│   │   │   ├── pages/       # Next.js pages
│   │   │   ├── components/  # React components
│   │   │   ├── styles/      # Global styles
│   │   │   └── lib/         # Utilities
│   │   └── public/          # Static assets
│   └── api/                 # Express backend
│       ├── src/
│       │   ├── routes/      # API routes
│       │   ├── middleware/  # Auth, error handling
│       │   ├── scripts/     # Seed, migrations
│       │   └── index.ts     # Server entry
│       └── prisma/          # Database schema
├── packages/
│   └── types/               # Shared TypeScript types
├── infra/
│   ├── Dockerfile.api       # API container
│   ├── Dockerfile.web       # Web container
│   └── docker-compose.yml   # Local dev setup
├── .github/
│   └── workflows/           # CI/CD pipelines
└── docs/                    # Documentation
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.x or higher
- **Docker** & **Docker Compose**
- **Git**

### 1. Clone the Repository
```bash
git clone <repository-url>
cd jewelfit-3d
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables

**Backend** (`apps/api/.env`):
```bash
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your configuration
```

**Frontend** (`apps/web/.env.local`):
```bash
cp apps/web/.env.example apps/web/.env.local
# Edit apps/web/.env.local with your configuration
```

### 4. Start with Docker Compose
```bash
docker-compose up --build
```

This will start:
- **PostgreSQL** on `localhost:5432`
- **MinIO** (S3) on `localhost:9000` (console: `localhost:9001`)
- **Backend API** on `localhost:4000`
- **Frontend** on `localhost:3000`

### 5. Run Database Migrations & Seed
```bash
# In a new terminal
npm run migrate
npm run seed
```

### 6. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **MinIO Console**: http://localhost:9001 (user: `minioaccess`, pass: `miniosecret`)

### Demo Credentials
- **Email**: demo@jewelfit.test
- **Password**: Demo123!

## 🛠️ Development

### Run Locally (without Docker)

**Terminal 1 - Backend**:
```bash
cd apps/api
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd apps/web
npm run dev
```

### Database Commands
```bash
# Generate Prisma client
npm run generate

# Create migration
npm run migrate

# Seed database
npm run seed

# Reset database
npx prisma migrate reset
```

### Testing
```bash
# Run all tests
npm test

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage
```

## 📊 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products (with pagination)
- `GET /api/products/:id` - Get product details

### Admin (Authenticated)
- `POST /api/admin/products` - Create product
- `PATCH /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `POST /api/admin/products/:id/assets` - Add asset
- `PATCH /api/admin/products/:id/publish` - Publish/unpublish

### Try-On
- `POST /api/tryon/events` - Record try-on event
- `GET /api/tryon/analytics` - Get analytics (admin)

### User (Authenticated)
- `GET /api/user/images` - List saved images
- `POST /api/user/images` - Save image
- `DELETE /api/user/images/:id` - Delete image

### Upload (Authenticated)
- `POST /api/upload/presign` - Get presigned upload URL

### Checkout (Authenticated)
- `POST /api/checkout/create-session` - Create Stripe session
- `POST /api/webhooks/stripe` - Stripe webhook

## 🎨 Adding New Jewelry Products

See [docs/ADMIN_GUIDE.md](./docs/ADMIN_GUIDE.md) for detailed instructions.

**Quick steps**:
1. Prepare 3D model (glTF) with named anchors
2. Export PBR textures (baseColor, normal, metalRough)
3. Create 2D PNG asset for Photo Mode
4. Upload via Admin Dashboard
5. Add metadata (SKU, price, description)
6. Publish product

## 🎭 3D Asset Guidelines

See [docs/BLENDER_GUIDE.md](./docs/BLENDER_GUIDE.md) for Blender export instructions.

**Key points**:
- Use glTF 2.0 format
- Name anchors: `ear_lobe_L`, `ear_lobe_R`, `neck_anchor`, `finger_X_L/R`
- Bake ambient occlusion
- Export PBR maps separately
- Keep poly count < 50k for performance

## 🌍 Environment Variables

### Backend (`apps/api/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Secret for JWT signing | `your-secret-key` |
| `S3_ENDPOINT` | S3 endpoint URL | `http://localhost:9000` |
| `S3_BUCKET` | S3 bucket name | `jewelfit-assets` |
| `S3_ACCESS_KEY` | S3 access key | `minioaccess` |
| `S3_SECRET_KEY` | S3 secret key | `miniosecret` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |

### Frontend (`apps/web/.env.local`)
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:4000` |
| `NEXTAUTH_URL` | NextAuth base URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | NextAuth secret | `your-nextauth-secret` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `your-client-id` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | `your-client-secret` |

## 🚢 Deployment

### Frontend (Vercel/Netlify)
1. Connect your Git repository
2. Set environment variables
3. Deploy with one click

### Backend (Render/Heroku)
1. Create new web service
2. Connect repository
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Add environment variables
6. Add PostgreSQL database addon

### Database (Managed PostgreSQL)
- Use managed PostgreSQL (AWS RDS, DigitalOcean, etc.)
- Run migrations: `npx prisma migrate deploy`

### Storage (AWS S3 / CloudFront)
- Create S3 bucket
- Enable public read access for assets
- Set up CloudFront CDN
- Update `S3_ENDPOINT` and `S3_PUBLIC_URL`

## 📈 Analytics & Metrics

Export analytics to CSV:
```bash
npm run export-metrics
```

This generates `metrics-export.csv` with:
- Try-on events (Photo/3D mode)
- Product popularity
- User engagement
- Conversion metrics

## 🧪 Testing Checklist

See [docs/TESTING_CHECKLIST.md](./docs/TESTING_CHECKLIST.md) for comprehensive testing guide.

**Quick checks**:
- [ ] Photo upload works on mobile & desktop
- [ ] Camera access works (HTTPS required)
- [ ] Landmark detection accurate for different faces
- [ ] 3D models load and render correctly
- [ ] Material editor updates in real-time
- [ ] Authentication flow (register, login, logout)
- [ ] Admin can create/edit/delete products
- [ ] Stripe checkout works (test mode)
- [ ] Responsive design on all screen sizes

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MediaPipe** for landmark detection
- **Three.js** for 3D rendering
- **Stripe** for payment processing
- **Vercel** for Next.js framework

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Email: support@jewelfit.test

---

Built with ❤️ by the JewelFit Team
