# Agent技能效果系统

## 概述

技能效果系统为AgentForge添加了完整的技能激活、效果处理和可视化功能。Agent可以解锁和激活技能，获得各种增益效果，提升任务执行能力。

## 核心功能

### 1. 技能效果处理器 (`skillEffectProcessor`)

核心服务，负责管理所有技能效果、激活和冷却时间。

```typescript
import { skillEffectProcessor } from '@/services/skillEffectProcessor'
import { SKILLS } from '@/data/skillTree'

// 初始化Agent的技能上下文
const context = skillEffectProcessor.initializeContext(
  'agent-123',
  level: 50,
  unlockedSkills: ['token_saver_1', 'fast_thinker', 'battle_rage']
)

// 计算当前所有激活的技能效果
const effects = skillEffectProcessor.calculateEffects('agent-123', SKILLS)

console.log('Token节省:', effects.tokenReduction, '%')
console.log('速度提升:', effects.speedBoost, '%')
console.log('成功率提升:', effects.successRate, '%')
console.log('经验加成:', effects.expGain, '%')
```

### 2. 技能类型

#### 被动技能 (Passive)
- 永久生效，无需激活
- 解锁后自动应用
- 示例：Token节省者、快速思考、快速学习

#### 主动技能 (Active)
- 需要手动激活
- 有持续时间和冷却时间
- 提供临时强力增益
- 示例：战斗狂怒、专注模式、超级专注

#### 终极技能 (Ultimate)
- 需要高等级解锁
- 提供永久强力效果
- 需要完成前置技能树
- 示例：全知全能、时间大师、神之领域

### 3. 技能效果类型

| 效果类型 | 说明 | 应用场景 |
|---------|------|---------|
| `token_reduction` | 降低Token消耗 | 任务执行 |
| `speed_boost` | 提升执行速度 | 任务执行 |
| `success_rate` | 提升成功率 | 任务执行 |
| `exp_gain` | 增加经验获取 | 任务完成 |
| `attack_boost` | 提升攻击力 | PvP战斗 |
| `defense_boost` | 提升防御力 | PvP战斗 |
| `hp_regen` | HP恢复 | PvP战斗 |

## 使用方法

### 激活主动技能

```typescript
import { skillEffectProcessor } from '@/services/skillEffectProcessor'
import { SKILLS } from '@/data/skillTree'

// 找到要激活的技能
const battleRage = SKILLS.find(s => s.id === 'battle_rage')

// 激活技能
const result = skillEffectProcessor.activateSkill('agent-123', battleRage)

if (result.success) {
  console.log('技能激活成功！')
  console.log('效果:', result.effects)
  console.log('冷却至:', new Date(result.cooldownUntil))
} else {
  console.log('激活失败:', result.message)
}
```

### 检查冷却状态

```typescript
const status = skillEffectProcessor.getCooldownStatus('agent-123', 'battle_rage')

if (status.onCooldown) {
  console.log('冷却中，剩余', status.remainingSeconds, '秒')
} else {
  console.log('技能已就绪')
}
```

### 应用效果到任务

```typescript
// 在任务执行前
const effects = skillEffectProcessor.calculateEffects('agent-123', SKILLS)
const modifiedTask = skillEffectProcessor.applyEffectsToTask('agent-123', task, effects)

// 任务现在会使用修改后的Token消耗和执行时间
console.log('原始Token:', task.tokenMetrics.estimatedTokens)
console.log('修改后Token:', modifiedTask.tokenMetrics.estimatedTokens)
```

### 应用效果到结果

```typescript
// 任务完成后
const baseExp = 100
const baseSuccessRate = 80

const result = skillEffectProcessor.applyEffectsToResult(
  effects,
  baseExp,
  baseSuccessRate
)

console.log('基础经验:', baseExp)
console.log('实际经验:', result.exp)
console.log('成功率:', result.successRate, '%')
```

## UI组件

### 1. SkillActivationPanel

显示所有可激活的主动技能，带冷却时间显示。

```tsx
import { SkillActivationPanel } from '@/components/SkillActivationPanel'

<SkillActivationPanel
  agentId="agent-123"
  agentLevel={50}
  unlockedSkills={['battle_rage', 'focus_mode']}
  onSkillActivated={(skillId, success, message) => {
    console.log(`技能 ${skillId}:`, message)
  }}
/>
```

### 2. SkillEffectDisplay

显示当前激活的技能效果，带粒子动画。

```tsx
import { SkillEffectDisplay } from '@/components/SkillEffectDisplay'

const activeSkills = skillEffectProcessor.getActiveSkills('agent-123')

<SkillEffectDisplay
  agentId="agent-123"
  activeSkills={activeSkills}
/>
```

