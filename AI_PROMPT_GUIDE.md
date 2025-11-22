# AI Prompt Guide

> Write specific prompts with context and references to get clean, convention-following code.

## Prompt Formula

```
ACTION + LOCATION + REQUIREMENTS + REFERENCE = QUALITY CODE

Example:
"Add POST /auth/verify endpoint to auth-service. 
Include VerifyEmailDto with validation, store tokens in Redis (@app/redis) 24h expiry.
Follow pattern in auth.service.ts"
```

## Project Context

- **Architecture**: NestJS monorepo, microservices (gRPC + REST)
- **Services**: api-gateway, auth, video, interaction, notification
- **Libs**: `@app/common`, `@app/database`, `@app/redis`, `@app/kafka`, `@app/grpc`
- **Stack**: NestJS 10, TypeScript 5, PostgreSQL, Redis, Kafka

## Naming Conventions

```typescript
// Files: kebab-case
user.service.ts ✅
UserService.ts ❌

// Classes: PascalCase
export class UserService {}

// Interfaces: IPascalCase
export interface IUser {}

// Methods: camelCase
getUserById()

// Constants: UPPER_SNAKE_CASE
MAX_VIDEO_SIZE
```

## Code Patterns

### Service
```typescript
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }
}
```

### Controller
```typescript
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async getUser(@Param('id') id: string) {
    return this.userService.findById(id);
  }
}
```

### DTO
```typescript
export class CreateUserDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecurePass123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}
```

### Entity
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

## Must Have

✅ Use `@Injectable()`, `@Controller()`, proper decorators  
✅ TypeScript strict types (no `any`)  
✅ DTOs with class-validator  
✅ Error handling with NestJS exceptions  
✅ Swagger decorators (`@ApiTags`, `@ApiOperation`)  
✅ Use shared libs via `@app/*` imports  
✅ async/await for async operations

## Must Avoid

❌ `any` types  
❌ Hardcoded values (use env vars)  
❌ Business logic in controllers  
❌ Sync operations (use async)  
❌ Ignoring error handling  
❌ Bypassing shared libraries

## Prompt Templates

### Add Feature
```
"Add [feature] to [service].
- [Requirement 1]
- [Requirement 2]
Follow pattern in [reference-file].
Include validation, error handling, tests."
```

### Refactor
```
"Refactor [file] to [goal].
Issues: [current problems]
Requirements: [improvements needed]
Maintain: [existing functionality]"
```

### Add Endpoint
```
"Add [METHOD] [/path] to [controller].
Request: [DTO with fields]
Response: [type]
Validation: [rules]
Follow: [reference-file]"
```

## Commit Format

```
<type>(<scope>): <subject>

Types: feat, fix, refactor, docs, test, style, perf, chore
Scopes: auth, video, interaction, notification, gateway, database, redis

Example:
feat(auth): add email verification endpoint

- Add verification token generation
- Store tokens in Redis with 24h expiry
- Include DTO validation and tests
```

## Reference Files

- Service: `apps/auth-service/src/auth.service.ts`
- Controller: `apps/auth-service/src/auth.controller.ts`
- Module: `apps/auth-service/src/auth.module.ts`

## Quality Checklist

Before generating code:
- [ ] Know which service/module
- [ ] Have specific requirements
- [ ] Know what patterns to follow
- [ ] Specified what libraries to use
- [ ] Defined validation rules
- [ ] Considered error handling

---

**Remember**: Specific prompts → Clean code → Less iteration
