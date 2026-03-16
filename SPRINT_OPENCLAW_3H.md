# 🚀 3小时OpenClaw集成冲刺计划

**目标：** 实现一键连接本地OpenClaw，自动同步Agent数据

**开始时间：** 2026-03-16 17:25
**结束时间：** 2026-03-16 20:25

---

## 📊 当前状态分析

### ✅ 已知信息
- OpenClaw Gateway地址: `ws://127.0.0.1:18789`
- 认证Token: `5190ffb21bb024bc145dacc982ef6773b35648fa83ccba77`
- 协议：WebSocket（不是REST API）
- 配置文件：`~/.openclaw/openclaw.json`
- 主Agent: main
- 模型: anthropic/claude-opus-4-6

### ❌ 当前问题
1. AgentForge使用REST API连接（不兼容）
2. 没有WebSocket客户端实现
3. 配置流程复杂，需要手动填写
4. 无法验证连接是否成功

---

## 🎯 3小时执行计划

### Phase 1: WebSocket客户端实现 (60分钟)

**目标：** 实现完整的OpenClaw WebSocket连接

#### Task 1.1: 创建WebSocket服务 (20分钟)
```typescript
// src/services/openclawWebSocket.ts
- 实现WebSocket连接管理
- 处理认证流程
- 心跳保持连接
- 自动重连机制
```

**关键API：**
```typescript
class OpenClawWebSocketClient {
  connect(url: string, token: string): Promise<boolean>
  getAgents(): Promise<Agent[]>
  sendMessage(agentId: string, message: string): Promise<void>
  disconnect(): void
}
```

#### Task 1.2: 协议适配器 (20分钟)
```typescript
// src/adapters/openclawWSAdapter.ts
- 将OpenClaw WebSocket消息转换为AgentData
- 处理不同消息类型
- 错误处理和重试
```

#### Task 1.3: 连接测试工具 (20分钟)
```typescript
// src/utils/openclawTester.ts
- 一键测试连接
- 验证Token有效性
- 返回详细诊断信息
```

---

### Phase 2: 一键连接UI (45分钟)

**目标：** 创建简化的配置界面

#### Task 2.1: 快速连接面板 (25分钟)
```tsx
// src/components/QuickConnectPanel.tsx
功能：
✨ 自动检测本地OpenClaw（扫描端口18789-18791）
🔑 自动读取~/.openclaw/openclaw.json获取Token
🎯 一键点击"Connect to OpenClaw"按钮
✅ 实时显示连接状态（连接中/成功/失败）
📊 显示连接的Agent数量
```

**UI设计：**
```
┌─────────────────────────────────────┐
│  🔌 Quick Connect to OpenClaw       │
├─────────────────────────────────────┤
│  Status: 🟡 Detecting...            │
│  Gateway: ws://127.0.0.1:18789      │
│  Token: 5190ff...48fa ✓             │
│                                     │
│  [🚀 Connect Now]                   │
└─────────────────────────────────────┘
```

#### Task 2.2: 连接状态指示器 (10分钟)
```tsx
// src/components/OpenClawStatusBadge.tsx
- TopBar右上角显示连接状态
- 绿色：已连接
- 黄色：连接中
- 红色：未连接
- 点击展开快速配置
```

#### Task 2.3: 自动同步开关 (10分钟)
```tsx
// 实时同步Agent数据
- 开关控制自动同步
- 同步间隔：5秒
- 显示最后同步时间
```

---

### Phase 3: 自动配置向导 (30分钟)

**目标：** 零配置或最小配置

#### Task 3.1: 自动发现 (15分钟)
```typescript
// src/utils/openclawDiscovery.ts
async function discoverOpenClaw() {
  // 1. 检查端口18789是否可用
  // 2. 读取~/.openclaw/openclaw.json
  // 3. 解析配置文件获取Token
  // 4. 返回完整配置
}
```

#### Task 3.2: 首次配置引导 (15分钟)
```tsx
// 如果检测到OpenClaw但未配置
显示引导：
"🎉 Detected local OpenClaw!
Click here to connect automatically."

[Auto Connect] [Manual Setup] [Skip]
```

---

### Phase 4: 数据同步和测试 (45分钟)

**目标：** 完整的数据流通

#### Task 4.1: Agent数据同步 (20分钟)
```typescript
// src/services/openclawSync.ts
- 定期拉取Agent列表
- 更新Store中的agentsCache
- 处理增量更新
- 冲突解决策略
```

