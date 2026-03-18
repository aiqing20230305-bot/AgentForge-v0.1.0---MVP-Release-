# 核心进化系统（Heart System）设计文档

**版本:** v1.2.0
**设计时间:** 2026-03-15
**目标:** 实现Agent持续进化的核心引擎

---

## 🎯 系统概览

**核心理念：** Agent如同生命体，拥有"心脏"作为核心驱动力，持续监控、评估、进化。

**双核心架构：**
1. **心跳监控系统（Heartbeat Monitoring）** - 实时健康检查
2. **进化引擎（Evolution Engine）** - 自动优化和成长

---

## 🫀 系统1：心跳监控系统（Heartbeat Monitoring System）

### 核心功能

1. **实时健康检查**
   - 每30秒一次心跳（可配置）
   - 监控CPU/内存/Token使用率
   - 检测任务队列状态
   - 识别异常行为

2. **生命力指标（Vitality）**
   - 0-100综合健康度
   - 实时显示心跳动画
   - 颜色编码：绿色(>70) / 黄色(40-70) / 红色(<40)

3. **状态分类**
   - `healthy` - 健康（生命力>70）
   - `warning` - 警告（生命力40-70）
   - `critical` - 危急（生命力<40）
   - `offline` - 离线

4. **告警机制**
   - 生命力低于阈值触发通知
   - 连续心跳失败告警
   - 资源过载警告

### 数据模型

```typescript
interface HeartbeatData {
  agentId: string
  timestamp: string
  vitality: number              // 0-100
  heartRate: number             // 心跳频率（次/分钟）
  status: 'healthy' | 'warning' | 'critical' | 'offline'

  metrics: {
    taskQueueLength: number
    avgTaskDuration: number
    tokenUsageRate: number      // Token/小时
    successRate: number         // 成功率百分比
    idleTime: number           // 闲置时间（秒）
  }

  warnings: string[]           // 警告列表
}

interface HeartbeatHistory {
  agentId: string
  records: HeartbeatData[]     // 最近100次心跳
  firstBeat: string
  totalBeats: number
}
```

### 生命力计算公式

```typescript
function calculateVitality(agent: AgentData): number {
  let vitality = 100

  // 任务成功率影响（最大-30）
  if (agent.stats.successRate < 70) {
    vitality -= (70 - agent.stats.successRate) * 0.5
  }

  // Token效率影响（最大-20）
  const tokenEfficiency = agent.energyStats.tokensUsedToday / agent.energyBudget.dailyLimit
  if (tokenEfficiency > 0.8) {
    vitality -= (tokenEfficiency - 0.8) * 100
  }

  // 闲置时间影响（最大-20）
  const idleHours = (Date.now() - new Date(agent.metadata.lastActiveAt).getTime()) / 3600000
  if (idleHours > 24) {
    vitality -= Math.min(20, idleHours - 24)
  }

  // 任务队列压力（最大-15）
  const queuePressure = agent.tasks.filter(t => t.status === 'pending').length
  if (queuePressure > 10) {
    vitality -= Math.min(15, (queuePressure - 10) * 1.5)
  }

  // 错误率影响（最大-15）
  const errorRate = agent.stats.failedTasks / agent.stats.totalTasks
  if (errorRate > 0.1) {
    vitality -= errorRate * 150
  }

  return Math.max(0, Math.min(100, vitality))
}
```

---

## 🧬 系统2：进化引擎（Evolution Engine）

### 核心功能

1. **自动进化检测**
   - 每小时评估一次进化机会
   - 基于历史数据分析趋势
   - 识别优化潜力

2. **进化点系统**
   - 完成任务获得进化点
   - 高难度任务获得更多
   - 累积进化点触发进化

3. **进化类型**
   - **效率进化** - 提升任务执行速度
   - **智慧进化** - 减少Token消耗
   - **专精进化** - 某类任务成功率提升
   - **技能升级** - 自动升级已有技能
   - **新技能解锁** - 达到条件解锁新技能

4. **自适应优化**
   - 根据使用模式调整参数
   - 动态平衡性能和成本
   - 自动负载均衡

### 数据模型

