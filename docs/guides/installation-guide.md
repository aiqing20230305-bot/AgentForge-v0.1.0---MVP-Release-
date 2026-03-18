# Installation Guide - Desktop Enhancement Features

## Task #311 桌面端增强功能安装指南

---

## 前置要求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **操作系统**: macOS 10.13+, Windows 10+, Linux (Ubuntu 18.04+)

---

## 安装步骤

### 1. 安装依赖

由于添加了新的依赖包，需要重新安装：

```bash
npm install
```

新增的依赖包：
- `better-sqlite3`: ^11.8.1 (本地数据库)
- `electron-log`: ^5.2.4 (日志系统)
- `electron-updater`: ^6.3.9 (自动更新)
- `@types/better-sqlite3`: ^7.6.12 (TypeScript 类型)

### 2. 准备托盘图标

在 `public/` 目录下创建以下图标文件：

#### macOS
```bash
# Template icon for macOS (dark mode support)
# 16x16 @2x = 32x32 PNG with transparency
public/icon-tray-template.png
```

#### Windows
```bash
# Windows tray icon
# 16x16 ICO format
public/icon-tray.ico

# Optional: PNG fallback
public/icon-tray.png
```

#### Linux
```bash
# Linux tray icon
# 16x16 or 32x32 PNG
public/icon-tray.png
```

**图标设计建议**:
- 使用简单的单色图标
- macOS 使用模板图标（Template Icon）以支持深色模式
- Windows 推荐使用 ICO 格式以支持多种尺寸
- 确保在不同背景下都清晰可见

### 3. 编译 TypeScript

```bash
npm run build
```

这会编译：
- `electron/*.ts` → `dist-electron/*.js`
- `src/**/*.tsx` → `dist/**/*.js`

---

## 开发模式测试

### 启动开发服务器

```bash
npm run electron:dev
```

这会同时启动：
- Vite 开发服务器 (端口 5173)
- Electron 应用

### 测试功能清单

启动后测试以下功能：

#### ✅ 系统托盘
1. 查看系统托盘区域是否有 AgentForge 图标
2. 右键点击托盘图标，查看菜单
3. 点击托盘图标，测试窗口显示/隐藏

#### ✅ 全局快捷键
测试以下快捷键：
- `Cmd/Ctrl + Shift + Space`: 显示/隐藏窗口
- `Cmd/Ctrl + Shift + N`: 创建新 Agent
- `Cmd/Ctrl + Shift + K`: 全局搜索

#### ✅ 开机自启动
1. 打开设置
2. 启用"开机自启动"
3. 重启电脑验证

#### ✅ 窗口管理
1. 测试最小化/最大化
2. 测试迷你模式（如果已实现 UI）
3. 测试窗口置顶

#### ✅ 剪贴板
1. 启用剪贴板监听（如果已实现 UI）
2. 复制文本到剪贴板
3. 验证应用是否收到通知

#### ✅ 本地数据库
1. 创建几个 Agent
2. 关闭应用
3. 重新打开，验证数据是否保存

#### ✅ 通知
1. 触发一个通知事件
2. 验证系统通知是否显示

---

## 构建生产版本

### macOS

```bash
npm run build
```

生成文件：
- `release/mac-arm64/AgentForge.app` (Apple Silicon)
- `release/mac-x64/AgentForge.app` (Intel)
- `release/AgentForge-1.3.0-arm64.dmg`
- `release/AgentForge-1.3.0-x64.dmg`

### Windows

```bash
npm run build
```

生成文件：
- `release/win-unpacked/AgentForge.exe`
- `release/AgentForge Setup 1.3.0.exe` (NSIS 安装程序)
- `release/AgentForge 1.3.0.exe` (Portable)

### Linux

```bash
npm run build
```

生成文件：
- `release/AgentForge-1.3.0.AppImage`
- `release/agentforge_1.3.0_amd64.deb`
- `release/agentforge-1.3.0.x86_64.rpm`

---

## 配置自动更新

### 1. 配置 GitHub Releases

在 `package.json` 中更新：

```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "your-github-username",
      "repo": "agentforge"
    }
  }
}
```

### 2. 生成 GitHub Token

1. 访问 GitHub Settings → Developer settings → Personal access tokens
2. 生成新 token，权限选择 `repo`
3. 设置环境变量：

```bash
export GH_TOKEN="your_github_token"
```

### 3. 发布更新

```bash
# Build and publish
npm run build -- --publish always
```

这会：
1. 构建应用
2. 创建 GitHub Release
3. 上传安装包

### 4. 测试自动更新

