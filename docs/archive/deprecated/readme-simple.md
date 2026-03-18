# 🤖 AgentForge

**隐私优先的 AI Agent 管理平台 | Privacy-First AI Agent Management Platform**

[![Version](https://img.shields.io/badge/version-1.3.0-blue.svg)](https://github.com/aiqing20230305-bot/AgentForge)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)](.

)

[🚀 快速开始](#-快速开始) • [📖 功能特性](#-核心特性) • [🔐 产品定位](PRODUCT.md) • [🏗️ 架构文档](ARCHITECTURE.md)

---

## 🎯 产品理念

> **你的 Agent，你的数据，你做主。**

AgentForge **不主动扫描任何外部服务**，所有数据源连接均需用户明确授权和配置。

- ✅ **隐私优先** - 不自动匹配 OpenClaw 或 API
- ✅ **本地优先** - 核心功能完全离线可用
- ✅ **透明可控** - 用户完全掌控数据流向
- ✅ **授权连接** - 需用户告知后才连接服务

> 详见 [产品定位文档 →](PRODUCT.md)

---

## ✨ 核心特性

### 🎮 Agent 管理
- **实时监控** - 心跳检测、生命力评分、健康预警
- **进化系统** - 20条自动进化规则，8大类别
- **可视化** - RPG风格界面，数据一目了然

### 📋 任务管理
- **自动执行** - Agent 自动领取和完成任务
- **进度追踪** - 实时日志、时间线可视化
- **智能调度** - 优先级排序、失败重试

### 🔔 通知系统
- **Toast 弹窗** - 屏幕右上角实时提示
- **通知中心** - 历史记录、按类型筛选
- **桌面通知** - 原生系统通知支持

### ⌨️ 快捷键
- **12+ 预设快捷键** - Cmd+K 搜索、Cmd+N 创建
- **3种风格** - Default / VSCode / Vim
- **自定义绑定** - 用户可修改所有快捷键

### 🌍 国际化
- **4种语言** - 中文、英文、日文、韩文
- **自动检测** - 根据浏览器语言自动切换
- **本地化** - 时区、货币、日期格式适配

### 🎨 主题系统
- **深色/浅色** - 完美适配两种模式
- **自定义主题** - Pro 用户可自定义颜色
- **跟随系统** - 自动切换主题

### 📱 移动端支持
- **响应式设计** - 完美适配手机/平板
- **触摸优化** - 按钮尺寸符合移动端标准
- **PWA 就绪** - 可安装到主屏幕

> 完整功能清单见 [FEATURES.md →](FEATURES.md)

---

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173` 开始使用！

### 首次启动

- ✅ **零配置** - 开箱即用，内置 8个 Demo Agent
- ✅ **演示模式** - 35个示例任务可立即体验
- ✅ **本地存储** - 所有数据保存在浏览器本地

### 连接数据源（可选）

1. 点击顶栏 **"数据源"** 按钮
2. 选择 **"添加数据源"**
3. 输入 OpenClaw URL 或 API 地址
4. 确认授权后开始连接

**注意**：AgentForge 不会自动扫描或连接任何服务，需要您手动配置。

---

## 📚 文档导航

| 文档 | 内容 |
|-----|------|
| [PRODUCT.md](PRODUCT.md) | 产品定位、核心理念、隐私设计 |
| [ARCHITECTURE.md](ARCHITECTURE.md) | 技术架构、系统设计、模块说明 |
| [FEATURES.md](FEATURES.md) | 完整功能清单、使用说明 |
| [CONTRIBUTING.md](CONTRIBUTING.md) | 贡献指南、开发规范 |

---

## 🛠️ 技术栈

- **框架**: React 18 + TypeScript 5
- **构建**: Vite 6
- **状态管理**: Zustand 4
- **UI 库**: Tailwind CSS 3 + Framer Motion 12
- **图标**: Lucide React
- **i18n**: react-i18next
- **测试**: Vitest + Playwright

---

## 📊 项目统计

| 指标 | 数值 |
|-----|-----|
| **总代码量** | 42,000+ 行 TypeScript |
| **组件数量** | 90+ React 组件 |
| **Store** | 15+ Zustand Store |
| **服务模块** | 12+ Service |
| **工具函数** | 18+ Utils |
| **TypeScript 错误** | 0 |

---

## 🎯 核心功能亮点

### 1. 隐私保护设计

```typescript
// ❌ 传统方式：自动扫描
scanForServices() // 自动连接 OpenClaw

// ✅ AgentForge 方式：用户授权
connectDataSource({
  url: userInput.url, // 用户手动输入
  apiKey: userInput.key, // 用户提供密钥
  autoConnect: false // 需要用户确认
})
```

### 2. 本地优先存储

```typescript
// 所有数据默认存储在本地
localStorage.setItem('agents', JSON.stringify(agents))

// 云同步需要用户明确启用
if (user.enableCloudSync) {
  syncToCloud(agents)
}
```

### 3. 透明的权限管理

```typescript
// 每个连接都需要用户授权
const connection = await requestPermission({
  service: 'OpenClaw',
  permissions: ['read', 'write'],
  showDialog: true // 显示授权对话框
})
```

---

## 🎮 使用示例

### 管理 Agent

```typescript
// 1. 查看 Agent 列表
// 在主界面即可看到所有 Agent

// 2. 选择 Agent
// 点击 Agent 卡片查看详情

// 3. 监控生命力
// 实时查看心跳、健康状态
```

### 创建任务

```typescript
// 快捷键创建
// Cmd + T (Mac) / Ctrl + T (Windows)

// 或手动创建
// 点击 "创建任务" 按钮
```

### 连接数据源

```typescript
// 1. 打开数据源管理
// 点击顶栏 "数据源" 按钮

// 2. 添加新数据源
// 输入 OpenClaw URL
// 确认授权

// 3. 测试连接
// 点击 "测试连接" 验证
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

查看 [贡献指南 →](CONTRIBUTING.md)

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

---

## 🔗 相关链接

- [产品定位](PRODUCT.md) - 核心理念和设计哲学
- [架构文档](ARCHITECTURE.md) - 技术架构说明
- [功能清单](FEATURES.md) - 完整功能列表
- [更新日志](CHANGELOG.md) - 版本更新记录

---

**© 2024-2026 AgentForge | 隐私优先的 AI Agent 管理平台**