### 3. SkillEffectsSummary

显示所有效果的汇总统计。

```tsx
import { SkillEffectsSummary } from '@/components/SkillEffectsSummary'

const effects = skillEffectProcessor.calculateEffects('agent-123', SKILLS)

<SkillEffectsSummary
  effects={effects}
  compact={false}
/>
```

## 集成到任务执行

技能效果已自动集成到任务执行系统：

```typescript
import { taskExecutor } from '@/services/taskExecutor'

// 执行任务时传入Agent的已解锁技能
await taskExecutor.executeTask({
  task: myTask,
  agentLevel: 50,
  unlockedSkills: ['token_saver_1', 'fast_thinker', 'battle_rage'],
  onProgress: (progress) => console.log('进度:', progress),
  onComplete: (success, result, error) => {
    console.log('完成:', success)
  },
  onLog: (log) => console.log('日志:', log)
})
```

任务执行器会自动：
1. 初始化技能上下文
2. 计算当前效果
3. 应用效果到任务
4. 在日志中显示效果
5. 应用效果到结果

## 技能配置

### 添加新技能

在 `src/data/skillTree.ts` 中添加：

```typescript
{
  id: 'my_new_skill',
  name: '我的新技能',
  description: '这是一个新技能',
  icon: '🔥',
  category: 'active', // passive | active | ultimate
  branch: 'efficiency', // efficiency | combat | learning | precision | ultimate
  maxLevel: 1,
  unlockLevel: 20,
  requiredSkills: ['prerequisite_skill'],
  effects: [
    { type: 'speed_boost', value: 30, duration: 45 }
  ],
  cost: 3,
  cooldown: 90, // 冷却时间（秒）
  manaCost: 40, // 能量消耗
  visualEffect: {
    color: '#f59e0b',
    particleCount: 100,
    animationType: 'spiral'
  }
}
```

### 视觉效果配置

支持的动画类型：
- `pulse`: 脉冲扩散
- `explosion`: 爆炸效果
- `spiral`: 螺旋上升
- `beam`: 光束
- `nova`: 新星爆发

## 性能优化

### 1. 上下文缓存
技能上下文在内存中缓存，避免重复初始化。

### 2. 自动清理
过期的激活技能和冷却时间自动清理。

### 3. 增量更新
只在技能状态改变时重新计算效果。

## 测试

运行单元测试：

```bash
npm test skillEffectProcessor.test.ts
```

测试覆盖：
- ✅ 上下文管理
- ✅ 效果计算
- ✅ 技能激活
- ✅ 冷却管理
- ✅ 任务应用
- ✅ 视觉效果生成

## 后续扩展

### 计划功能
1. 技能组合效果（Combo）
2. 技能升级系统
3. 技能装备系统
4. 技能预设（Build）
5. 技能成就系统
6. 实时PvP技能对战

### API扩展
1. 技能推荐系统
2. 技能效果预测
3. 技能优化建议
4. 技能使用统计

## 注意事项

1. **技能解锁检查**：激活技能前务必检查Agent是否已解锁
2. **冷却管理**：UI应实时显示冷却状态，避免重复激活
3. **效果叠加**：多个技能的相同类型效果会叠加
4. **上下文清理**：Agent删除时应调用 `resetContext()`
5. **持久化**：技能状态需要持久化到数据库/存储

## 示例场景

### 场景1: 执行大型任务

```typescript
// 1. 激活专注模式（速度+50%，Token-20%）
skillEffectProcessor.activateSkill(agentId, focusModeSkill)

// 2. 执行任务
const effects = skillEffectProcessor.calculateEffects(agentId, SKILLS)
// 效果: Token节省 20%, 速度提升 50%

// 3. 任务完成更快，花费更少
```

### 场景2: PvP战斗

```typescript
// 1. 激活战斗狂怒（攻击+50%）
skillEffectProcessor.activateSkill(agentId, battleRageSkill)

// 2. 进入战斗
const effects = skillEffectProcessor.calculateEffects(agentId, SKILLS)
// 攻击力暂时翻倍

// 3. 30秒后效果消失，进入冷却
```

### 场景3: 经验刷取

```typescript
// 解锁被动技能：快速学习、知识大师
// 效果: 永久+70%经验获取

const effects = skillEffectProcessor.calculateEffects(agentId, SKILLS)
// effects.expGain = 70
// effects.totalExpMultiplier = 1.7

// 每个任务获得1.7倍经验
```

## 贡献

欢迎提交PR改进技能系统！

1. 添加新技能
2. 优化效果算法
3. 改进UI组件
4. 添加新的效果类型
5. 完善文档

---

**版本**: 1.0.0
**最后更新**: 2026-03-16
