# AI Prompt Guide for TikTok Clone NestJS Monorepo

> **Purpose**: Guide AI assistants to generate clean, maintainable code that follows project conventions and architecture patterns.

## 🎯 Quick Reference for AI Prompts

### ✅ Good Prompts
```
"Add a new endpoint to auth-service for email verification following our REST conventions"
"Refactor video.service.ts to use the shared @app/redis module"
"Create a DTO for user profile update with proper validation decorators"
"Add integration tests for the like/unlike video endpoint"
```

### ❌ Bad Prompts
```
"Add login" (too vague)
"Fix the code" (no context)
"Make it better" (subjective, unclear)
"Add everything for user management" (too broad)
```

---

## 📋 Project Context (Include in Prompts)

### Architecture Overview
- **Monorepo** with NestJS microservices
- **Services**: api-gateway, auth-service, video-service, interaction-service, notification-service
- **Shared Libraries**: `@app/common`, `@app/database`, `@app/redis`, `@app/kafka`, `@app/grpc`
- **Communication**: gRPC for inter-service, REST for client-facing APIs
- **Frontend**: Next.js 14 with TypeScript in `tiktok-frontend/`

### Technology Stack
- **Backend**: NestJS 10.x, TypeScript 5.x
- **Database**: PostgreSQL with TypeORM
- **Cache**: Redis (ioredis)
- **Message Queue**: Kafka
- **Auth**: JWT with Passport
- **Validation**: class-validator, class-transformer

---

## 🏗️ Code Generation Guidelines

### 1. File Structure & Naming

**Always follow these conventions:**

```typescript
// File naming: kebab-case
// ✅ user.service.ts
// ✅ video-upload.controller.ts
// ❌ UserService.ts
// ❌ video_upload.controller.ts

// Class naming: PascalCase
export class UserService {}
export class VideoUploadController {}

// Interfaces: PascalCase with 'I' prefix
export interface IUser {}
export interface IVideoMetadata {}

// Methods/Variables: camelCase
getUserById(id: string) {}
const maxFileSize = 1024;

// Constants: UPPER_SNAKE_CASE
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
export const JWT_EXPIRY = '7d';
```

### 2. NestJS Service Pattern

**When creating services:**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    // Implementation
  }
}
```

**Requirements:**
- ✅ Use `@Injectable()` decorator
- ✅ Inject dependencies via constructor
- ✅ Use `readonly` for injected services
- ✅ Return type annotations on all methods
- ✅ Use async/await for async operations
- ❌ Don't use `any` type
- ❌ Don't create services without dependency injection

### 3. Controller Pattern

**When creating controllers:**

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async getUserById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new user' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
}
```

**Requirements:**
- ✅ Use `@ApiTags()` and `@ApiOperation()` for Swagger docs
- ✅ Use DTOs for request bodies
- ✅ Use proper HTTP decorators (@Get, @Post, @Put, @Delete, @Patch)
- ✅ Use route parameters and query params appropriately
- ❌ Don't put business logic in controllers

### 4. DTO Pattern with Validation

**When creating DTOs:**

```typescript
import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'John Doe', minLength: 2 })
  @IsString()
  @MinLength(2)
  username: string;

  @ApiProperty({ example: 'SecurePass123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ example: 'Software Engineer' })
  @IsOptional()
  @IsString()
  bio?: string;
}
```

**Requirements:**
- ✅ Use class-validator decorators
- ✅ Add Swagger decorators for API docs
- ✅ Provide examples in decorators
- ✅ Use optional properties with `?` and `@IsOptional()`
- ❌ Don't use plain objects for validation

### 5. Entity Pattern (TypeORM)

**When creating entities:**

```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  bio: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Requirements:**
- ✅ Use `@Entity()` with table name
- ✅ Use UUID for primary keys
- ✅ Add `createdAt` and `updatedAt` timestamps
- ✅ Use `select: false` for sensitive fields (passwords)
- ✅ Define relationships properly (@OneToMany, @ManyToOne, etc.)
- ❌ Don't expose sensitive data in entities

### 6. Module Pattern

**When creating modules:**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // Export if other modules need it
})
export class UserModule {}
```

**Requirements:**
- ✅ Import required entities with TypeOrmModule.forFeature()
- ✅ Register controllers and providers
- ✅ Export services that need to be shared
- ✅ Import other modules as needed

