# 💎 Virtual Jewelry Try-On Platform

A cutting-edge web application that enables customers to virtually try on jewelry using advanced 3D rendering and AI-powered photo overlay technology. Built with Next.js, Three.js, MediaPipe, and Prisma.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)

## ✨ Features

### 🎨 Virtual Try-On Modes
- **3D Interactive Viewer**: Real-time 3D jewelry visualization with Three.js
  - Rotate, zoom, and inspect jewelry from all angles
  - PBR (Physically Based Rendering) materials
  - Dynamic lighting and environment mapping
  - Material editor for customization

- **Photo Try-On**: AI-powered jewelry overlay on user photos
  - MediaPipe face/hand detection for accurate placement
  - Real-time landmark tracking
  - Support for earrings, necklaces, rings, bracelets, and nose pins
  - Background removal capabilities

### 👨‍💼 Admin Dashboard
- **Product Management**: Upload and manage jewelry products
- **Analytics**: Track user engagement and try-on events
- **Order Management**: View and process customer orders
- **User Management**: Manage customer accounts
- **Settings**: Configure platform settings

### 🔐 Authentication & User Management
- Secure authentication with NextAuth.js
- User registration and login
- Profile management with photo uploads
- Session management

### 📦 Product Features
- Product catalog with filtering
- Multiple asset types (2D images, 3D models, PBR textures)
- SKU management
- Price management
- Publish/unpublish products

## 🏗️ Architecture

This is a monorepo project using Yarn workspaces:

```
jwelleryfit/
├── apps/
│   ├── api/              # Express.js REST API
│   ├── web/              # Next.js frontend
│   └── python_tryon/     # Python ML service (optional)
├── packages/
│   └── @jewelfit/
│       └── types/        # Shared TypeScript types
└── infra/                # Docker configurations
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **3D Graphics**: Three.js, React Three Fiber, Drei
- **AI/ML**: MediaPipe (Face Mesh, Hands, Pose)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Authentication**: NextAuth.js

### Backend
- **Runtime**: Node.js with Express
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer
- **Security**: Helmet, CORS

### DevOps
- **Containerization**: Docker & Docker Compose
- **Testing**: Jest, Playwright
- **Linting**: ESLint
- **Type Checking**: TypeScript

## 📋 Prerequisites

- Node.js >= 18.0.0
- Yarn >= 1.22.0
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/samarthdarak24-cpu/virtuall-jwellery-.git
cd virtuall-jwellery-
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Environment Setup

#### API Environment (.env)
Create `apps/api/.env`:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-this"
PORT=4000
NODE_ENV=development
```

#### Web Environment (.env.local)
Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="your-nextauth-secret-change-this"
```

### 4. Database Setup

```bash
# Run migrations
yarn migrate

# Seed the database with sample data
yarn seed
```

### 5. Start Development Servers

```bash
# Start both API and Web servers concurrently
yarn dev

# Or start individually:
yarn dev:api   # API server on http://localhost:4000
yarn dev:web   # Web server on http://localhost:3000
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000
- **Admin Dashboard**: http://localhost:3000/admin

## 📦 Available Scripts

### Root Level
```bash
yarn dev              # Start all services in development mode
yarn build            # Build all workspaces
yarn test             # Run tests across all workspaces
yarn lint             # Lint all workspaces
yarn seed             # Seed database with sample data
yarn migrate          # Run database migrations
yarn docker:up        # Start with Docker Compose
yarn docker:down      # Stop Docker containers
```

### Web App (apps/web)
```bash
yarn dev              # Start Next.js dev server
yarn build            # Build for production
yarn start            # Start production server
yarn test             # Run Jest tests
yarn test:e2e         # Run Playwright E2E tests
yarn lint             # Run ESLint
```

### API (apps/api)
```bash
yarn dev              # Start API dev server with hot reload
yarn build            # Compile TypeScript
yarn start            # Start production server
yarn test             # Run Jest tests
yarn migrate          # Run Prisma migrations
yarn seed             # Seed database
yarn generate         # Generate Prisma client
```

