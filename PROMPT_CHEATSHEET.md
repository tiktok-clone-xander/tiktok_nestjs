# AI Prompt Cheat Sheet 🚀

Quick reference for writing effective prompts to AI assistants.

## 🎯 Prompt Template

```
I need to [action] in [location].

Requirements:
- [requirement 1]
- [requirement 2]
- Follow patterns in [reference file]
- Include [tests/docs/validation]

Context: [any relevant background]
```

## ✅ Good Prompt Examples

### Adding a Feature
```
Add email verification to auth-service.

Requirements:
- Generate verification token on registration
- Create POST /auth/verify endpoint
- Add VerifyEmailDto with token validation
- Store tokens in Redis with 24h expiry
- Send verification email (mock for now)
- Follow the pattern in auth.service.ts
- Include unit tests
```

### Creating a New Endpoint
```
Add GET /videos/trending endpoint to video-service.

Requirements:
- Return top 20 videos by views (last 7 days)
- Use QueryDto for pagination
- Cache results in Redis for 5 minutes
- Add Swagger documentation
- Include proper error handling
- Follow the pattern in video.controller.ts
```

### Refactoring Code
```
Refactor interaction.service.ts to optimize like/unlike performance.

Current issues:
- Each like triggers separate DB query and notification
- No caching for like counts
- Race conditions on rapid like/unlike

Requirements:
- Add Redis caching for like counts
- Batch notifications using Kafka
- Use database transactions
- Maintain existing API contract
- Add tests for new implementation
```

### Adding Validation
```
Add validation to CreateVideoDto.

Requirements:
- Title: 1-150 chars, required
- Description: max 2000 chars, optional
- Tags: array of strings, max 10 items
- Privacy: enum ['public', 'private', 'friends']
- Use class-validator decorators
- Add Swagger examples
```

### Creating Tests
```
Add unit tests for auth.service.ts.

Coverage needed:
- register(): success, duplicate email, validation errors
- login(): success, wrong password, user not found
- validateUser(): valid token, expired token, invalid token
- Mock UserRepository and JwtService
- Follow pattern in apps/auth-service/test/auth.service.spec.ts
```

## ❌ Bad Prompt Examples (Don't Do This)

```
❌ "Add login"
→ Too vague, no context

❌ "Fix the bug"
→ What bug? Where?

❌ "Make it better"
→ Better how?

❌ "Add user management"
→ Too broad, unclear scope

❌ "Create CRUD"
→ For what entity? Which service?
```

## 🏗️ Service-Specific Prompts

### Auth Service
```
[Action] in auth-service following JWT/Passport patterns.
Include: validation, error handling, Redis integration.
Reference: apps/auth-service/src/auth.service.ts
```

### Video Service
```
[Action] in video-service.
Include: file validation, S3/storage integration, typeorm relations.
Reference: apps/video-service/src/video.service.ts
```

### Interaction Service
```
[Action] in interaction-service.
Include: Redis caching, Kafka notifications, optimistic updates.
Reference: apps/interaction-service/src/interaction.service.ts
```

## 📋 Context Keywords to Include

| Keyword | When to Use |
|---------|-------------|
| "following pattern in [file]" | Always - ensures consistency |
| "use shared library @app/[lib]" | When using common functionality |
| "include validation" | For DTOs and inputs |
| "add Swagger docs" | For any endpoint |
| "with error handling" | Always for services |
| "include tests" | For testable code |
| "cache in Redis" | For frequently accessed data |
| "send to Kafka" | For async notifications |

## 🎨 Code Style Keywords

```
✅ Use these phrases:
- "following TypeScript best practices"
- "with proper type annotations"
- "using async/await"
- "with dependency injection"
- "following NestJS conventions"
- "using class-validator decorators"

❌ Avoid these:
- "make it work" (too vague)
- "add some validation" (be specific)
- "fix errors" (what errors?)
- "improve code" (how?)
```

## 🔍 Debugging Prompts

```
I'm getting [error message] in [file/location].

What I'm doing:
- [step by step]

What I expect:
- [expected result]

What happens:
- [actual result]

Relevant code:
- File: [filename]
- Function: [function name]
- Line: [approximate line]

Environment:
- Service: [service name]
- Dependencies: [relevant packages]
```

## 📝 Documentation Prompts

```
Add/Update documentation for [feature/module].

Include:
- Purpose and overview
- API endpoints (if applicable)
- Request/response examples
- Error codes and handling
- Environment variables
- Usage examples

Format: Markdown with code examples
Location: [specify file or create new]
```

## 🧪 Testing Prompts

```
Add [unit/integration/e2e] tests for [component].

Test cases:
1. Happy path: [describe]
2. Error case 1: [describe]
3. Error case 2: [describe]
4. Edge case: [describe]

Mocks needed:
- [service/repository names]

Assertions:
- [what to verify]

Follow pattern in: [reference test file]
```

## ⚡ Quick Commands

### Create New Feature
```
Create [feature-name] feature in [service-name]:
- Controller with [endpoints]
- Service with [methods]
- DTOs with validation
- Entity with TypeORM
- Module registration
- Swagger docs
- Unit tests
```

### Add Endpoint
```
Add [METHOD] [/path] to [controller]:
- Request: [DTO name with fields]
- Response: [return type]
- Validation: [rules]
- Error handling: [cases]
- Swagger: [summary]
```

### Refactor Component
```
Refactor [file-name]:
- Extract [what] into [where]
- Optimize [what]
- Maintain [what must stay same]
- Improve [specific aspect]
```

## 🎓 Learning Prompts

```
✅ Good: "Explain the authentication flow in auth-service, including JWT generation and Redis token storage"

✅ Good: "How does the video upload process work in video-service?"

✅ Good: "What's the difference between interaction-service and notification-service?"

❌ Bad: "Explain the code"
❌ Bad: "How does this work?"
```

## 💡 Pro Tips

1. **Be Specific**: "Add email validation" → "Add email validation using IsEmail decorator from class-validator"

2. **Reference Existing Code**: "Create a service" → "Create a service following the pattern in auth.service.ts"

3. **Define Success**: "Fix the bug" → "Fix the bug where users can't login, should return JWT token on success"

4. **Scope Clearly**: "Add user features" → "Add user profile update endpoint with avatar upload"

5. **Include Context**: Always mention which service, which file, which patterns to follow

## 📚 Related Files

- **Full Guide**: `AI_PROMPT_GUIDE.md` - Comprehensive guide with examples
- **Conventions**: `CONTRIBUTING.md` - Code style and conventions
- **Commits**: `COMMIT_CONVENTION.md` - How to format commits
- **Architecture**: `MONOREPO_ARCHITECTURE.md` - Project structure

## 🚀 Remember

**Good Prompt Formula**:
```
Action + Location + Requirements + Reference + Context = Quality Code
```

**Golden Rule**:
> Specific prompts → Specific code → Less iteration → Faster development
