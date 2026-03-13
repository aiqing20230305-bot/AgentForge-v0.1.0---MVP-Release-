# Contributing to World of Claudecraft

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 🚀 Quick Start

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/world-of-claudecraft.git
cd world-of-claudecraft

# 3. Install dependencies
npm install

# 4. Run development server
npm run electron:dev

# 5. Make your changes
# 6. Test your changes
./scripts/test-suite.sh

# 7. Commit and push
git add .
git commit -m "feat: your feature description"
git push origin your-branch-name

# 8. Create a Pull Request
```

---

## 📋 Development Setup

### Prerequisites
- Node.js >= 16.0.0
- npm >= 8.0.0
- Git

### Environment Setup

```bash
# Verify your setup
node scripts/verify-setup.js

# Should show all green checkmarks
```

---

## 🎯 Project Structure

```
world-of-claudecraft/
├── src/
│   ├── components/      # React components
│   ├── stores/          # Zustand state management
│   ├── services/        # API and business logic
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript type definitions
│   └── styles/          # CSS and styling
├── electron/            # Electron main process
├── scripts/             # Build and utility scripts
└── docs/                # Documentation
```

---

## 💻 Coding Standards

### TypeScript
- Use TypeScript for all new code
- Avoid `any` types when possible
- Add proper type definitions

### React
- Use functional components with hooks
- Use `React.memo` for expensive components
- Use `useMemo` and `useCallback` appropriately

### Naming Conventions
- **Components:** PascalCase (`AgentDisplayPanel.tsx`)
- **Functions:** camelCase (`loadOpenClawAgents`)
- **Constants:** UPPER_SNAKE_CASE (`DEFAULT_PORT`)
- **Files:** PascalCase for components, camelCase for utilities

### Code Style
```typescript
// ✅ Good
export async function loadAgents(): Promise<Agent[]> {
  try {
    const data = await fetchAgents()
    return data.map(convertToLocal)
  } catch (error) {
    console.error('Failed to load agents:', error)
    return getDefaultAgents()
  }
}

// ❌ Bad
export async function loadAgents() {
  let data = await fetchAgents()
  return data.map(x => convertToLocal(x))
}
```

---

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm test

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e

# Full test suite
./scripts/test-suite.sh
```

### Writing Tests
- Add tests for all new features
- Test edge cases and error handling
- Aim for > 70% code coverage

```typescript
// Example test
describe('openclawLoader', () => {
  it('should use simple lowercase Agent IDs', () => {
    const agents = getDefaultAgents()
    expect(agents[0].id).toBe('atlas')
  })
})
```

---

## 📝 Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### Examples
```bash
feat(agent): add auto-discovery for local agents

Implement automatic scanning of ~/.openclaw/agents directory
to discover local agent configurations.

Closes #42

---

fix(task): resolve empty task list issue

Standardized Agent ID format from prefixed (local_agent_*) to
simple lowercase (atlas, clip) to match task data.

Fixes #15, #23
```

---

## 🔄 Pull Request Process

### Before Submitting
1. ✅ Run `./scripts/test-suite.sh`
2. ✅ Update documentation if needed
3. ✅ Add tests for new features
4. ✅ Ensure all tests pass
5. ✅ Follow code style guidelines

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added unit tests
- [ ] Updated documentation

## Screenshots (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
```

### Review Process
1. Maintainer reviews code
2. Address feedback
3. Tests must pass
4. At least one approval required
5. Squash and merge

---

## 🐛 Bug Reports

### Before Reporting
1. Check existing issues
2. Try latest version
3. Read TROUBLESHOOTING.md

### Bug Report Template
```markdown
**Describe the bug**
Clear description of the issue

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g. macOS 13.0]
- Node.js: [e.g. v18.0.0]
- Version: [e.g. v0.1.0]

**Console logs**
Paste relevant console output
```

---

## 💡 Feature Requests

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
What you want to happen

**Describe alternatives you've considered**
Other solutions you've thought about

**Additional context**
Screenshots, mockups, examples
```

---

## 🏗️ Architecture Guidelines

### State Management
- Use Zustand for global state
- Keep state minimal and normalized
- Avoid duplicating data

### Component Structure
- Keep components small and focused
- Extract reusable logic into hooks
- Use composition over inheritance

### File Organization
- One component per file
- Co-locate related files
- Keep utilities separate from components

---

## 📚 Resources

- [Project README](README.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [Development Status](DEVELOPMENT_STATUS.md)
- [Next Steps](NEXT_STEPS.md)

---

## 🤝 Code of Conduct

### Our Standards
- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions

### Unacceptable Behavior
- Harassment or discrimination
- Trolling or insulting comments
- Personal attacks
- Publishing private information

---

## 📞 Getting Help

- **Issues:** https://github.com/Summonair/world-of-claudecraft/issues
- **Discussions:** https://github.com/Summonair/world-of-claudecraft/discussions
- **Email:** (if provided)

---

**Thank you for contributing to World of Claudecraft!** 🎉