### 7. Shared Libraries Usage

**When using shared libraries:**

```typescript
// ✅ Use path aliases from tsconfig
import { LoggerService } from '@app/common';
import { DatabaseModule } from '@app/database';
import { RedisService } from '@app/redis';
import { KafkaService } from '@app/kafka';

// ❌ Don't use relative paths for shared libs
import { LoggerService } from '../../../libs/common/src/logger.service';
```

### 8. Error Handling

**When handling errors:**

```typescript
import { HttpException, HttpStatus, NotFoundException, BadRequestException } from '@nestjs/common';

// ✅ Use NestJS built-in exceptions
async getUserById(id: string): Promise<User> {
  const user = await this.userRepository.findOne({ where: { id } });
  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }
  return user;
}

// ✅ Custom business logic errors
if (video.size > MAX_VIDEO_SIZE) {
  throw new BadRequestException('Video size exceeds maximum allowed size');
}

// ❌ Don't use generic errors
throw new Error('Something went wrong');
```

### 9. Testing Pattern

**When writing tests:**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

describe('UserService', () => {
  let service: UserService;
  let mockRepository;

  beforeEach(async () => {
    mockRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find user by id', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    mockRepository.findOne.mockResolvedValue(mockUser);

    const result = await service.findById('1');
    expect(result).toEqual(mockUser);
    expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
  });
});
```

---

## 🎨 Code Style Rules

### TypeScript Specific

```typescript
// ✅ Use strict typing
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ Avoid 'any'
function calculateTotal(items: any): any {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ Use optional chaining
const userName = user?.profile?.name;

// ✅ Use nullish coalescing
const displayName = user.name ?? 'Anonymous';

// ✅ Use const assertions for constants
const ROLES = ['admin', 'user', 'moderator'] as const;
```

### Async/Await Best Practices

```typescript
// ✅ Always use async/await
async updateUser(id: string, data: UpdateUserDto): Promise<User> {
  const user = await this.findById(id);
  Object.assign(user, data);
  return await this.userRepository.save(user);
}

// ❌ Don't mix promises and async/await
async updateUser(id: string, data: UpdateUserDto): Promise<User> {
  return this.findById(id).then(user => {
    Object.assign(user, data);
    return this.userRepository.save(user);
  });
}
```

### Import Organization

```typescript
// ✅ Organize imports in this order:
// 1. Node/External packages
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// 2. Shared libraries (@app/*)
import { LoggerService } from '@app/common';
import { RedisService } from '@app/redis';

// 3. Local imports
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
```

---

## 📝 Commit Message Convention

**When creating commits (include in PR descriptions):**

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation only
- `test`: Adding tests
- `style`: Code style changes (formatting)
- `perf`: Performance improvements
- `chore`: Maintenance tasks

### Scopes
- `auth`, `video`, `interaction`, `notification`, `gateway`
- `database`, `redis`, `kafka`
- `frontend`, `docker`, `ci`

### Examples
```
feat(auth): add email verification endpoint

- Add verification token generation
- Create email sending service integration
- Add verification endpoint with DTO validation
- Include tests for verification flow

Closes #123

---

fix(video): resolve upload memory leak

Multer config was not cleaning temp files properly.
Added automatic cleanup after processing.

Fixes #456

---

refactor(interaction): optimize like/unlike performance

- Add Redis caching for like counts
- Implement batch processing for notifications
- Reduce database queries by 70%
```

---

## 🔍 Prompt Templates for Common Tasks

### Adding a New Feature

```
I need to add [feature name] to the [service-name].

Requirements:
- Should follow REST conventions
- Include proper DTO validation
- Add Swagger documentation
- Use shared libraries where applicable
- Include error handling
- Follow the existing code patterns in [service-name]

Example: "I need to add email verification to the auth-service..."
```

### Creating a New Service

```
Create a new microservice called [service-name] for [purpose].

Requirements:
- Follow the structure of existing services (auth-service, video-service)
- Include health check endpoint
- Set up proper module organization
- Add Dockerfile following existing patterns
- Use shared libraries: @app/database, @app/redis, @app/common
- Include basic tests

Example: "Create a new microservice called comment-service for handling video comments..."
```

### Refactoring Existing Code

```
Refactor [file/module name] to [improvement goal].

Context:
- Current issues: [list problems]
- Desired outcome: [what should improve]
- Must maintain: [existing functionality to preserve]
- Follow: [specific patterns or conventions]

Example: "Refactor video.service.ts to use Redis caching for frequently accessed videos..."
```

### Adding Tests

```
Add [unit/integration/e2e] tests for [component name].

Coverage should include:
- Happy path scenarios
- Error cases
- Edge cases
- [Specific scenarios]

Follow the testing patterns in [reference test file].

Example: "Add unit tests for auth.service.ts covering login, registration, and token validation..."
```

### Debugging Issues

```
I'm encountering [error/issue description] in [location].

Context:
- What I'm trying to do: [goal]
- Current behavior: [what's happening]
- Expected behavior: [what should happen]
- Relevant code: [file/function names]
- Error messages: [if any]

Example: "I'm encountering a 'Cannot find module @app/redis' error when starting the video-service..."
```

---

## 🚫 Anti-Patterns to Avoid

### Code Quality

```typescript
// ❌ Don't use 'any' type
const processData = (data: any) => { ... }

// ❌ Don't hardcode configuration
const dbHost = 'localhost';

// ❌ Don't put business logic in controllers
@Post()
async createUser(@Body() dto: CreateUserDto) {
  const hashedPassword = await bcrypt.hash(dto.password, 10);
  const user = this.userRepository.create({ ...dto, password: hashedPassword });
  return this.userRepository.save(user);
}

// ❌ Don't use synchronous operations
const file = fs.readFileSync('path/to/file');

// ❌ Don't ignore error handling
const user = await this.userRepository.findOne({ where: { id } });
return user; // What if user is null?
```

### Architecture

```typescript
// ❌ Don't bypass shared libraries
import { Redis } from 'ioredis';
const redis = new Redis(); // Use @app/redis instead

// ❌ Don't create circular dependencies
// user.module.ts imports video.module.ts
// video.module.ts imports user.module.ts

// ❌ Don't mix concerns
export class UserService {
  // This service should not handle video uploads
  async uploadVideo() { ... }
}
```

---

## ✅ Pre-Submit Checklist

Before asking AI to generate/modify code, ensure your prompt includes:

- [ ] **Context**: Which service/module are we working in?
- [ ] **Purpose**: What problem are we solving?
- [ ] **Requirements**: What are the specific needs?
- [ ] **Conventions**: Reference to follow existing patterns
- [ ] **Scope**: Clearly defined boundaries (not "add everything")
- [ ] **Testing**: Should tests be included?
- [ ] **Documentation**: Should docs be updated?

---

## 🎓 Learning from Existing Code

When in doubt, tell AI to:

```
"Follow the pattern used in [existing similar file/feature]"
```

### Reference Files for Patterns

- **Service Pattern**: `apps/auth-service/src/auth.service.ts`
- **Controller Pattern**: `apps/auth-service/src/auth.controller.ts`
- **Module Pattern**: `apps/auth-service/src/auth.module.ts`
- **DTO Pattern**: Search for `*.dto.ts` files in any service
- **Entity Pattern**: Search for `*.entity.ts` files
- **Test Pattern**: `apps/auth-service/test/auth.service.spec.ts`

---

## 📚 Additional Resources

- **Architecture**: See `MONOREPO_ARCHITECTURE.md`
- **Setup Guide**: See `QUICKSTART.md`
- **Contributing**: See `CONTRIBUTING.md`
- **Commit Convention**: See `COMMIT_CONVENTION.md`
- **Development**: See `DEVELOPMENT.md`

---

## 🤖 Example AI Conversation

### Bad Conversation ❌
```
User: "Add login"
AI: "I'll add a login function..."
Result: Generic code that doesn't match project conventions
```

### Good Conversation ✅
```
User: "Add JWT refresh token functionality to auth-service following our existing auth patterns. Should include:
- New refresh endpoint in auth.controller.ts
- Token rotation logic in auth.service.ts
- Store refresh tokens in Redis using @app/redis
- Proper DTO validation
- Error handling for expired tokens
- Follow the pattern in auth.service.ts for token generation"

AI: "I'll implement JWT refresh token functionality following your auth-service patterns..."
Result: Clean, consistent code that fits the project architecture
```

---

## 🎯 Summary

**The Golden Rule**: Always provide context, be specific, reference existing patterns, and follow established conventions.

Good prompts = Clean code = Less technical debt = Happier developers 🚀
