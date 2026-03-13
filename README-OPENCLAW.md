# World of Claudecraft - OpenClaw Edition 🦞⚔️

基于 World of Claudecraft 的多 AI 平台 Agent 配置工具，专为 OpenClaw 和其他 AI 平台定制。

## ✨ 新增功能

### 🎯 多 AI 平台支持
- **Claude**: Anthropic Claude agents (原生支持)
- **OpenAI**: GPT-4 / GPT-3.5 agents
- **Gemini**: Google Gemini agents
- **OpenClaw**: 飞书机器人专用配置 🦞
- **Custom**: 自定义平台格式

### 🦞 OpenClaw 专属组件
预置了 OpenClaw 飞书机器人的专用组件库：

#### 角色 (Roles)
- **feishu-bot-master**: 飞书机器人主控制器
- **ai-orchestrator**: 多 AI 平台编排者

#### 技能 (Skills)
- **feishu-api-expert**: 飞书 API 专家
- **multi-model-caller**: 多模型调用专家

#### 行为 (Behaviors)
- **proactive-assistant**: 主动助手行为

#### 上下文 (Contexts)
- **openclaw-project**: OpenClaw 项目上下文

#### 工具 (Tools)
- **openclaw-cli**: OpenClaw 命令行工具集

## 🚀 快速开始

### 1. 安装依赖
```bash
cd ~/world-of-claudecraft
npm install
```

### 2. 启动应用
```bash
npm run dev
```

### 3. 加载 OpenClaw 组件
1. 点击界面右上角的 **⚙️ 设置** 按钮
2. 选择 `openclaw-components` 目录
3. 组件会自动加载到背包中

### 4. 配置你的 Agent
1. 从背包拖拽组件到装备槽位
2. 右上角选择目标平台（Claude / OpenAI / OpenClaw 等）
3. 点击 **📤 Export** → **🚀 Save to platform**
4. 输入文件名，保存！

## 🎮 装备槽位说明

| 槽位 | 类型 | 说明 |
|------|------|------|
| 🪖 HEAD | 角色 | 核心身份和角色定位 |
| 🛡️ CHEST | 行为 | 核心行为模式（2个槽位）|
| ⚔️ HANDS | 技能 | 具体能力和技能（3个槽位）|
| 👖 LEGS | 约束 | 规则和边界（2个槽位）|
| 👟 FEET | 格式 | 输出格式规则 |
| 💍 RINGS | 个性/上下文 | 沟通风格和上下文 |
| 🔧 OFFHAND | 工具 | 工具集成 |

## 🎯 OpenClaw 使用场景

### 场景 1: 飞书客服机器人
```
HEAD: feishu-bot-master
CHEST_1: proactive-assistant
HANDS_1: feishu-api-expert
RING2: openclaw-project
```

### 场景 2: 多模型智能路由
```
HEAD: ai-orchestrator
HANDS_1: multi-model-caller
HANDS_2: feishu-api-expert
OFFHAND: openclaw-cli
```

### 场景 3: 完整功能机器人
```
HEAD: feishu-bot-master
CHEST_1: proactive-assistant
HANDS_1: feishu-api-expert
HANDS_2: multi-model-caller
RING1: (自定义个性)
RING2: openclaw-project
OFFHAND: openclaw-cli
```

## 📤 导出格式

### Claude (.md)
```markdown
---
name: my-agent
description: Agent配置
tools: [Read, Write, Bash]
model: sonnet
---

## Roles
...
```

### OpenClaw (.json)
```json
{
  "name": "my-bot",
  "platform": "feishu",
  "ai": {
    "provider": "litellm",
    "baseURL": "https://cloudnative.tezign.com/litellm/api/v1",
    "model": "claude-sonnet-4.5"
  },
  "capabilities": {...},
  "behaviors": {...}
}
```

### OpenAI (.md)
```markdown
# My Agent

## About Me
...

## Custom Instructions
...
```

## 🔧 技术栈

- **Electron** - 桌面应用框架
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** - 样式
- **Zustand** - 状态管理
- **react-dnd** - 拖拽交互

## 📁 目录结构

```
world-of-claudecraft/
├── src/
│   ├── components/
│   │   ├── PlatformSelector.tsx    # 平台选择器（新增）
│   │   └── ...
│   ├── utils/
│   │   ├── platformGenerators.ts   # 多平台生成器（新增）
│   │   └── ...
│   └── stores/
│       └── buildStore.ts           # 状态管理（已增强）
├── openclaw-components/            # OpenClaw 组件（新增）
│   ├── roles/
│   ├── skills/
│   ├── behaviors/
│   ├── contexts/
│   └── tools/
└── sample-components/              # 示例组件（原有）
```

## 🎨 自定义组件

### 创建新组件
在 `openclaw-components` 或自定义目录中创建 `.md` 文件：

```markdown
---
name: my-skill
description: 我的技能描述
tools: [Read, Write]
---

# 技能名称

技能的详细说明和使用方法...
```

### 组件分类
文件所在的目录名决定其类型：
- `roles/` → 角色
- `skills/` → 技能
- `behaviors/` → 行为
- `constraints/` → 约束
- `contexts/` → 上下文
- `formats/` → 格式
- `tools/` → 工具
- `personalities/` → 个性

## 🔗 OpenClaw 集成

### 配置文件位置
- **Claude**: `~/.claude/agents/`
- **OpenClaw**: `~/.openclaw/agents/`
- **其他**: `~/ai-agents/{platform}/`

### OpenClaw 配置文件
```bash
~/.openclaw/
├── openclaw.json          # 主配置
├── agents/                # Agent 配置（导出到这里）
│   └── my-bot.json
└── logs/
    └── gateway.log
```

### 使用导出的配置
```bash
# 1. 在界面中配置并导出
# 2. 配置会保存到 ~/.openclaw/agents/

# 3. 在 OpenClaw 中加载
cat ~/.openclaw/agents/my-bot.json

# 4. 更新主配置引用该 agent
# 编辑 ~/.openclaw/openclaw.json
```

## 🐛 故障排查

### 组件不显示
1. 检查目录路径是否正确
2. 确保 `.md` 文件格式正确
3. 点击 🔄 刷新按钮重新扫描

### 导出失败
1. 检查目标目录是否存在
2. 确保有写入权限
3. 查看 Console 错误信息

### Token 超限
- 调整右上角的 Token 预算
- 移除一些组件
- 选择更简洁的组件

## 📝 开发计划

- [ ] 更多 AI 平台支持（百度文心、阿里通义）
- [ ] 组件市场和在线分享
- [ ] 可视化效果统计
- [ ] 批量导出和模板管理
- [ ] 飞书 Bot 测试模拟器
- [ ] Docker 部署支持

## 🙏 致谢

基于 [World of Claudecraft](https://github.com/Summonair/world-of-claudecraft) 项目二次开发。

## 📄 License

MIT License

---

🦞 **Made for OpenClaw** - 让 AI Agent 配置像玩游戏一样有趣！
