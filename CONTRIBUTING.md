# 🤝 Contributing to Virtual Jewelry Try-On Platform

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)

---

## 🤗 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

---

## 🚀 Getting Started

### 1. Fork the Repository

Click the "Fork" button at the top right of the repository page.

### 2. Clone Your Fork

```bash
git clone https://github.com/samarthdarak24-cpu/virtuall-jwellery-.git
cd virtuall-jwellery-
```

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/samarthdarak24-cpu/virtuall-jwellery-.git
```

### 4. Install Dependencies

```bash
yarn install
```

### 5. Set Up Environment

Follow the [SETUP_GUIDE.md](./SETUP_GUIDE.md) for complete setup instructions.

---

## 💻 Development Workflow

### Creating a Feature Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a new feature branch
git checkout -b feature/your-feature-name
```

### Branch Naming Convention

- `feature/` - New features (e.g., `feature/add-ring-try-on`)
- `fix/` - Bug fixes (e.g., `fix/camera-permission-error`)
- `docs/` - Documentation updates (e.g., `docs/update-api-guide`)
- `refactor/` - Code refactoring (e.g., `refactor/optimize-3d-rendering`)
- `test/` - Adding tests (e.g., `test/add-auth-tests`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)

### Making Changes

1. Make your changes in your feature branch
2. Test your changes thoroughly
3. Ensure code follows project standards
4. Update documentation if needed

### Keeping Your Branch Updated

```bash
# Fetch latest changes from upstream
git fetch upstream

# Rebase your branch on upstream/main
git rebase upstream/main
```

---

## 📝 Coding Standards

### TypeScript/JavaScript

- Use TypeScript for type safety
- Follow ESLint rules (run `yarn lint`)
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Prefer `const` over `let`, avoid `var`
- Use async/await over promises when possible

**Example**:
```typescript
/**
 * Calculates the position for jewelry overlay on face
 * @param landmarks - MediaPipe face landmarks
 * @param jewelryType - Type of jewelry (earring, necklace, etc.)
 * @returns Position coordinates {x, y, z}
 */
async function calculateJewelryPosition(
  landmarks: FaceLandmark[],
  jewelryType: JewelryType
): Promise<Position3D> {
  // Implementation
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper TypeScript types for props

**Example**:
```typescript
interface ProductCardProps {
  product: Product;
  onSelect: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onSelect 
}) => {
  // Component implementation
};
```

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Keep custom CSS minimal
- Use semantic class names

### File Organization

```
src/
├── components/
│   ├── common/          # Reusable components
│   ├── layout/          # Layout components
│   └── [feature]/       # Feature-specific components
├── pages/               # Next.js pages
├── utils/               # Utility functions
├── hooks/               # Custom React hooks
└── types/               # TypeScript type definitions
```

---

## 📦 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(3d-viewer): add material editor for jewelry customization

- Added color picker for metal selection
- Implemented texture switcher for gemstones
- Added real-time preview updates

Closes #123
```

```bash
fix(auth): resolve token expiration issue

Fixed bug where JWT tokens were expiring prematurely
due to incorrect timezone handling.

Fixes #456
```

### Commit Best Practices

- Write clear, concise commit messages
- Use present tense ("add feature" not "added feature")
- Reference issue numbers when applicable
- Keep commits atomic (one logical change per commit)
- Avoid committing commented-out code

---

## 🔄 Pull Request Process

### Before Submitting

1. **Test your changes**:
   ```bash
   yarn test
   yarn lint
   ```

2. **Update documentation** if needed

3. **Ensure no merge conflicts**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

4. **Review your changes**:
   ```bash
   git diff upstream/main
   ```

### Creating a Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Go to the original repository on GitHub

3. Click "New Pull Request"

4. Select your fork and branch

5. Fill out the PR template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests passing
```

### PR Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged
4. Your contribution will be credited

### After Your PR is Merged

1. Delete your feature branch:
   ```bash
   git branch -d feature/your-feature-name
   git push origin --delete feature/your-feature-name
   ```

2. Update your main branch:
   ```bash
   git checkout main
   git pull upstream main
   ```

---

## 🧪 Testing Guidelines

### Writing Tests

- Write tests for new features
- Update tests for modified features
- Aim for high code coverage
- Test edge cases and error scenarios

### Test Structure

```typescript
describe('ProductCard Component', () => {
  it('should render product information correctly', () => {
    // Test implementation
  });

  it('should call onSelect when clicked', () => {
    // Test implementation
  });

  it('should handle missing image gracefully', () => {
    // Test implementation
  });
});
```

### Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test --watch

# Run tests with coverage
yarn test --coverage

# Run E2E tests
cd apps/web && npm run test:e2e
```

---

## 🐛 Reporting Bugs

### Before Reporting

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
What you expected to happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Node version: [e.g., 18.17.0]

**Additional context**
Any other relevant information
```

---

## 💡 Suggesting Features

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
Clear description of desired solution

**Describe alternatives you've considered**
Alternative solutions or features

**Additional context**
Mockups, examples, or references
```

---

## 📚 Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

---

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

---

## 📞 Questions?

- Open a GitHub Discussion
- Comment on relevant issues
- Reach out to maintainers

---

Thank you for contributing to the Virtual Jewelry Try-On Platform! 💎✨