```typescript
interface EvolutionSystem {
  agentId: string
  evolutionPoints: number       // 当前进化点
  evolutionLevel: number        // 进化等级（0-10）
  totalEvolutions: number       // 总进化次数

  history: EvolutionEvent[]
  nextEvolution: {
    type: string
    requiredPoints: number
    estimatedImpact: string
  } | null

  autoEvolutionEnabled: boolean
}

interface EvolutionEvent {
  id: string
  timestamp: string
  type: 'efficiency' | 'wisdom' | 'specialization' | 'skill_upgrade' | 'skill_unlock'
  category: string

  trigger: {
    type: 'auto' | 'manual'
    reason: string
    dataPoints: any[]
  }

  changes: {
    before: any
    after: any
    impact: {
      performance: number      // -100 to +100
      cost: number            // -100 to +100
      capability: number      // -100 to +100
    }
  }

  result: 'success' | 'partial' | 'failed'
  feedback: string
}
```

### 进化规则引擎

```typescript
interface EvolutionRule {
  id: string
  name: string
  description: string

  condition: {
    minLevel: number
    minEvolutionPoints: number
    customConditions: (agent: AgentData) => boolean
  }

  action: {
    type: 'stat_boost' | 'skill_upgrade' | 'new_ability'
    parameters: any
    cost: number              // 消耗进化点
  }

  impact: {
    vitality: number          // 对生命力的影响
    efficiency: number        // 对效率的影响
    cost: number             // 对成本的影响
  }
}

// 示例规则
const evolutionRules: EvolutionRule[] = [
  {
    id: 'efficiency_boost_1',
    name: '效率提升 I',
    description: '连续20个任务平均耗时减少10%，自动提升速度',
    condition: {
      minLevel: 5,
      minEvolutionPoints: 100,
      customConditions: (agent) => {
        const recent20 = agent.taskHistory.slice(-20)
        const avg = recent20.reduce((s, t) => s + t.duration, 0) / 20
        const previous20 = agent.taskHistory.slice(-40, -20)
        const prevAvg = previous20.reduce((s, t) => s + t.duration, 0) / 20
        return (prevAvg - avg) / prevAvg >= 0.1
      }
    },
    action: {
      type: 'stat_boost',
      parameters: { stat: 'speed', amount: 10 },
      cost: 100
    },
    impact: {
      vitality: 5,
      efficiency: 15,
      cost: -5
    }
  },

  {
    id: 'token_optimization_1',
    name: 'Token优化 I',
    description: 'Token使用效率持续优秀，减少10%消耗',
    condition: {
      minLevel: 3,
      minEvolutionPoints: 50,
      customConditions: (agent) => {
        const usage = agent.energyStats.tokensUsedToday
        const budget = agent.energyBudget.dailyLimit
        return usage / budget < 0.7
      }
    },
    action: {
      type: 'stat_boost',
      parameters: { stat: 'tokenEfficiency', amount: 10 },
      cost: 50
    },
    impact: {
      vitality: 3,
      efficiency: 5,
      cost: 20
    }
  },

  {
    id: 'specialization_coding',
    name: '编码专精',
    description: '编码任务成功率>90%，专精该领域',
    condition: {
      minLevel: 10,
      minEvolutionPoints: 200,
      customConditions: (agent) => {
        const codingTasks = agent.taskHistory.filter(t => t.category === 'coding')
        if (codingTasks.length < 50) return false
        const successRate = codingTasks.filter(t => t.status === 'completed').length / codingTasks.length
        return successRate >= 0.9
      }
    },
    action: {
      type: 'new_ability',
      parameters: { ability: 'coding_master', bonus: 25 },
      cost: 200
    },
    impact: {
      vitality: 10,
      efficiency: 30,
      cost: -10
    }
  }
]
```

---

## 🎨 UI组件设计

### 1. HeartbeatIndicator（心跳指示器）

**位置：** Agent卡片右上角
**功能：**
- 脉冲动画（模拟心跳）
- 颜色随生命力变化
- 悬停显示详细指标
- 点击打开详情面板

```typescript
<HeartbeatIndicator
  vitality={agent.coreEvolution.vitality}
  heartRate={agent.coreEvolution.heartRate}
  status={agent.coreEvolution.healthStatus}
  onClick={() => openHeartbeatPanel(agent)}
/>
```

**视觉效果：**
```
健康(>70):  ❤️  (绿色脉冲，慢速)
警告(40-70): 💛 (黄色脉冲，中速)
危急(<40):  ❤️‍🩹 (红色脉冲，快速)
离线:       💔 (灰色，无动画)
```

---

### 2. VitalityGauge（生命力仪表盘）

**位置：** SettingsPanel新标签页
**功能：**
- 圆形进度环显示生命力
- 实时心跳波形图
- 关键指标卡片
- 历史趋势图表

