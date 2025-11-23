# 🐛 Debug Guide - NestJS Microservices

## 📋 Overview
Hướng dẫn debug cho TikTok Clone Microservices trong VS Code.

## 🚀 Quick Start

### Option 1: Debug từ VS Code UI
1. Mở **Run and Debug** panel (Ctrl+Shift+D)
2. Chọn service muốn debug từ dropdown
3. Nhấn F5 hoặc click **Start Debugging**

### Option 2: Debug từ Command
```bash
# Debug từng service
npm run start:auth:debug
npm run start:video:debug
npm run start:interaction:debug
npm run start:notification:debug
npm run start:gateway:debug
```

## 🎯 Available Debug Configurations

### Individual Services
- **Debug Auth Service** - Port 9229
- **Debug Video Service** - Port 9230
- **Debug Interaction Service** - Port 9231
- **Debug Notification Service** - Port 9232
- **Debug API Gateway** - Port 9233

### Attach Configurations
- **Attach to Auth Service** - Attach to running process
- **Attach to Video Service** - Attach to running process
- **Attach to Interaction Service** - Attach to running process
- **Attach to Notification Service** - Attach to running process
- **Attach to API Gateway** - Attach to running process

### Compound Configuration
- **Debug All Services** - Launch tất cả services cùng lúc

## 🔧 Debug Ports

```
Auth Service:         9229
Video Service:        9230
Interaction Service:  9231
Notification Service: 9232
API Gateway:          9233
```

## 📝 Cách sử dụng

### 1. Debug một service
```bash
# Cách 1: Từ VS Code
1. Press F5
2. Chọn service từ dropdown
3. Set breakpoints
4. Start debugging

# Cách 2: Từ Terminal
npm run start:auth:debug
# Sau đó attach debugger từ VS Code
```

### 2. Debug nhiều services cùng lúc
```bash
# Từ VS Code
1. Chọn "Debug All Services" từ dropdown
2. Press F5
3. Tất cả services sẽ start với debugger attached
```

### 3. Attach vào service đang chạy
```bash
# Terminal 1: Start service với debug mode
npm run start:auth:debug

# VS Code: 
1. Chọn "Attach to Auth Service"
2. Press F5
```

## 🎨 Breakpoint Tips

### Set Breakpoint
- Click vào line number margin (màu đỏ sẽ xuất hiện)
- Hoặc nhấn F9 khi cursor ở dòng code

### Conditional Breakpoint
- Right-click vào breakpoint → Edit Breakpoint
- Nhập condition: `userId === 'specific-id'`

### Logpoint
- Right-click vào line margin → Add Logpoint
- Nhập message: `User: {user.email}`

## ⌨️ Keyboard Shortcuts

```
F5          - Start/Continue debugging
F9          - Toggle breakpoint
F10         - Step over
F11         - Step into
Shift+F11   - Step out
Shift+F5    - Stop debugging
Ctrl+Shift+F5 - Restart debugging
```

## 🔍 Debug Panel Features

### Variables
- Xem giá trị của tất cả variables trong scope hiện tại
- Expand objects để xem properties
- Right-click → Copy Value để copy giá trị

### Watch
- Add expressions để monitor: `user.email`, `video.id`
- Watch sẽ update khi code execution thay đổi

### Call Stack
- Xem execution path
- Click vào frame để jump đến code location

### Debug Console
- Execute code trong debug context
- Try: `console.log(user)`, `video.title`

## 🛠️ Troubleshooting

### Debugger không attach được
```bash
# 1. Kill tất cả Node processes
Get-Process node | Stop-Process -Force

# 2. Clear port
netstat -ano | findstr :9229
taskkill /PID <PID> /F

# 3. Restart VS Code
```

### Breakpoint bị skip
```bash
# 1. Rebuild project
npm run build

# 2. Verify source maps
# Check tsconfig.json has "sourceMap": true

# 3. Restart debugger
```

### Multiple services conflict
```bash
# Đảm bảo mỗi service dùng debug port riêng
# Auth: 9229
# Video: 9230
# Interaction: 9231
# Notification: 9232
# Gateway: 9233
```

## 📚 Best Practices

### 1. Infrastructure First
```bash
# Luôn start infrastructure trước khi debug
docker compose -f docker-compose.infra.yml up -d
```

### 2. Single Service Debug
```bash
# Debug từng service một để tránh confusion
npm run start:auth:debug
```

### 3. Use Logpoints
```bash
# Thay vì console.log, dùng logpoints
# Không cần modify code, không cần rebuild
```

### 4. Conditional Breakpoints
```bash
# Chỉ break khi condition match
# Example: userId === 'test-user-id'
```

### 5. Clean Up
```bash
# Stop tất cả debug sessions trước khi close VS Code
# Press Shift+F5 trên mỗi service
```

## 🔗 Related Files

- `.vscode/launch.json` - Debug configurations
- `.vscode/settings.json` - VS Code settings
- `package.json` - Debug scripts
- `tsconfig.json` - TypeScript config với source maps

## 💡 Pro Tips

1. **Multiple Terminals**: Mỗi service một terminal riêng
2. **Debug Console**: Test code nhanh mà không cần rebuild
3. **Restart Frame**: Right-click trên call stack → Restart frame
4. **Copy Value**: Right-click variable → Copy Value
5. **Auto Attach**: VS Code có thể auto-attach khi detect debug port

## 📞 Support

Nếu gặp vấn đề:
1. Check `.vscode/launch.json` config
2. Verify debug ports không conflict
3. Rebuild project: `npm run build`
4. Restart VS Code
5. Check Node.js version: `node --version`

---

Happy Debugging! 🎉