1. 发布新版本（修改 `package.json` 中的 `version`）
2. 启动旧版本应用
3. 应用会自动检查更新
4. 下载并提示安装

---

## 数据库位置

本地 SQLite 数据库存储位置：

### macOS
```
~/Library/Application Support/AgentForge/agentforge.db
```

### Windows
```
%APPDATA%\AgentForge\agentforge.db
```

### Linux
```
~/.config/AgentForge/agentforge.db
```

---

## 配置文件位置

### electron-store 配置

macOS: `~/Library/Application Support/AgentForge/config.json`
Windows: `%APPDATA%\AgentForge\config.json`
Linux: `~/.config/AgentForge/config.json`

### 快捷键配置

`shortcuts.json` - 存储在同一目录

### 更新配置

`updater.json` - 存储在同一目录

---

## 故障排查

### 托盘图标不显示

**问题**: 系统托盘没有显示图标

**解决方案**:
1. 检查图标文件是否存在：
   ```bash
   ls -la public/icon-tray*.png
   ```
2. 确保图标尺寸正确（16x16 或 32x32）
3. 检查图标格式（PNG 或 ICO）
4. 查看控制台错误日志

### 快捷键不工作

**问题**: 全局快捷键无响应

**解决方案**:
1. 检查是否有其他应用占用快捷键
2. 在 macOS 上，授予应用辅助功能权限：
   - System Preferences → Security & Privacy → Privacy → Accessibility
   - 添加 AgentForge
3. 重启应用

### 数据库错误

**问题**: SQLite 错误或数据丢失

**解决方案**:
1. 检查磁盘空间
2. 验证数据库文件权限
3. 运行数据库修复：
   ```typescript
   const db = getDatabase()
   db.vacuum()
   ```
4. 备份并删除数据库文件，重新启动

### 自动更新失败

**问题**: 无法检查或下载更新

**解决方案**:
1. 检查网络连接
2. 验证 GitHub Token 配置
3. 检查 Release 是否正确发布
4. 查看 electron-log 日志：
   - macOS: `~/Library/Logs/AgentForge/main.log`
   - Windows: `%USERPROFILE%\AppData\Roaming\AgentForge\logs\main.log`
   - Linux: `~/.config/AgentForge/logs/main.log`

### 性能问题

**问题**: 应用运行缓慢或内存占用高

**解决方案**:
1. 检查内存使用：
   ```typescript
   const memory = await window.electronAPI.system.getMemoryInfo()
   console.log(memory)
   ```
2. 禁用 GPU 加速（如果需要）：
   ```typescript
   await window.electronAPI.system.disableHardwareAcceleration()
   ```
3. 清理数据库：
   ```typescript
   const db = getDatabase()
   db.vacuum()
   ```

---

## 调试技巧

### 启用详细日志

在 `electron/main.ts` 中：

```typescript
import log from 'electron-log'
log.transports.file.level = 'debug'
log.transports.console.level = 'debug'
```

### 查看 IPC 通信

在 `electron/preload.ts` 中添加日志：

```typescript
console.log('[IPC] Calling:', method, args)
```

### 数据库查询调试

```typescript
import { getDatabase } from './localDatabase'
const db = getDatabase()
const stats = db.getStats()
console.log('Database stats:', stats)
```

### 同步状态监控

```typescript
import { getSyncManager } from './syncManager'
const syncManager = getSyncManager()
syncManager.onStatusChangeCallback((status) => {
  console.log('Sync status:', status)
})
```

---

## 卸载

### macOS
1. 将 `AgentForge.app` 移到废纸篓
2. 删除配置文件：
   ```bash
   rm -rf ~/Library/Application\ Support/AgentForge
   rm -rf ~/Library/Logs/AgentForge
   ```

### Windows
1. 使用"添加或删除程序"卸载
2. 删除配置文件：
   ```cmd
   rmdir /s /q %APPDATA%\AgentForge
   ```

### Linux
1. 删除 AppImage 文件
2. 删除配置文件：
   ```bash
   rm -rf ~/.config/AgentForge
   ```

---

## 支持

如有问题，请：
1. 查看 `docs/DESKTOP_FEATURES.md` 文档
2. 检查 GitHub Issues
3. 提交新 Issue 并附上日志文件

---

## 下一步

安装完成后：
1. ✅ 阅读 `docs/DESKTOP_FEATURES.md` 了解所有功能
2. ✅ 查看 `src/hooks/useDesktopFeatures.ts` 了解 API
3. ✅ 运行 `electron/test-desktop-features.ts` 测试所有功能
4. ✅ 开始使用桌面增强功能！

---

**祝使用愉快！** 🎉