```typescript
<VitalityGauge
  vitality={agent.coreEvolution.vitality}
  heartbeatHistory={heartbeatHistory}
  metrics={currentMetrics}
/>
```

---

### 3. EvolutionTimeline（进化时间轴）

**位置：** Agent详情面板
**功能：**
- 时间轴展示所有进化事件
- 进化前后对比
- 影响分析图表
- 手动触发进化按钮

```typescript
<EvolutionTimeline
  evolutionHistory={agent.coreEvolution.evolutionHistory}
  currentPoints={agent.coreEvolution.evolutionPoints}
  nextEvolution={agent.coreEvolution.nextEvolution}
  onManualEvolve={handleManualEvolve}
/>
```

---

### 4. HeartbeatMonitorPanel（心跳监控面板）

**位置：** 全局顶部工具栏
**功能：**
- 所有Agent心跳概览
- 异常Agent高亮
- 一键健康检查
- 批量优化建议

---

## 🔧 系统架构

### 服务层

```typescript
// /src/services/evolution/heartbeatService.ts
export class HeartbeatService {
  private intervalId: NodeJS.Timeout | null = null
  private heartbeatInterval = 30000  // 30秒

  start(): void {
    this.intervalId = setInterval(() => {
      this.performHeartbeat()
    }, this.heartbeatInterval)
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
  }

  private async performHeartbeat(): Promise<void> {
    const agents = useDataSourceStore.getState().agentsCache

    for (const agent of agents) {
      const vitality = calculateVitality(agent)
      const heartbeatData: HeartbeatData = {
        agentId: agent.id,
        timestamp: new Date().toISOString(),
        vitality,
        heartRate: this.calculateHeartRate(vitality),
        status: this.getHealthStatus(vitality),
        metrics: this.collectMetrics(agent),
        warnings: this.detectWarnings(agent, vitality)
      }

      this.saveHeartbeat(heartbeatData)

      // 触发告警
      if (heartbeatData.status === 'critical') {
        notificationService.notify({
          title: `Agent ${agent.name} 生命力危急！`,
          message: `当前生命力: ${vitality}%`,
          type: 'warning',
          agentId: agent.id
        })
      }
    }
  }

  private calculateHeartRate(vitality: number): number {
    // 生命力越低，心跳越快（压力反应）
    return Math.round(60 + (100 - vitality) * 0.5)
  }

  private getHealthStatus(vitality: number): HeartbeatData['status'] {
    if (vitality > 70) return 'healthy'
    if (vitality > 40) return 'warning'
    return 'critical'
  }
}

// /src/services/evolution/evolutionEngine.ts
export class EvolutionEngine {
  private checkInterval = 3600000  // 1小时

  start(): void {
    setInterval(() => {
      this.checkEvolutionOpportunities()
    }, this.checkInterval)
  }

  private async checkEvolutionOpportunities(): Promise<void> {
    const agents = useDataSourceStore.getState().agentsCache

    for (const agent of agents) {
      if (!agent.coreEvolution?.autoEvolutionEnabled) continue

      const eligibleRules = evolutionRules.filter(rule =>
        this.canEvolve(agent, rule)
      )

      for (const rule of eligibleRules) {
        const success = await this.applyEvolution(agent, rule)
        if (success) {
          notificationService.notify({
            title: `🧬 ${agent.name} 进化成功！`,
            message: rule.name,
            type: 'success',
            agentId: agent.id
          })
        }
      }
    }
  }

  private canEvolve(agent: AgentData, rule: EvolutionRule): boolean {
    if (agent.level < rule.condition.minLevel) return false
    if (agent.coreEvolution.evolutionPoints < rule.condition.minEvolutionPoints) return false
    return rule.condition.customConditions(agent)
  }

  private async applyEvolution(agent: AgentData, rule: EvolutionRule): Promise<boolean> {
    try {
      const before = { ...agent }

      // 应用进化
      switch (rule.action.type) {
        case 'stat_boost':
          this.applyStatBoost(agent, rule.action.parameters)
          break
        case 'skill_upgrade':
          this.upgradeSkill(agent, rule.action.parameters)
          break
        case 'new_ability':
          this.unlockAbility(agent, rule.action.parameters)
          break
      }

      // 扣除进化点
      agent.coreEvolution.evolutionPoints -= rule.action.cost
      agent.coreEvolution.totalEvolutions++

      // 记录进化事件
      const event: EvolutionEvent = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        type: this.getEvolutionType(rule),
        category: rule.id,
        trigger: {
          type: 'auto',
          reason: rule.description,
          dataPoints: []
        },
        changes: {
          before,
          after: agent,
          impact: rule.impact
        },
        result: 'success',
        feedback: `成功进化：${rule.name}`
      }

      agent.coreEvolution.evolutionHistory.push(event)

      // 更新生命力
      agent.coreEvolution.vitality = Math.min(100, agent.coreEvolution.vitality + rule.impact.vitality)

      // 保存更新
      useDataSourceStore.getState().updateAgentData(agent.id, agent)

      return true
    } catch (error) {
      console.error('Evolution failed:', error)
      return false
    }
  }
}

// /src/services/evolution/vitalityMonitor.ts
export class VitalityMonitor {
  getVitalityReport(agentId: string): VitalityReport {
    const history = this.getHeartbeatHistory(agentId)
    const current = history[history.length - 1]

    return {
      current: current.vitality,
      trend: this.calculateTrend(history),
      recommendations: this.generateRecommendations(current),
      predictions: this.predictFutureVitality(history)
    }
  }

  private calculateTrend(history: HeartbeatData[]): 'improving' | 'stable' | 'declining' {
    if (history.length < 10) return 'stable'

    const recent5 = history.slice(-5).reduce((s, h) => s + h.vitality, 0) / 5
    const previous5 = history.slice(-10, -5).reduce((s, h) => s + h.vitality, 0) / 5

    if (recent5 > previous5 + 5) return 'improving'
    if (recent5 < previous5 - 5) return 'declining'
    return 'stable'
  }

  private generateRecommendations(heartbeat: HeartbeatData): string[] {
    const recommendations: string[] = []

    if (heartbeat.metrics.taskQueueLength > 20) {
      recommendations.push('任务队列过长，建议增加自动执行或分配给其他Agent')
    }

    if (heartbeat.metrics.tokenUsageRate > heartbeat.metrics.tokenBudget * 0.9) {
      recommendations.push('Token使用接近预算，建议优化提示词或调整预算')
    }

    if (heartbeat.metrics.successRate < 70) {
      recommendations.push('成功率偏低，建议检查任务难度或技能配置')
    }

    if (heartbeat.metrics.idleTime > 86400) {
      recommendations.push('Agent闲置超过1天，考虑分配新任务或调整优先级')
    }

    return recommendations
  }
}
```

