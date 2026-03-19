# Desktop Enhancement Features

## Task #311 - 桌面端增强功能

完整的桌面端增强系统，深度利用 Electron 能力，提供原生桌面体验。

---

## 功能模块

### 1. 系统集成 (System Integration)

#### 系统托盘 (System Tray)
- **文件**: `electron/tray.ts`
- **功能**:
  - 系统托盘图标显示
  - 右键上下文菜单
  - 点击显示/隐藏窗口
  - 快速操作菜单
  - 自定义菜单项支持

**使用示例**:
```typescript
import { TrayManager } from './tray'

const trayManager = new TrayManager(mainWindow)
trayManager.create()
trayManager.updateTooltip('AgentForge - 3 tasks running')
```

#### 全局快捷键 (Global Shortcuts)
- **文件**: `electron/shortcut.ts`
- **功能**:
  - 可自定义快捷键
  - 全局快捷键注册
  - 快捷键冲突检测
  - 持久化配置

**默认快捷键**:
- `Command/Ctrl + Shift + Space`: 显示/隐藏窗口
- `Command/Ctrl + Shift + N`: 创建新 Agent
- `Command/Ctrl + Shift + K`: 全局搜索
- `Command/Ctrl + Shift + S`: 截图工具

**使用示例**:
```typescript
const shortcuts = shortcutManager.getShortcuts()
shortcutManager.toggleShortcut('Command+Shift+Space')
shortcutManager.register('Command+Shift+A', 'custom-action')
```

#### 开机自启动 (Auto Launch)
```typescript
// Get auto launch status
const enabled = await window.electronAPI.autoLaunch.get()

// Set auto launch
await window.electronAPI.autoLaunch.set(true)
```

---

### 2. 离线能力 (Offline Capabilities)

#### 本地数据库 (Local Database)
- **文件**: `src/services/offline/localDatabase.ts`
- **技术**: SQLite (better-sqlite3)
- **功能**:
  - 完整的 CRUD 操作
  - 全文搜索
  - 同步状态跟踪
  - 软删除支持

**使用示例**:
```typescript
import { getDatabase } from './localDatabase'

const db = getDatabase()

// Create agent
const agent = db.createAgent({
  name: 'My Agent',
  content: '...',
  tags: ['ai', 'helper'],
  syncStatus: 'pending',
})

// Query agents
const allAgents = db.getAllAgents()
const results = db.searchAgents('search query')
```

#### 后台同步 (Background Sync)
- **文件**: `src/services/offline/syncManager.ts`
- **功能**:
  - 自动后台同步
  - 同步队列管理
  - 失败重试机制
  - 冲突检测和解决

**使用示例**:
```typescript
import { getSyncManager } from './syncManager'

const syncManager = getSyncManager()

// Start sync
syncManager.start()

// Manual sync
await syncManager.sync()

// Configure
syncManager.configure({
  interval: 60000, // 1 minute
  retryLimit: 3,
  conflictResolution: 'manual',
})

// Listen to status
syncManager.onStatusChangeCallback((status) => {
  console.log('Sync status:', status)
})
```

---

### 3. 多窗口管理 (Window Management)

- **文件**: `electron/windowManager.ts`
- **功能**:
  - 多窗口创建和管理
  - 迷你窗口模式
  - 窗口状态持久化
  - 自定义窗口配置

**窗口类型**:
- `main`: 主窗口
- `mini`: 迷你模式窗口（置顶、无边框）
- `screenshot`: 截图窗口（全屏、透明）
- `custom`: 自定义窗口

**使用示例**:
```typescript
// Toggle mini mode
await window.electronAPI.window.toggleMini()

// Window controls
await window.electronAPI.window.minimize()
await window.electronAPI.window.maximize()
await window.electronAPI.window.setAlwaysOnTop(true)

// Get/Set bounds
const bounds = await window.electronAPI.window.getBounds()
await window.electronAPI.window.setBounds({ x: 100, y: 100, width: 800, height: 600 })
```

---

### 4. 系统工具 (System Tools)

#### 截图工具 (Screenshot)
```typescript
await window.electronAPI.screenshot.capture()
```

#### 剪贴板监听 (Clipboard Watch)
```typescript
// Start watching
await window.electronAPI.clipboard.startWatch()

// Listen to changes
window.electronAPI.clipboard.onChanged((text) => {
  console.log('Clipboard changed:', text)
})

// Stop watching
await window.electronAPI.clipboard.stopWatch()
```

#### 系统信息 (System Info)
```typescript
// Get system info
const info = await window.electronAPI.system.getInfo()
// { platform, arch, version, electronVersion, nodeVersion, chromiumVersion }

// Check power status
const power = await window.electronAPI.system.getPowerStatus()
// { onBattery, charging }

// Check network status
const online = await window.electronAPI.system.isOnline()

// Get memory info
const memory = await window.electronAPI.system.getMemoryInfo()

// Get GPU info
const gpu = await window.electronAPI.system.getGPUInfo()
```

---

### 5. 自动更新 (Auto Update)

- **文件**: `electron/updater.ts`
- **技术**: electron-updater
- **功能**:
  - 自动检查更新
  - 差量更新
  - 后台静默下载
  - 更新日志展示

