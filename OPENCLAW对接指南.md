# 🔌 OpenClaw 对接指南

**版本**: v1.0
**更新时间**: 2026-03-11
**状态**: ✅ 已完成

---

## 📋 简介

OpenClaw Agent 管理中心现在支持与真实的 OpenClaw Gateway 对接，获取实时的 Agent 状态和任务信息。

### 🦞 上海小龙虾 OpenClaw 配置

**已自动配置本地 OpenClaw Gateway！**
- 服务地址：`http://localhost:18789`
- 绑定模式：loopback（本地访问）
- 认证方式：Token 认证
- 飞书机器人：OpenClaw助手 (App ID: cli_a906f00e64785bd9)

管理中心已默认启用本地 OpenClaw 连接，无需手动配置。

### 支持的对接方式

1. **本地 OpenClaw** - 连接到本地运行的 OpenClaw Gateway ✅ 已启用
2. **远程服务器** - 通过 Tailscale 或公网代理连接远程 OpenClaw
3. **自定义服务器** - 连接到任何可访问的 OpenClaw Gateway

---

## 🚀 快速开始

### 方式一：使用默认配置（推荐）

如果你已经在本地运行了 OpenClaw Gateway：

1. 点击顶部栏的 **OpenClaw** 按钮
2. 点击 **"加载默认配置"**
3. 启用 **"启用 OpenClaw 连接"** 开关
4. 点击 **"测试连接"** 验证
5. 点击 **"保存配置"**

默认配置：
```json
{
  "gatewayUrl": "http://localhost:18789",
  "authToken": "e4d645acd59df43f1032fa5bcee1540238c01e9796296266"
}
```

---

### 方式二：手动配置

#### 1. 获取 OpenClaw Gateway 信息

在你的 OpenClaw 配置文件中查找：

```bash
cat ~/.openclaw/openclaw.json
```

找到以下信息：
```json
{
  "gateway": {
    "port": 18789,          // Gateway 端口
    "auth": {
      "token": "xxx..."    // 认证 Token
    }
  }
}
```

#### 2. 在管理中心配置

1. 点击顶部栏的 **OpenClaw 未连接** 按钮
2. 启用 **"启用 OpenClaw 连接"** 开关
3. 填写 **Gateway URL**: `http://localhost:18789`
4. 填写 **认证 Token**: 从配置文件中复制
5. 点击 **"测试连接"**
6. 连接成功后，点击 **"保存配置"**

---

## 🌐 连接到远程服务器

### 腾讯云服务器（上海小龙虾）

如果 OpenClaw 运行在远程服务器上：

#### 1. 确保网络可达

```bash
# 测试连接
curl http://服务器IP:18789/api/ping \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 2. 配置管理中心

- **Gateway URL**: `http://服务器IP:18789`
- **认证 Token**: 服务器上的 gateway.auth.token

#### 3. 安全建议

⚠️ **生产环境建议**:
- 使用 HTTPS 加密连接
- 配置防火墙限制访问
- 定期更换认证 Token
- 使用 VPN 或内网穿透

---

## 🔧 功能说明

### 当前支持的功能

✅ **Agent 状态同步**
- 实时获取 Agent 在线状态
- 显示当前工作任务
- 同步 Agent 信息

✅ **数据模式**
- **OpenClaw 模式**: 连接到真实 Gateway
- **模拟模式**: 使用内置演示数据（默认）

✅ **自动切换**
- OpenClaw 连接失败时自动回退到模拟数据
- 无缝切换，不影响使用

---

## 🎯 配置示例

### 本地开发环境

```json
{
  "gatewayUrl": "http://localhost:18789",
  "authToken": "e4d645acd59df43f1032fa5bcee1540238c01e9796296266",
  "enabled": true
}
```

### 腾讯云服务器

```json
{
  "gatewayUrl": "http://上海小龙虾IP:18789",
  "authToken": "从服务器配置获取",
  "enabled": true
}
```

### Tailscale 内网

```json
{
  "gatewayUrl": "http://100.x.x.x:18789",
  "authToken": "your-token-here",
  "enabled": true
}
```

---

## 🐛 故障排查

### 连接失败

**症状**: 测试连接失败，显示"连接失败"

**排查步骤**:

1. **检查 Gateway 是否运行**
   ```bash
   ps aux | grep openclaw
   curl http://localhost:18789/api/ping
   ```

2. **检查端口是否监听**
   ```bash
   lsof -i :18789
   netstat -an | grep 18789
   ```

3. **检查认证 Token**
   ```bash
   # 确认 Token 正确
   cat ~/.openclaw/openclaw.json | grep -A5 "auth"
   ```