#### Task 4.2: 连接测试和验证 (15分钟)
```bash
# 手动测试流程
1. 启动本地OpenClaw
2. 启动AgentForge
3. 点击"Connect to OpenClaw"
4. 验证Agent列表显示
5. 测试发送消息功能
```

#### Task 4.3: 错误处理和回退 (10分钟)
```typescript
// 如果连接失败
- 显示详细错误信息
- 提供手动配置选项
- 回退到本地数据源
- 不影响现有功能
```

---

## 🛠️ 技术实现细节

### WebSocket连接流程
```typescript
1. 连接到 ws://127.0.0.1:18789
2. 发送认证消息：
   {
     type: 'auth',
     token: '5190ffb21bb024bc145dacc982ef6773b35648fa83ccba77'
   }
3. 接收认证响应
4. 订阅Agent更新
5. 处理实时消息
```

### 自动配置流程
```typescript
1. 检测端口: lsof -ti:18789
2. 读取配置: cat ~/.openclaw/openclaw.json
3. 解析Token: JSON.parse(config).gateway_token
4. 验证连接: WebSocket握手
5. 自动填充配置
6. 一键连接
```

---

## 📋 最小可行功能 (MVP)

**必须完成：**
- ✅ WebSocket基础连接
- ✅ 认证流程
- ✅ 获取Agent列表
- ✅ 一键连接按钮
- ✅ 连接状态显示

**优先级2（如果有时间）：**
- 🔄 自动重连
- 📊 实时数据同步
- 🔍 自动发现OpenClaw

**优先级3（后续）：**
- 💬 发送消息给Agent
- 📈 性能监控
- 🎨 高级配置选项

---

## 🎯 成功标准

**核心目标：**
1. ✅ 点击一个按钮即可连接OpenClaw
2. ✅ 自动显示OpenClaw的Agent列表
3. ✅ 连接状态实时反馈
4. ✅ 失败时有明确错误提示

**时间目标：**
- 从零到可用：< 3分钟
- 从检测到连接：< 10秒
- 配置步骤：≤ 1步（理想情况0步）

---

## 📊 执行时间表

```
17:25-18:25  Phase 1: WebSocket客户端实现
  17:25-17:45  Task 1.1: WebSocket服务
  17:45-18:05  Task 1.2: 协议适配器
  18:05-18:25  Task 1.3: 连接测试工具

18:25-19:10  Phase 2: 一键连接UI
  18:25-18:50  Task 2.1: 快速连接面板
  18:50-19:00  Task 2.2: 连接状态指示器
  19:00-19:10  Task 2.3: 自动同步开关

19:10-19:40  Phase 3: 自动配置向导
  19:10-19:25  Task 3.1: 自动发现
  19:25-19:40  Task 3.2: 首次配置引导

19:40-20:25  Phase 4: 数据同步和测试
  19:40-20:00  Task 4.1: Agent数据同步
  20:00-20:15  Task 4.2: 连接测试和验证
  20:15-20:25  Task 4.3: 错误处理和回退
```

---

## 🚨 风险和应对

### 风险1：WebSocket协议不明确
**应对：**
- 抓包分析OpenClaw WebSocket通信
- 查看OpenClaw源码或文档
- 使用wscat工具手动测试

### 风险2：时间不够
**应对：**
- 专注MVP功能
- 砍掉非核心功能
- 并行开发（UI和后端）

### 风险3：认证失败
**应对：**
- 提供手动Token输入
- 详细的错误日志
- 回退到本地数据源

---

## 📝 开发原则

1. **简单优先** - 先让基础功能工作
2. **快速迭代** - 每20分钟一个可测试的成果
3. **用户第一** - 最少的配置步骤
4. **可回退** - 不破坏现有功能
5. **日志详细** - 方便调试问题

---

## 🎉 交付物

**代码：**
- `src/services/openclawWebSocket.ts`
- `src/adapters/openclawWSAdapter.ts`
- `src/components/QuickConnectPanel.tsx`
- `src/components/OpenClawStatusBadge.tsx`
- `src/utils/openclawDiscovery.ts`

**文档：**
- `OPENCLAW_INTEGRATION.md` - 集成文档
- `QUICK_START.md` - 快速开始指南

**测试：**
- 手动测试检查清单
- 连接成功截图
- 错误处理验证

---

## ⏰ 开始执行

**现在开始 Phase 1 - WebSocket客户端实现！**

准备好了吗？Let's GO! 🚀