**使用示例**:
```typescript
// Check for updates
const result = await window.electronAPI.updater.check()
// { success: true, updateAvailable: true, version: '1.4.0' }

// Download update
await window.electronAPI.updater.download()

// Install update (will restart app)
await window.electronAPI.updater.install()

// Get current version
const version = await window.electronAPI.updater.getVersion()

// Listen to update events
window.electronAPI.updater.onMessage((message) => {
  console.log('Update event:', message.event, message.data)
  // Events: checking-for-update, update-available, update-not-available,
  //         download-progress, update-downloaded, update-error
})

// Configure
await window.electronAPI.updater.setConfig({
  autoDownload: true,
  autoInstallOnAppQuit: true,
  checkOnStartup: true,
})
```

---

## React Hooks

### useDesktopFeatures

完整的桌面功能访问接口：

```typescript
import { useDesktopFeatures } from '@/hooks/useDesktopFeatures'

function MyComponent() {
  const {
    isElectron,
    systemInfo,
    isOnline,
    powerStatus,
    clipboard,
    windowManager,
    updater,
    showNotification,
    // ... more
  } = useDesktopFeatures()

  useEffect(() => {
    if (isElectron) {
      getSystemInfo()
      checkOnlineStatus()
    }
  }, [isElectron])

  return (
    <div>
      {isElectron && (
        <button onClick={() => windowManager.toggleMini()}>
          Toggle Mini Mode
        </button>
      )}
    </div>
  )
}
```

### useTrayActions

监听托盘操作：

```typescript
import { useTrayActions } from '@/hooks/useDesktopFeatures'

function MyComponent() {
  useTrayActions((action) => {
    switch (action) {
      case 'new-agent':
        // Handle new agent
        break
      case 'settings':
        // Open settings
        break
    }
  })
}
```

### useShortcutActions

监听快捷键操作：

```typescript
import { useShortcutActions } from '@/hooks/useDesktopFeatures'

function MyComponent() {
  useShortcutActions((action) => {
    console.log('Shortcut triggered:', action)
  })
}
```

### useClipboardWatch

监听剪贴板变化：

```typescript
import { useClipboardWatch } from '@/hooks/useDesktopFeatures'

function MyComponent() {
  useClipboardWatch(
    (text) => {
      console.log('Clipboard content:', text)
    },
    true // enabled
  )
}
```

### useUpdateListener

监听更新事件：

```typescript
import { useUpdateListener } from '@/hooks/useDesktopFeatures'

function MyComponent() {
  useUpdateListener((status) => {
    if (status.event === 'update-available') {
      showNotification('Update available: ' + status.data.version)
    }
  })
}
```

---

## 配置

### Electron Builder

更新后的 `package.json` 配置支持：
- macOS: DMG + ZIP (x64 + arm64)
- Windows: NSIS + Portable
- Linux: AppImage + deb + rpm
- 自动更新（GitHub Releases）

### 托盘图标

需要在 `public/` 目录下放置以下图标：
- `icon-tray.png`: Windows/Linux 托盘图标 (16x16 或 32x32)
- `icon-tray-template.png`: macOS 托盘图标模板 (16x16 @2x = 32x32)
- `icon-tray.ico`: Windows 托盘图标 (ICO 格式)

---

## 性能优化

### GPU 加速
默认启用 GPU 加速，提供流畅的动画和渲染性能。

### 内存优化
- SQLite WAL 模式优化
- 进程间通信优化
- 自动内存回收

### 启动优化
- 延迟加载非关键模块
- 预加载关键资源
- 窗口显示优化

---

## 安全性

### Context Isolation
所有 IPC 通信通过 contextBridge 暴露，确保渲染进程安全。

### Web Security
可配置跨域策略，支持本地 API 调用。

### 数据加密
本地数据库支持加密存储（可选）。

---

## 测试

### 开发模式测试

```bash
npm run electron:dev
```

### 构建测试

```bash
npm run build
```

### 功能测试清单

- [ ] 系统托盘图标显示正常
- [ ] 全局快捷键可用
- [ ] 开机自启动设置生效
- [ ] 离线模式可用
- [ ] 数据同步正常
- [ ] 多窗口管理流畅
- [ ] 截图工具可用
- [ ] 剪贴板监听正常
- [ ] 自动更新检测正常
- [ ] 通知显示正常

---

## 故障排查

### 快捷键不工作
- 检查是否有其他应用占用快捷键
- 使用 `shortcutManager.isValidAccelerator()` 验证快捷键格式

### 托盘图标不显示
- 确保图标文件存在于 `public/` 目录
- 检查图标尺寸和格式

### 自动更新失败
- 检查网络连接
- 确保已配置正确的 GitHub repo
- 查看 electron-log 日志

### 数据库错误
- 检查磁盘空间
- 运行 `db.vacuum()` 优化数据库
- 查看 SQLite 日志

---

## 未来扩展

- [ ] 本地 AI 模型集成
- [ ] 更多快捷键自定义
- [ ] 插件系统支持
- [ ] 主题自定义
- [ ] 数据导入/导出
- [ ] 云端同步（多设备）

---

## 相关文件

### Core Files
- `electron/main.ts` - 主进程入口
- `electron/preload.ts` - 预加载脚本
- `electron/tray.ts` - 系统托盘
- `electron/shortcut.ts` - 全局快捷键
- `electron/updater.ts` - 自动更新
- `electron/windowManager.ts` - 窗口管理

### Services
- `src/services/offline/localDatabase.ts` - 本地数据库
- `src/services/offline/syncManager.ts` - 同步管理

### Hooks
- `src/hooks/useDesktopFeatures.ts` - 桌面功能 Hook

### Types
- `src/types/electron.d.ts` - TypeScript 类型定义

---

## 贡献

欢迎提交 Issue 和 PR 来改进桌面端功能！

## License

MIT
