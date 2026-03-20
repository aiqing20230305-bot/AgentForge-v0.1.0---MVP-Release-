# 冲突解决指南

v2.5.0 Phase 2.2 - Conflict Resolution

## 概述

当在离线模式下修改数据，同时服务器上的数据也被修改时，就会产生数据冲突。AgentForge提供了完整的冲突检测和解决机制，确保数据不会丢失。

## 冲突产生场景

### 常见场景

1. **多设备编辑**
   ```
   设备A (离线) → 修改Agent level = 10
   设备B (在线)  → 修改Agent level = 15
   同步时 → 冲突！
   ```

2. **离线时间过长**
   ```
   手机离线 → 修改Task status = "completed"
   同时服务器 → 修改Task status = "in_progress"
   恢复连接 → 冲突！
   ```

3. **时钟不同步**
   ```
   本地时钟错误 → _timestamp差异过大
   系统检测 → 潜在冲突！
   ```

## 冲突检测机制

### 自动检测

AgentForge在以下情况下自动检测冲突：

1. **版本号不匹配**
   ```typescript
   local._version !== remote._version
   ```

2. **时间戳差异过大**
   ```typescript
   Math.abs(local._timestamp - remote._timestamp) > 60000  // 1分钟
   ```

### 检测流程

```
┌─────────────────┐
│  本地数据同步    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 比对版本号/_time │
└────────┬────────┘
         │
    ┌────┴────┐
    │  冲突?  │
    └────┬────┘
         │
    ┌────┴────────┐
    │             │
    ▼             ▼
 无冲突        有冲突
    │             │
    ▼             ▼
 直接同步    创建冲突记录
```

## 解决策略

### 1. 自动合并 (merge_auto)

系统智能合并数据，无需用户干预。

#### 自动合并规则

| 数据类型 | 合并策略 | 示例 |
|---------|---------|------|
| **数值** | 取较大值 | level: max(5, 10) = 10 |
| **数组** | 合并去重 | skills: ['A','B'] + ['B','C'] = ['A','B','C'] |
| **布尔** | 优先true | active: false \|\| true = true |
| **字符串** | 取较长的 | name: len(10) > len(5) → 较长版本 |
| **状态** | 按优先级 | completed > in_progress > pending |

#### 使用示例

```typescript
import { conflictResolver } from './services/offline/conflictResolver';

// 自动解决冲突
const result = await conflictResolver.autoResolve(conflict);

if (result.success) {
  console.log('✅ 自动合并成功');
  console.log('合并数据:', result.mergedData);
} else {
  console.log('❌ 需要手动解决');
  console.log('冲突字段:', result.conflicts);
}
```

### 2. 保留本地版本 (keep_local)

完全保留设备上的数据，覆盖服务器版本。

**适用场景**:
- 确定本地数据更准确
- 服务器数据已过时
- 本地做了重要修改

```typescript
await conflictResolver.manualResolve(
  conflictId,
  'keep_local'
);
```

### 3. 保留服务器版本 (keep_remote)

完全保留服务器上的数据，丢弃本地修改。

**适用场景**:
- 本地修改是错误的
- 服务器数据更权威
- 愿意放弃本地修改

```typescript
await conflictResolver.manualResolve(
  conflictId,
  'keep_remote'
);
```

### 4. 手动合并 (merge_manual)

逐字段选择保留哪个版本，完全控制。

**适用场景**:
- 自动合并失败
- 需要精细控制
- 数据很重要，不能随意决定

```typescript
// 构建合并数据
const mergedData = {
  ...localVersion,
  name: remoteVersion.name,      // 选择服务器的name
  level: localVersion.level,     // 选择本地的level
  // ...
};

await conflictResolver.manualResolve(
  conflictId,
  'merge_manual',
  mergedData
);
```

## 三向合并算法

当有基准版本(base version)时，使用三向合并：

