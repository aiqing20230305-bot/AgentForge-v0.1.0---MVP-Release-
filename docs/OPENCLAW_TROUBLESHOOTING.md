# OpenClaw 故障排除指南

## 诊断流程

```
问题发生
    ↓
检查 Gateway 状态
    ↓
验证配置
    ↓
查看日志
    ↓
测试连接
    ↓
解决问题
```

## 常见问题

### 1. 无法连接到 Gateway

#### 症状
- 状态一直显示"连接中"
- 超时错误
- 连接立即失败

#### 诊断步骤

**Step 1: 检查 Gateway 是否运行**
```bash
# 查找进程
ps aux | grep openclaw

# 如果没有输出，说明 Gateway 未运行
```

**Step 2: 检查端口**
```bash
# 检查端口是否被占用
lsof -i :18789

# 或使用 netstat
netstat -an | grep 18789
```

**Step 3: 查看 Gateway 日志**
```bash
# 查看最近的日志
tail -n 50 ~/.openclaw/logs/gateway.log

# 实时查看日志
tail -f ~/.openclaw/logs/gateway.log

# 搜索错误
grep ERROR ~/.openclaw/logs/gateway.log
```

#### 解决方案

**方案 1: 启动 Gateway**
```bash
openclaw start

# 或使用 PM2
pm2 start openclaw
pm2 logs openclaw
```

**方案 2: 重启 Gateway**
```bash
openclaw restart

# 或
pkill -f openclaw && openclaw start
```

**方案 3: 检查配置文件**
```bash
# 查看配置
cat ~/.openclaw/openclaw.json

# 验证 JSON 格式
python -m json.tool ~/.openclaw/openclaw.json
```

**方案 4: 更换端口**
```json
// ~/.openclaw/openclaw.json
{
  "port": 18790,  // 尝试其他端口
  "token": "..."
}
```

### 2. 认证失败

#### 症状
- "Token验证失败或权限不足"
- "Auth failed"
- 连接后立即断开

#### 诊断步骤

**Step 1: 验证 Token**
```bash
# 查看配置中的 Token
cat ~/.openclaw/openclaw.json | grep token

# 确保 Token 长度足够（至少10个字符）
```

**Step 2: 检查 Token 格式**
```javascript
// 浏览器控制台
const token = 'your-token-here'
console.log('Token length:', token.length)
console.log('Token valid:', token.length >= 10)
```

**Step 3: 测试 Token**
```bash
# 使用测试脚本
node test-openclaw-connection.js
```

#### 解决方案

**方案 1: 重新获取 Token**
```bash
# 从配置文件复制正确的 Token
cat ~/.openclaw/openclaw.json | jq -r '.token'
```

**方案 2: 重新生成 Token（如果支持）**
```bash
openclaw token generate
```

**方案 3: 检查权限**
```bash
# 确保配置文件可读
ls -la ~/.openclaw/openclaw.json

# 修复权限
chmod 600 ~/.openclaw/openclaw.json
```

### 3. Agent 列表为空

#### 症状
- 连接成功但显示 0 个 Agent
- "Found 0 agents"

#### 诊断步骤

**Step 1: 检查 Gateway 中的 Agent**
```bash
# 查看 Gateway 日志
grep -i agent ~/.openclaw/logs/gateway.log

# 检查 Agent 配置
cat ~/.openclaw/agents.json
```

**Step 2: 验证权限**
```bash
# 确认 Token 有权限访问 Agent 列表
# 查看 Gateway 的权限配置
```

**Step 3: 手动触发同步**
```javascript
// 浏览器控制台
await window.autoSync.syncNow()
```

#### 解决方案

**方案 1: 添加 Agent 到 Gateway**
```bash
# 根据 OpenClaw 文档添加 Agent
openclaw agent add --name "Agent1" --model "claude-3-opus"
```

**方案 2: 检查 Agent 状态**
```bash
# 确保 Agent 处于 online 状态
openclaw agent list
```

**方案 3: 重启 Gateway**
```bash
openclaw restart
```

### 4. 连接频繁断开

#### 症状
- 连接建立后很快断开
- 状态在"已连接"和"连接中"之间切换
- 连接质量显示"较差"

#### 诊断步骤

**Step 1: 检查网络稳定性**
```bash
# Ping Gateway 服务器
ping 127.0.0.1

# 检查网络延迟
ping -c 10 127.0.0.1
```

