# 🐛 Hướng dẫn Debug - Cấu hình mới

## ✅ Những gì đã được cải thiện

### 1. **Source Maps được bật**

Tất cả debug configurations giờ đã có:

- `sourceMaps: true` - Để map code TypeScript với JavaScript
- `outFiles` - Chỉ đường dẫn dist folder
- `resolveSourceMapLocations` - Chỉ tìm source maps trong workspace

### 2. **Debug Configurations mới**

#### 🎯 Debug Service riêng lẻ

```
- Debug Auth Service (Port 9229)
- Debug Video Service (Port 9230)
- Debug Interaction Service (Port 9231)
- Debug Notification Service (Port 9232)
- Debug API Gateway (Port 9233)
```

#### 🔌 Attach Configurations

```
- Attach to Auth Service
- Attach to Video Service
- Attach to Interaction Service
- Attach to Notification Service
- Attach to API Gateway
```

#### 🆕 Debug mới được thêm

```
- Debug Current File - Debug file TypeScript hiện tại
- Debug Jest Tests - Debug tất cả Jest tests
- Debug Jest Current File - Debug test file hiện tại
- Debug E2E Tests - Debug end-to-end tests
- Debug All Services - Debug tất cả services cùng lúc
```

### 3. **Tasks.json - Tự động hóa**

#### Build & Watch Tasks

```
- Build All - Build toàn bộ project
- Watch Auth Service - Watch & auto-reload Auth
- Watch Video Service - Watch & auto-reload Video
- Watch Interaction Service - Watch & auto-reload Interaction
- Watch Notification Service - Watch & auto-reload Notification
- Watch API Gateway - Watch & auto-reload Gateway
- Watch All Services - Watch tất cả services
```

#### Database Tasks

```
- Database: Run Migrations - Chạy migrations
- Database: Seed Data - Seed dữ liệu
- Database: Reset - Reset database
```

#### Docker Tasks

```
- Docker: Start Infrastructure - Start PostgreSQL, Redis, Kafka
- Docker: Stop Infrastructure - Stop infrastructure
- Docker: Start All Services - Start tất cả services
- Docker: Stop All Services - Stop tất cả services
```

#### Code Quality Tasks

```
- Lint - Chạy ESLint
- Format Code - Format với Prettier
- Run Tests - Chạy unit tests
- Run E2E Tests - Chạy E2E tests
```

### 4. **Settings.json - Debug tối ưu**

Đã thêm:

```json
{
  "debug.allowBreakpointsEverywhere": true,
  "debug.javascript.autoAttachFilter": "smart",
  "debug.javascript.terminalOptions": {
    "skipFiles": ["<node_internals>/**"]
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.updateImportsOnFileMove.enabled": "always"
}
```

## 🚀 Cách sử dụng Debug

### Cách 1: Debug từ VS Code (Khuyên dùng)

1. **Mở Debug Panel**: `Ctrl+Shift+D` (Windows) hoặc `Cmd+Shift+D` (Mac)

2. **Chọn configuration từ dropdown**:
   - Debug Auth Service
   - Debug Video Service
   - Debug Interaction Service
   - Debug Notification Service
   - Debug API Gateway
   - Debug All Services (debug tất cả cùng lúc)

3. **Set breakpoint**:
   - Click vào line number margin (bên trái số dòng)
   - Hoặc nhấn `F9` tại dòng muốn debug

4. **Start debugging**: Nhấn `F5`

### Cách 2: Debug với Tasks

1. **Mở Command Palette**: `Ctrl+Shift+P` (Windows) hoặc `Cmd+Shift+P` (Mac)

2. **Gõ**: `Tasks: Run Task`

3. **Chọn task muốn chạy**:
   - Watch Auth Service
   - Watch Video Service
   - ... (các task khác)

4. **Sau đó attach debugger**:
   - Mở Debug Panel
   - Chọn "Attach to [Service Name]"
   - Nhấn `F5`

### Cách 3: Debug Tests

#### Debug tất cả tests:

1. Chọn "Debug Jest Tests" từ dropdown
2. Nhấn `F5`

#### Debug test file hiện tại:

1. Mở test file (.spec.ts)
2. Chọn "Debug Jest Current File"
3. Nhấn `F5`

#### Debug E2E tests:

1. Chọn "Debug E2E Tests"
2. Nhấn `F5`

### Cách 4: Debug file TypeScript đơn lẻ

