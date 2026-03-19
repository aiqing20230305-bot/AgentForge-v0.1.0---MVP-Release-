# 📚 AgentForge v2.4.0 API参考文档

**版本**: v2.4.0
**最后更新**: 2026-03-19
**Base URL**: `http://localhost:5000/api` (开发环境)

---

## 📋 目录

- [Analytics API](#analytics-api)
  - [Overview](#get-analyticsoverview)
  - [Agent Performance](#get-analyticsagentsperformance)
  - [Task Completion](#get-analyticstaskscompletion)
  - [User Activity](#get-analyticsusersactivity)
  - [Trends](#get-analyticstrends)
  - [Custom Analytics](#get-analyticscustom)
- [Predictive Analytics API](#predictive-analytics-api)
  - [Predictions](#get-analyticspredictions)
  - [Anomalies](#get-analyticsanomalies)
  - [Optimization Suggestions](#get-analyticssuggestions)
- [认证](#认证)
- [错误码](#错误码)

---

## Analytics API

### GET /analytics/overview

获取系统概览数据，包括Agent数量、任务统计、用户活跃度等核心指标。

**Query Parameters**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `timeRange` | string | 否 | week | 时间范围: `day`, `week`, `month`, `year` |
| `teamId` | string | 否 | - | 团队ID（过滤特定团队） |
| `userId` | string | 否 | - | 用户ID（过滤特定用户） |

**Response Example**:

```json
{
  "success": true,
  "data": {
    "metrics": {
      "totalAgents": 42,
      "agentChange": 12.5,
      "totalTasks": 156,
      "taskChange": 8.3,
      "activeUsers": 23,
      "userChange": -2.1,
      "avgResponseTime": 245,
      "responseChange": -5.6
    },
    "summary": {
      "timeRange": "week",
      "startDate": "2026-03-12T00:00:00.000Z",
      "endDate": "2026-03-19T15:30:00.000Z",
      "teamId": null,
      "userId": null
    }
  },
  "timestamp": "2026-03-19T15:30:00.000Z"
}
```

**cURL Example**:

```bash
curl -X GET "http://localhost:5000/api/analytics/overview?timeRange=week"
```

---

### GET /analytics/agents/performance

获取Agent性能排行数据，包括任务完成数、成功率、平均响应时间等。

**Query Parameters**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `timeRange` | string | 否 | week | 时间范围 |
| `limit` | number | 否 | 10 | 返回的Agent数量 |
| `teamId` | string | 否 | - | 团队ID |

**Response Example**:

```json
{
  "success": true,
  "data": {
    "agents": [
      {
        "id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "name": "Agent-001",
        "totalTasks": 45,
        "successTasks": 42,
        "failedTasks": 3,
        "avgTime": 234,
        "successRate": "93.33%",
        "level": 5,
        "experience": 1250
      },
      {
        "id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "name": "Agent-002",
        "totalTasks": 38,
        "successTasks": 36,
        "failedTasks": 2,
        "avgTime": 256,
        "successRate": "94.74%",
        "level": 4,
        "experience": 980
      }
    ],
    "summary": {
      "totalAgents": 2,
      "timeRange": "week",
      "startDate": "2026-03-12T00:00:00.000Z"
    }
  },
  "timestamp": "2026-03-19T15:30:00.000Z"
}
```

**cURL Example**:

```bash
curl -X GET "http://localhost:5000/api/analytics/agents/performance?limit=5&timeRange=week"
```

---

### GET /analytics/tasks/completion

获取任务完成统计，包括各状态任务数量、完成率、每日趋势等。

**Query Parameters**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `timeRange` | string | 否 | week | 时间范围 |
| `teamId` | string | 否 | - | 团队ID |
| `agentId` | string | 否 | - | Agent ID（过滤特定Agent） |

**Response Example**:

```json
{
  "success": true,
  "data": {
    "status": {
      "completed": 142,
      "in_progress": 18,
      "pending": 8,
      "failed": 4
    },
    "total": 172,
    "completionRate": "82.56%",
    "trend": [
      { "date": "03-13", "completed": 18, "failed": 2 },
      { "date": "03-14", "completed": 22, "failed": 1 },
      { "date": "03-15", "completed": 25, "failed": 0 },
      { "date": "03-16", "completed": 20, "failed": 1 },
      { "date": "03-17", "completed": 24, "failed": 0 },
      { "date": "03-18", "completed": 19, "failed": 0 },
      { "date": "03-19", "completed": 14, "failed": 0 }
    ],
    "summary": {
      "timeRange": "week",
      "startDate": "2026-03-12T00:00:00.000Z",
      "teamId": null,
      "agentId": null
    }
  },
  "timestamp": "2026-03-19T15:30:00.000Z"
}
```

**cURL Example**:

```bash
curl -X GET "http://localhost:5000/api/analytics/tasks/completion?timeRange=month"
```

---

### GET /analytics/users/activity

获取用户活动热力图数据，显示用户在不同时间段的活跃程度。

**Query Parameters**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `timeRange` | string | 否 | week | 时间范围 |
| `teamId` | string | 否 | - | 团队ID |

**Response Example**:

```json
{
  "success": true,
  "data": {
    "heatmap": [
      { "day": "周一", "hour": 0, "value": 2 },
      { "day": "周一", "hour": 1, "value": 1 },
      { "day": "周一", "hour": 9, "value": 25 },
      { "day": "周一", "hour": 10, "value": 28 },
      // ... 更多数据点
    ],
    "stats": {
      "totalUsers": 23,
      "activeUsers": 18,
      "dailyActiveUsers": 15,
      "peakHour": 14,
      "peakDay": "周三"
    },
    "summary": {
      "timeRange": "week",
      "startDate": "2026-03-12T00:00:00.000Z",
      "teamId": null
    }
  },
  "timestamp": "2026-03-19T15:30:00.000Z"
}
```

**cURL Example**:

```bash
curl -X GET "http://localhost:5000/api/analytics/users/activity"
```

---

### GET /analytics/trends

获取历史趋势数据，支持多指标同时查询。

**Query Parameters**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `timeRange` | string | 否 | week | 时间范围 |
| `metrics` | string | 否 | agents,tasks | 指标列表（逗号分隔）: `agents`, `tasks`, `users` |
| `teamId` | string | 否 | - | 团队ID |

**Response Example**:

```json
{
  "success": true,
  "data": {
    "trends": [
      { "date": "03-13", "agents": 28, "tasks": 65 },
      { "date": "03-14", "agents": 32, "tasks": 78 },
      { "date": "03-15", "agents": 35, "tasks": 92 },
      { "date": "03-16", "agents": 38, "tasks": 103 },
      { "date": "03-17", "agents": 40, "tasks": 128 },
      { "date": "03-18", "agents": 41, "tasks": 142 },
      { "date": "03-19", "agents": 42, "tasks": 156 }
    ],
    "summary": {
      "metrics": ["agents", "tasks"],
      "timeRange": "week",
      "startDate": "2026-03-12T00:00:00.000Z",
      "teamId": null
    }
  },
  "timestamp": "2026-03-19T15:30:00.000Z"
}
```

**cURL Example**:

```bash
curl -X GET "http://localhost:5000/api/analytics/trends?metrics=agents,tasks,users&timeRange=month"
```

---

### GET /analytics/custom

执行自定义分析查询，支持灵活的过滤和分组。

**Query Parameters**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `metric` | string | **是** | - | 指标类型: `agents`, `tasks`, `users` |
| `timeRange` | string | 否 | week | 时间范围 |
| `groupBy` | string | 否 | - | 分组字段 |
| `filters` | string | 否 | - | 过滤条件（JSON字符串） |

**Response Example**:

```json
{
  "success": true,
  "data": {
    "metric": "agents",
    "data": [
      // 原始数据数组
    ],
    "groupBy": null,
    "filters": {},
    "summary": {
      "timeRange": "week",
      "startDate": "2026-03-12T00:00:00.000Z",
      "resultCount": 42
    }
  },
  "timestamp": "2026-03-19T15:30:00.000Z"
}
```

**cURL Example**:

```bash
curl -X GET 'http://localhost:5000/api/analytics/custom?metric=agents&filters={"status":"active"}'
```

---

## Predictive Analytics API

### GET /analytics/predictions

获取趋势预测数据，预测未来一段时间的指标变化。

**Query Parameters**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `metric` | string | 否 | agents | 预测指标: `agents`, `tasks`, `users`, `performance` |
| `method` | string | 否 | linear | 预测方法: `linear` (线性回归), `ema` (指数移动平均) |
| `futureDays` | number | 否 | 7 | 预测天数 |
| `teamId` | string | 否 | - | 团队ID |

**Response Example**:

```json
{
  "success": true,
  "data": {
    "metric": "agents",
    "method": "linear",
    "futureDays": 7,
    "historicalData": [
      { "date": "03-13", "value": 28 },
      { "date": "03-14", "value": 32 },
      // ... 历史数据
    ],
    "predictions": [
      { "date": "03-20", "value": 45, "confidence": 0.85 },
      { "date": "03-21", "value": 47, "confidence": 0.82 },
      { "date": "03-22", "value": 49, "confidence": 0.79 },
      { "date": "03-23", "value": 51, "confidence": 0.76 },
      { "date": "03-24", "value": 53, "confidence": 0.73 },
      { "date": "03-25", "value": 55, "confidence": 0.70 },
      { "date": "03-26", "value": 57, "confidence": 0.67 }
    ]
  },
  "timestamp": "2026-03-19T15:30:00.000Z"
}
```

**cURL Example**:

```bash
curl -X GET "http://localhost:5000/api/analytics/predictions?metric=tasks&method=ema&futureDays=14"
```

---

### GET /analytics/anomalies

检测数据异常，识别超出正常范围的数据点。

**Query Parameters**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `metric` | string | 否 | agents | 检测指标 |
| `method` | string | 否 | zscore | 检测方法: `zscore` (Z-score), `window` (移动窗口) |
| `threshold` | number | 否 | 2 | 异常阈值（标准差倍数） |
| `teamId` | string | 否 | - | 团队ID |

**Response Example**:

```json
{
  "success": true,
  "data": {
    "metric": "tasks",
    "method": "zscore",
    "threshold": 2,
    "totalDataPoints": 30,
    "anomaliesDetected": 2,
    "anomalies": [
      {
        "date": "03-15",
        "value": 150,
        "zScore": 2.5,
        "deviation": "high",
        "severity": "medium"
      },
      {
        "date": "03-18",
        "value": 30,
        "zScore": -2.2,
        "deviation": "low",
        "severity": "low"
      }
    ]
  },
  "timestamp": "2026-03-19T15:30:00.000Z"
}
```

**cURL Example**:

```bash
curl -X GET "http://localhost:5000/api/analytics/anomalies?metric=tasks&threshold=2.5"
```

---

### GET /analytics/suggestions

获取优化建议，基于当前数据分析提供改进方案。

**Query Parameters**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `teamId` | string | 否 | - | 团队ID |
| `category` | string | 否 | all | 建议类别: `performance`, `efficiency`, `cost`, `quality`, `all` |

**Response Example**:

```json
{
  "success": true,
  "data": {
    "totalSuggestions": 5,
    "suggestions": [
      {
        "type": "performance",
        "priority": "high",
        "title": "优化高负载Agent",
        "description": "Agent-001处理了过多任务，建议分散负载",
        "impact": "预计提升20%整体响应速度",
        "actionItems": [
          "创建2个新Agent分担任务",
          "调整任务分配策略",
          "增加Agent-001的资源配额"
        ]
      },
      {
        "type": "efficiency",
        "priority": "medium",
        "title": "减少任务失败率",
        "description": "任务失败率达到5%，超过正常水平",
        "impact": "预计节省15%重试时间",
        "actionItems": [
          "检查失败任务的共同特征",
          "优化错误处理逻辑",
          "添加任务重试机制"
        ]
      }
    ],
    "category": "all"
  },
  "timestamp": "2026-03-19T15:30:00.000Z"
}
```

**cURL Example**:

```bash
curl -X GET "http://localhost:5000/api/analytics/suggestions?category=performance"
```

---

## 认证

所有API端点都需要认证。当前版本支持以下认证方式：

### JWT Token (推荐)

在请求头中包含JWT token：

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/analytics/overview
```

### Cookie认证

使用session cookie（自动处理）：

```bash
curl --cookie "session=YOUR_SESSION_ID" \
  http://localhost:5000/api/analytics/overview
```

---

## 错误码

| HTTP状态码 | 说明 | 示例 |
|-----------|------|------|
| 200 | 成功 | 请求成功处理 |
| 400 | 请求错误 | 缺少必填参数 |
| 401 | 未认证 | Token无效或过期 |
| 403 | 无权限 | 没有访问该资源的权限 |
| 404 | 未找到 | 资源不存在 |
| 500 | 服务器错误 | 内部错误 |

**错误响应格式**:

```json
{
  "success": false,
  "error": "Failed to get analytics overview",
  "message": "Database connection timeout",
  "timestamp": "2026-03-19T15:30:00.000Z"
}
```

---

## 速率限制

- **默认限制**: 100请求/分钟
- **Pro用户**: 1000请求/分钟
- **Enterprise**: 无限制

超出限制时返回 `429 Too Many Requests`。

---

## 分页

支持分页的端点使用以下参数：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | number | 1 | 页码 |
| `limit` | number | 10 | 每页数量 |

**分页响应格式**:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 最佳实践

1. **使用适当的timeRange**: 减少不必要的数据查询
2. **设置合理的limit**: 避免一次性请求过多数据
3. **缓存结果**: Analytics数据可以缓存5-10秒
4. **批量查询**: 使用trends API一次获取多个指标
5. **处理错误**: 始终检查 `success` 字段

---

## SDK支持

### JavaScript/TypeScript

```typescript
import { getOverview, getAgentPerformance } from './services/analyticsApi'

// 获取概览数据
const overview = await getOverview({ timeRange: 'week' })

// 获取Agent性能
const performance = await getAgentPerformance({ limit: 10 })
```

### Python (规划中)

```python
from agentforge import AnalyticsClient

client = AnalyticsClient(api_key='YOUR_API_KEY')
overview = client.get_overview(time_range='week')
```

---

## 变更日志

### v2.4.0 (2026-03-19)
- ✅ 新增9个Analytics API端点
- ✅ 新增3个预测分析端点
- ✅ 支持MongoDB真实数据查询
- ✅ 支持时间范围过滤
- ✅ 支持团队和用户级别筛选

---

## 支持

- **文档**: https://docs.agentforge.io
- **Issues**: https://github.com/your-repo/AgentForge/issues
- **Discord**: https://discord.gg/agentforge
- **Email**: support@agentforge.io

---

**API文档版本**: v2.4.0
**最后更新**: 2026-03-19
**维护者**: AgentForge Team
