# OpenClaw 快速参考

## 一分钟快速开始

```bash
# 1. 启动 OpenClaw Gateway
openclaw start

# 2. 在 AgentForge 中
# - 点击右上角状态指示器
# - 输入 URL: ws://127.0.0.1:18789
# - 输入 Token（从 ~/.openclaw/openclaw.json 获取）
# - 点击"立即连接"
```

## 常用命令

### Gateway 管理
```bash
# 启动
openclaw start

# 停止
openclaw stop

# 重启
openclaw restart

# 查看状态
ps aux | grep openclaw

# 查看日志
tail -f ~/.openclaw/logs/gateway.log
```

### 浏览器控制台
```javascript
// 快速测试
await window.testOpenClaw()

// 自动同步控制
window.autoSync.start()
window.autoSync.stop()
window.autoSync.syncNow()
window.autoSync.getStatus()
```

## 配置文件位置

```
~/.openclaw/openclaw.json    # OpenClaw 配置
localStorage                  # AgentForge 配置
```

## 默认配置

```json
{
  "url": "ws://127.0.0.1:18789",
  "token": "your-token-here"
}
```

## 连接状态

| 颜色 | 状态 | 说明 |
|------|------|------|
| 🟢 绿色 | 已连接 | 正常工作 |
| 🟡 黄色 | 连接中 | 正在建立连接 |
| 🔴 红色 | 错误 | 连接失败 |
| ⚪ 灰色 | 未连接 | 本地模式 |

## 连接质量

| 等级 | 延迟 | 说明 |
|------|------|------|
| 优秀 | <200ms | 非常稳定 |
| 良好 | 200-500ms | 稳定 |
| 一般 | 500-1000ms | 可用 |
| 较差 | >1000ms | 不稳定 |

## 常见问题

### 连接失败
1. 检查 Gateway 是否运行
2. 验证 URL 和端口
3. 确认 Token 正确

### Agent 列表为空
1. 确认 Gateway 中有 Agent
2. 检查 Token 权限
3. 手动触发同步

### 频繁断开
1. 检查网络稳定性
2. 查看连接质量
3. 调整同步间隔

## 快捷操作

### 导出配置
1. 点击"导出"按钮
2. 保存 JSON 文件
3. 妥善保管（包含 Token）

### 导入配置
1. 点击"导入"按钮
2. 选择 JSON 文件
3. 自动填充配置

### 手动重连
1. 点击"断开连接"
2. 点击"立即连接"

## 调试技巧

### 查看详细日志
```javascript
// 浏览器控制台
localStorage.debug = 'openclaw:*'
```

### 测试连接
```bash
# 使用测试脚本
node test-openclaw-connection.js
```

### 检查配置
```bash
# 查看 OpenClaw 配置
cat ~/.openclaw/openclaw.json | jq

# 验证 JSON 格式
python -m json.tool ~/.openclaw/openclaw.json
```

## 性能建议

- 同步间隔: 5-10秒（平衡实时性和性能）
- 心跳间隔: 30秒（默认，无需修改）
- 重连次数: 5次（默认，无需修改）

## 安全提示

- ⚠️ 不要分享 Token
- ⚠️ 生产环境使用 WSS
- ⚠️ 定期备份配置
- ⚠️ 妥善保管导出的配置文件

## 支持的消息类型

- ✅ `auth` - 认证
- ✅ `get_agents` - 获取 Agent 列表
- ✅ `ping/pong` - 心跳
- ✅ `event` - 事件消息（已适配）
- ✅ `agent_update` - Agent 更新

## 版本兼容性

| AgentForge | OpenClaw Gateway | 状态 |
|------------|------------------|------|
| v1.0.0+ | v1.0.0+ | ✅ 完全支持 |
| v1.0.0+ | v0.9.x | ⚠️ 部分支持 |
| v1.0.0+ | <v0.9 | ❌ 不支持 |

## 获取帮助

- 📖 完整文档: `docs/OPENCLAW_INTEGRATION.md`
- 🐛 问题反馈: GitHub Issues
- 💬 社区讨论: Discord/Slack

---

**提示**: 将此文档加入书签，方便随时查阅！