```
┌─────────┐
│ 基准版本 │ (最后一次同步的版本)
│  Base   │
└────┬────┘
     │
  ┌──┴──┐
  │     │
  ▼     ▼
┌────┐ ┌────┐
│本地│ │服务│
│版本│ │器版│
└────┘ └────┘
```

### 合并规则

| 本地改? | 服务器改? | 结果 |
|--------|----------|------|
| ❌ | ❌ | 保持基准版本 |
| ✅ | ❌ | 采用本地版本 |
| ❌ | ✅ | 采用服务器版本 |
| ✅ | ✅ 相同 | 采用任意版本 |
| ✅ | ✅ 不同 | **冲突！需要解决** |

### 示例

```typescript
// 基准版本 (1周前同步)
const base = { name: 'Agent', level: 5, experience: 100 };

// 本地版本 (今天修改)
const local = { name: 'Agent', level: 10, experience: 100 };

// 服务器版本 (昨天修改)
const remote = { name: 'My Agent', level: 5, experience: 200 };

// 三向合并结果
const merged = {
  name: 'My Agent',    // 只有服务器改了 → 采用服务器
  level: 10,           // 只有本地改了 → 采用本地
  experience: 200,     // 只有服务器改了 → 采用服务器
};
```

## React组件使用

### useConflictResolution Hook

```typescript
import { useConflictResolution } from './hooks/useConflictResolution';

function MyComponent() {
  const {
    conflicts,              // 所有冲突
    unresolvedConflicts,    // 未解决的冲突
    loading,
    stats,                  // 统计信息
    autoResolve,            // 自动解决
    manualResolve,          // 手动解决
    resolveAll,             // 批量解决
    clearResolved,          // 清除已解决
    refresh,                // 刷新列表
  } = useConflictResolution();

  // 使用...
}
```

### ConflictList 组件

显示所有冲突列表：

```typescript
import ConflictList from './components/ConflictList';

function App() {
  return (
    <div>
      <ConflictList />
    </div>
  );
}
```

**功能**:
- ✅ 显示所有冲突
- ✅ 统计信息展示
- ✅ 一键自动解决
- ✅ 手动解决按钮
- ✅ 批量操作
- ✅ 已解决冲突历史

### ConflictResolutionModal 组件

手动解决冲突的模态框：

```typescript
import ConflictResolutionModal from './components/ConflictResolutionModal';

function MyComponent() {
  const [selectedConflict, setSelectedConflict] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleResolve = async (strategy, mergedData) => {
    await conflictResolver.manualResolve(
      selectedConflict.id,
      strategy,
      mergedData
    );
    setIsOpen(false);
  };

  return (
    <ConflictResolutionModal
      conflict={selectedConflict}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onResolve={handleResolve}
    />
  );
}
```

**功能**:
- ✅ 4种解决策略选择器
- ✅ 逐字段对比显示
- ✅ 手动合并字段选择
- ✅ 实时预览
- ✅ 冲突字段高亮

## API参考

### ConflictResolver

```typescript
import { conflictResolver } from './services/offline/conflictResolver';
```

#### detectConflict()

检测是否存在冲突：

```typescript
const hasConflict = conflictResolver.detectConflict(localData, remoteData);
```

#### createConflict()

创建冲突记录：

```typescript
const conflict = await conflictResolver.createConflict(
  'agent',           // 类型: 'agent' | 'task'
  localVersion,      // 本地版本
  remoteVersion,     // 服务器版本
  baseVersion?       // 基准版本（可选）
);
```

#### autoResolve()

自动解决冲突：

```typescript
const result = await conflictResolver.autoResolve(conflict);

if (result.success) {
  // 成功合并
  console.log(result.mergedData);
} else {
  // 需要手动解决
  console.log(result.conflicts);  // 冲突字段列表
}
```

#### manualResolve()

手动解决冲突：

