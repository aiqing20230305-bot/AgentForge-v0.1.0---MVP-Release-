# 数据导出功能文档

## 概述

AgentForge的数据导出功能提供了完整的Agent和Task数据导出/导入解决方案，支持多种格式、数据脱敏和完整性验证。

## 功能特性

### 导出功能
- 导出单个或多个Agents
- 导出单个或多个Tasks
- 完整系统备份（Agents + Tasks）
- 支持JSON、CSV、Markdown三种格式
- 数据脱敏保护敏感信息
- 可配置的元数据包含选项

### 导入功能
- JSON数据导入
- 完整性验证
- 错误和警告提示
- 版本兼容性检查

### UI组件
- 直观的图形界面
- 实时预览
- 一键下载
- 复制到剪贴板

## 快速开始

### 1. 使用UI组件

```tsx
import { ExportPanel } from '@/components/ExportPanel'
import { useState } from 'react'

function MyComponent() {
  const [showExport, setShowExport] = useState(false)
  const agents = [] // 你的agents数据

  return (
    <>
      <button onClick={() => setShowExport(true)}>
        Export Data
      </button>

      {showExport && (
        <ExportPanel
          agents={agents}
          onClose={() => setShowExport(false)}
        />
      )}
    </>
  )
}
```

### 2. 使用工具函数

```typescript
import {
  exportAgents,
  downloadExport
} from '@/utils/dataExporter'

// 导出agents为JSON
const content = exportAgents(agents, {
  format: 'json',
  includeMetadata: true
})

// 下载文件
downloadExport(content, 'my-agents-backup', 'json')
```

## API参考

### 导出函数

#### `exportAgent(agent, options)`
导出单个Agent。

**参数:**
- `agent: Agent` - 要导出的Agent对象
- `options: ExportOptions` - 导出选项

**返回:** `string` - 导出的内容

**示例:**
```typescript
const content = exportAgent(myAgent, {
  format: 'json',
  desensitize: true
})
```

#### `exportAgents(agents, options)`
导出多个Agents。

**参数:**
- `agents: Agent[]` - Agent数组
- `options: ExportOptions` - 导出选项

**返回:** `string` - 导出的内容

#### `exportTask(task, options)`
导出单个Task。

**参数:**
- `task: Task` - 要导出的Task对象
- `options: ExportOptions` - 导出选项

**返回:** `string` - 导出的内容

#### `exportTasks(tasks, options)`
导出多个Tasks。

**参数:**
- `tasks: Task[]` - Task数组
- `options: ExportOptions` - 导出选项

**返回:** `string` - 导出的内容

#### `exportFullBackup(agents, tasks, options)`
导出完整备份。

**参数:**
- `agents: Agent[]` - Agent数组
- `tasks: Task[]` - Task数组
- `options: ExportOptions` - 导出选项

**返回:** `string` - 导出的内容

**示例:**
```typescript
const backup = exportFullBackup(agents, tasks, {
  format: 'json',
  includeMetadata: true,
  desensitize: false
})
```

### 工具函数

#### `downloadExport(content, filename, format)`
触发文件下载。

**参数:**
- `content: string` - 文件内容
- `filename: string` - 文件名（不含扩展名）
- `format: ExportFormat` - 文件格式

**示例:**
```typescript
downloadExport(content, 'backup-2026-03-16', 'json')
```

#### `copyToClipboard(content)`
复制内容到剪贴板。

**参数:**
- `content: string` - 要复制的内容

**返回:** `Promise<void>`

**示例:**
```typescript
await copyToClipboard(exportContent)
```

#### `validateImportData(data)`
验证导入数据。

**参数:**
- `data: any` - 要验证的数据

**返回:**
```typescript
{
  valid: boolean
  errors: string[]
  warnings: string[]
}
```

**示例:**
```typescript
const validation = validateImportData(importedData)
if (validation.valid) {
  // 可以安全导入
} else {
  console.error('Validation errors:', validation.errors)
}
```