**Step 2: 查看连接质量**
```javascript
// 浏览器控制台
const client = window.getOpenClawWSClient?.()
if (client) {
  console.log('Quality:', client.getConnectionQuality())
}
```

**Step 3: 检查 Gateway 负载**
```bash
# 查看 CPU 和内存使用
top -p $(pgrep openclaw)

# 或使用 htop
htop -p $(pgrep openclaw)
```

#### 解决方案

**方案 1: 调整心跳间隔**
```typescript
// 在代码中修改心跳间隔
// src/services/openclawWebSocket.ts
private startHeartbeat() {
  this.heartbeatInterval = setInterval(() => {
    // ...
  }, 60000) // 改为 60 秒
}
```

**方案 2: 降低同步频率**
```javascript
// 浏览器控制台
window.autoSync.setInterval(10000) // 改为 10 秒
```

**方案 3: 检查防火墙**
```bash
# macOS
sudo pfctl -s rules | grep 18789

# Linux
sudo iptables -L | grep 18789
```

**方案 4: 使用本地连接**
```typescript
// 确保使用 127.0.0.1 而不是 localhost
const config = {
  url: 'ws://127.0.0.1:18789',  // ✅ 推荐
  // url: 'ws://localhost:18789',  // ❌ 可能有 DNS 解析延迟
  token: '...'
}
```

### 5. 消息解析失败

#### 症状
- "Failed to parse message"
- 控制台显示 JSON 解析错误
- 收到未知消息类型

#### 诊断步骤

**Step 1: 查看原始消息**
```javascript
// 在 openclawWebSocket.ts 中添加日志
private handleMessage(data: string) {
  console.log('[DEBUG] Raw message:', data)  // 添加这行
  try {
    const message = JSON.parse(data)
    // ...
  }
}
```

**Step 2: 检查协议版本**
```bash
# 查看 Gateway 版本
openclaw --version

# 查看 AgentForge 版本
cat package.json | grep version
```

**Step 3: 验证消息格式**
```javascript
// 浏览器控制台
// 检查收到的消息是否符合预期格式
```

#### 解决方案

**方案 1: 更新 AgentForge**
```bash
git pull origin main
npm install
npm run build
```

**方案 2: 更新 Gateway**
```bash
# 根据 OpenClaw 文档更新
openclaw update
```

**方案 3: 添加协议适配**
```typescript
// 在 openclawWebSocket.ts 中添加新的消息类型处理
private handleMessage(data: string) {
  try {
    const message = JSON.parse(data)

    // 添加新的消息类型处理
    if (message.type === 'new_type') {
      this.handleNewType(message)
      return
    }

    // ...
  }
}
```

### 6. 自动同步失败

#### 症状
- "Sync failed"
- Agent 数据不更新
- 同步错误计数增加

#### 诊断步骤

**Step 1: 检查同步状态**
```javascript
// 浏览器控制台
const status = window.autoSync.getStatus()
console.log('Sync status:', status)
```

**Step 2: 手动触发同步**
```javascript
// 浏览器控制台
try {
  await window.autoSync.syncNow()
  console.log('Manual sync succeeded')
} catch (error) {
  console.error('Manual sync failed:', error)
}
```

**Step 3: 检查连接状态**
```javascript
// 浏览器控制台
const client = window.getOpenClawWSClient?.()
console.log('Connected:', client?.isConnected())
```

#### 解决方案

**方案 1: 重启自动同步**
```javascript
// 浏览器控制台
window.autoSync.stop()
await new Promise(r => setTimeout(r, 1000))
window.autoSync.start(5000)
```

**方案 2: 调整同步间隔**
```javascript
// 浏览器控制台
window.autoSync.setInterval(10000) // 降低频率
```

**方案 3: 检查错误日志**
```javascript
// 查看控制台中的详细错误信息
// 搜索 "[AutoSync]" 前缀的日志
```

### 7. 配置导入/导出失败

#### 症状
- 导出文件为空
- 导入时提示格式错误
- 配置丢失

#### 诊断步骤

**Step 1: 验证配置格式**
```json
// 正确的配置格式
{
  "id": "config_123",
  "name": "My Config",
  "url": "ws://127.0.0.1:18789",
  "token": "your-token-here",
  "createdAt": "2026-03-16T10:00:00.000Z"
}
```