## 🗄️ Database Schema

### Core Models

- **User**: Customer accounts with authentication
- **UserImage**: User-uploaded photos for try-on
- **Product**: Jewelry products with SKU and pricing
- **ProductAsset**: Product images, 3D models, and PBR textures
- **TryOnEvent**: Analytics tracking for try-on sessions
- **Order**: Customer orders

### Asset Types
- `IMAGE_2D`: Product photos
- `MODEL_GLTF`: 3D models
- `PBR_BASECOLOR`: Base color texture
- `PBR_NORMAL`: Normal map
- `PBR_METALROUGH`: Metallic/roughness map
- `HDRI`: Environment map

## 🐳 Docker Deployment

### Build and Run with Docker Compose

```bash
# Start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop services
docker-compose down
```

### Individual Docker Builds

```bash
# Build API
docker build -f infra/Dockerfile.api -t jewelfit-api .

# Build Web
docker build -f infra/Dockerfile.web -t jewelfit-web .
```

## 📁 Project Structure

```
jwelleryfit/
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   │   ├── schema.prisma      # Database schema
│   │   │   └── migrations/        # Database migrations
│   │   └── src/
│   │       ├── index.ts           # API entry point
│   │       ├── middleware/        # Auth & error handling
│   │       ├── routes/            # API routes
│   │       └── scripts/           # Seed & utility scripts
│   │
│   ├── web/
│   │   ├── public/                # Static assets
│   │   └── src/
│   │       ├── components/        # React components
│   │       │   ├── 3d/           # Three.js components
│   │       │   ├── photo/        # Photo try-on components
│   │       │   └── layout/       # Layout components
│   │       ├── pages/            # Next.js pages
│   │       │   ├── admin/        # Admin dashboard
│   │       │   ├── auth/         # Authentication pages
│   │       │   ├── try/          # Try-on pages
│   │       │   └── api/          # API routes
│   │       ├── styles/           # Global styles
│   │       └── utils/            # Utility functions
│   │
│   └── python_tryon/             # Python ML service
│       ├── main.py
│       └── requirements.txt
│
├── packages/
│   └── @jewelfit/
│       └── types/                # Shared TypeScript types
│
└── infra/
    ├── Dockerfile.api            # API Docker config
    ├── Dockerfile.web            # Web Docker config
    └── docker-compose.yml        # Multi-container setup
```

## 🎯 Key Features Implementation

### 3D Jewelry Viewer
- Uses React Three Fiber for declarative 3D rendering
- Implements PBR materials for realistic appearance
- Supports GLTF model loading
- Interactive camera controls with OrbitControls
- Material editor for real-time customization

### Photo Try-On
- MediaPipe integration for facial landmark detection
- Canvas-based rendering for jewelry overlay
- Support for multiple jewelry types with different anchor points
- Real-time tracking with One Euro Filter for smoothing
- Background removal using @imgly/background-removal

### Admin Dashboard
- Complete CRUD operations for products
- File upload with preview
- Analytics visualization
- User and order management
- Responsive design with Tailwind CSS

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Helmet.js security headers
- Input validation with Zod
- SQL injection prevention with Prisma
- Environment variable protection

## 🧪 Testing

```bash
# Run all tests
yarn test

# Run E2E tests
cd apps/web && yarn test:e2e

# Run API tests
cd apps/api && yarn test
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `POST /api/user/images` - Upload user image

### Try-On Events
- `POST /api/tryon` - Log try-on event

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Samarth Darak**
- GitHub: [@samarthdarak24-cpu](https://github.com/samarthdarak24-cpu)

## 🙏 Acknowledgments

- Three.js community for 3D rendering capabilities
- MediaPipe team for AI/ML models
- Next.js team for the amazing framework
- Prisma team for the excellent ORM

## 📞 Support

For support, email your-email@example.com or open an issue in the GitHub repository.

---

Made with ❤️ by Samarth Darak