4. **检查防火墙**
   ```bash
   # macOS
   sudo pfctl -sr | grep 18789

   # Linux
   sudo iptables -L | grep 18789
   ```

---

### Gateway API 不可用

**症状**: 连接成功但无法获取 Agent 数据

**说明**:
- OpenClaw Gateway API 接口可能尚未完全实现
- 当前版本会自动回退到模拟数据
- 等待 OpenClaw Gateway 更新后即可使用

**临时方案**:
- 使用模拟模式（关闭 OpenClaw 连接）
- 等待 Gateway API 完善

---

### 网络问题

**症状**: 远程连接超时

**解决方案**:

1. **使用内网穿透**
   ```bash
   # 使用 Tailscale
   tailscale up

   # 或使用 frp/ngrok
   ```

2. **配置端口转发**
   ```bash
   # SSH 端口转发
   ssh -L 18789:localhost:18789 user@remote-server
   ```

3. **使用反向代理**
   ```nginx
   # Nginx 配置
   location /openclaw/ {
     proxy_pass http://localhost:18789/;
   }
   ```

---

## 📊 API 接口说明

### Gateway API 端点

当前管理中心支持以下接口（等待 OpenClaw Gateway 实现）：

#### 1. 测试连接
```
GET /api/ping
Authorization: Bearer {token}
```

#### 2. 获取 Agent 列表
```
GET /api/agents
Authorization: Bearer {token}

Response:
{
  "agents": [
    {
      "name": "ATLAS",
      "status": "working",
      "currentTask": "处理任务中"
    }
  ]
}
```

#### 3. 获取 Agent 状态
```
GET /api/agents/{agentId}/status
Authorization: Bearer {token}
```

#### 4. 获取任务列表
```
GET /api/tasks?agentId={agentId}
Authorization: Bearer {token}
```

#### 5. 创建任务
```
POST /api/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "任务标题",
  "description": "任务描述",
  "agentId": "atlas",
  "priority": "high"
}
```

---

## 🔐 安全最佳实践

### 1. Token 安全

- ❌ 不要在代码中硬编码 Token
- ❌ 不要提交 Token 到 Git
- ✅ 使用环境变量存储 Token
- ✅ 定期轮换 Token

### 2. 网络安全

- ✅ 生产环境使用 HTTPS
- ✅ 配置 IP 白名单
- ✅ 使用 VPN 或内网穿透
- ✅ 启用请求速率限制

### 3. 访问控制

- ✅ 最小权限原则
- ✅ 定期审计访问日志
- ✅ 使用强密码/Token
- ✅ 启用双因素认证（如果支持）

---

## 📝 开发计划

### 即将支持的功能

- [ ] **实时任务管理** - 创建、更新、删除任务
- [ ] **Agent 消息通信** - 与 Agent 实时对话
- [ ] **飞书集成** - 同步飞书消息和通知
- [ ] **任务执行监控** - 实时查看任务执行进度
- [ ] **Agent 性能统计** - 任务完成率、响应时间等
- [ ] **Webhook 通知** - Agent 状态变化推送
- [ ] **日志查看器** - 实时查看 Agent 日志

---

## 💡 使用建议

### 开发环境

建议配置：
- ✅ 启用 OpenClaw 连接
- ✅ 使用本地 Gateway
- ✅ 开启调试日志

### 演示/展示环境

建议配置：
- ✅ 使用模拟数据
- ✅ 关闭 OpenClaw 连接
- ✅ 使用示例 Agent 数据

### 生产环境

建议配置：
- ✅ 启用 OpenClaw 连接
- ✅ 连接到可靠的 Gateway
- ✅ 配置监控和告警
- ✅ 定期备份配置

---

## 🆘 获取帮助

### 问题反馈

- **GitHub Issues**: [项目仓库](https://github.com/...)
- **飞书群组**: 上海小龙虾工作群
- **邮件支持**: support@example.com

### 相关文档

- [OpenClaw 官方文档](https://openclaw.com/docs)
- [Gateway API 文档](https://openclaw.com/docs/gateway)
- [安全指南](https://openclaw.com/docs/security)

---

## 📦 配置文件位置

### 管理中心配置

```
浏览器 LocalStorage
key: openclaw-config
```

### OpenClaw 配置

```bash
~/.openclaw/openclaw.json       # OpenClaw 主配置
~/.openclaw/logs/gateway.log    # Gateway 日志
```

---

## 🎉 完成

配置完成后，你应该可以：

✅ 在顶部栏看到 "OpenClaw 已连接" 状态
✅ Agent 状态实时同步
✅ 查看真实的任务信息
✅ 与 Agent 进行交互

享受强大的 Agent 管理体验！🚀

---

**维护者**: 上海小龙虾🦞
**最后更新**: 2026-03-11 14:00
