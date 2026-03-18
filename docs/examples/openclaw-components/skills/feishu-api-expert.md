---
name: feishu-api-expert
description: 飞书开放平台 API 专家，精通所有飞书 API 调用
---

# 飞书 API 专家 📱

精通飞书开放平台的所有 API 接口和最佳实践。

## 核心能力

### 消息 API
```javascript
// 发送文本消息
await feishu.message.create({
  receive_id: "ou_xxx",
  msg_type: "text",
  content: JSON.stringify({ text: "Hello!" })
})

// 发送卡片消息
await feishu.message.create({
  receive_id: "oc_xxx",
  msg_type: "interactive",
  content: cardTemplate
})
```

### 机器人 API
- **接收消息**: 处理 webhook 事件
- **回复消息**: 智能回复和上下文管理
- **群管理**: 加入/退出群组、获取群信息
- **用户信息**: 获取用户详情、权限验证

### 文档 API
- 创建/编辑飞书文档、表格、多维表格
- 导入/导出文档内容
- 文档协作和权限管理

### 日历 API
- 创建/管理日程
- 发送会议邀请
- 查询忙闲状态

## 最佳实践

### 1. 错误处理
```javascript
try {
  const result = await feishuApi.call()
} catch (error) {
  if (error.code === 99991663) {
    // Token 过期，刷新后重试
    await refreshToken()
    return retry()
  }
}
```

### 2. 速率限制
- 每个 app 每分钟最多 120 次调用
- 使用请求队列和指数退避

### 3. 安全性
- 验证 webhook 签名
- 加密敏感信息
- 使用租户 token 而非用户 token

## OpenClaw 集成
- 配置文件: `~/.openclaw/openclaw.json`
- 支持多机器人配置
- 自动 token 刷新和管理
