# 🔧 Fix Lỗi "Delete CR" Khi Save File

## ❌ Vấn đề

Khi save file, VS Code hiện đầy lỗi đỏ `Delete CR` và không tự động format được.

## 🎯 Nguyên nhân

- **CR** = Carriage Return (Windows line ending `\r\n` hay CRLF)
- Prettier yêu cầu **LF** (Unix line ending `\n`)
- File đang dùng Windows line endings nhưng config yêu cầu Unix

## ✅ Giải pháp

### Cách 1: Fix ngay file đang mở (Nhanh nhất)

1. Mở Command Palette: `Ctrl+Shift+P`
2. Gõ: `Change End of Line Sequence`
3. Chọn: `LF`
4. Save lại: `Ctrl+S`

### Cách 2: Fix tất cả files cùng lúc

```bash
npm run format:fix-line-endings
```

### Cách 3: Fix từng folder

```bash
# Fix apps folder
npx prettier --write "apps/**/*.ts" --end-of-line lf

# Fix libs folder
npx prettier --write "libs/**/*.ts" --end-of-line lf

# Fix docs folder
npx prettier --write "docs/**/*.ts" --end-of-line lf
```

## 🛡️ Phòng ngừa (Đã config sẵn)

### 1. `.prettierrc` - Force LF

```json
{
  "endOfLine": "lf"  ← Bắt buộc dùng LF
}
```

### 2. `.editorconfig` - Cross-editor

```ini
[*]
end_of_line = lf  ← Mọi editor đều dùng LF
```

### 3. VS Code Settings

```json
{
  "files.eol": "\n"  ← New files sẽ dùng LF
}
```

### 4. Git Config (Khuyến nghị)

```bash
# Ngăn Git tự động convert CRLF ↔ LF
git config core.autocrlf false

# Hoặc chỉ khi checkout (Windows)
git config core.autocrlf input
```

## 📊 Check Line Ending của File

### Trong VS Code:

- Nhìn góc dưới bên phải status bar
- Thấy `CRLF` → Cần đổi thành `LF`
- Click vào đó để đổi

### Command Line:

```bash
# Check file có CRLF không
file docs/sentry-usage-examples.ts

# Hoặc dùng PowerShell
(Get-Content "docs/sentry-usage-examples.ts" -Raw) -match "`r`n"
# True = có CRLF, False = chỉ có LF
```

## 🚀 Commands Hữu Ích

```bash
# Format tất cả + fix line endings
npm run format:fix-line-endings

# Check format without changing
npm run format:check

# Format + Lint
npm run format && npm run lint
```

## 📝 Lưu ý

### Khi nào cần fix lại?

- ✅ Mở file cũ từ trước khi có config
- ✅ Copy code từ Windows vào
- ✅ Clone repo lần đầu (nếu git config sai)
- ✅ Sau khi merge code từ người khác

### Khi nào không cần lo?

- ✅ File mới tạo → Tự động LF
- ✅ Sau khi đã chạy `format:fix-line-endings` 1 lần
- ✅ Save file bình thường → Auto format

## 🎯 Quick Fix cho Lỗi Hiện Tại

Mở file `docs/sentry-usage-examples.ts`:

**Option A - Dùng VS Code:**

1. Click vào `CRLF` ở góc dưới phải
2. Chọn `LF`
3. Save (Ctrl+S)

**Option B - Dùng Command:**

```bash
npx prettier --write "docs/sentry-usage-examples.ts" --end-of-line lf
```

**Done! File sẽ format ngay lập tức** ✅

## 🔍 Kiểm tra Config

```bash
# Check Prettier config
cat .prettierrc

# Check EditorConfig
cat .editorconfig

# Check VS Code settings
cat .vscode/settings.json | Select-String "eol"
```

## ✨ Sau khi fix xong

1. ✅ File không còn lỗi đỏ
2. ✅ Save tự động format
3. ✅ Không còn `Delete CR` nữa
4. ✅ Code nhất quán cho cả team

---

**Tóm lại:**

- Lỗi `Delete CR` = line ending sai (CRLF thay vì LF)
- Fix nhanh: Click `CRLF` → chọn `LF` → Save
- Fix hết: `npm run format:fix-line-endings`
- Đã config để không bị lại ✅
