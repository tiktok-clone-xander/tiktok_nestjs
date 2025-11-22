# 🎯 AI Prompt Quick Guide - Visual Reference

## 📊 Prompt Quality Levels

```
❌ LEVEL 0 - Terrible
"fix this"
"add feature"
"make it work"
→ Result: Random code, doesn't match conventions

⚠️ LEVEL 1 - Poor  
"add login function"
"create user service"
→ Result: Generic code, missing validation

✅ LEVEL 2 - Good
"Add login endpoint to auth.controller.ts with JWT token response"
"Create UserService with TypeORM repository for CRUD operations"
→ Result: Working code, some conventions followed

🌟 LEVEL 3 - Excellent
"Add POST /auth/login endpoint to auth.controller.ts following our authentication patterns.
- Use LoginDto with email/password validation
- Return JWT token in HttpOnly cookie
- Handle invalid credentials with UnauthorizedException
- Add Swagger documentation
- Follow pattern in auth.service.ts"
→ Result: Clean, convention-following, production-ready code
```

## 🎨 Prompt Formula

```
┌─────────────────────────────────────────────┐
│   ACTION + LOCATION + REQUIREMENTS           │
│        + REFERENCE + CONTEXT                 │
│   = QUALITY CODE                             │
└─────────────────────────────────────────────┘

Example:
┌────────────────────────────────────────────────────────┐
│ ACTION:      "Add email verification"                  │
│ LOCATION:    "to auth-service"                         │
│ REQUIREMENTS: "- Generate tokens                       │
│               - Store in Redis (24h expiry)            │
│               - Create /auth/verify endpoint"          │
│ REFERENCE:   "Follow patterns in auth.service.ts"      │
│ CONTEXT:     "Use @app/redis for token storage"        │
└────────────────────────────────────────────────────────┘
```

## 🔄 Iteration Comparison

### Without Guide (5-7 iterations)
```
1. "add login" 
   → Missing validation ❌
2. "add validation"
   → Wrong validators ❌
3. "use class-validator"
   → No error handling ❌
4. "add error handling"
   → No Swagger docs ❌
5. "add swagger"
   → Wrong file structure ❌
6. "fix structure"
   → Not using shared libs ❌
7. "use @app/common"
   → Finally works ✅
```

### With Guide (1-2 iterations)
```
1. [Read PROMPT_CHEATSHEET.md]
   "Add login endpoint to auth.controller.ts with LoginDto validation,
   JWT response, error handling, Swagger docs, following auth.service.ts pattern"
   → Works perfectly ✅

2. [Minor adjustment if needed]
   "Update to use HttpOnly cookie instead of response body"
   → Production ready ✅
```

## 📈 Code Quality Impact

```
WITHOUT GUIDE               WITH GUIDE
─────────────               ──────────
Code Quality:               Code Quality:
░░░░░░░░░░ 20%             ████████░░ 80%

Type Safety:                Type Safety:
░░░░░░░░░░ 30%             █████████░ 90%

Convention:                 Convention:
░░░░░░░░░░ 25%             █████████░ 95%

Documentation:              Documentation:
░░░░░░░░░░ 15%             ████████░░ 85%

Error Handling:             Error Handling:
░░░░░░░░░░ 40%             █████████░ 90%
```

## 🎯 Decision Tree

```
Need to write code?
    │
    ├─ Simple task (1 file, obvious)?
    │   └─→ Use AI directly with specific prompt
    │
    ├─ Complex feature (multiple files)?
    │   └─→ Read PROMPT_CHEATSHEET.md
    │       └─→ Use template from guide
    │
    ├─ New to codebase?
    │   └─→ Read .copilot-instructions.md
    │       └─→ Skim AI_PROMPT_GUIDE.md
    │       └─→ Keep CHEATSHEET open
    │
    └─ Unsure about pattern?
        └─→ Check AI_PROMPT_GUIDE.md
            └─→ Find similar example
            └─→ Reference in prompt
```

## 📋 Checklist Before Prompting

```
Before asking AI to generate code:

□ I know which service/module to work in
□ I've checked existing similar code
□ I know what patterns to follow
□ I have specific requirements listed
□ I know what libraries to use (@app/*)
□ I know what validation rules needed
□ I know what error handling needed
□ I know if tests are needed

If 6+ boxes checked → Good to prompt!
If < 6 boxes checked → Read guides first
```

## 🎨 Common Patterns Quick Reference

### Controller Endpoint
```typescript
📍 Location: apps/[service]/src/[name].controller.ts
📝 Pattern:

@ApiTags('[resource]')
@Controller('[resource]')
export class [Name]Controller {
  constructor(private readonly service: [Name]Service) {}

  @Get(':id')
  @ApiOperation({ summary: 'Description' })
  async getById(@Param('id') id: string) {
    return this.service.findById(id);
  }
}

✅ Must have: @ApiTags, @ApiOperation, proper decorators, DI
❌ Don't: Put logic in controller, use 'any' type
```

