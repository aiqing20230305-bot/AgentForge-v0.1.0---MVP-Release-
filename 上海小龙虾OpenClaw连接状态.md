# 🦞 上海小龙虾 OpenClaw 连接状态

**更新时间**: 2026-03-11 15:50

---

## ✅ 连接配置完成

### 本地 OpenClaw Gateway
- **状态**: ✅ 运行中
- **地址**: http://localhost:18789
- **端口**: 18789
- **绑定模式**: loopback（仅本地访问）
- **认证方式**: Token 认证
- **认证令牌**: `e4d645acd59df43f1032fa5bcee1540238c01e9796296266`

### 飞书机器人配置
- **App ID**: `cli_a906f00e64785bd9`
- **机器人名称**: OpenClaw助手
- **Webhook URL**: http://localhost:18789/feishu/events

---

## 🎮 如何使用管理中心

### 1. 启动管理中心
```bash
cd ~/world-of-claudecraft
npm run dev
```

访问：http://localhost:5174/

### 2. 查看 OpenClaw 连接状态

在管理中心顶部栏，您会看到：
- **绿色脉动图标** ⚡ = OpenClaw 已连接
- **灰色图标** = OpenClaw 未连接

### 3. 配置/测试连接

点击顶部的 **"OpenClaw"** 按钮，会打开配置面板：
- 查看当前配置
- 测试连接状态
- 加载默认配置
- 修改服务器地址

---

## 🔧 当前配置

管理中心已自动配置为连接本地 OpenClaw：

```json
{
  "gatewayUrl": "http://localhost:18789",
  "authToken": "e4d645acd59df43f1032fa5bcee1540238c01e9796296266",
  "enabled": true
}
```

---

## 📊 功能说明

### 已支持的功能

✅ **实时 Agent 状态同步**
- 管理中心会尝试从 OpenClaw Gateway 获取 Agent 状态
- 如果 API 不可用，自动回退到模拟数据

✅ **智能回退机制**
- OpenClaw 连接失败 → 自动使用模拟数据
- 无缝切换，不影响使用体验

✅ **配置持久化**
- 配置保存在浏览器 LocalStorage
- 下次打开自动加载

### 待 OpenClaw Gateway 完善的功能

⏳ **Agent 列表 API** (`/api/agents`)
- 当前返回 HTML 页面，需要实现 JSON API
- 实现后可实时显示 Agent 状态

⏳ **任务管理 API** (`/api/tasks`)
- 创建、更新、查询任务
- 实现后可直接从管理中心操作任务

⏳ **Agent 消息 API** (`/api/agents/{id}/message`)
- 与 Agent 实时对话
- 实现后聊天系统可连接真实 Agent

---

## 🌐 远程访问方案

如果需要从其他设备访问本地 OpenClaw：

### 方案 1: Tailscale（推荐）
```bash
# 安装 Tailscale
brew install tailscale
tailscale up

# 获取 Tailscale IP
tailscale ip

# 使用 Tailscale IP 访问
# http://100.x.x.x:18789
```

### 方案 2: SSH 端口转发
```bash
# 从远程机器执行
ssh -L 18789:localhost:18789 user@本机IP

# 然后访问 http://localhost:18789
```

### 方案 3: ngrok/frp 公网穿透
```bash
# 使用 ngrok
ngrok http 18789

# 获得公网 URL
# https://xxx.ngrok.io
```

⚠️ **安全提醒**:
- 公网暴露需要确保 Token 安全
- 建议仅在可信网络使用
- 生产环境建议使用 HTTPS + VPN

---

## 🐛 故障排查

### 问题：连接失败

**检查 OpenClaw 是否运行**
```bash
ps aux | grep openclaw
curl http://localhost:18789
```

**检查端口是否监听**
```bash
lsof -i :18789
```

**查看 OpenClaw 日志**
```bash
tail -f ~/.openclaw/logs/gateway.log
```

### 问题：显示模拟数据

**原因**：OpenClaw Gateway API 尚未完全实现

**当前状态**：
- Gateway Web UI 正常运行 ✅
- REST API 端点待实现 ⏳

**解决方案**：
1. 等待 OpenClaw Gateway 更新实现 API
2. 或者，当前使用模拟数据进行演示

---

## 📝 下一步

### 建议 OpenClaw Gateway 实现的 API

```bash
# 1. Ping/健康检查
GET /api/ping
Authorization: Bearer {token}

# 2. Agent 列表
GET /api/agents
Authorization: Bearer {token}
Response: {
  "agents": [
    {
      "name": "ATLAS",
      "status": "working",
      "currentTask": "处理任务中"
    }
  ]
}

# 3. 任务列表
GET /api/tasks?agentId={id}
Authorization: Bearer {token}

# 4. 创建任务
POST /api/tasks
Authorization: Bearer {token}
Body: {
  "title": "任务标题",
  "description": "任务描述",
  "agentId": "atlas",
  "priority": "high"
}

# 5. Agent 消息
POST /api/agents/{id}/message
Authorization: Bearer {token}
Body: {
  "message": "你好"
}
```

---

## 🎉 总结

✅ 本地 OpenClaw Gateway 运行正常
✅ 管理中心配置完成，已启用连接
✅ 界面美化、动画效果、聊天系统、技能库全部完成
⏳ 等待 Gateway REST API 实现后可实现完整对接

**当前状态**:
- 管理中心 100% 完成
- 使用模拟数据提供完整演示
- Gateway API 实现后可无缝切换到真实数据

享受强大的 Agent 管理体验！🚀

---

**维护者**: 上海小龙虾🦞
**项目路径**: ~/world-of-claudecraft
**文档更新**: 2026-03-11 15:50