## 导出选项

```typescript
interface ExportOptions {
  format: 'json' | 'csv' | 'markdown'
  desensitize?: boolean      // 数据脱敏，默认false
  includeMetadata?: boolean  // 包含元数据，默认true
  dateFormat?: 'iso' | 'locale' // 日期格式，默认locale
}
```

### 格式说明

#### JSON格式
- 最完整的数据保存
- 适合备份和导入
- 保留所有字段和类型信息

**示例输出:**
```json
{
  "id": "agent-001",
  "name": "ATLAS",
  "aiModel": "gpt-4",
  "level": 15,
  ...
}
```

#### CSV格式
- 适合Excel/表格软件
- 适合数据分析
- 多值字段用分号分隔

**示例输出:**
```csv
ID,Name,AI Model,Status,Level
agent-001,ATLAS,gpt-4,idle,15
```

#### Markdown格式
- 适合人类阅读
- 适合文档化
- 包含格式化和emoji

**示例输出:**
```markdown
# Agent: ATLAS

**ID:** `agent-001`
**Model:** gpt-4
**Status:** 🟢 idle
**Level:** 15
```

### 数据脱敏

启用脱敏后，以下信息会被掩码：
- `userId`: "user123" → "us***23"
- `systemPrompt`: 前50个字符 + "... [REDACTED]"
- `executionLog`: 每条日志前50个字符
- `result`: 前50个字符 + "... [REDACTED]"

**使用场景:**
- 分享数据给他人
- 公开展示
- 演示和测试

## 导入验证

### 验证规则

1. **数据结构检查**
   - 确保是有效的JSON对象
   - 检查必需的字段存在

2. **Agent验证**
   - `id` 必填
   - `name` 必填
   - `aiModel` 必填

3. **Task验证**
   - `id` 必填
   - `title` 必填
   - `status` 必填

4. **版本检查**
   - 检查版本号兼容性
   - 版本不匹配时给出警告

### 使用示例

```typescript
import { validateImportData } from '@/utils/dataExporter'

// 读取导入文件
const importedData = JSON.parse(fileContent)

// 验证数据
const validation = validateImportData(importedData)

if (!validation.valid) {
  console.error('导入失败：', validation.errors)
  return
}

if (validation.warnings.length > 0) {
  console.warn('警告：', validation.warnings)
}

// 处理导入
processImportData(importedData)
```

## 完整示例

### 示例1: 导出并下载备份

```typescript
import { exportFullBackup, downloadExport } from '@/utils/dataExporter'
import { useTaskStore } from '@/stores/taskStore'

function BackupButton() {
  const { tasks } = useTaskStore()
  const agents = [] // 从你的store获取

  const handleBackup = () => {
    // 创建备份
    const backup = exportFullBackup(agents, tasks, {
      format: 'json',
      includeMetadata: true,
      desensitize: false
    })

    // 下载文件
    const timestamp = new Date().toISOString().split('T')[0]
    downloadExport(backup, `agentforge-backup-${timestamp}`, 'json')
  }

  return (
    <button onClick={handleBackup}>
      Create Backup
    </button>
  )
}
```

### 示例2: 导出为Markdown并预览

```typescript
import { exportTasks } from '@/utils/dataExporter'

function ExportMarkdownButton({ tasks }) {
  const handleExport = () => {
    const markdown = exportTasks(tasks, {
      format: 'markdown',
      includeMetadata: true,
      dateFormat: 'locale'
    })

    // 显示预览
    showPreviewModal(markdown)
  }

  return (
    <button onClick={handleExport}>
      Export as Markdown
    </button>
  )
}
```

### 示例3: 导出脱敏数据

