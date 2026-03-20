# Offline Storage System

v2.5.0 Phase 2.1 - IndexedDB Implementation

## 概述

AgentForge的离线存储系统提供完整的本地数据缓存功能，支持在无网络环境下继续使用应用，并在恢复连接后自动同步数据。

## 架构

```
┌─────────────────────────────────────────┐
│          React Components               │
│   (AgentList, TaskManager, etc.)        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         React Hooks                     │
│  - useOfflineAgent()                    │
│  - useOfflineTask()                     │
│  - useOnlineStatus()                    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      OfflineStore Service               │
│  (IndexedDB wrapper using 'idb')        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         IndexedDB                       │
│  - agents (ObjectStore)                 │
│  - tasks (ObjectStore)                  │
│  - syncQueue (ObjectStore)              │
│  - metadata (ObjectStore)               │
└─────────────────────────────────────────┘
```

## 核心组件

### 1. OfflineStore (offlineStore.ts)

底层IndexedDB封装服务，提供CRUD操作。

```typescript
import { offlineStore } from './services/offline/offlineStore';

// 初始化（自动执行）
await offlineStore.init();

// 保存Agent
await offlineStore.saveAgent({
  name: 'My Agent',
  level: 1,
  experience: 0,
});

// 获取所有Agents
const agents = await offlineStore.getAllAgents();

// 更新Agent
await offlineStore.updateAgent('agent-id', { level: 5 });

// 删除Agent
await offlineStore.deleteAgent('agent-id');

// 获取统计信息
const stats = await offlineStore.getStats();
console.log(stats.agents, stats.unsyncedAgents);
```

### 2. React Hooks

#### useOfflineAgent()

```typescript
import { useOfflineAgent } from './hooks/useOfflineAgent';

function MyComponent() {
  const {
    agents,        // Agent列表
    loading,       // 加载状态
    error,         // 错误信息
    saveAgent,     // 保存新Agent
    updateAgent,   // 更新Agent
    deleteAgent,   // 删除Agent
    refresh,       // 刷新列表
  } = useOfflineAgent();

  return (
    <div>
      {agents.map(agent => (
        <div key={agent.id}>{agent.name}</div>
      ))}
    </div>
  );
}
```

#### useOfflineTask(agentId?)

```typescript
import { useOfflineTask } from './hooks/useOfflineTask';

function TaskList({ agentId }) {
  const {
    tasks,          // Task列表
    loading,
    error,
    saveTask,       // 保存新Task
    updateTask,     // 更新Task
    deleteTask,     // 删除Task
  } = useOfflineTask(agentId); // 可选：只获取特定Agent的Tasks

  return (
    <div>
      {tasks.map(task => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  );
}
```

#### useOnlineStatus()

```typescript
import { useOnlineStatus, useOnlineStatusCallback } from './hooks/useOnlineStatus';

// 方式1: 仅获取状态
function StatusIndicator() {
  const { isOnline, lastChangeTime } = useOnlineStatus();

  return (
    <div>
      {isOnline ? '🟢 Online' : '🔴 Offline'}
    </div>
  );
}

// 方式2: 监听状态变化并执行回调
function AutoSyncComponent() {
  useOnlineStatusCallback(
    // 上线回调
    () => {
      console.log('Going online - syncing...');
      syncManager.syncAll();
    },
    // 离线回调
    () => {
      console.log('Going offline');
    }
  );

  return <div>Auto-sync enabled</div>;
}
```

## 数据结构

### OfflineAgent

```typescript
interface OfflineAgent {
  // 基本信息
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'paused';
  level: number;
  experience: number;

  // 离线元数据
  _offline: boolean;      // 是否在离线模式下创建
  _synced: boolean;       // 是否已同步到服务器
  _timestamp: number;     // 最后修改时间戳
  _version: number;       // 版本号（用于冲突检测）

  // 原始数据（可选，用于完整恢复）
  originalData?: any;
}
```

### OfflineTask

```typescript
interface OfflineTask {
  // 基本信息
  id: string;
  agentId: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';

  // 离线元数据
  _offline: boolean;
  _synced: boolean;
  _timestamp: number;
  _version: number;

  originalData?: any;
}
```

## 同步队列

所有本地修改都会自动添加到同步队列，等待网络恢复后同步：

```typescript
// 获取同步队列
const queue = await offlineStore.getSyncQueue();

// 队列项结构
interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: 'agents' | 'tasks';
  data: any;
  timestamp: number;
  retries: number;
}

// 清除已同步的项
await offlineStore.clearSyncQueueItem(item.id);
```

