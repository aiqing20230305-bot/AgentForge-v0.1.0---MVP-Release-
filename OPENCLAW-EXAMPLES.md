# 🦞 OpenClaw Agent 配置实例

## 场景 1: 上海小龙虾 - 智能客服机器人

### 需求
- 响应飞书群聊消息
- 提供友好的用户支持
- 自动路由到最合适的 AI 模型
- 使用富文本卡片展示信息

### 装备配置

```
🪖 HEAD (角色)
   └─ feishu-bot-master
      "你是上海小龙虾，OpenClaw 飞书智能客服机器人"

🛡️ CHEST_1 (行为)
   └─ proactive-assistant
      "主动识别用户需求，提供帮助建议"

⚔️ HANDS_1 (技能)
   └─ feishu-api-expert
      "精通飞书 API，发送消息、创建卡片"

⚔️ HANDS_2 (技能)
   └─ multi-model-caller
      "智能调用多个 AI 模型"

💍 RING1 (个性)
   └─ friendly-helper
      "友好、专业、耐心的交流风格"

💍 RING2 (上下文)
   └─ openclaw-project
      "OpenClaw 项目信息和配置"

👟 FEET (格式)
   └─ rich-message
      "使用飞书富文本和交互式卡片"
```

### 导出配置

1. 平台选择: **🦞 OpenClaw**
2. 文件名: `shanghai-crayfish`
3. 保存路径: `~/.openclaw/agents/shanghai-crayfish.json`

### 预期效果

```json
{
  "name": "shanghai-crayfish",
  "version": "1.0.0",
  "platform": "feishu",
  "ai": {
    "provider": "litellm",
    "baseURL": "https://cloudnative.tezign.com/litellm/api/v1",
    "model": "claude-sonnet-4.5",
    "fallback_models": ["claude-haiku-4.5"]
  },
  "bot": {
    "name": "上海小龙虾",
    "description": "👤 1 • 🎭 1 • ⚡ 2 • ✨ 1 • 📍 1 • 📋 1 | ~2500 tokens",
    "avatar": "🦞",
    "role": "OpenClaw 飞书机器人主控制器..."
  },
  "capabilities": {
    "feishu-api-expert": "精通飞书开放平台的所有 API...",
    "multi-model-caller": "多模型调用专家..."
  },
  "behaviors": {
    "proactive-assistant": "主动助手行为..."
  }
}
```

### 使用方式

```bash
# 在 OpenClaw 主配置中引用
vim ~/.openclaw/openclaw.json

# 添加：
{
  "bots": [
    {
      "app_id": "cli_a906f00e64785bd9",
      "agent_config": "~/.openclaw/agents/shanghai-crayfish.json"
    }
  ]
}

# 重启 OpenClaw
openclaw restart
```

---

## 场景 2: 湖北小龙虾 - 代码审查助手

### 需求
- 帮助团队进行代码审查
- 发现安全问题和潜在 bug
- 提供改进建议
- 生成审查报告

### 装备配置

```
🪖 HEAD (角色)
   └─ feishu-bot-master

🛡️ CHEST_1 (行为)
   └─ proactive-assistant

⚔️ HANDS_1 (技能)
   └─ code-reviewer
      "专业的代码审查和质量保证"

⚔️ HANDS_2 (技能)
   └─ feishu-api-expert

👖 LEGS_1 (约束)
   └─ security-guard
      "严格的安全和隐私保护"

💍 RING1 (个性)
   └─ friendly-helper

💍 RING2 (上下文)
   └─ openclaw-project

👟 FEET (格式)
   └─ rich-message
```

### Token 预算
- 总 Token: ~3500
- 主要组件: code-reviewer (800), security-guard (600)

### 使用场景

**用户**:
```
@湖北小龙虾 帮我审查这段代码：

function login(username, password) {
  const query = "SELECT * FROM users WHERE name='" + username + "'"
  const user = db.query(query)
  if (user.password === password) {
    return true
  }
  return false
}
```

**机器人回复** (飞书卡片):
```
┌─────────────────────────────────────┐
│ ⚠️ 代码审查报告                      │
├─────────────────────────────────────┤
│ ❌ 严重问题                          │
│ 1. SQL 注入漏洞                      │
│    位置: line 2                      │
│    风险: 高危                        │
│                                     │
│ 2. 明文密码比对                      │
│    位置: line 4                      │
│    风险: 中危                        │
│                                     │
│ 💡 建议修复方案                      │
│ 1. 使用参数化查询                    │
│ 2. 密码使用哈希比对                  │
│                                     │
│ [查看详细报告] [生成修复代码]        │
└─────────────────────────────────────┘
```

---

## 场景 3: 多模型智能路由器

### 需求
- 根据任务类型自动选择最合适的 AI 模型
- 成本优化：简单任务用 Haiku，复杂任务用 Opus
- 支持并发调用多个模型
- 智能降级和重试

### 装备配置

```
🪖 HEAD (角色)
   └─ ai-orchestrator
      "多 AI 平台编排者"

⚔️ HANDS_1 (技能)
   └─ multi-model-caller
      "统一接口调用不同 AI 平台"

⚔️ HANDS_2 (技能)
   └─ feishu-api-expert

💍 RING2 (上下文)
   └─ openclaw-project

🔧 OFFHAND (工具)
   └─ openclaw-cli
      "命令行工具和管理脚本"
```

### 路由策略

```javascript
// 自动路由规则
const routingRules = {
  "简单问答": "claude-haiku-4.5",      // 0.25$/M tokens
  "代码生成": "claude-sonnet-4.5",     // 3.0$/M tokens
  "复杂推理": "claude-opus-4.6",       // 15.0$/M tokens
  "图像理解": "gpt-4-vision",          // 10.0$/M tokens
  "长文档分析": "gemini-pro"            // 7.0$/M tokens
}

// 成本控制
const dailyBudget = 100 // $100/day
const alertThreshold = 0.8 // 80% 时告警
```

