# 🦞 OpenClaw 团队配置指南

## 目标：配置多个 Agent 组成团队

当前状态：
- ✅ **上海小龙虾** (main) - Team Leader - 已配置
- ⚠️  **湖北小龙虾** (newbot) - 目录存在，未完全配置
- 🆕 可以添加更多团队成员

---

## 方法 1: 激活现有的 newbot（推荐）

### 步骤 1: 创建 Identity 文件

```bash
# 创建湖北小龙虾的身份文件
cat > ~/.openclaw/agents/newbot/agent/IDENTITY.md << 'EOF'
# 湖北小龙虾 🦐

我是湖北小龙虾，OpenClaw 团队的开发助手。

## 角色定位
- **职位**: Full Stack Developer
- **专长**: 代码开发、测试、文档编写
- **性格**: 务实高效、注重细节

## 工作方式
- 快速响应开发需求
- 保证代码质量
- 积极协作配合团队

## 技能
- TypeScript/JavaScript
- Python
- React/Node.js
- OpenClaw 开发
EOF
```

### 步骤 2: 在 OpenClaw 配置中注册

编辑 `~/.openclaw/openclaw.json`，找到 `agents` 部分，添加：

```json
{
  "agents": {
    "defaults": {
      // ... 现有配置 ...
    },
    "entries": {
      "main": {
        // ... main 配置 ...
      },
      "newbot": {
        "model": {
          "primary": "anthropic/claude-sonnet-4-5"
        },
        "routing": {
          "channels": []
        }
      }
    }
  }
}
```

### 步骤 3: 验证配置

```bash
openclaw agents list
```

期望看到：
```
Agents:
- main (default)
  Identity: 🦞 (小龙虾) (IDENTITY.md)
  ...
- newbot
  Identity: 🦐 (湖北小龙虾) (IDENTITY.md)
  ...
```

### 步骤 4: 重启桥接服务

```bash
# 停止旧服务
pkill -f openclaw-bridge

# 启动新服务
cd ~/world-of-claudecraft
node scripts/openclaw-bridge.js &
```

### 步骤 5: 刷新管理中心

打开 http://localhost:5174/，按 F12 打开开发者工具，执行：

```javascript
localStorage.clear()
location.reload()
```

现在应该看到 2 个 Agent！

---

## 方法 2: 创建全新的团队成员

### 使用 OpenClaw CLI 创建

```bash
# 创建一个新 Agent
openclaw agents create code-ninja

# 按提示配置：
# - 选择模型（例如 claude-sonnet-4-5）
# - 编辑 IDENTITY.md 定义角色
```

### 手动创建 Agent

1. **创建目录结构**:
```bash
mkdir -p ~/.openclaw/agents/code-ninja/agent
mkdir -p ~/.openclaw/agents/code-ninja/sessions
```

2. **创建 IDENTITY.md**:
```bash
cat > ~/.openclaw/agents/code-ninja/agent/IDENTITY.md << 'EOF'
# Code Ninja 🥷

我是 Code Ninja，专注于代码质量和性能优化。

## 角色定位
- **职位**: Code Reviewer & Optimizer
- **专长**: 代码审查、性能优化、重构
- **性格**: 追求完美、注重规范

## 工作方式
- 严格代码审查
- 性能分析和优化
- 持续改进代码质量

## 技能
- Code Review
- Performance Optimization
- Refactoring
- Best Practices
EOF
```

3. **添加到配置文件** (`~/.openclaw/openclaw.json`):
```json
{
  "agents": {
    "entries": {
      "code-ninja": {
        "model": {
          "primary": "anthropic/claude-sonnet-4-5"
        },
        "routing": {
          "channels": []
        }
      }
    }
  }
}
```

---

## 方法 3: 创建虚拟团队（用于演示）

如果你只是想在管理中心看到多个 Agent（用于展示或测试），可以修改桥接服务返回模拟团队：

### 编辑 `~/world-of-claudecraft/scripts/openclaw-bridge.js`

在文件末尾添加 `getOpenClawAgents` 函数的替代版本：

