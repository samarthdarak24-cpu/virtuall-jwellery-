# Contributing to JewelFit 3D

Thank you for your interest in contributing to JewelFit 3D! This document provides guidelines and instructions for contributing.

## 🤝 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other contributors

## 🚀 Getting Started

### 1. Fork the Repository

Click the "Fork" button at the top right of the repository page.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/jewelfit-3d.git
cd jewelfit-3d
```

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/jewelfit-3d.git
```

### 4. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates

## 💻 Development Workflow

### 1. Setup Development Environment

```bash
# Install dependencies
npm install

# Start development servers
docker-compose up

# In another terminal, run migrations
npm run migrate

# Seed database
npm run seed
```

### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update tests as needed

### 3. Test Your Changes

```bash
# Run linter
npm run lint

# Run type check
npx tsc --noEmit

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e
```

### 4. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add new jewelry category filter"
git commit -m "fix: resolve 3D model loading issue"
git commit -m "docs: update API documentation"
```

Commit types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill out the PR template
5. Submit for review

## 📋 Pull Request Guidelines

### PR Title

Use conventional commit format:
```
feat: add jewelry comparison feature
fix: resolve camera permission issue on iOS
docs: update deployment guide
```

### PR Description

Include:
- **What**: What changes were made
- **Why**: Why these changes were necessary
- **How**: How the changes were implemented
- **Testing**: How you tested the changes
- **Screenshots**: For UI changes

Template:
```markdown
## Description
Brief description of changes

## Motivation
Why this change is needed

## Changes
- Change 1
- Change 2

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots
(if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes
```

## 🎨 Code Style

### TypeScript

```typescript
// Use explicit types
function calculatePrice(priceCents: number): string {
  return `$${(priceCents / 100).toFixed(2)}`;
}

// Use interfaces for objects
interface Product {
  id: string;
  title: string;
  priceCents: number;
}

// Use async/await over promises
async function fetchProduct(id: string): Promise<Product> {
  const response = await fetch(`/api/products/${id}`);
  return response.json();
}
```

### React Components

```typescript
// Use functional components with TypeScript
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export default function Button({ onClick, children, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={`btn-${variant}`}>
      {children}
    </button>
  );
}
```

### CSS/Tailwind

```tsx
// Prefer Tailwind utility classes
<div className="flex items-center justify-between p-4 bg-white/10 rounded-lg">
  <h3 className="text-xl font-bold">Title</h3>
</div>

// Use custom classes for repeated patterns
<div className="card">
  {/* card class defined in globals.css */}
</div>
```

## 🧪 Testing Guidelines

### Unit Tests

```typescript
// apps/api/src/__tests__/auth.test.ts
import { validateEmail } from '../utils/validation';

describe('validateEmail', () => {
  it('should validate correct email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('should reject invalid email', () => {
    expect(validateEmail('invalid')).toBe(false);
  });
});
```

### E2E Tests

```typescript
// apps/web/tests/e2e/photo-mode.spec.ts
import { test, expect } from '@playwright/test';

test('user can upload image in photo mode', async ({ page }) => {
  await page.goto('/try/photo');
  
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('test-image.jpg');
  
  await expect(page.locator('canvas')).toBeVisible();
});
```

## 📚 Documentation

### Code Comments

```typescript
/**
 * Calculates the transform matrix for jewelry overlay
 * @param landmarks - Detected facial landmarks
 * @param assetSize - Size of the jewelry asset
 * @returns Transform object with scale, rotation, and translation
 */
function calculateTransform(landmarks: Landmark[], assetSize: Size): Transform {
  // Implementation
}
```

### README Updates

When adding features:
1. Update main README.md
2. Add to relevant guide (ADMIN_GUIDE.md, etc.)
3. Update API.md if adding endpoints
4. Add to TESTING_CHECKLIST.md

## 🐛 Bug Reports

### Before Submitting

1. Check existing issues
2. Verify it's reproducible
3. Test on latest version

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 120]
- Version: [e.g. 1.0.0]

**Additional context**
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution**
How you'd like it to work

**Describe alternatives**
Other solutions you've considered

**Additional context**
Mockups, examples, etc.
```

## 🏗️ Architecture Decisions

### Adding New Features

1. **Discuss first**: Open an issue to discuss major changes
2. **Design**: Plan the architecture
3. **Implement**: Write code following guidelines
4. **Test**: Add comprehensive tests
5. **Document**: Update relevant documentation

### Database Changes

1. Create Prisma migration:
   ```bash
   npx prisma migrate dev --name add_feature
   ```

2. Update seed script if needed

3. Document schema changes

### API Changes

1. Update route handler
2. Update types in `packages/types`
3. Update API.md documentation
4. Add tests for new endpoints

## 🔍 Code Review Process

### For Contributors

- Respond to feedback promptly
- Make requested changes
- Keep PR scope focused
- Rebase if needed

### For Reviewers

- Be constructive and kind
- Test the changes locally
- Check for:
  - Code quality
  - Test coverage
  - Documentation
  - Performance impact
  - Security issues

## 📦 Release Process

### Versioning

We use [Semantic Versioning](https://semver.org/):
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

### Release Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped
- [ ] Git tag created
- [ ] Deployed to staging
- [ ] Tested on staging
- [ ] Deployed to production

## 🎯 Areas for Contribution

### High Priority

- [ ] Improve MediaPipe performance
- [ ] Add more metal/gemstone presets
- [ ] Enhance mobile experience
- [ ] Add AR try-on (WebXR)
- [ ] Improve accessibility

### Good First Issues

Look for issues labeled `good-first-issue`:
- Documentation improvements
- UI polish
- Test coverage
- Bug fixes

### Advanced Features

- AI-powered recommendations
- Advanced material editor
- Video try-on
- Social sharing
- Multi-language support

## 🛠️ Development Tools

### Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma
- GitLens
- Thunder Client (API testing)

### Useful Commands

```bash
# Format code
npm run format

# Check types
npm run type-check

# Generate Prisma client
npm run generate

# View database
npx prisma studio

# Reset database
npx prisma migrate reset
```

## 📞 Getting Help

- **Documentation**: Check `/docs` folder
- **Issues**: Search existing issues
- **Discussions**: GitHub Discussions
- **Discord**: [Join our Discord](#) (if available)

## 🙏 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to JewelFit 3D! 🎉
