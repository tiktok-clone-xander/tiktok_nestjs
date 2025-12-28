# VS Code: Prettier + ESLint Auto-Format Setup

## ✅ Configuration Complete

Your workspace is now configured to auto-format code consistently using Prettier and ESLint on save.

## 📦 Required Extensions

Make sure these VS Code extensions are installed:

1. **Prettier - Code formatter** (`esbenp.prettier-vscode`)
2. **ESLint** (`dbaeumer.vscode-eslint`)

Install via:

```bash
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
```

## ⚙️ How It Works

### On Save (Auto-Format):

1. **Prettier** formats code (spacing, quotes, semicolons, line length)
2. **Organize Imports** sorts import statements
3. **ESLint** fixes auto-fixable issues (unused imports, etc.)

### Configuration Files:

#### `.prettierrc` - Prettier Rules

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true
}
```

#### `.eslintrc.js` - ESLint Rules

- Extends `plugin:prettier/recommended` (integrates Prettier with ESLint)
- Uses `eslint-plugin-unused-imports` to auto-remove unused code
- Validates TypeScript code

#### `.vscode/settings.json` - VS Code Settings

- `editor.formatOnSave: true` - Auto-format on save
- `editor.defaultFormatter: "esbenp.prettier-vscode"` - Use Prettier
- `editor.codeActionsOnSave` - Run organize imports + ESLint fixes
- `typescript.format.enable: false` - Disable built-in TS formatter
- `eslint.format.enable: false` - Use Prettier for formatting, ESLint for linting

#### `.editorconfig` - Editor Config

- Ensures consistent line endings (LF)
- Sets indent size (2 spaces)
- Trims trailing whitespace
- Works across all editors

## 🎯 Format Order (On Save)

```
1. Prettier formats the file
   ↓
2. Organize imports (VS Code built-in)
   ↓
3. ESLint auto-fixes (removes unused imports/variables)
   ↓
4. File saved ✅
```

## 🔧 Manual Commands

```bash
# Format all TypeScript files with Prettier
npm run format

# Lint and auto-fix all files with ESLint
npm run lint
```

## 🧪 Test the Setup

1. Open any `.ts` file
2. Add some messy code:

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SomeUnusedImport } from 'somewhere';

@Injectable()
export class TestService {
  constructor(private config: ConfigService) {}

  getHello(): string {
    return 'hello';
  }
}
```

3. Save the file (Ctrl+S / Cmd+S)
4. The code should auto-format to:

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TestService {
  constructor(private config: ConfigService) {}

  getHello(): string {
    return 'hello';
  }
}
```

Notice:

- ✅ Unused import removed
- ✅ Spacing normalized
- ✅ Single quotes applied
- ✅ Trailing comma added
- ✅ Proper indentation

## 🚨 Common Issues

### Issue: Nothing happens on save

**Solution:** Check that extensions are installed and enabled:

```bash
code --list-extensions | grep -E 'prettier|eslint'
```

### Issue: Format conflicts between Prettier and ESLint

**Solution:** Already configured! `.eslintrc.js` extends `plugin:prettier/recommended` which:

- Disables ESLint formatting rules that conflict with Prettier
- Runs Prettier as an ESLint rule
- Shows Prettier issues as ESLint errors

### Issue: Different line endings (CRLF vs LF)

**Solution:** `.editorconfig` forces LF everywhere. If you still see CRLF:

```bash
# Convert all files to LF
git config core.autocrlf false
git rm -rf --cached .
git reset --hard HEAD
```

### Issue: Format on save not working for specific file type

**Solution:** Check `.vscode/settings.json` has formatter set for that language:

```json
"[typescript]": {
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true
}
```

## 📝 Key Settings Explained

### Why disable TypeScript formatter?

```json
"typescript.format.enable": false
```

Prettier handles all formatting. Built-in TS formatter conflicts with Prettier rules.

### Why disable ESLint formatter?

```json
"eslint.format.enable": false
```

ESLint is for linting (finding errors), Prettier is for formatting (style). Keep them separate.

### Why organize imports before ESLint?

```json
"editor.codeActionsOnSave": {
  "source.organizeImports": "explicit",  // First
  "source.fixAll.eslint": "explicit"     // Second
}
```

Organize imports first, then ESLint removes unused ones.

## ✨ Benefits

1. **Consistency** - Everyone's code looks the same
2. **Speed** - No manual formatting needed
3. **Quality** - Catch issues before commit
4. **Automation** - Format on save, lint on commit
5. **Integration** - Prettier + ESLint work together seamlessly

## 🎉 You're All Set!

Your code will now auto-format consistently every time you save a file!
