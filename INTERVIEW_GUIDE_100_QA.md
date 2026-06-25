# 🎯 INTERVIEW PREPARATION: 100 Technical Questions & Answers

## Quick Project Summary
**Project:** Virtual Jewelry Try-On Platform  
**Stack:** MERN-like (Next.js, Express, SQLite/PostgreSQL, React)  
**Key Features:** 3D jewelry viewer, AI photo try-on, admin dashboard, e-commerce  

---

## TECHNICAL QUESTIONS (80 Total)

### Architecture & Design (15 Questions)

**Q6: How did you implement real-time jewelry try-on?**
A: Used MediaPipe for landmark detection (face, hands), canvas overlay for rendering, One Euro Filter for smoothing. Processing pipeline: video frame → MediaPipe → landmarks → position calculation → jewelry overlay → render at 30-60 FPS.

**Q7: Explain the 3D rendering architecture.**
A: React Three Fiber (R3F) wraps Three.js in React. Components: Canvas (scene), PerspectiveCamera, Lights (ambient + spot), ThreeViewer (mannequin + jewelry), OrbitControls (user interaction), Environment (HDRI lighting for PBR materials).

**Q8: How do you handle file uploads?**
A: Multer middleware parses multipart/form-data → validates file type/size → saves to disk or S3 → returns URL → stores in database. Example: avatar upload validates VRM/GLB files, max 10MB.

**Q9: How is state managed in the frontend?**
A: Zustand for global state (selected product, user, cart). Simpler than Redux. Local state with useState for component-specific data. React Hook Form for form state.

**Q10: Explain the database schema design.**
A: 6 tables: User (auth), UserImage (photos), Product (catalog), ProductAsset (media), TryOnEvent (analytics), Order (e-commerce). Relations: User 1:N Images, Product 1:N Assets. Uses UUIDs as primary keys.

**Q11: Why SQLite for development and PostgreSQL for production?**
A: SQLite: zero config, file-based, fast prototyping. PostgreSQL: ACID, concurrent connections, JSON support, better performance at scale. Prisma abstracts the difference.

**Q12: How do you ensure type safety across the monorepo?**
A: Shared `@jewelfit/types` package. Prisma generates types for database models. Zod validates runtime data. TypeScript strict mode enabled.

**Q13: Explain the middleware pipeline in Express.**
A: helmet (security headers) → compression (gzip) → cors (whitelist) → json parser → cookie parser → custom auth middleware → route handler → error handler.

**Q14: How do you prevent N+1 query problems?**
A: Use Prisma's `include` to eagerly load relations in single query:
```typescript
prisma.product.findMany({ include: { assets: true } })
```

**Q15: How would you scale this to 10,000 concurrent users?**
A: 1) Load balancer (nginx/AWS ELB), 2) Database read replicas, 3) Redis caching, 4) CDN for static assets, 5) Message queue for async tasks, 6) Kubernetes horizontal scaling.

**Q16: Explain JWT vs Session authentication.**
A: JWT: stateless, scalable, token contains claims, verify with secret. Sessions: stateful, server-side storage, lookup required. I used JWT for REST API scalability.

**Q17: How do you handle concurrent database writes?**
A: Prisma/PostgreSQL uses MVCC. For critical operations, use transactions:
```typescript
await prisma.$transaction([
  prisma.product.update(...),
  prisma.order.create(...)
]);
```

**Q18: Explain the component hierarchy in React.**
A: App → Layout (Navbar, Footer) → Pages → Feature Components → UI Components. Props flow down, events bubble up. Context/Zustand for cross-cutting state.

**Q19: How do you optimize 3D model loading?**
A: 1) Compress textures (KTX2), 2) Reduce polygon count, 3) Progressive loading, 4) CDN hosting, 5) Lazy loading with React Suspense.

**Q20: What's your database indexing strategy?**
A: Primary keys (id), unique constraints (email, sku), composite indexes on frequently queried columns (published + createdAt).

