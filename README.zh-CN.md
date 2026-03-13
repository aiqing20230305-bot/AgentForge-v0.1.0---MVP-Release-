# AgentForge ⚔️

**像锻造传奇英雄一样打造你的 AI Agent**

[English](README.md) | 中文

---

## ✨ 特性

- **🛡️ RPG 装备界面**: 魔兽世界风格的角色装备系统
- **🐉 拖拽操作**: 从背包拖拽组件到装备槽
- **💰 Token 预算**: 实时追踪 token 使用，稀有度基于 token 数量
- **📜 分类系统**: roles、skills、behaviors 等分类管理
- **💾 装备方案**: 保存和加载不同的装备配置
- **🚀 一键导出**: 直接保存到 `~/.claude/agents/your-agent.md`
- **👥 Agent 管理**: 查看和管理多个 AI Agent，追踪任务状态
- **📋 任务系统**: 为每个 Agent 分配和监控任务
- **🔌 OpenClaw 集成**: 可选连接到真实的 Agent 系统（自动降级到演示模式）
- **🎯 开箱即用**: 内置 8 个演示 Agent 和 35 个示例任务

---

## 🎮 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

**🎉 首次启动体验：**
- 无需配置！应用启动时已包含：
  - **8 个演示 Agent**（ATLAS, CLIP, ORACLE, SENTINEL, NEXUS, ECHO, NOVA, AEGIS）
  - **35 个示例任务**（分配给不同 Agent）
  - 完整的 Agent 和任务管理界面
- 状态指示器显示 **🟡 演示模式**（连接到 OpenClaw 时显示 **🟢 已连接**）

### 📂 使用示例组件

体验我们的示例组件：
1. 点击界面上的 **设置图标**（齿轮）
2. 选择 `sample-components` 目录
3. 背包将自动填充示例组件

### 👥 Agent 和任务管理

- 点击任意 Agent 头像查看详情和已分配的任务
- 使用任务管理面板：
  - 按 Agent 筛选任务
  - 更改任务状态（待处理 → 进行中 → 已完成）
  - 为 Agent 创建新任务
  - 追踪完成统计

---

## ⚔️ 装备槽配置

每个槽位代表 Agent 的不同方面：

| 槽位 | 分类 | 说明 |
|------|------|------|
| **头部** | `roles` | 主要角色和人设 |
| **胸甲** | `behaviors` | 核心行为模式 |
| **手部** | `skills` | 能力和专项技能 |
| **腿部** | `constraints` | 规则和操作边界 |
| **靴子** | `formats` | 输出格式规则 |
| **戒指** | `personalities`/`contexts` | 沟通风格和上下文 |
| **副手** | `tools` | 工具集成（MCP、脚本等）|

---

## 📤 导出 Agent

1. **开始导出**: 点击预览面板的 **Export** 按钮，选择 "Save to Claude"
2. **命名 Agent**: 输入唯一的 Agent 配置名称
3. **在 Claude 中激活**: 在 Claude 中执行 `/agent` 命令查看和使用新 Agent

---

## 🔍 自动发现 OpenClaw

AgentForge 可以自动发现本地的 OpenClaw Agent：

1. 打开 **设置** → **数据源** → **自动发现**
2. 点击 **开始扫描**
3. 系统将自动检测：
   - 本地 OpenClaw 配置（~/.openclaw/openclaw.json）
   - OpenClaw Agent 目录（~/.openclaw/agents/）
   - Claude Agent 目录（~/.claude/agents/）
   - 运行中的 Gateway 服务（端口 18789）

4. 点击 **验证** 测试连接
5. 点击 **添加** 将数据源加入管理

**连接成功后**，状态指示器将显示 **🟢 OpenClaw Connected**，您将看到真实的 Agent 数据。

---

## 🛠️ 技术栈

- **Electron** & **React 18**
- **TypeScript** & **Vite**
- **Tailwind CSS** - 样式
- **Zustand** - 状态管理
- **react-dnd** - 拖拽交互

---

## 📖 文档

- [快速开始](README.md) - 本文档
- [故障排除](TROUBLESHOOTING.md) - 常见问题解决
- [贡献指南](CONTRIBUTING.md) - 如何参与开发
- [更新日志](CHANGELOG.md) - 版本历史

---

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详情。

---

## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

- Claude AI - 强大的 AI 能力
- OpenClaw - Agent 编排框架
- 所有贡献者和用户

---

**使用 AgentForge 锻造你的 AI 梦之队！** 🚀