```javascript
// 注释掉原来的 getOpenClawAgents，添加这个版本：
function getOpenClawAgents() {
  // 返回模拟的团队数据
  return [
    {
      name: '上海小龙虾',
      level: 50,
      exp: 9500,
      maxExp: 10000,
      role: 'Team Leader',
      skills: ['OpenClaw', 'Feishu', 'Strategy', 'Management'],
      personality: 'Decisive and strategic',
      status: 'online',
      color: '#3b82f6',
      description: 'Team Leader - Claude Haiku 4.5'
    },
    {
      name: '湖北小龙虾',
      level: 45,
      exp: 8200,
      maxExp: 10000,
      role: 'Full Stack Dev',
      skills: ['TypeScript', 'React', 'Node.js', 'Testing'],
      personality: 'Detail-oriented and efficient',
      status: 'online',
      color: '#10b981',
      description: 'Developer - Claude Sonnet 4.5'
    },
    {
      name: 'Code Ninja',
      level: 48,
      exp: 8800,
      maxExp: 10000,
      role: 'Code Reviewer',
      skills: ['Code Review', 'Optimization', 'Refactoring'],
      personality: 'Perfectionist and meticulous',
      status: 'online',
      color: '#8b5cf6',
      description: 'Reviewer - Claude Sonnet 4.5'
    },
    {
      name: 'Doc Master',
      level: 42,
      exp: 7500,
      maxExp: 10000,
      role: 'Documentation',
      skills: ['Writing', 'Documentation', 'Examples'],
      personality: 'Clear and helpful',
      status: 'idle',
      color: '#f59e0b',
      description: 'Docs - Claude Haiku 4.5'
    }
  ];
}
```

**重启桥接服务**即可看到 4 个团队成员！

---

## 推荐的团队配置

### 小型团队（2-3人）
- 🦞 **Team Leader** (Haiku 4.5) - 协调和决策
- 🦐 **Developer** (Sonnet 4.5) - 核心开发
- 🥷 **Code Reviewer** (Sonnet 4.5) - 代码审查

### 中型团队（4-6人）
- 🦞 **Team Leader** - 战略和协调
- 🦐 **Frontend Dev** - 前端开发
- 🔧 **Backend Dev** - 后端开发
- 🥷 **Code Reviewer** - 质量保证
- 📝 **Doc Master** - 文档编写
- 🔒 **Security Guard** - 安全审计

### 大型团队（7+人）
在中型基础上添加：
- 🎨 **UI/UX Designer** - 界面设计
- 📊 **Data Analyst** - 数据分析
- 🧪 **QA Engineer** - 测试工程师
- 🚀 **DevOps** - 部署运维

---

## 团队协作模式

### 1. 角色分工
每个 Agent 负责特定领域，避免职责重叠。

### 2. 工作流
```
用户需求 → Team Leader 分析
         → 分配给合适的 Agent
         → Agent 执行任务
         → Code Reviewer 审查
         → Doc Master 编写文档
         → 交付给用户
```

### 3. 通信方式
- 在管理中心创建任务并分配
- 通过飞书与特定 Agent 交互
- 使用 routing 规则自动路由消息

---

## 故障排查

### Q: 新 Agent 不显示在管理中心？

**解决**:
1. 检查 OpenClaw 配置: `openclaw agents list`
2. 确认 IDENTITY.md 存在
3. 重启桥接服务: `pkill -f openclaw-bridge && node scripts/openclaw-bridge.js &`
4. 清理浏览器缓存: `localStorage.clear(); location.reload()`

### Q: Agent 显示但无法分配任务？

**原因**: Agent 可能没有配置路由规则

**解决**: 在 `openclaw.json` 中为 Agent 添加 routing 配置

### Q: 想要修改 Agent 的名字或角色？

**解决**: 编辑对应的 `~/.openclaw/agents/<agent-name>/agent/IDENTITY.md`

---

## 快速启动脚本

创建 `~/world-of-claudecraft/scripts/setup-team.sh`:

```bash
#!/bin/bash

echo "🦞 OpenClaw 团队配置助手"
echo ""

# 1. 创建 newbot identity
echo "📝 创建湖北小龙虾配置..."
cat > ~/.openclaw/agents/newbot/agent/IDENTITY.md << 'EOF'
# 湖北小龙虾 🦐
我是湖北小龙虾，OpenClaw 团队的开发助手。
EOF

echo "✅ 配置文件已创建"

# 2. 重启桥接服务
echo "🔄 重启桥接服务..."
pkill -f openclaw-bridge
cd ~/world-of-claudecraft
node scripts/openclaw-bridge.js &

echo "✅ 服务已重启"
echo ""
echo "🎉 团队配置完成！"
echo "📍 访问 http://localhost:5174/ 查看你的团队"
```

运行:
```bash
chmod +x ~/world-of-claudecraft/scripts/setup-team.sh
~/world-of-claudecraft/scripts/setup-team.sh
```

---

## 下一步

1. **现在就试试方法 3（虚拟团队）** - 最快看到效果
2. **长期使用方法 1** - 配置真实的 Agent
3. **扩展团队** - 根据需要添加更多角色

---

**版本**: v1.0
**最后更新**: 2026-03-11
**作者**: 上海小龙虾 🦞