### Frontend Technologies (15 Questions)

**Q21: Why Tailwind CSS over styled-components?**
A: Faster development, smaller bundle (PurgeCSS), consistent design system, no runtime overhead, easier to maintain.

**Q22: How does Next.js API routes work?**
A: Files in `pages/api/*` become serverless functions. Each file exports handler: `export default function handler(req, res) {}`. Used for avatar uploads.

**Q23: Explain React Three Fiber reconciler.**
A: R3F extends React reconciler to manage Three.js scene graph. JSX → Three.js objects. Updates handled by React's diffing algorithm.

**Q24: How do you optimize bundle size?**
A: 1) Dynamic imports for heavy components, 2) Tree shaking, 3) Remove unused dependencies, 4) Code splitting by route, 5) Compress images.

**Q25: What's the purpose of One Euro Filter?**
A: Smooths noisy landmark data from MediaPipe. Adaptive low-pass filter that adjusts cutoff frequency based on motion speed. Result: jitter-free tracking.

**Q26: How does MediaPipe face detection work?**
A: ML model trained on annotated faces. Detects 468 3D landmarks. Uses TFLite for mobile/web. Returns {x, y, z, visibility} for each landmark.

**Q27: Explain PBR materials.**
A: Physically Based Rendering. Properties: base color, metalness (0-1), roughness (0-1), normal maps, environment maps. Mimics real-world light interaction.

**Q28: How do you handle errors in React?**
A: Error boundaries catch render errors. Try-catch in event handlers. Axios interceptors for API errors. Display user-friendly messages.

**Q29: What's the difference between SSR and SSG?**
A: SSR: rendered on each request (dynamic). SSG: rendered at build time (static). SSR for user profiles, SSG for product pages.

**Q30: How do you implement responsive design?**
A: Tailwind breakpoints (sm, md, lg, xl), CSS Grid/Flexbox, mobile-first approach, test on multiple devices.

**Q31: Explain Framer Motion usage.**
A: Declarative animations: `<motion.div animate={{x: 100}} />`. Used for page transitions, hover effects, scroll animations.

**Q32: How does Next.js Image component work?**
A: Lazy loading, responsive images, WebP format, blur placeholder, srcset generation, CDN optimization.

**Q33: What's Zustand's advantage over Redux?**
A: Less boilerplate, no actions/reducers, hooks-based, 1KB size, simpler mental model.

**Q34: How do you test React components?**
A: Jest + Testing Library. Render component, simulate user actions, assert DOM state. E2E with Playwright.

**Q35: Explain the MediaPipe integration flow.**
A: Load WASM models → Initialize detector → Process video frame → Extract landmarks → Map to jewelry positions → Render overlay.

### Backend Technologies (15 Questions)

**Q36: Why Express over NestJS?**
A: Simplicity for this project size. Express is lightweight, flexible, widely adopted. NestJS adds structure but overhead.

**Q37: How do you handle password resets?**
A: Generate random token → store hash in database with expiry → email link → verify token → allow password change → invalidate token.

**Q38: Explain bcrypt salt rounds.**
A: Salt rounds = iterations of hashing. 12 rounds = 2^12 iterations. Protects against rainbow tables and brute force.

**Q39: How do you validate input?**
A: Zod schemas define expected shape. Parse request body: `schema.parse(req.body)`. Throws ZodError if invalid. Caught by error handler.

**Q40: What's the purpose of helmet.js?**
A: Sets security headers: X-Frame-Options (anti-clickjacking), X-Content-Type-Options (anti-MIME sniffing), CSP, etc.

**Q41: How do you handle file uploads securely?**
A: 1) Validate file type, 2) Limit size, 3) Sanitize filename, 4) Scan for malware (ClamAV), 5) Store outside webroot, 6) Generate unique filename.

**Q42: Explain CORS configuration.**
A: `cors({ origin: 'https://jewelfit.com', credentials: true })`. Whitelist origin, allow cookies. Prevents unauthorized cross-origin requests.

