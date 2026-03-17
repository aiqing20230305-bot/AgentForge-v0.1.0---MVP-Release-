# 🚀 AgentForge Web版 - 快速开始

**5秒开始使用 · 无需安装 · 完整功能**

---

## 🌟 立即体验

### 方式1: 在线访问 (推荐)

```
https://agentforge.app
```

- ✅ 无需注册,游客模式立即使用
- ✅ 所有数据保存在本地浏览器
- ✅ 随时升级为正式账号

### 方式2: 本地开发

```bash
# 克隆仓库
git clone https://github.com/agentforge/agentforge.git
cd agentforge

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

---

## ⚡ 3步开始使用

### Step 1: 访问网站

打开浏览器,访问 https://agentforge.app

### Step 2: 选择登录方式

- **游客模式** - 点击即用,无需注册 (推荐新用户)
- **Magic Link** - 邮箱免密登录
- **OAuth** - Google/GitHub/Discord登录
- **邮箱密码** - 传统注册登录

### Step 3: 开始创建Agent

界面会自动引导你创建第一个Agent!

---

## 🎯 核心功能

### 1. Agent管理
- 创建和管理AI Agent
- 配置AI模型和参数
- 监控Agent状态和性能

### 2. 任务系统
- 创建和分配任务
- 自动/手动执行
- 任务历史和统计

### 3. 游戏化
- 等级和经验系统
- 成就和徽章
- PvP对战模式
- 全球排行榜

### 4. 协作功能
- 团队共享
- 实时同步
- 评论和反馈

---

## 💾 数据管理

### 游客模式

数据存储在本地浏览器:
- ✅ 完全离线可用
- ✅ 隐私安全
- ⚠️ 清除浏览器数据会丢失

### 正式账号

数据同步到云端:
- ✅ 多设备同步
- ✅ 数据永久保存
- ✅ 自动备份

### 升级账号

游客可随时升级:

```
1. 点击右上角头像
2. 选择 "升级账号"
3. 输入邮箱和密码
4. 数据自动迁移到新账号
```

---

## 🔧 高级功能

### PWA安装

获得类似原生应用的体验:

#### Chrome/Edge
1. 访问网站
2. 地址栏右侧点击 "安装" 图标
3. 确认安装

#### Safari (iOS/macOS)
1. 访问网站
2. 点击分享按钮
3. 选择 "添加到主屏幕"

### 离线模式

Web版完全支持离线使用:
- ✅ 查看和管理Agents
- ✅ 创建和编辑任务
- ✅ 查看历史记录
- ⚠️ 需要网络: AI执行、PvP对战

### 快捷键

提高效率的快捷键:

| 快捷键 | 功能 |
|-------|------|
| `Ctrl/Cmd + K` | 全局搜索 |
| `Ctrl/Cmd + N` | 创建Agent |
| `Ctrl/Cmd + T` | 创建任务 |
| `Ctrl/Cmd + S` | 保存当前 |
| `Ctrl/Cmd + ,` | 打开设置 |
| `?` | 显示快捷键帮助 |

### 云端同步

实时同步配置:

```
设置 → 云同步 → 配置