---

## 📊 存储设计

### LocalStorage结构

```typescript
// 心跳历史（每个Agent独立）
localStorage.setItem('heartbeat_history_' + agentId, JSON.stringify({
  agentId,
  records: HeartbeatData[],  // 最近100次
  firstBeat: string,
  totalBeats: number
}))

// 进化历史（每个Agent独立）
localStorage.setItem('evolution_history_' + agentId, JSON.stringify({
  agentId,
  events: EvolutionEvent[],  // 所有进化事件
  totalEvolutions: number,
  lastEvolution: string
}))

// 全局配置
localStorage.setItem('evolution_config', JSON.stringify({
  heartbeatInterval: 30000,
  evolutionCheckInterval: 3600000,
  autoEvolutionEnabled: true,
  notificationsEnabled: true
}))
```

---

## 🎯 实施计划

### Phase 1: 基础框架（1小时）
1. 数据模型扩展（AgentData添加coreEvolution字段）
2. HeartbeatService基础实现
3. 生命力计算函数
4. localStorage存储

### Phase 2: 心跳监控（1小时）
1. HeartbeatIndicator组件
2. VitalityGauge组件
3. 实时心跳动画
4. 告警通知

### Phase 3: 进化引擎（2小时）
1. EvolutionEngine实现
2. 进化规则定义（至少5条）
3. EvolutionTimeline组件
4. 进化点系统

### Phase 4: UI集成（1小时）
1. 集成到Agent卡片
2. 添加到SettingsPanel
3. 全局监控面板
4. 测试和优化

**总预计时间:** 5小时
**优先级:** 高
**依赖:** 无

---

## 🚀 预期效果

1. **用户体验：**
   - Agent状态可视化
   - 实时健康监控
   - 自动优化建议

2. **系统稳定性：**
   - 早期异常检测
   - 自动负载均衡
   - 性能持续优化

3. **游戏化增强：**
   - 进化系统增加趣味性
   - 生命力指标提升沉浸感
   - 成就感和成长感

4. **长期价值：**
   - Agent能力持续增长
   - 系统自我优化
   - 用户参与度提升

---

**设计文档版本:** v1.0
**状态:** 待实施
**预计完成:** v1.2.0里程碑