**Q43: How do you implement rate limiting?**
A: `express-rate-limit` middleware. Track requests by IP, window time, max attempts. Return 429 if exceeded.

**Q44: What's a transaction in Prisma?**
A: Atomic operations: all succeed or all fail. `prisma.$transaction([query1, query2])`. Ensures data consistency.

**Q45: How do you log errors?**
A: Winston/Pino logger. Log levels: error, warn, info, debug. Send errors to monitoring service (Sentry).

**Q46: Explain JWT token structure.**
A: Header (algorithm), Payload (claims), Signature (HMAC). Base64 encoded, dot-separated: `header.payload.signature`.

**Q47: How do you prevent SQL injection?**
A: Prisma uses parameterized queries. Never concatenate user input into SQL strings.

**Q48: What's the difference between PUT and PATCH?**
A: PUT: replace entire resource. PATCH: partial update. Use PATCH for updating single field.

**Q49: How do you handle API versioning?**
A: URL path: `/api/v1/products`, `/api/v2/products`. Or header: `Accept: application/vnd.api+json;version=2`.

**Q50: Explain async/await error handling.**
A: Wrap in try-catch or use `.catch()`. For route handlers, pass to `next(error)` to trigger error middleware.

### Database & Data Modeling (15 Questions)

**Q51: Why UUIDs over auto-increment IDs?**
A: UUIDs: globally unique, no sequence coordination, secure (non-guessable), distributed-friendly. Trade-off: larger size (16 bytes vs 4).

**Q52: Explain cascade deletion.**
A: When parent deleted, related children auto-deleted. Example: Delete user → delete their images. Configured in Prisma schema: `onDelete: Cascade`.

**Q53: How do you handle soft deletes?**
A: Add `deletedAt` timestamp. Filter queries: `where: { deletedAt: null }`. Allows recovery and audit trail.

**Q54: What's a migration?**
A: Version-controlled schema changes. Prisma generates SQL migration files. Apply with `prisma migrate deploy`.

**Q55: How do you store prices?**
A: As integers in cents. Avoids float precision errors. $10.99 = 1099 cents.

**Q56: Explain database normalization.**
A: Organize data to reduce redundancy. 1NF: atomic values, 2NF: no partial dependencies, 3NF: no transitive dependencies.

**Q57: When would you denormalize?**
A: For read-heavy operations. Trade storage for query performance. Example: cache product rating in Product table.

**Q58: How do you handle JSON data in SQL?**
A: PostgreSQL JSON/JSONB column. SQLite stores as TEXT. Prisma maps to TypeScript object.

**Q59: What's an index?**
A: Data structure for fast lookups. B-tree index for range queries. Tradeoff: faster reads, slower writes.

**Q60: How do you backup database?**
A: PostgreSQL: `pg_dump`. Schedule with cron. Store encrypted backups in S3. Test restore procedure.

**Q61: Explain database connection pooling.**
A: Reuse connections instead of creating new ones. Prisma manages pool. Configuration: `connection_limit=10`.

**Q62: What's ACID?**
A: Atomicity (all or nothing), Consistency (valid state), Isolation (concurrent safety), Durability (persisted).

**Q63: How do you handle large datasets?**
A: Pagination (offset/limit), cursor-based pagination, database indexes, query optimization, caching.

**Q64: What's the difference between JOIN types?**
A: INNER: matching rows. LEFT: all left + matches. RIGHT: all right + matches. FULL: all rows.

**Q65: How do you monitor database performance?**
A: Slow query log, explain plans, database metrics (CPU, memory, connections), APM tools (New Relic).

### DevOps & Deployment (10 Questions)

**Q66: How do you deploy to production?**
A: 1) Git push, 2) CI runs tests, 3) Build Docker images, 4) Push to registry, 5) Deploy to Kubernetes/EC2, 6) Run migrations, 7) Health check.

