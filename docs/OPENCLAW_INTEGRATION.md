# OpenClaw 集成完整文档

## 概述

AgentForge 已完整集成 OpenClaw Gateway，支持实时连接、Agent 同步、状态监控等功能。

## 功能特性

### 核心功能
- ✅ WebSocket 实时连接
- ✅ Token 认证
- ✅ Agent 列表同步
- ✅ 自动重连（指数退避策略）
- ✅ 心跳保活
- ✅ 连接质量监控
- ✅ 配置导入/导出
- ✅ 错误处理和用户提示

### 协议支持
- ✅ 标准消息类型（auth, get_agents, ping/pong）
- ✅ Event 类型消息适配（type: 'event'）
- ✅ Agent 状态更新推送

## 快速开始

### 1. 启动 OpenClaw Gateway

```bash
# 确保 OpenClaw Gateway 正在运行
openclaw start

# 或使用 PM2
pm2 start openclaw

# 检查状态
ps aux | grep openclaw
```

### 2. 在 AgentForge 中连接

1. 点击右上角的连接状态指示器
2. 输入 Gateway URL（默认：`ws://127.0.0.1:18789`）
3. 输入认证 Token
4. 点击"立即连接"

### 3. 验证连接

连接成功后，你会看到：
- 状态指示器变为绿色
- 显示 Agent 数量
- 自动同步开始运行

## 架构设计

### 组件结构

```
src/
├── services/
│   ├── openclawWebSocket.ts      # WebSocket 客户端
│   └── openclawAutoSync.ts       # 自动同步服务
├── adapters/
│   └── openclawWSAdapter.ts      # 协议适配器
├── components/
│   ├── OpenClawStatusBadge.tsx   # 状态指示器
│   └── QuickConnectPanel.tsx     # 快速连接面板
└── utils/
    ├── openclawTester.ts         # 连接测试工具
    └── openclawConfigManager.ts  # 配置管理器
```

### 数据流

```
OpenClaw Gateway (WebSocket)
    ↓
openclawWebSocket.ts (连接管理)
    ↓
openclawWSAdapter.ts (协议转换)
    ↓
useDataSourceStore (状态管理)
    ↓
UI Components (展示)
```

## API 文档

### OpenClawWebSocketClient

#### 连接管理

```typescript
// 连接到 Gateway
await client.connect({
  url: 'ws://127.0.0.1:18789',
  token: 'your-token-here'
})

// 断开连接
client.disconnect()

// 手动重连
await client.manualReconnect()

// 检查连接状态
const isConnected = client.isConnected()
const status = client.getStatus() // 'connected' | 'connecting' | 'disconnected' | 'error'
```

#### 获取 Agent 数据

```typescript
// 获取 Agent 列表
const agents = await client.getAgents()

// 订阅 Agent 更新
client.onAgentUpdate((agents) => {
  console.log('Agents updated:', agents)
})
```

#### 连接质量监控

```typescript
// 获取连接质量
const quality = client.getConnectionQuality()
// {
//   latency: 150,        // 延迟（ms）
//   status: 'good',      // 'excellent' | 'good' | 'fair' | 'poor'
//   lastPing: 1234567890,
//   missedPings: 0
// }

// 监听质量变化
client.onQualityChange((quality) => {
  console.log('Quality:', quality.status, quality.latency + 'ms')
})
```

#### 错误处理

```typescript
// 监听错误
client.onError((error, details) => {
  console.error('Error:', error, details)
  // 显示用户提示
  showNotification(error)
})

// 监听状态变化
client.onStatusChange((status, error) => {
  if (status === 'error') {
    console.error('Connection error:', error)
  }
})
```

### 自动同步服务

```typescript
import { getAutoSyncService } from './services/openclawAutoSync'

const autoSync = getAutoSyncService()

// 启动自动同步（每5秒）
autoSync.start(5000)

// 停止自动同步
autoSync.stop()

// 立即同步一次
await autoSync.syncNow()

// 获取同步状态
const status = autoSync.getStatus()
// {
//   enabled: true,
//   lastSyncTime: '2026-03-16T10:30:00.000Z',
//   syncInterval: 5000,
//   errorCount: 0,
//   lastError: null
// }

// 监听状态变化
autoSync.onStatusChange((status) => {
  console.log('Sync status:', status)
})
```