## 使用示例

### 完整的离线优先组件

```typescript
import React from 'react';
import { useOfflineAgent } from './hooks/useOfflineAgent';
import { useOnlineStatusCallback } from './hooks/useOnlineStatus';
import { syncManager } from './services/offline/syncManager';

export function OfflineAgentManager() {
  const {
    agents,
    loading,
    saveAgent,
    updateAgent,
    deleteAgent,
    getUnsyncedAgents,
  } = useOfflineAgent();

  const { isOnline } = useOnlineStatusCallback(
    // 上线时自动同步
    async () => {
      const unsynced = await getUnsyncedAgents();
      if (unsynced.length > 0) {
        console.log(`Syncing ${unsynced.length} agents...`);
        await syncManager.syncAll();
      }
    }
  );

  const handleCreate = async () => {
    await saveAgent({
      name: 'New Agent',
      status: 'active',
      level: 1,
      experience: 0,
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* 在线状态指示器 */}
      <div className={isOnline ? 'online' : 'offline'}>
        {isOnline ? 'Online' : 'Offline Mode'}
      </div>

      {/* Agent列表 */}
      <button onClick={handleCreate}>Create Agent</button>

      {agents.map(agent => (
        <div key={agent.id}>
          <h3>{agent.name}</h3>
          {!agent._synced && <span>⏳ Pending sync</span>}
          <button onClick={() => updateAgent(agent.id, { level: agent.level + 1 })}>
            Level Up
          </button>
          <button onClick={() => deleteAgent(agent.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

## 测试

运行单元测试：

```bash
npm test src/services/offline/__tests__/offlineStore.test.ts
npm test src/hooks/__tests__/useOfflineAgent.test.ts
npm test src/hooks/__tests__/useOfflineTask.test.ts
npm test src/hooks/__tests__/useOnlineStatus.test.ts
```

## 性能优化

### 1. 批量操作

```typescript
// ❌ 避免循环中的单个操作
for (const agent of agents) {
  await offlineStore.saveAgent(agent);
}

// ✅ 使用事务批量操作
// TODO v2.5.0 Phase 2.2: 实现批量操作API
```

### 2. 索引查询

```typescript
// ✅ 使用索引查询（快速）
const activeAgents = await db.getAllFromIndex('agents', 'by-status', 'active');

// ❌ 避免全表扫描
const activeAgents = (await offlineStore.getAllAgents()).filter(a => a.status === 'active');
```

### 3. 分页加载

```typescript
// TODO v2.5.0 Phase 2.2: 实现分页查询API
```

## 调试

### 浏览器DevTools

1. 打开Chrome DevTools
2. 进入 Application → Storage → IndexedDB
3. 查看 `AgentForgeOfflineDB` 数据库

### 日志

所有操作都会输出控制台日志：

```javascript
// 启用详细日志
localStorage.setItem('DEBUG', 'offline:*');
```

## 故障排除

### 数据库打不开

```typescript
// 清空数据库重试
await offlineStore.clearAll();
await offlineStore.close();
window.location.reload();
```

### IndexedDB不支持

```typescript
if (!window.indexedDB) {
  console.error('IndexedDB not supported');
  // 回退到localStorage
}
```

### 数据不同步

```typescript
// 检查同步队列
const queue = await offlineStore.getSyncQueue();
console.log('Pending sync:', queue.length);

// 手动触发同步
await syncManager.syncAll();
```

## 已知限制

1. **浏览器存储限制**: IndexedDB通常有50-100MB的限制
2. **跨浏览器差异**: Safari的IndexedDB实现可能有些许不同
3. **隐身模式**: 部分浏览器的隐身模式可能限制IndexedDB功能

## 路线图

- ✅ v2.5.0 Phase 2.1: IndexedDB基础实现
- 🚧 v2.5.0 Phase 2.2: 冲突解决机制
- 🚧 v2.5.0 Phase 2.3: 后台同步API
- 📅 v2.6.0: 批量操作优化
- 📅 v2.6.0: 分页查询支持

## 相关文档

- [API Reference](../../docs/API_REFERENCE_v2.5.0.md)
- [Sync Manager](./syncManager.ts)
- [Testing Guide](../../docs/TESTING_GUIDE.md)

---

**Last Updated**: 2026-03-20
**Version**: v2.5.0 Phase 2.1
**Maintainer**: AgentForge Team
