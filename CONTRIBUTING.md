# Contributing to TikTok Clone

First off, thank you for considering contributing to TikTok Clone! 🎉

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/tiktok_nestjs.git`
3. Add upstream remote: `git remote add upstream https://github.com/betuanminh22032003/tiktok_nestjs.git`
4. Create a new branch: `git checkout -b feature/your-feature-name`

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Start infrastructure:
   ```bash
   docker-compose up -d postgres redis rabbitmq
   ```

4. Run development server:
   ```bash
   npm run start:dev
   ```

## How to Contribute

### Reporting Bugs

- Use the GitHub Issues page
- Describe the bug and how to reproduce it
- Include screenshots if applicable
- Mention your environment (OS, Node version, etc.)

### Suggesting Enhancements

- Use the GitHub Issues page
- Clearly describe the enhancement
- Explain why it would be useful
- Provide examples if possible

### Code Contributions

1. **Find an issue** or create one
2. **Comment** on the issue to let others know you're working on it
3. **Fork and clone** the repository
4. **Create a branch** from `develop`
5. **Make your changes**
6. **Write tests** for your changes
7. **Ensure tests pass**: `npm run test`
8. **Commit your changes** following our [commit convention](COMMIT_CONVENTION.md)
9. **Push to your fork**
10. **Create a Pull Request**

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Provide proper type annotations
- Avoid using `any` type

### NestJS

- Follow NestJS best practices
- Use dependency injection
- Implement proper DTOs with validation
- Use decorators appropriately

### Naming Conventions

- **Files**: `kebab-case.ts` (e.g., `user.service.ts`)
- **Classes**: `PascalCase` (e.g., `UserService`)
- **Interfaces**: `PascalCase` with `I` prefix (e.g., `IUser`)
- **Methods/Variables**: `camelCase` (e.g., `getUserById`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_FILE_SIZE`)

### Code Style

- Use Prettier for formatting
- Use ESLint for linting
- Run `npm run lint` before committing
- 2 spaces for indentation
- Single quotes for strings
- Semicolons required

### Documentation

- Add JSDoc comments for public APIs
- Document complex logic
- Update README.md if adding new features
- Keep documentation up to date

## Commit Messages

Follow the [Conventional Commits](COMMIT_CONVENTION.md) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Examples:
- `feat(auth): add password reset functionality`
- `fix(video): resolve upload timeout issue`
- `docs(readme): update installation instructions`

## Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Ensure all tests pass**: `npm run test`
4. **Run linter**: `npm run lint`
5. **Update CHANGELOG.md** (if applicable)
6. **Request review** from maintainers
7. **Address review comments**
8. **Wait for approval** before merging

### PR Title Format

Use conventional commit format:
```
feat(scope): description
fix(scope): description
docs(scope): description
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where needed
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests
- [ ] All tests pass locally
```

## Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:cov
```

### Writing Tests

- Write tests for all new features
- Aim for >80% code coverage
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

Example:
```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a user with valid data', async () => {
      // Arrange
      const dto = { email: 'test@example.com', ... };
      
      // Act
      const result = await service.createUser(dto);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(dto.email);
    });
  });
});
```

## Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring
- `test/description` - Adding tests
- `chore/description` - Maintenance tasks

## Questions?

Feel free to:
- Open an issue
- Ask in discussions
- Contact maintainers

## Recognition

Contributors will be recognized in:
- README.md Contributors section
- Release notes
- Project documentation

Thank you for contributing! 🚀