```typescript
import { exportAgents, copyToClipboard } from '@/utils/dataExporter'

async function ShareAgentsButton({ agents }) {
  const handleShare = async () => {
    // 导出脱敏数据
    const content = exportAgents(agents, {
      format: 'json',
      desensitize: true,
      includeMetadata: false
    })

    // 复制到剪贴板
    await copyToClipboard(content)
    alert('Desensitized data copied to clipboard!')
  }

  return (
    <button onClick={handleShare}>
      Share (Desensitized)
    </button>
  )
}
```

### 示例4: 导入并验证

```typescript
import { validateImportData } from '@/utils/dataExporter'

function ImportButton() {
  const handleImport = async (file: File) => {
    // 读取文件
    const text = await file.text()
    const data = JSON.parse(text)

    // 验证数据
    const validation = validateImportData(data)

    if (!validation.valid) {
      alert('Import failed:\n' + validation.errors.join('\n'))
      return
    }

    if (validation.warnings.length > 0) {
      console.warn('Warnings:', validation.warnings)
    }

    // 导入数据
    importAgents(data.agents)
    importTasks(data.tasks)

    alert('Import successful!')
  }

  return (
    <input
      type="file"
      accept=".json"
      onChange={(e) => {
        const file = e.target.files?.[0]
        if (file) handleImport(file)
      }}
    />
  )
}
```

## 最佳实践

### 1. 定期备份
```typescript
// 设置自动备份
setInterval(() => {
  const backup = exportFullBackup(agents, tasks, {
    format: 'json',
    includeMetadata: true
  })
  saveToLocalStorage('backup', backup)
}, 24 * 60 * 60 * 1000) // 每天备份
```

### 2. 版本控制
```typescript
// 在备份中包含版本信息
const backup = {
  version: '1.0',
  timestamp: new Date().toISOString(),
  data: exportFullBackup(agents, tasks, { format: 'json' })
}
```

### 3. 增量备份
```typescript
// 只备份变更的数据
const lastBackup = loadLastBackup()
const changedAgents = agents.filter(a =>
  a.updatedAt > lastBackup.timestamp
)
```

### 4. 数据加密
```typescript
// 导出敏感数据前加密
import { encrypt } from './crypto'

const backup = exportFullBackup(agents, tasks, { format: 'json' })
const encrypted = encrypt(backup, password)
downloadExport(encrypted, 'secure-backup', 'json')
```

## 错误处理

```typescript
try {
  const content = exportAgents(agents, options)
  downloadExport(content, 'agents', 'json')
} catch (error) {
  if (error instanceof TypeError) {
    console.error('Invalid data format')
  } else if (error instanceof Error) {
    console.error('Export failed:', error.message)
  }
}
```

## 性能优化

### 大数据量处理
```typescript
// 分批导出大量数据
function exportLargeDataset(items: any[], batchSize = 100) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const content = exportAgents(batch, { format: 'json' })
    downloadExport(content, `batch-${i / batchSize}`, 'json')
  }
}
```

### 流式导出
```typescript
// 对于超大数据集，使用流式处理
async function* streamExport(items: any[]) {
  for (const item of items) {
    yield exportAgent(item, { format: 'json' })
  }
}
```

## 故障排除

### 常见问题

**Q: CSV导出中文乱码？**
A: 确保文件使用UTF-8编码保存。Excel打开CSV时可能需要手动指定编码。

**Q: 无法复制到剪贴板？**
A: 确保在用户交互上下文中调用，某些浏览器需要HTTPS。

**Q: 导入验证失败？**
A: 检查JSON格式是否正确，必填字段是否完整。

**Q: 大文件导出卡顿？**
A: 考虑分批导出或使用Web Worker处理。

## 路线图

未来计划的功能：
- [ ] Excel (.xlsx) 格式支持
- [ ] 选择性字段导出
- [ ] 导出模板系统
- [ ] 云端备份集成
- [ ] 增量导入/导出
- [ ] 数据转换规则
- [ ] 导出进度显示

## 贡献

欢迎提交issue和PR来改进导出功能！

## 许可证

MIT License

---

**最后更新:** 2026-03-16
**版本:** 1.0.0