### 配置管理

```typescript
import {
  saveConfig,
  getAllConfigs,
  exportConfigToFile,
  importConfigFromFile,
} from './utils/openclawConfigManager'

// 保存配置
const saved = saveConfig(
  { url: 'ws://...', token: '...' },
  'Production Gateway'
)

// 获取所有配置
const configs = getAllConfigs()

// 导出配置到文件
exportConfigToFile(saved)

// 从文件导入配置
const imported = await importConfigFromFile()
```

## 消息协议

### 标准消息格式

```typescript
// 认证
{
  type: 'auth',
  token: 'your-token'
}

// 认证响应
{
  type: 'auth_response',
  success: true
}

// 获取 Agent 列表
{
  type: 'get_agents'
}

// Agent 列表响应
{
  type: 'agents_response',
  agents: [
    {
      id: 'agent-1',
      name: 'Agent Name',
      status: 'online',
      model: 'claude-3-opus',
      workspace: '/path/to/workspace'
    }
  ]
}

// 心跳
{
  type: 'ping'
}

// 心跳响应
{
  type: 'pong'
}
```

### Event 类型消息（已适配）

```typescript
// OpenClaw 可能发送 event 类型消息
{
  type: 'event',
  event: 'agent_update',  // 或 eventType
  agents: [...]
}

// 适配器会自动转换为标准格式
{
  type: 'agent_update',
  agents: [...]
}
```

## 连接质量指标

### 质量等级

| 等级 | 延迟范围 | 说明 |
|------|---------|------|
| 优秀 (excellent) | 0-200ms | 连接非常稳定 |
| 良好 (good) | 200-500ms | 连接稳定 |
| 一般 (fair) | 500-1000ms | 连接可用，可能有延迟 |
| 较差 (poor) | >1000ms | 连接不稳定，建议检查网络 |

### 自动处理

- 连续 3 次未收到 pong 响应 → 自动重连
- 重连采用指数退避策略（2s, 4s, 8s, 16s, 30s）
- 达到最大重连次数（5次）后停止，提示用户手动重连

## 错误处理

### 常见错误及解决方案

#### 1. 连接超时

**错误信息**: "Connection timeout"

**原因**:
- OpenClaw Gateway 未运行
- 端口错误
- 防火墙阻止

**解决方案**:
```bash
# 检查 Gateway 是否运行
ps aux | grep openclaw

# 检查端口
lsof -i :18789

# 重启 Gateway
openclaw restart
```

#### 2. 认证失败

**错误信息**: "Token验证失败或权限不足"

**原因**:
- Token 错误或过期
- 权限不足

**解决方案**:
```bash
# 查看配置文件中的 Token
cat ~/.openclaw/openclaw.json

# 重新生成 Token（如果支持）
openclaw token generate
```

#### 3. 消息解析失败

**错误信息**: "Failed to parse message"

**原因**:
- 协议不兼容
- 消息格式错误

**解决方案**:
- 检查 OpenClaw Gateway 版本
- 查看浏览器控制台的详细错误信息
- 更新 AgentForge 到最新版本

#### 4. 自动同步失败

**错误信息**: "Sync failed"

**原因**:
- 连接断开
- Gateway 响应超时

**解决方案**:
- 检查连接状态
- 手动触发同步
- 调整同步间隔（降低频率）

## 调试工具

### 浏览器控制台

```javascript
// 测试连接
await window.testOpenClaw()

// 自定义配置测试
await window.testOpenClawConnection({
  url: 'ws://127.0.0.1:18789',
  token: 'your-token'
})

// 自动检测
await window.detectLocalOpenClaw()

// 控制自动同步
window.autoSync.start()
window.autoSync.stop()
window.autoSync.syncNow()
window.autoSync.getStatus()
```

### 日志级别

所有日志都带有 `[OpenClawWS]` 或 `[AutoSync]` 前缀，方便过滤：

```javascript
// 在控制台过滤日志
// 只看 OpenClaw 相关日志
console.log = (function(oldLog) {
  return function(...args) {
    if (args[0]?.includes?.('[OpenClaw') || args[0]?.includes?.('[AutoSync')) {
      oldLog.apply(console, args)
    }
  }
})(console.log)
```

