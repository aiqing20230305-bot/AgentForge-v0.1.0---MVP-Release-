# 🚀 快速开始指南

## 📦 已完成的工作

✅ 项目已克隆到: `~/world-of-claudecraft`
✅ 创建了 11 个 OpenClaw 专用组件
✅ 添加了多 AI 平台支持（Claude, OpenAI, Gemini, OpenClaw）
✅ 创建了平台选择器 UI
✅ 更新了导出逻辑支持多平台

## 📁 OpenClaw 组件清单

### 角色 (2个)
- `feishu-bot-master.md` - 飞书机器人主控制器 🦞
- `ai-orchestrator.md` - 多 AI 平台编排者 🎭

### 技能 (3个)
- `feishu-api-expert.md` - 飞书 API 专家 📱
- `multi-model-caller.md` - 多模型调用专家 🚀
- `code-reviewer.md` - 代码审查专家 👨‍💻

### 行为 (1个)
- `proactive-assistant.md` - 主动助手行为 💡

### 约束 (1个)
- `security-guard.md` - 安全守卫 🛡️

### 上下文 (1个)
- `openclaw-project.md` - OpenClaw 项目上下文 🦞

### 格式 (1个)
- `rich-message.md` - 飞书富文本消息格式 📱

### 工具 (1个)
- `openclaw-cli.md` - OpenClaw 命令行工具集 🛠️

### 个性 (1个)
- `friendly-helper.md` - 友好助手 😊

## 🎮 使用步骤

### 1. 启动应用
```bash
cd ~/world-of-claudecraft
./start.sh
```

或者：
```bash
npm run dev
```

### 2. 加载 OpenClaw 组件
1. 应用启动后，点击右上角的 **⚙️ 设置** 按钮
2. 点击 "Select components directory"
3. 选择 `~/world-of-claudecraft/openclaw-components`
4. 点击 OK

组件会自动加载到左侧的背包 (Inventory) 中。

### 3. 配置你的第一个 Agent

#### 推荐配置: 飞书智能客服机器人

拖拽以下组件到对应槽位：

```
🪖 HEAD (角色)
   └─ feishu-bot-master

🛡️ CHEST_1 (行为)
   └─ proactive-assistant

⚔️ HANDS_1 (技能)
   └─ feishu-api-expert

⚔️ HANDS_2 (技能)
   └─ multi-model-caller

💍 RING2 (上下文)
   └─ openclaw-project

👟 FEET (格式)
   └─ rich-message

😊 RING1 (个性)
   └─ friendly-helper
```

### 4. 选择导出平台
点击右上角的平台选择器，选择：
- 🦞 **OpenClaw** (推荐) - 导出为 OpenClaw JSON 配置
- 🤖 **Claude** - 导出为 Claude agent 配置
- ⚡ **OpenAI** - 导出为 OpenAI 自定义指令
- ✨ **Gemini** - 导出为 Gemini 系统提示词

### 5. 预览和导出
1. 配置完成后，点击左下角的 **👁️ Preview** 查看生成的配置
2. 确认无误后，点击 **📤 Export** → **🚀 Save to platform**
3. 输入 agent 名称，例如: `shanghai-crayfish`
4. 配置会保存到:
   - OpenClaw: `~/.openclaw/agents/shanghai-crayfish.json`
   - Claude: `~/.claude/agents/shanghai-crayfish.md`
   - 其他: `~/ai-agents/{platform}/shanghai-crayfish.{ext}`

### 6. 在 OpenClaw 中使用

```bash
# 查看导出的配置
cat ~/.openclaw/agents/shanghai-crayfish.json

# 在 OpenClaw 配置中引用
# 编辑 ~/.openclaw/openclaw.json
```

## 🎯 常用配置方案

### 方案 1: 基础客服机器人
```
HEAD: feishu-bot-master
CHEST_1: proactive-assistant
HANDS_1: feishu-api-expert
RING1: friendly-helper
RING2: openclaw-project
```

### 方案 2: 多模型智能路由
```
HEAD: ai-orchestrator
HANDS_1: multi-model-caller
HANDS_2: feishu-api-expert
RING2: openclaw-project
OFFHAND: openclaw-cli
```

### 方案 3: 代码审查助手
```
HEAD: feishu-bot-master
HANDS_1: code-reviewer
HANDS_2: feishu-api-expert
LEGS_1: security-guard
RING1: friendly-helper
```

### 方案 4: 完整功能机器人
```
HEAD: feishu-bot-master
CHEST_1: proactive-assistant
HANDS_1: feishu-api-expert
HANDS_2: multi-model-caller
HANDS_3: code-reviewer
LEGS_1: security-guard
RING1: friendly-helper
RING2: openclaw-project
FEET: rich-message
OFFHAND: openclaw-cli
```

## 🔧 自定义组件

### 创建新组件
```bash
# 在 openclaw-components 对应目录创建 .md 文件
cd ~/world-of-claudecraft/openclaw-components

# 例如创建新技能
cat > skills/my-skill.md << 'EOF'
---
name: my-skill
description: 我的自定义技能
---

# 我的技能

详细说明...
EOF

# 刷新组件列表
# 在应用中点击 🔄 按钮
```

### 组件目录结构
```
openclaw-components/
├── roles/           # 角色定位
├── skills/          # 具体技能
├── behaviors/       # 行为模式
├── constraints/     # 规则约束
├── contexts/        # 上下文信息
├── formats/         # 输出格式
├── tools/           # 工具集成
└── personalities/   # 个性风格
```

## 🐛 故障排查

### 应用无法启动
```bash
# 检查依赖是否安装
cd ~/world-of-claudecraft
npm install

# 清理缓存重新安装
rm -rf node_modules package-lock.json
npm install
```

### 组件不显示
1. 确认目录路径正确
2. 检查 `.md` 文件格式
3. 点击 🔄 刷新按钮

### 导出失败
```bash
# 确保目标目录存在
mkdir -p ~/.openclaw/agents
mkdir -p ~/.claude/agents
mkdir -p ~/ai-agents/openai
mkdir -p ~/ai-agents/gemini
```

## 📚 下一步

1. **测试配置**: 在飞书中测试机器人
2. **调优**: 根据反馈调整组件配置
3. **扩展**: 创建更多自定义组件
4. **分享**: 与团队分享你的配置

## 🙋 需要帮助？

查看详细文档:
- `README-OPENCLAW.md` - 完整使用说明
- `README.md` - 原项目文档

---

🦞 **OpenClaw Edition** - 让 AI Agent 配置变得简单有趣！
