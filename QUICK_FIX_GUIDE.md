# 🔧 World of Claudecraft - 快速修复指南

## 问题：界面显示模拟数据（ATLAS、CLIP、ORACLE、SENTINEL）

如果你看到的是模拟 Agent 而不是真实的 Agent，按照以下步骤修复：

---

## 方法 1: 自动诊断修复（推荐）⚡

1. **打开应用**: http://localhost:5174/
2. **点击顶部「诊断」按钮** （琥珀色，带听诊器图标）
3. **查看诊断结果**:
   - ✅ 绿色 = 正常
   - ❌ 红色 = 需要修复
   - ⚠️  黄色 = 警告
4. **点击「快速修复」按钮**
5. **确认清理并刷新页面**

诊断工具会自动：
- 检查 OpenClaw 桥接服务状态
- 检查 Agent API 连接
- 检查数据源配置
- 提供一键修复方案

---

## 方法 2: 手动修复 🛠️

### 第 1 步: 启动 OpenClaw 桥接服务

```bash
cd ~/world-of-claudecraft
node scripts/openclaw-bridge.js &
```

验证服务运行:
```bash
curl http://localhost:18790/api/ping
# 期望输出: {"status":"ok"}
```

### 第 2 步: 测试 Agent API

```bash
curl http://localhost:18790/api/agents | jq '.'
```

期望输出:
```json
{
  "agents": [
    {
      "name": "上海小龙虾",
      "status": "online",
      ...
    }
  ]
}
```

### 第 3 步: 清理浏览器缓存

打开浏览器开发者工具 (F12)，在 Console 中执行:

```javascript
// 清理所有本地数据
localStorage.clear()

// 刷新页面
location.reload()
```

### 第 4 步: 验证连接

刷新后，打开开发者工具 (F12) 查看 Console 输出:

✅ 成功的输出:
```
🔍 [AgentLoader] 开始加载 Agent 数据...
✅ [AgentLoader] 成功加载 2 个 Agent (从数据源管理器)
   Agent 1: 上海小龙虾 (本地 OpenClaw)
   Agent 2: PLUGINS (本地 OpenClaw)
```

❌ 失败的输出:
```
🎭 [AgentLoader] 使用模拟数据
```

---

## 方法 3: 完全重置 🔄

如果以上方法都不行，执行完全重置:

```bash
# 1. 停止所有服务
pkill -f openclaw-bridge
pkill -f vite

# 2. 清理进程
ps aux | grep -E "(openclaw|vite)" | grep -v grep

# 3. 重新启动桥接服务
cd ~/world-of-claudecraft
node scripts/openclaw-bridge.js &

# 4. 重新启动开发服务器
npm run dev
```

然后在浏览器中:
1. 按 Cmd+Shift+Delete (Mac) 或 Ctrl+Shift+Delete (Windows)
2. 清除浏览器缓存和 Site Data
3. 访问 http://localhost:5174/
4. 按 F12 打开开发者工具
5. 在 Console 中执行: `localStorage.clear(); location.reload()`

---

## 常见问题 FAQ

### Q1: 诊断显示「无法连接桥接服务」

**原因**: OpenClaw 桥接服务未运行

**解决**:
```bash
cd ~/world-of-claudecraft
node scripts/openclaw-bridge.js
```

### Q2: 桥接服务运行正常，但仍显示模拟数据

**原因**: 浏览器 localStorage 中有旧配置

**解决**:
1. F12 打开开发者工具
2. Application/Storage → Local Storage
3. 删除所有 localStorage 项
4. 刷新页面

### Q3: Agent API 返回空数组

**原因**: OpenClaw Gateway 未运行或没有 Agent

**解决**:
```bash
# 检查 OpenClaw Gateway
ps aux | grep openclaw-gateway

# 如果未运行，启动它
~/.openclaw/restart-clean.sh

# 查看 Agent 列表
openclaw agents list
```

### Q4: 端口 18790 被占用

**解决**:
```bash
# 查找占用端口的进程
lsof -i :18790

# 停止该进程
kill <PID>

# 或使用其他端口（修改 scripts/openclaw-bridge.js）
```

---

## 开发者：添加自己的 Agent 数据源 🚀

### 方式 1: OpenClaw 数据源（推荐）

如果你有自己的 OpenClaw 实例:

1. **点击顶部「数据源」按钮**
2. **点击「➕ 新增数据源」**
3. **选择类型**: OpenClaw
4. **填写配置**:
   - Gateway URL: `http://your-openclaw-host:18790`
   - Auth Token: 你的认证令牌
5. **测试连接** → **保存**

### 方式 2: 自定义 API

如果你有自己的 Agent API:

1. **点击顶部「数据源」按钮**
2. **选择类型**: Custom API
3. **填写 API 端点**: `https://your-api.com/agents`
4. **配置认证**（如需要）
5. **测试连接** → **保存**

API 需要返回以下格式:
```json
{
  "agents": [
    {
      "name": "Agent Name",
      "status": "online",
      "level": 50,
      "role": "Developer",
      "skills": ["Coding", "Testing"],
      ...
    }
  ]
}
```

### 方式 3: 本地脚本

如果你想用脚本生成 Agent 数据:

1. 创建脚本文件（例如 `my-agents.js`）
2. 输出 JSON 格式的 Agent 数据
3. 在数据源管理器中添加「Local Script」类型
4. 指定脚本路径和执行器（node/python/bash）

---

## 技术架构说明

```
┌─────────────────────────────────────────┐
│   World of Claudecraft (浏览器)         │
│   http://localhost:5174                 │
└───────────────┬─────────────────────────┘
                │
                ↓ HTTP Request
┌─────────────────────────────────────────┐
│   OpenClaw API 桥接服务                 │
│   http://localhost:18790                │
│   - GET /api/ping                       │
│   - GET /api/agents                     │
└───────────────┬─────────────────────────┘
                │
                ↓ exec('openclaw agents list')
┌─────────────────────────────────────────┐
│   OpenClaw CLI / Gateway                │
│   真实 Agent 数据                       │
│   - ~/.openclaw/openclaw.json           │
│   - ~/.openclaw/agents/                 │
└─────────────────────────────────────────┘
```

---

## 日志调试

查看详细日志信息:

**浏览器 Console (F12)**:
```javascript
// 查看 Agent 加载日志
// 所有日志以 [AgentLoader] 前缀开头

// 查看数据源配置
localStorage.getItem('agent-data-source-store')
```

**桥接服务日志**:
```bash
# 查看桥接服务输出
tail -f ~/world-of-claudecraft/scripts/bridge.log

# 或直接运行（前台）
node scripts/openclaw-bridge.js
```

**OpenClaw Gateway 日志**:
```bash
tail -f ~/.openclaw/logs/gateway.log
```

---

## 需要帮助？

1. **查看诊断结果**: 点击顶部「诊断」按钮
2. **查看浏览器 Console**: F12 查看详细错误
3. **查看服务日志**: 检查桥接服务和 Gateway 日志
4. **GitHub Issues**: https://github.com/your-repo/world-of-claudecraft/issues

---

**版本**: v1.0
**最后更新**: 2026-03-11
**贡献者**: 上海小龙虾 🦞