## 性能优化

### 1. 同步间隔调整

```typescript
// 根据需求调整同步间隔
autoSync.setInterval(10000) // 10秒（降低服务器压力）
autoSync.setInterval(3000)  // 3秒（更实时）
```

### 2. 连接池管理

当前实现使用单例模式，确保只有一个 WebSocket 连接：

```typescript
// 获取单例实例
const client = getOpenClawWSClient()
```

### 3. 消息批处理

Agent 更新会自动合并，避免频繁更新 UI：

```typescript
// 智能合并：保留本地数据，只更新状态
const merged = mergeOpenClawAgents(existing, incoming)
```

## 安全建议

### 1. Token 保护

- ✅ Token 在 UI 中自动掩码显示
- ✅ 配置导出时包含完整 Token（注意保管）
- ⚠️ 不要在公共场合分享配置文件

### 2. 连接安全

```typescript
// 生产环境使用 WSS（加密连接）
const config = {
  url: 'wss://your-gateway.com',  // 使用 wss://
  token: process.env.OPENCLAW_TOKEN
}
```

### 3. 配置存储

- 配置存储在 localStorage
- 建议定期备份配置
- 敏感环境可以禁用配置保存功能

## 测试指南

### 单元测试

```bash
# 运行测试
npm test

# 测试 WebSocket 连接
npm test -- openclawWebSocket.test.ts

# 测试协议适配器
npm test -- openclawWSAdapter.test.ts
```

### 集成测试

```bash
# 使用测试脚本
node test-openclaw-connection.js

# 预期输出
# ✅ WebSocket连接成功
# ✅ 认证成功
# ✅ 获取Agent列表成功 (N个)
```

### 手动测试清单

- [ ] 连接成功（绿色指示器）
- [ ] 显示正确的 Agent 数量
- [ ] 自动同步正常工作
- [ ] 连接质量显示正确
- [ ] 断开重连功能正常
- [ ] 配置导入/导出功能正常
- [ ] 错误提示清晰明确
- [ ] 心跳保活正常（30秒间隔）
- [ ] 网络中断后自动重连
- [ ] 多次重连失败后正确提示

## 故障排除

### 问题：连接一直显示"连接中"

**检查步骤**:
1. 确认 Gateway 正在运行
2. 检查 URL 和端口是否正确
3. 查看浏览器控制台错误
4. 尝试手动重连

### 问题：Agent 列表为空

**检查步骤**:
1. 确认 Gateway 中有 Agent
2. 检查 Token 权限
3. 查看 Gateway 日志
4. 手动触发同步

### 问题：连接频繁断开

**检查步骤**:
1. 检查网络稳定性
2. 查看连接质量指标
3. 检查 Gateway 负载
4. 调整心跳间隔

### 问题：配置导入失败

**检查步骤**:
1. 确认 JSON 格式正确
2. 检查必需字段（url, token）
3. 验证 URL 格式（ws:// 或 wss://）
4. 检查 Token 长度（至少10个字符）

## 更新日志

### v1.0.0 (2026-03-16)

**新增功能**:
- ✅ 完整的 WebSocket 连接管理
- ✅ Event 类型消息协议适配
- ✅ 连接质量实时监控
- ✅ 指数退避重连策略
- ✅ 配置导入/导出功能
- ✅ 完善的错误处理和用户提示
- ✅ 自动同步服务
- ✅ 快速连接面板
- ✅ 状态指示器

**优化**:
- 🔧 心跳机制优化（检测丢失的 pong）
- 🔧 重连逻辑优化（指数退避）
- 🔧 错误提示优化（更友好的消息）
- 🔧 UI 交互优化（连接质量显示）

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/openclaw-xxx`)
3. 提交更改 (`git commit -m 'feat: add xxx'`)
4. 推送到分支 (`git push origin feature/openclaw-xxx`)
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

- 项目主页: https://github.com/your-org/agentforge
- 问题反馈: https://github.com/your-org/agentforge/issues
- OpenClaw 文档: https://github.com/openclaw/openclaw

---

**最后更新**: 2026-03-16
**文档版本**: 1.0.0