1. Mở file TypeScript muốn debug
2. Set breakpoints
3. Chọn "Debug Current File" từ dropdown
4. Nhấn `F5`

## ⌨️ Keyboard Shortcuts quan trọng

```
F5              - Start Debugging / Continue
F9              - Toggle Breakpoint
F10             - Step Over
F11             - Step Into
Shift+F11       - Step Out
Ctrl+Shift+F5   - Restart Debugging
Shift+F5        - Stop Debugging
Ctrl+Shift+D    - Mở Debug Panel
Ctrl+`          - Mở Terminal
```

## 🎨 Breakpoint Types

### 1. Normal Breakpoint

- Click vào line margin
- Code sẽ dừng tại dòng đó

### 2. Conditional Breakpoint

- Right-click vào breakpoint → **Edit Breakpoint**
- Nhập điều kiện: `userId === 'abc123'`
- Chỉ dừng khi điều kiện đúng

### 3. Logpoint

- Right-click vào line margin → **Add Logpoint**
- Nhập message: `User email: {user.email}`
- In log mà không dừng code

### 4. Function Breakpoint

- Debug Panel → Breakpoints section → Click `+`
- Nhập tên function: `AuthService.login`
- Dừng khi function được gọi

## 🔍 Debug Console

Trong Debug Console bạn có thể:

```javascript
// Xem giá trị biến
user;

// Gọi function
await this.userService.findOne(userId);

// Evaluate expression
user.email === 'test@example.com';

// Xem object properties
Object.keys(user);
```

## 🐳 Debug với Docker

Nếu services đang chạy trong Docker:

1. **Expose debug ports** trong `docker-compose.yml`:

```yaml
services:
  auth-service:
    ports:
      - '3001:3001'
      - '9229:9229' # Debug port
    command: npm run start:auth:debug
```

2. **Attach debugger**:
   - Chọn "Attach to Auth Service"
   - Nhấn `F5`

## 💡 Tips & Tricks

### 1. Debug multiple services

- Chọn "Debug All Services"
- Tất cả services sẽ start với debugger attached
- Có thể set breakpoints ở bất kỳ service nào

### 2. Hot Reload với Debug

- Sử dụng Watch tasks
- Code thay đổi sẽ tự động reload
- Debugger vẫn attached

### 3. Debug nhanh

- Để cursor tại dòng code
- Nhấn `F9` để set breakpoint
- Nhấn `F5` để start debug

### 4. Skip node_internals

- Tất cả configs đã có `skipFiles: ["<node_internals>/**"]`
- Sẽ không debug vào Node.js internals

### 5. Auto Attach

- Settings đã bật `debug.javascript.autoAttachFilter: "smart"`
- Debugger sẽ tự attach khi chạy `npm run start:*:debug`

## 🚨 Troubleshooting

### Breakpoint không dừng?

1. Kiểm tra source maps: `sourceMaps: true`
2. Kiểm tra `outFiles` path
3. Rebuild project: `npm run build`
4. Restart debugger: `Ctrl+Shift+F5`

### Cannot connect to debug port?

1. Kiểm tra port có đang được dùng: `netstat -ano | findstr :9229`
2. Kill process đang dùng port
3. Restart service

### Source maps không hoạt động?

1. Kiểm tra `tsconfig.json` có `"sourceMap": true`
2. Clear `dist` folder: Run task "Clean"
3. Rebuild: Run task "Build All"

### Debug trong Docker không hoạt động?

1. Kiểm tra ports được expose
2. Kiểm tra debug command trong docker-compose
3. Kiểm tra firewall settings

## 📚 Tài liệu tham khảo

- [VS Code Debugging Guide](https://code.visualstudio.com/docs/editor/debugging)
- [Node.js Debugging in VS Code](https://code.visualstudio.com/docs/nodejs/nodejs-debugging)
- [NestJS Debugging](https://docs.nestjs.com/recipes/debugging)

## ✨ Kết luận

Giờ bạn có thể:

- ✅ Debug bất kỳ service nào riêng lẻ
- ✅ Debug tất cả services cùng lúc
- ✅ Debug tests (unit & E2E)
- ✅ Debug file TypeScript đơn lẻ
- ✅ Sử dụng tasks để automate build & watch
- ✅ Debug trong Docker containers
- ✅ Hot reload với debugger attached

Happy debugging! 🎉