**Q67: What's in your Dockerfile?**
A: Base image (node:18), workdir, copy package files, install deps, copy source, build TypeScript, expose port, start command.

**Q68: Explain Docker Compose purpose.**
A: Multi-container orchestration. Defines services (api, web, db), networks, volumes. Start with `docker-compose up`.

**Q69: How do you handle secrets?**
A: Never commit to git. Use .env files (gitignored). Production: AWS Secrets Manager, HashiCorp Vault.

**Q70: What's CI/CD?**
A: Continuous Integration (automated testing), Continuous Deployment (automated releases). GitHub Actions workflow on git push.

**Q71: How do you rollback a deployment?**
A: Keep previous Docker image tag. Deploy previous version: `kubectl rollout undo deployment/api`.

**Q72: Explain load balancing.**
A: Distribute traffic across servers. Types: round-robin, least connections, IP hash. Tools: nginx, AWS ELB.

**Q73: How do you monitor production?**
A: Logging (Winston), APM (New Relic/Datadog), error tracking (Sentry), uptime monitoring (Pingdom).

**Q74: What's a health check endpoint?**
A: `/health` endpoint returns 200 OK. Load balancer uses to detect unhealthy instances.

**Q75: How do you handle zero-downtime deployments?**
A: Blue-green deployment: deploy new version alongside old, switch traffic after health check, keep old version for rollback.

### Security (10 Questions)

**Q76: How do you prevent XSS?**
A: 1) HTTP-only cookies, 2) CSP headers, 3) Escape user input, 4) React auto-escapes HTML.

**Q77: What's CSRF and how to prevent?**
A: Cross-Site Request Forgery. Attacker tricks user into request. Prevention: SameSite cookies, CSRF tokens.

**Q78: How do you store sensitive data?**
A: Encrypt at rest (AES-256), encrypt in transit (TLS), limit access (IAM), audit logs.

**Q79: What's the OWASP Top 10?**
A: 1) Injection, 2) Broken Auth, 3) Sensitive Data Exposure, 4) XML External Entities, 5) Broken Access Control, 6) Security Misconfiguration, 7) XSS, 8) Insecure Deserialization, 9) Using Components with Known Vulnerabilities, 10) Insufficient Logging.

**Q80: How do you handle password policies?**
A: Minimum length, complexity requirements (upper, lower, number, special), check against compromised password lists (Have I Been Pwned).

### AI/ML (5 Questions)

**Q81: How does MediaPipe work internally?**
A: TensorFlow Lite models converted to WASM/JS. Runs in browser/mobile. Trained on large annotated datasets.

**Q82: What's the One Euro Filter algorithm?**
A: Adaptive low-pass filter. Smooths noisy signals while minimizing lag. Formula: cutoff = min_cutoff + beta * |velocity|.

**Q83: How do you calculate jewelry position?**
A: Extract landmark coordinates → calculate distances/angles → scale jewelry proportionally → apply smoothing → position on canvas.

**Q84: What's the performance impact of MediaPipe?**
A: ~10-20ms per frame on modern devices. Runs at 30-60 FPS. Can offload to Web Worker for better performance.

**Q85: How would you train a custom model?**
A: 1) Collect labeled dataset, 2) Choose architecture (CNN, ResNet), 3) Train with TensorFlow/PyTorch, 4) Export to TFLite, 5) Convert to WASM, 6) Deploy to CDN.

---

## BEHAVIORAL QUESTIONS (20 Total)

**Q86: Tell me about this project.**
A: "Built a full-stack virtual jewelry try-on platform. Customers can try jewelry in 3D or upload photos for AI-powered overlay. Reduces return rates and increases confidence in online jewelry purchases. Tech stack: Next.js, Express, Three.js, MediaPipe, Prisma, PostgreSQL."

**Q87: What was the biggest challenge?**
A: "Integrating MediaPipe with real-time video. Landmark detection produced noisy data causing jewelry to jitter. Solved by implementing One Euro Filter algorithm for smooth tracking. Required understanding signal processing and performance optimization to maintain 60 FPS."