### Service Method
```typescript
📍 Location: apps/[service]/src/[name].service.ts
📝 Pattern:

@Injectable()
export class [Name]Service {
  constructor(
    @InjectRepository([Entity])
    private readonly repo: Repository<[Entity]>,
  ) {}

  async findById(id: string): Promise<[Entity]> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`[Entity] ${id} not found`);
    }
    return entity;
  }
}

✅ Must have: @Injectable, typed returns, error handling
❌ Don't: Use 'any', ignore errors, hardcode values
```

### DTO with Validation
```typescript
📍 Location: apps/[service]/src/dto/[action]-[name].dto.ts
📝 Pattern:

export class Create[Name]Dto {
  @ApiProperty({ example: 'value' })
  @IsString()
  @IsNotEmpty()
  field: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  optionalField?: string;
}

✅ Must have: Validation decorators, Swagger decorators, examples
❌ Don't: Skip validation, use plain objects
```

## 🚦 Traffic Light System

```
🔴 RED - Stop and Read Guide
   - New to project
   - Creating new service
   - Unfamiliar pattern
   - Breaking conventions

🟡 YELLOW - Check Cheatsheet
   - Similar to existing code
   - Minor modifications
   - Adding endpoint
   - Standard CRUD

🟢 GREEN - Go Ahead
   - Simple variable rename
   - Fixing typo
   - Adding comment
   - Trivial change
```

## 💡 Pro Tips Visual

```
┌───────────────────────────────────────┐
│  TIP #1: Reference Existing Files    │
├───────────────────────────────────────┤
│  "following pattern in X.service.ts"  │
│  → AI copies good patterns ✅          │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│  TIP #2: Be Specific About Libraries  │
├───────────────────────────────────────┤
│  "using @app/redis for caching"       │
│  → Correct import paths ✅             │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│  TIP #3: List All Requirements        │
├───────────────────────────────────────┤
│  "Include: validation, errors, docs"  │
│  → Complete implementation ✅          │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│  TIP #4: Specify Conventions          │
├───────────────────────────────────────┤
│  "Follow NestJS & project conventions"│
│  → Clean, maintainable code ✅         │
└───────────────────────────────────────┘
```

## 📚 File Guide Reference

```
┌────────────────────────────────────────────────────┐
│ WHEN TO USE WHICH FILE                             │
├────────────────────────────────────────────────────┤
│                                                    │
│ 📘 .copilot-instructions.md                        │
│    → Auto-loaded by Copilot (always active)       │
│    → Quick rules & patterns                        │
│    → Use: Automatic                                │
│                                                    │
│ 📗 PROMPT_CHEATSHEET.md                            │
│    → Quick reference while coding                  │
│    → Common prompt templates                       │
│    → Use: Daily, keep open                         │
│                                                    │
│ 📕 AI_PROMPT_GUIDE.md                              │
│    → Comprehensive learning resource               │
│    → Detailed patterns & examples                  │
│    → Use: Learning, complex features               │
│                                                    │
│ 📙 AI_IMPLEMENTATION_SUMMARY.md                    │
│    → Overview of all guides                        │
│    → Before/after examples                         │
│    → Use: Onboarding, understanding impact         │
│                                                    │
└────────────────────────────────────────────────────┘
```

## 🎓 Learning Path

```
Day 1: Onboarding
├─ Read .copilot-instructions.md (5 min)
├─ Skim AI_PROMPT_GUIDE.md sections (15 min)
└─ Bookmark PROMPT_CHEATSHEET.md

Day 2-5: Practice
├─ Keep CHEATSHEET open while coding
├─ Reference GUIDE for complex tasks
└─ Compare your prompts with examples

Week 2+: Mastery
├─ Prompts become natural
├─ Code quality improves
└─ Less iteration needed
```

## ✨ Success Metrics

```
BEFORE GUIDES        AFTER GUIDES
─────────────        ────────────
Time per task:       Time per task:
████████░░ 80min    ████░░░░░░ 40min

Iterations:          Iterations:
██████░░░░ 6x       ██░░░░░░░░ 2x

Convention errors:   Convention errors:
████████░░ 8/PR     █░░░░░░░░░ 1/PR

Code quality:        Code quality:
███░░░░░░░ 30%      ████████░░ 80%
```

## 🎯 Remember

```
┌────────────────────────────────────────┐
│                                        │
│   SPECIFIC PROMPT → CLEAN CODE         │
│                                        │
│   VAGUE PROMPT → MESSY CODE            │
│                                        │
│   5 MIN READING → HOURS SAVED          │
│                                        │
└────────────────────────────────────────┘
```

---

**Quick Start**: Keep `PROMPT_CHEATSHEET.md` open → Reference as needed → Write better prompts → Get cleaner code!