**Step 2: 检查浏览器权限**
```javascript
// 检查是否允许下载文件
// 查看浏览器设置 -> 下载
```

**Step 3: 验证 localStorage**
```javascript
// 浏览器控制台
const configs = localStorage.getItem('openclaw_configs')
console.log('Saved configs:', JSON.parse(configs))
```

#### 解决方案

**方案 1: 手动导出**
```javascript
// 浏览器控制台
const configs = JSON.parse(localStorage.getItem('openclaw_configs') || '[]')
console.log(JSON.stringify(configs, null, 2))
// 复制输出并保存为 JSON 文件
```

**方案 2: 手动导入**
```javascript
// 浏览器控制台
const config = {
  id: 'manual_' + Date.now(),
  name: 'Manual Config',
  url: 'ws://127.0.0.1:18789',
  token: 'your-token-here',
  createdAt: new Date().toISOString()
}

const configs = JSON.parse(localStorage.getItem('openclaw_configs') || '[]')
configs.push(config)
localStorage.setItem('openclaw_configs', JSON.stringify(configs))
```

**方案 3: 清空并重新配置**
```javascript
// 浏览器控制台
localStorage.removeItem('openclaw_configs')
localStorage.removeItem('openclaw_active_config')
// 然后重新添加配置
```

## 高级诊断

### 启用详细日志

```typescript
// 在 openclawWebSocket.ts 中
private debug = true  // 添加这个标志

private log(...args: any[]) {
  if (this.debug) {
    console.log('[OpenClawWS]', ...args)
  }
}

// 在所有关键位置添加日志
```

### 网络抓包

```bash
# 使用 tcpdump 抓取 WebSocket 流量
sudo tcpdump -i lo0 -A 'port 18789'

# 或使用 Wireshark
# 过滤器: tcp.port == 18789
```

### 性能分析

```javascript
// 浏览器控制台
// 记录性能指标
performance.mark('sync-start')
await window.autoSync.syncNow()
performance.mark('sync-end')
performance.measure('sync-duration', 'sync-start', 'sync-end')
console.log(performance.getEntriesByName('sync-duration'))
```

## 预防措施

### 1. 定期备份配置
```javascript
// 每周导出配置
window.exportAllConfigs()
```

### 2. 监控连接质量
```javascript
// 设置质量监控
const client = getOpenClawWSClient()
client.onQualityChange((quality) => {
  if (quality.status === 'poor') {
    console.warn('Connection quality is poor!')
    // 发送通知
  }
})
```

### 3. 设置错误监听
```javascript
// 监听所有错误
const client = getOpenClawWSClient()
client.onError((error, details) => {
  console.error('OpenClaw Error:', error, details)
  // 记录到日志系统
})
```

### 4. 健康检查
```bash
#!/bin/bash
# health-check.sh

# 检查 Gateway 是否运行
if ! pgrep -f openclaw > /dev/null; then
  echo "Gateway is down, restarting..."
  openclaw start
fi

# 检查端口
if ! lsof -i :18789 > /dev/null; then
  echo "Port 18789 is not listening"
  openclaw restart
fi
```

## 获取帮助

如果以上方法都无法解决问题：

1. **收集诊断信息**
   ```bash
   # Gateway 版本
   openclaw --version

   # 系统信息
   uname -a

   # 日志
   tail -n 100 ~/.openclaw/logs/gateway.log

   # 配置
   cat ~/.openclaw/openclaw.json
   ```

2. **创建 Issue**
   - 访问 GitHub Issues
   - 提供详细的错误信息
   - 附上诊断信息
   - 描述复现步骤

3. **社区支持**
   - Discord/Slack 频道
   - 论坛讨论
   - Stack Overflow

## 紧急恢复

### 完全重置

```bash
# 1. 停止 Gateway
openclaw stop

# 2. 备份数据
cp -r ~/.openclaw ~/.openclaw.backup

# 3. 清空配置
rm -rf ~/.openclaw

# 4. 重新初始化
openclaw init

# 5. 恢复必要的配置
# 手动编辑 ~/.openclaw/openclaw.json
```

### 浏览器端重置

```javascript
// 清空所有 OpenClaw 相关数据
localStorage.removeItem('openclaw_configs')
localStorage.removeItem('openclaw_active_config')

// 刷新页面
location.reload()
```

---

**提示**: 遇到问题时，先查看日志，90% 的问题都能从日志中找到答案！