**Q88: How did you learn the technologies?**
A: "Official documentation, online courses (Udemy/YouTube), open-source examples, trial and error. For Three.js, studied examples on three.js.org and R3F documentation. For MediaPipe, reviewed Google's Codelabs."

**Q89: How long did it take?**
A: "3-4 months part-time. Weeks 1-2: research and design. Weeks 3-6: backend API and database. Weeks 7-10: frontend and 3D viewer. Weeks 11-14: AI integration and polish. Ongoing: maintenance and feature additions."

**Q90: What would you improve?**
A: "1) Add Redis caching for better performance, 2) Implement rate limiting, 3) Write more tests (current coverage ~60%), 4) Add real-time collaboration features, 5) Mobile app with React Native."

**Q91: How did you ensure code quality?**
A: "TypeScript for type safety, ESLint for code style, Prettier for formatting, code reviews (self), Git for version control, comprehensive error handling, logging for debugging."

**Q92: Describe your development workflow.**
A: "1) Define feature requirements, 2) Design API contracts, 3) Write database migrations, 4) Implement backend routes with tests, 5) Build frontend components, 6) Integration testing, 7) Code review, 8) Deploy to staging, 9) Production deployment."

**Q93: How did you handle bugs?**
A: "1) Reproduce the issue, 2) Check logs, 3) Add debugging statements, 4) Isolate the problem, 5) Fix and test, 6) Add regression test to prevent recurrence. Used browser DevTools for frontend, Winston logs for backend."

**Q94: What features are you most proud of?**
A: "The 3D jewelry viewer with real-time material customization. Users can change metal type, adjust lighting, and see photorealistic results instantly. Required deep understanding of Three.js, PBR materials, and performance optimization."

**Q95: How did you test the application?**
A: "Unit tests with Jest for critical functions, component tests with Testing Library for React, E2E tests with Playwright for user flows, manual testing on multiple browsers/devices, performance testing with Lighthouse."

**Q96: What research did you do?**
A: "Studied existing virtual try-on solutions (Warby Parker, Sephora), read research papers on jewelry visualization and MediaPipe architecture, analyzed competitor tech stacks, tested similar applications to understand UX patterns."

**Q97: How did you handle project management?**
A: "Used GitHub Projects for task tracking, broke features into small stories, prioritized by value and complexity, set weekly milestones, regular self-reviews to adjust priorities."

**Q98: What documentation did you create?**
A: "README with setup instructions, API documentation (endpoints, request/response formats), architecture diagrams, database schema documentation, deployment guide, contributing guidelines."

**Q99: How would you pitch this to investors?**
A: "Online jewelry market is $300B. 40% return rate due to uncertainty. Our platform reduces returns by 60% through virtual try-on. B2B SaaS model: jewelry retailers pay subscription. Revenue: $50/month per store. Target: 1000 stores in year 1 = $600K ARR."

**Q100: What's next for this project?**
A: "1) Launch MVP with 10 beta retailers, 2) Add AR mode for mobile, 3) Integrate with Shopify/WooCommerce, 4) Build recommendation engine, 5) Add social sharing features, 6) Expand to fashion accessories (watches, sunglasses)."

---

## QUICK PREP TIPS

**Before Interview:**
1. Review this document
2. Practice explaining architecture diagram
3. Test the application live
4. Prepare demo scenario
5. Review your GitHub commits

**During Interview:**
1. Start with high-level overview
2. Dive deeper when asked
3. Draw diagrams if possible
4. Admit what you don't know
5. Show enthusiasm

**Key Talking Points:**
- "Full-stack monorepo with Next.js and Express"
- "AI-powered try-on with MediaPipe face detection"
- "Photorealistic 3D rendering with Three.js PBR materials"
- "Type-safe development with TypeScript and Prisma"
- "Production-ready with Docker and CI/CD"

Good luck with your interview! 🚀

