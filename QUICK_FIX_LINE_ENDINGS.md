# 🚀 Quick Fix: Line Endings (CRLF → LF)

## ⚡ Giải pháp nhanh nhất

### Gặp lỗi `Delete CR` khi save file?

**Cách 1: Fix ngay file đang mở (2 giây)**
```
1. Nhìn góc dưới bên phải VS Code
2. Click vào "CRLF" 
3. Chọn "LF"
4. Save (Ctrl+S)
```

**Cách 2: Fix tất cả files (1 lệnh)**
```bash
npm run format:fix-line-endings
```

**Cách 3: Fix chỉ TypeScript files**
```bash
npx prettier --write "**/*.ts" --end-of-line lf
```

## ✅ Đã setup xong - Không còn lo nữa!

### 1️⃣ Git Config ✅
```bash
git config core.autocrlf false  # Không tự động convert
git config core.eol lf          # Luôn dùng LF
```

### 2️⃣ .gitattributes ✅
Tất cả text files tự động dùng LF khi commit/checkout

### 3️⃣ .prettierrc ✅  
```json
{
  "endOfLine": "lf"  // Force LF
}
```

### 4️⃣ VS Code Settings ✅
```json
{
  "files.eol": "\n"  // New files = LF
}
```

## 📋 Commands Có Sẵn

```bash
# Format tất cả + fix line endings
npm run format:fix-line-endings

# Format chỉ code (không touch docs)
npm run format

# Check format (không sửa)
npm run format:check

# Lint + auto fix
npm run lint
```

## 🎯 Quy Trình Chuẩn

### Lần đầu setup project (1 lần duy nhất):
```bash
# Fix toàn bộ project
npm run format:fix-line-endings

# Commit
git add .
git commit -m "chore: fix line endings to LF"
```

### Khi code hàng ngày:
```bash
# Chỉ cần save file → Tự động format ✅
# Không cần làm gì thêm!
```

### Nếu pull code từ người khác có CRLF:
```bash
# Fix lại 1 lần
npm run format:fix-line-endings
```

## 🔍 Debug

### Check file đang dùng LF hay CRLF?
```bash
# Trong VS Code: Nhìn góc dưới phải
# Command line:
Get-Content "path/to/file.ts" -Raw | Select-String "`r`n"
# True = CRLF, False = LF
```

### Git báo "warning: CRLF will be replaced by LF"?
**→ Đây là TỐT!** Git đang tự động fix cho bạn.

### Prettier không format được?
```bash
# Clear cache và retry
Remove-Item -Recurse -Force node_modules\.cache
npm run format:fix-line-endings
```

## 💡 Tips

✅ **File mới tạo** → Tự động LF  
✅ **Save file** → Tự động format  
✅ **Git commit** → Tự động convert CRLF → LF  
✅ **Pull code** → Giữ nguyên LF  

❌ **Không cần** format thủ công  
❌ **Không cần** lo về line endings  
❌ **Không cần** fix từng file  

## 🎉 Tóm lại

1. **Đã setup xong** → Không cần lo nữa
2. **Gặp lỗi cũ** → Click CRLF → LF → Save
3. **Fix hết một lúc** → `npm run format:fix-line-endings`

**That's it! Simple! 🚀**
