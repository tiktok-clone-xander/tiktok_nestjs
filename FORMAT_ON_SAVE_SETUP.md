# 🎯 FORMAT ON SAVE - Setup Hoàn Chỉnh

## ✅ Đã Setup Sẵn Cho Toàn Bộ Project!

### 🚀 Từ giờ chỉ cần SAVE là tự động format!

## 📦 Đã Config Sẵn

### 1. `.gitattributes` - Git tự động xử lý line endings

```gitattributes
* text=auto eol=lf
*.ts text eol=lf
*.js text eol=lf
*.json text eol=lf
```

→ **Tác dụng**: Mọi file commit vào Git đều tự động dùng LF

### 2. `.prettierrc` - Prettier format rules

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "endOfLine": "lf"
}
```

→ **Tác dụng**: Format code theo chuẩn, force LF

### 3. `.editorconfig` - Editor-agnostic config

```ini
[*]
end_of_line = lf
indent_size = 2
```

→ **Tác dụng**: Mọi editor đều follow cùng chuẩn

### 4. VS Code Settings - Auto format on save

```json
{
  "editor.formatOnSave": true,
  "files.eol": "\n",
  "editor.codeActionsOnSave": {
    "source.organizeImports": "explicit",
    "source.fixAll.eslint": "explicit"
  }
}
```

→ **Tác dụng**: Save file → Auto format + fix linting

### 5. Git Config - Prevent auto CRLF conversion

```bash
git config core.autocrlf false
git config core.eol lf
```

→ **Tác dụng**: Git không tự ý convert line endings

## 🎬 Sử Dụng Hàng Ngày

### Workflow bình thường:

```
1. Mở file
2. Code
3. Save (Ctrl+S)
   ↓
   ✅ Tự động format
   ✅ Tự động remove unused imports
   ✅ Tự động fix ESLint issues
   ✅ Done!
```

### Không cần làm gì thêm! 🎉

## 🚨 Troubleshooting

### Vấn đề 1: Gặp lỗi `Delete CR`

**Nguyên nhân**: File cũ còn dùng CRLF (Windows line endings)

**Fix nhanh (2 giây)**:

1. Click vào `CRLF` góc dưới phải VS Code
2. Chọn `LF`
3. Save (Ctrl+S)

**Fix hết một lúc**:

```bash
npm run format:fix-line-endings
```

hoặc:

```powershell
.\scripts\fix-line-endings.ps1
```

### Vấn đề 2: Format không chạy khi Save

**Kiểm tra**:

1. VS Code extensions installed?

   ```bash
   code --list-extensions | Select-String "prettier|eslint"
   ```

2. Reload VS Code window:
   - `Ctrl+Shift+P` → "Reload Window"

3. Check Prettier config exists:
   ```bash
   Test-Path .prettierrc
   ```

### Vấn đề 3: Conflict giữa Prettier và ESLint

**Đã fix sẵn!** `.eslintrc.js` extends `plugin:prettier/recommended`

- ESLint không format, chỉ lint
- Prettier handle formatting
- Không conflict

## 📋 Commands Hữu Ích

```bash
# Format tất cả files
npm run format

# Format + fix line endings
npm run format:fix-line-endings

# Check format (không sửa)
npm run format:check

# Lint + auto-fix
npm run lint

# Format + Lint
npm run format && npm run lint

# Quick fix script
.\scripts\fix-line-endings.ps1
```

## 👥 Setup Cho Người Mới Vào Team

### Bước 1: Clone repo

```bash
git clone <repo-url>
cd tiktok_nestjs
```

### Bước 2: Install dependencies

```bash
npm install
```

### Bước 3: Install VS Code extensions

```bash
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
```

### Bước 4: Reload VS Code

```
Ctrl+Shift+P → "Reload Window"
```

### Bước 5: Test

1. Mở file `.ts` bất kỳ
2. Thêm dòng code bừa
3. Save (Ctrl+S)
4. → Phải tự động format ✅

### That's it! Done! 🎉

## 🎓 Giải Thích Chi Tiết

### Tại sao LF thay vì CRLF?

| Line Ending | Ký tự  | Dùng trong              | Vấn đề                      |
| ----------- | ------ | ----------------------- | --------------------------- |
| **LF**      | `\n`   | Unix, Linux, macOS, Git | ✅ Standard, không conflict |
| **CRLF**    | `\r\n` | Windows                 | ❌ Gây conflict trong Git   |
| **CR**      | `\r`   | Old Mac OS              | ❌ Deprecated               |

**Quy tắc**: Trong Git repo luôn dùng LF!

### Format flow khi Save:

```
Save File (Ctrl+S)
    ↓
[1] Prettier formats code
    - Fix spacing, quotes, semicolons
    - Enforce line length
    - Normalize indentation
    ↓
[2] Organize Imports (VS Code built-in)
    - Sort imports alphabetically
    - Group by type
    ↓
[3] ESLint auto-fixes
    - Remove unused imports
    - Remove unused variables
    - Fix minor issues
    ↓
✅ File saved with perfect formatting!
```

## 📚 Tài Liệu Chi Tiết

- [QUICK_FIX_LINE_ENDINGS.md](./QUICK_FIX_LINE_ENDINGS.md) - Quick reference
- [docs/FIX_LINE_ENDINGS.md](./docs/FIX_LINE_ENDINGS.md) - Troubleshooting chi tiết
- [docs/PRETTIER_ESLINT_SETUP.md](./docs/PRETTIER_ESLINT_SETUP.md) - Full documentation

## 🎁 Bonus Scripts

### Fix line endings nhanh:

```powershell
.\scripts\fix-line-endings.ps1
```

### Check status:

```bash
# Check Git config
git config --get core.autocrlf
git config --get core.eol

# Check Prettier
npx prettier --check "**/*.ts"

# Check ESLint
npm run lint
```

## ✨ Tóm Lại

1. ✅ **Auto format on save** - Configured
2. ✅ **Line endings (LF)** - Enforced
3. ✅ **Git integration** - Seamless
4. ✅ **Team consistency** - Guaranteed
5. ✅ **Zero manual work** - Just save!

**Từ giờ chỉ cần code và save, mọi thứ tự động lo! 🚀**

---

_Last updated: December 28, 2025_
_Status: ✅ Production Ready_