### 使用案例

**场景 A: 简单问答** (自动选择 Haiku)
```
用户: "今天天气怎么样？"
路由: claude-haiku-4.5 ✅
响应时间: 0.8s
成本: $0.0001
```

**场景 B: 代码生成** (自动选择 Sonnet)
```
用户: "写一个 React 组件实现图片上传"
路由: claude-sonnet-4.5 ✅
响应时间: 2.5s
成本: $0.008
```

**场景 C: 复杂任务** (自动选择 Opus)
```
用户: "设计一个分布式系统架构，支持百万级并发"
路由: claude-opus-4.6 ✅
响应时间: 5.2s
成本: $0.025
```

**场景 D: 故障转移**
```
请求: claude-sonnet-4.5
状态: 503 Service Unavailable ❌
自动降级: claude-haiku-4.5 ✅
重试成功
```

---

## 场景 4: 完整功能的企业级机器人

### 需求
- 全功能客服机器人
- 代码审查
- 多模型路由
- 安全防护
- 富文本交互

### 装备配置 (满配)

```
🪖 HEAD (角色)
   └─ feishu-bot-master

🛡️ CHEST_1 (行为)
   └─ proactive-assistant

⚔️ HANDS_1 (技能)
   └─ feishu-api-expert

⚔️ HANDS_2 (技能)
   └─ multi-model-caller

⚔️ HANDS_3 (技能)
   └─ code-reviewer

👖 LEGS_1 (约束)
   └─ security-guard

💍 RING1 (个性)
   └─ friendly-helper

💍 RING2 (上下文)
   └─ openclaw-project

👟 FEET (格式)
   └─ rich-message

🔧 OFFHAND (工具)
   └─ openclaw-cli
```

### Token 预算
- 总预算: 5000 tokens
- 实际使用: ~4200 tokens
- 剩余空间: 800 tokens

### 功能清单

✅ **基础功能**
- [x] 接收和回复消息
- [x] @机器人触发
- [x] 群聊和私聊支持
- [x] 富文本卡片展示

✅ **高级功能**
- [x] 多模型智能路由
- [x] 代码审查
- [x] 安全检查
- [x] 主动建议

✅ **管理功能**
- [x] 日志记录
- [x] 性能监控
- [x] 错误处理
- [x] 命令行工具

### 部署配置

```json
{
  "name": "enterprise-bot",
  "bots": [
    {
      "app_id": "cli_a906f00e64785bd9",
      "name": "上海小龙虾",
      "agent": "~/.openclaw/agents/enterprise-bot.json",
      "enable": true
    }
  ],
  "ai": {
    "provider": "litellm",
    "baseURL": "https://cloudnative.tezign.com/litellm/api/v1",
    "models": {
      "fast": "claude-haiku-4.5",
      "balanced": "claude-sonnet-4.5",
      "powerful": "claude-opus-4.6"
    }
  },
  "security": {
    "rate_limit": {
      "per_user_per_minute": 60,
      "per_user_per_hour": 1000
    },
    "blacklist": [],
    "whitelist": []
  },
  "monitoring": {
    "log_level": "info",
    "log_file": "~/.openclaw/logs/gateway.log",
    "metrics_enabled": true
  }
}
```

---

## 配置对比表

| 功能 | 场景1<br>智能客服 | 场景2<br>代码审查 | 场景3<br>智能路由 | 场景4<br>企业级 |
|------|------------------|------------------|------------------|----------------|
| 角色 | ✅ | ✅ | ✅ | ✅ |
| 行为 | ✅ | ✅ | ❌ | ✅ |
| 技能数 | 2 | 2 | 2 | 3 |
| 约束 | ❌ | ✅ | ❌ | ✅ |
| 个性 | ✅ | ✅ | ❌ | ✅ |
| 上下文 | ✅ | ✅ | ✅ | ✅ |
| 格式 | ✅ | ✅ | ❌ | ✅ |
| 工具 | ❌ | ❌ | ✅ | ✅ |
| Token 数 | ~2500 | ~3500 | ~1800 | ~4200 |
| 复杂度 | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |

---

## 快速开始

### 1. 选择场景
根据你的需求选择上面的某个场景

### 2. 打开应用
```bash
cd ~/world-of-claudecraft
./start.sh
```

### 3. 加载组件
- 点击 **⚙️ 设置**
- 选择 `openclaw-components` 目录

### 4. 按照场景配置
拖拽对应的组件到装备槽

### 5. 选择平台并导出
- 平台: **🦞 OpenClaw**
- 导出: **📤 Export** → **🚀 Save to platform**

### 6. 部署使用
```bash
# 查看配置
cat ~/.openclaw/agents/your-bot.json

# 更新 OpenClaw 配置
vim ~/.openclaw/openclaw.json

# 重启服务
openclaw restart
```

---

## 性能优化建议

### Token 优化
- 移除不必要的组件
- 使用更简洁的描述
- 合并相似功能

### 响应速度
- 简单任务用 Haiku (0.8s)
- 平衡性能用 Sonnet (2s)
- 复杂任务用 Opus (5s)

### 成本控制
```javascript
// 按场景估算成本
const costEstimate = {
  "场景1-客服": "$0.50/天",   // 1000次调用
  "场景2-审查": "$1.20/天",   // 500次调用
  "场景3-路由": "$0.80/天",   // 1500次调用
  "场景4-企业": "$2.00/天"    // 2000次调用
}
```

---

🦞 **OpenClaw** - 轻松配置，智能运行！
