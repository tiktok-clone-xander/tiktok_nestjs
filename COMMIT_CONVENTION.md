# Git Commit Message Convention

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files

## Scopes

- **auth**: Authentication service
- **video**: Video service
- **interaction**: Interaction service
- **notification**: Notification service
- **gateway**: API Gateway
- **database**: Database related
- **redis**: Redis related
- **rabbitmq**: RabbitMQ related
- **docker**: Docker related
- **ci**: CI/CD related
- **docs**: Documentation

## Examples

### Feature
```
feat(auth): implement JWT refresh token flow

- Add refresh token endpoint
- Store refresh tokens in Redis
- Add token rotation logic
- Update tests

Closes #123
```

### Bug Fix
```
fix(video): resolve video upload memory leak

The multer configuration was not properly cleaning up temp files.
Added automatic cleanup after 1 hour.

Fixes #456
```

### Documentation
```
docs(readme): update installation instructions

- Add prerequisites section
- Update Docker setup steps
- Add troubleshooting guide
```

### Refactor
```
refactor(database): optimize video feed query

- Add database indexes
- Implement query caching
- Reduce N+1 queries

Performance improved by 60%
```

### Test
```
test(auth): add e2e tests for login flow

- Test successful login
- Test invalid credentials
- Test token expiration
- Test refresh token
```

### CI/CD
```
ci: add security scanning to pipeline

- Add Trivy vulnerability scanner
- Add npm audit
- Add SAST with CodeQL
```

### Build
```
build: upgrade NestJS to v10.3

- Update @nestjs/* packages
- Fix breaking changes
- Update tests
```

## Commit Message Template

Create `.gitmessage` file:

```
# <type>(<scope>): <subject>
# 
# <body>
# 
# <footer>
#
# Type: feat, fix, docs, style, refactor, perf, test, build, ci, chore
# Scope: auth, video, interaction, notification, gateway, database, etc.
# Subject: Imperative mood, no period at end, max 50 chars
# Body: Explain what and why, not how. Wrap at 72 chars.
# Footer: Reference issues (Closes #123, Fixes #456)
```

Configure git to use template:
```bash
git config commit.template .gitmessage
```

## Best Practices

1. **Use imperative mood**: "Add feature" not "Added feature"
2. **Capitalize first letter**: "Add feature" not "add feature"
3. **No period at end**: "Add feature" not "Add feature."
4. **Limit subject to 50 characters**
5. **Wrap body at 72 characters**
6. **Separate subject and body with blank line**
7. **Use body to explain what and why**
8. **Reference issues in footer**

## Atomic Commits

Each commit should:
- Be a single logical change
- Compile and pass tests
- Have a clear message
- Be reviewable in isolation

## Examples from this project

```bash
# Initial setup
git commit -m "chore: initialize NestJS monorepo structure"

# Add feature
git commit -m "feat(auth): implement user registration with JWT

- Create User entity
- Add bcrypt password hashing
- Generate JWT tokens
- Store session in Redis
- Add input validation

Closes #1"

# Fix bug
git commit -m "fix(auth): prevent duplicate user registration

Add unique constraint check before creating user.
Return proper error message for duplicate emails.

Fixes #12"

# Documentation
git commit -m "docs: add comprehensive README and setup guide

- Add installation instructions
- Document API endpoints
- Add Docker setup guide
- Include troubleshooting section"

# Docker
git commit -m "build(docker): add multi-stage Dockerfile for auth service

- Use alpine base image
- Create non-root user
- Add health check
- Optimize layer caching"

# CI/CD
git commit -m "ci: setup GitHub Actions pipeline

- Add lint and test jobs
- Add security scanning
- Add Docker build and push
- Add deployment to EC2"
```

## Semantic Versioning

Based on commit types:
- **MAJOR**: Breaking changes (BREAKING CHANGE in footer)
- **MINOR**: New features (feat)
- **PATCH**: Bug fixes (fix)

## Tools

### Commitlint

Install:
```bash
npm install -D @commitlint/cli @commitlint/config-conventional
```

Config (commitlint.config.js):
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'auth',
        'video',
        'interaction',
        'notification',
        'gateway',
        'database',
        'redis',
        'rabbitmq',
        'docker',
        'ci',
        'docs',
      ],
    ],
  },
};
```

### Husky (Git Hooks)

Install:
```bash
npm install -D husky
npx husky install
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
```

This ensures all commits follow the convention!