选项:
- 自动同步: 每30秒同步一次
- 实时同步: WebSocket实时推送
- 冲突策略: 本地优先/云端优先/智能合并
```

---

## 🎨 个性化

### 主题

多种主题可选:
- 深色模式 (默认)
- 浅色模式
- 赛博朋克
- WoW经典

切换: `设置 → 外观 → 主题`

### 语言

支持多语言:
- 简体中文 (默认)
- English
- 日本語
- 한국어

切换: `设置 → 语言`

---

## 📱 移动端使用

### 响应式设计

Web版完美适配移动端:
- ✅ 触控优化
- ✅ 手势操作
- ✅ 移动导航
- ✅ 性能优化

### 建议

- iOS用户: 使用Safari浏览器
- Android用户: 使用Chrome浏览器
- 安装PWA获得最佳体验

---

## 🔐 隐私和安全

### 游客模式

- 数据仅存储在本地浏览器
- 不收集任何个人信息
- 不需要注册账号

### 正式账号

- 使用行业标准加密
- 支持2FA双因素认证
- 符合GDPR数据保护法规

### 数据控制

你完全控制你的数据:
- 导出所有数据为JSON
- 一键删除所有数据
- 下载历史记录

---

## ⚡ 性能优化

### 浏览器要求

| 浏览器 | 最低版本 | 推荐版本 |
|-------|---------|---------|
| Chrome | 90+ | 最新版 |
| Edge | 90+ | 最新版 |
| Safari | 14+ | 最新版 |
| Firefox | 88+ | 最新版 |

### 性能提示

1. **使用最新浏览器** - 获得最佳性能
2. **安装PWA** - 启动更快
3. **清理缓存** - 如遇问题清理缓存
4. **关闭不用的标签页** - 节省内存

---

## 🆘 常见问题

### Q: 游客模式数据安全吗?

A: 数据存储在本地IndexedDB,只要不清除浏览器数据就不会丢失。建议升级为正式账号获得云端备份。

### Q: Web版功能完整吗?

A: Web版提供桌面版99%的功能。少数需要系统权限的功能(如文件系统访问)在Web版受限。

### Q: 可以离线使用吗?

A: 完全可以!除了需要调用AI API的任务执行,其他所有功能都支持离线。

### Q: 数据会同步吗?

A: 游客模式数据仅本地存储。正式账号数据会自动同步到云端,支持多设备访问。

### Q: 如何备份数据?

A: `设置 → 数据管理 → 导出数据`,可下载JSON格式的完整备份。

### Q: 忘记密码怎么办?

A: 登录页面点击 "忘记密码",通过邮箱重置。或者使用Magic Link免密登录。

### Q: 性能问题怎么办?

A:
1. 刷新页面 (Ctrl/Cmd + Shift + R)
2. 清除浏览器缓存
3. 检查网络连接
4. 更新到最新浏览器

### Q: 移动端体验如何?

A: Web版完美适配移动端,推荐安装PWA获得类似原生应用的体验。

---

## 📚 进阶指南

### 开发者模式

启用开发者工具:

```
设置 → 高级 → 开发者模式

功能:
- 性能监控面板
- API调试工具
- 日志查看器
- 实验性功能
```

### API集成

Web版支持API访问:

```javascript
// 获取Agent列表
fetch('https://api.agentforge.app/v1/agents', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})

// 创建任务
fetch('https://api.agentforge.app/v1/tasks', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    agentId: 'agent_123',
    title: 'My Task',
    description: 'Task description'
  })
})
```

### 自托管

企业用户可自托管Web版:

```bash
# 构建
npm run build

# 部署到Nginx
rsync -avz dist/ user@server:/var/www/agentforge/

# 或使用Docker
docker build -t agentforge-web .
docker run -p 80:80 agentforge-web
```

---

## 🎓 学习资源

### 视频教程

- [5分钟快速入门](https://youtube.com/watch?v=xxx)
- [创建第一个Agent](https://youtube.com/watch?v=xxx)
- [任务管理完全指南](https://youtube.com/watch?v=xxx)

### 文档

- [完整文档](https://docs.agentforge.app)
- [API参考](https://docs.agentforge.app/api)
- [最佳实践](https://docs.agentforge.app/best-practices)

### 社区

- [Discord社区](https://discord.gg/agentforge)
- [GitHub讨论](https://github.com/agentforge/discussions)
- [中文论坛](https://forum.agentforge.cn)

---

## 💬 获取帮助

遇到问题?我们随时提供帮助:

- **在线聊天**: 右下角聊天按钮
- **邮件支持**: support@agentforge.app
- **GitHub Issues**: https://github.com/agentforge/issues
- **Discord**: https://discord.gg/agentforge

---

## 🎉 开始你的Agent之旅!

现在就访问 https://agentforge.app,体验下一代AI Agent管理平台!

**无需注册 · 5秒开始 · 完整功能**

---

最后更新: 2026-03-17