```typescript
const result = await conflictResolver.manualResolve(
  conflictId,
  strategy,          // 'keep_local' | 'keep_remote' | 'merge_manual'
  mergedData?,       // 合并数据（merge_manual时必需）
  userId?            // 操作用户ID（可选）
);
```

#### resolveAll()

批量解决所有冲突：

```typescript
const result = await conflictResolver.resolveAll('merge_auto');

console.log(`成功: ${result.resolved}, 失败: ${result.failed}`);
console.log(`剩余: ${result.conflicts.length}`);
```

#### getUnresolvedConflicts()

获取未解决的冲突：

```typescript
const conflicts = await conflictResolver.getUnresolvedConflicts();
```

#### getAllConflicts()

获取所有冲突（包括已解决）：

```typescript
const conflicts = await conflictResolver.getAllConflicts();
```

#### clearResolvedConflicts()

清除已解决的冲突历史：

```typescript
// 清除7天前的已解决冲突
const cleared = await conflictResolver.clearResolvedConflicts(
  Date.now() - 7 * 24 * 60 * 60 * 1000
);
```

#### getConflictStats()

获取冲突统计信息：

```typescript
const stats = await conflictResolver.getConflictStats();

console.log(stats);
// {
//   total: 10,
//   unresolved: 3,
//   resolved: 7,
//   byType: { agent: 6, task: 4 },
//   byStrategy: {
//     keep_local: 2,
//     keep_remote: 1,
//     merge_auto: 3,
//     merge_manual: 1,
//   }
// }
```

## 最佳实践

### 1. 定期清理

```typescript
// 每周清理一次已解决冲突
setInterval(async () => {
  await conflictResolver.clearResolvedConflicts(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  );
}, 7 * 24 * 60 * 60 * 1000);
```

### 2. 优先自动解决

```typescript
// 尝试自动解决，失败再手动
const result = await conflictResolver.autoResolve(conflict);

if (!result.success) {
  // 显示手动解决UI
  showConflictModal(conflict);
}
```

### 3. 批量处理

```typescript
// 用户上线后自动解决所有冲突
window.addEventListener('online', async () => {
  const unresolvedCount = await conflictResolver.getUnresolvedConflicts();

  if (unresolvedCount.length > 0) {
    const result = await conflictResolver.resolveAll('merge_auto');

    if (result.failed > 0) {
      // 通知用户需要手动解决
      showNotification(`${result.failed}个冲突需要手动解决`);
    }
  }
});
```

### 4. 用户通知

```typescript
// 检测到冲突时通知用户
const conflicts = await conflictResolver.getUnresolvedConflicts();

if (conflicts.length > 0) {
  showNotification(
    `检测到${conflicts.length}个数据冲突，点击查看`,
    () => navigateToConflictPage()
  );
}
```

## 故障排除

### 问题1: 冲突无法自动解决

**原因**: 字段类型复杂或无法判断优先级

**解决**:
```typescript
// 使用手动解决
await conflictResolver.manualResolve(
  conflictId,
  'merge_manual',
  mergedData
);
```

### 问题2: 冲突历史占用过多空间

**原因**: 长时间未清理已解决冲突

**解决**:
```typescript
// 清除所有已解决冲突
await conflictResolver.clearResolvedConflicts(0);
```

### 问题3: 频繁产生冲突

**原因**: 多设备频繁编辑同一数据

**建议**:
- 缩短同步间隔
- 使用乐观锁
- 采用分布式协调

## 测试

运行冲突解决测试：

```bash
npm test src/services/offline/__tests__/conflictResolver.test.ts
npm test src/hooks/__tests__/useConflictResolution.test.ts
```

## 相关文档

- [离线存储指南](../src/services/offline/README.md)
- [同步管理文档](SYNC_MANAGER_GUIDE.md)
- [API参考](API_REFERENCE_v2.5.0.md)

---

**最后更新**: 2026-03-20
**版本**: v2.5.0 Phase 2.2
**维护者**: AgentForge Team
