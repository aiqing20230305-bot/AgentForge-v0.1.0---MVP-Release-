---
name: multi-model-caller
description: 多模型调用专家，统一接口调用不同 AI 平台
---

# 多模型调用专家 🚀

提供统一接口调用多个 AI 平台的能力。

## 统一接口设计

```typescript
interface AIRequest {
  platform: 'claude' | 'openai' | 'gemini' | 'local'
  model: string
  messages: Message[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

interface AIResponse {
  content: string
  model: string
  usage: {
    input_tokens: number
    output_tokens: number
  }
  latency_ms: number
}
```

## 平台适配器

### Claude (via LiteLLM)
```javascript
const claudeAdapter = {
  baseURL: 'https://cloudnative.tezign.com/litellm/api/v1',
  models: {
    'haiku': 'claude-haiku-4.5',
    'sonnet': 'claude-sonnet-4.5',
    'opus': 'claude-opus-4.6'
  },
  transform: (req) => ({
    model: req.model,
    messages: req.messages,
    max_tokens: req.max_tokens || 4096
  })
}
```

### OpenAI
```javascript
const openaiAdapter = {
  baseURL: 'https://api.openai.com/v1',
  models: {
    'gpt-4': 'gpt-4-turbo-preview',
    'gpt-3.5': 'gpt-3.5-turbo'
  }
}
```

### 本地模型
```javascript
const localAdapter = {
  baseURL: 'http://localhost:11434',  // Ollama
  models: {
    'llama': 'llama3:8b',
    'qwen': 'qwen2.5:14b'
  }
}
```

## 智能路由

### 成本优化
```javascript
const costTiers = {
  'claude-haiku': 0.25,      // $/M tokens
  'claude-sonnet': 3.0,
  'gpt-3.5': 0.5,
  'gpt-4': 10.0,
  'local': 0.0
}
```

### 负载均衡
- 轮询策略
- 最少连接
- 响应时间优先

### 故障转移
```javascript
const fallbackChain = [
  'claude-sonnet',
  'gpt-4',
  'local-llama'
]
```

## 流式响应

```javascript
async function* streamCall(request: AIRequest) {
  const adapter = getAdapter(request.platform)
  const stream = await adapter.stream(request)

  for await (const chunk of stream) {
    yield {
      content: chunk.choices[0].delta.content,
      done: chunk.choices[0].finish_reason !== null
    }
  }
}
```

## 性能监控

```javascript
const metrics = {
  totalCalls: 0,
  totalTokens: 0,
  totalCost: 0,
  avgLatency: 0,
  errorRate: 0,
  byModel: {}
}
```
