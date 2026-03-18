# AI Agent 训练和优化平台

完整的AI Agent训练、评估和部署解决方案。

## 功能概述

### 1. 数据集管理 📊

强大的数据集管理系统，支持数据集的完整生命周期管理。

#### 核心功能

- **数据集创建和组织**
  - 创建自定义数据集
  - 支持多种数据格式（JSON、JSONL、CSV）
  - 数据集元数据管理（领域、语言、标签）

- **数据标注**
  - 灵活的标注系统
  - 多种标注类型（分类、实体、情感、质量）
  - 质量评分（0-1分制）

- **版本控制**
  - 自动版本管理（语义化版本）
  - 版本历史追踪
  - 变更记录

- **数据过滤和搜索**
  - 按质量过滤
  - 按标签过滤
  - 全文搜索

- **导入导出**
  - JSON格式导出
  - JSONL格式导出
  - CSV格式导出
  - 批量导入

#### 使用示例

```typescript
import { datasetManager } from './services/training';

// 创建数据集
const dataset = datasetManager.createDataset(
  'customer-support',
  '客户支持对话数据集',
  {
    source: 'production',
    domain: 'customer-service',
    language: 'zh-CN',
    tags: ['dialogue', 'support']
  }
);

// 添加数据点
datasetManager.addDataPoint(dataset.id, {
  input: '如何重置密码？',
  output: '请点击登录页面的"忘记密码"链接...',
  metadata: {
    source: 'ticket-12345',
    timestamp: Date.now(),
    quality: 0.95,
    tags: ['password', 'reset']
  }
});

// 标注数据点
datasetManager.annotateDataPoint(
  dataset.id,
  dataPointId,
  {
    annotator: 'user@example.com',
    type: 'quality',
    value: 'excellent',
    confidence: 0.9
  }
);

// 导出数据集
const exported = datasetManager.exportDataset(dataset.id, 'json');
```

### 2. 模型训练 🎯

完整的训练引擎，支持微调和Prompt优化。

#### 核心功能

- **训练配置**
  - 超参数配置（学习率、批大小、轮数）
  - 优化器选择（Adam、SGD、AdamW）
  - 学习率调度（线性、余弦、常数）

- **实时监控**
  - 训练进度追踪
  - 实时指标更新
  - 训练曲线可视化

- **检查点管理**
  - 自动保存检查点
  - 最佳模型标记
  - 检查点恢复

- **早停机制**
  - 可配置的耐心值
  - 自动停止过拟合训练

- **Prompt优化**
  - 遗传算法优化
  - 自动Prompt生成
  - A/B测试验证

#### 使用示例

```typescript
import { trainingEngine } from './services/training';

// 创建训练任务
const job = trainingEngine.createTrainingJob(
  'sentiment-analysis-v1',
  datasetId,
  {
    modelType: 'fine-tuning',
    baseModel: 'claude-3-sonnet',
    hyperparameters: {
      learningRate: 0.0001,
      batchSize: 32,
      epochs: 10,
      warmupSteps: 100,
      weightDecay: 0.01
    },
    optimization: {
      optimizer: 'adamw',
      scheduler: 'cosine',
      earlyStoppingPatience: 3
    },
    dataConfig: {
      maxInputLength: 512,
      maxOutputLength: 128,
      shuffleData: true,
      augmentation: true
    }
  }
);

// 启动训练
await trainingEngine.startTraining(job.id);

// 监控进度
const currentJob = trainingEngine.getTrainingJob(job.id);
console.log(`Progress: ${currentJob.progress.percentage}%`);
console.log(`Current Loss: ${currentJob.metrics.loss[currentJob.metrics.loss.length - 1]}`);

// 暂停/恢复训练
trainingEngine.pauseTraining(job.id);
await trainingEngine.resumeTraining(job.id);

// Prompt优化
const template = trainingEngine.createPromptTemplate(
  'customer-support',
  'You are a helpful customer support agent. {context}',
  ['context']
);

const optimized = await trainingEngine.optimizePrompt(
  template.id,
  testCases
);
```

### 3. 性能评估 📈

全面的评估系统，支持自动化测试和A/B测试。

#### 核心功能

- **测试套件**
  - 创建测试套件
  - 管理测试用例
  - 按难度分类

- **评估指标**
  - 准确率、精确率、召回率、F1分数
  - BLEU、ROUGE评分
  - 延迟和吞吐量
  - 困惑度

- **A/B测试**
  - 多变体对比
  - 流量分配控制
  - 统计显著性检验
  - 自动获胜者选择

- **模型对比**
  - 多模型并行评估
  - 性能对比可视化
  - 基准测试

#### 使用示例

```typescript
import { evaluationSystem } from './services/training';

// 创建测试套件
const testSuite = evaluationSystem.createTestSuite(
  'accuracy-test',
  '准确性测试套件',
  [
    {
      input: { text: 'What is AI?' },
      expectedOutput: 'AI stands for Artificial Intelligence...',
      metadata: {
        category: 'definition',
        difficulty: 'easy',
        tags: ['ai', 'basics']
      }
    }
  ]
);

// 运行评估
const result = await evaluationSystem.runEvaluation(
  testSuite.id,
  modelId
);

console.log('Evaluation Results:');
console.log(`Accuracy: ${result.metrics.accuracy}`);
console.log(`F1 Score: ${result.metrics.f1Score}`);
console.log(`Pass Rate: ${result.summary.passRate * 100}%`);

// 创建A/B测试
const abTest = evaluationSystem.createABTest(
  'model-comparison',
  '模型A vs 模型B',
  [
    { name: 'Model A', modelId: 'model-a', config: {} },
    { name: 'Model B', modelId: 'model-b', config: {} }
  ]
);

// 启动A/B测试
await evaluationSystem.startABTest(abTest.id);

// 查看结果
const testResult = evaluationSystem.getABTest(abTest.id);
if (testResult.results?.winner) {
  console.log(`Winner: ${testResult.results.winner}`);
  console.log(`Statistical Significance: ${testResult.results.statisticalSignificance}`);
}

// 模型对比
const comparison = evaluationSystem.compareModels([
  'model-v1',
  'model-v2',
  'model-v3'
]);
console.log('Model Comparison:', comparison);
```

### 4. 模型部署 🚀

企业级部署管理，支持多种发布策略。

#### 核心功能

- **部署管理**
  - 创建和管理部署
  - 环境隔离（开发、测试、生产）
  - 资源配置（CPU、内存、GPU）

- **版本控制**
  - 模型版本管理
  - 版本标签
  - 版本归档

- **发布策略**
  - 滚动更新
  - 蓝绿部署
  - 金丝雀发布

- **流量管理**
  - 流量分配
  - 灰度发布
  - 流量切换

- **监控和回滚**
  - 实时健康检查
  - 性能监控
  - 自动回滚
  - 手动回滚

- **自动扩缩容**
  - 基于CPU/内存的自动扩展
  - 副本数管理

#### 使用示例

```typescript
import { deploymentManager } from './services/training';

// 创建部署
const deployment = await deploymentManager.createDeployment(
  modelId,
  '1.0.0',
  'production-deployment',
  'production',
  {
    replicas: 3,
    resources: {
      cpu: '2',
      memory: '4Gi',
      gpu: 'nvidia-t4'
    },
    scaling: {
      minReplicas: 2,
      maxReplicas: 10,
      targetCPU: 70,
      targetMemory: 80
    },
    healthCheck: {
      enabled: true,
      interval: 30,
      timeout: 10,
      failureThreshold: 3
    },
    rollout: {
      strategy: 'rolling',
      maxSurge: 1,
      maxUnavailable: 0
    }
  }
);

// 金丝雀部署
const canary = await deploymentManager.createCanaryDeployment(
  deployment.id,
  'model-v2',
  '2.0.0',
  [
    { name: 'Stage 1', traffic: 10, duration: 300000 },
    { name: 'Stage 2', traffic: 50, duration: 600000 },
    { name: 'Stage 3', traffic: 100, duration: 300000 }
  ]
);

// 蓝绿部署
const { blue, green } = await deploymentManager.blueGreenDeployment(
  currentDeploymentId,
  'model-v2',
  '2.0.0'
);

// 回滚
const rollback = await deploymentManager.rollbackDeployment(
  deployment.id,
  '1.0.0',
  'Performance degradation detected'
);

// 查看部署指标
const deploymentInfo = deploymentManager.getDeployment(deployment.id);
console.log('Metrics:', {
  requestCount: deploymentInfo.metrics.requestCount,
  successRate: deploymentInfo.metrics.successRate,
  avgLatency: deploymentInfo.metrics.avgLatency,
  uptime: deploymentInfo.metrics.uptime
});
```

## UI 组件

### DatasetManager 组件

数据集管理界面，提供直观的数据集操作体验。

```tsx
import { DatasetManager } from './components/training';

function App() {
  return <DatasetManager />;
}
```

特性：
- 数据集列表和详情
- 数据点浏览和编辑
- 质量评分调整
- 版本历史查看
- 导入导出操作

### TrainingDashboard 组件

训练监控仪表板，实时展示训练状态和指标。

```tsx
import { TrainingDashboard } from './components/training';

function App() {
  return <TrainingDashboard />;
}
```

特性：
- 训练任务列表
- 实时进度追踪
- 训练曲线可视化
- 检查点管理
- 训练日志查看
- 训练控制（开始、暂停、停止）

### EvaluationPanel 组件

评估面板，管理测试和查看评估结果。

```tsx
import { EvaluationPanel } from './components/training';

function App() {
  return <EvaluationPanel />;
}
```

特性：
- 测试套件管理
- 运行评估
- 指标可视化（雷达图）
- A/B测试管理
- 变体对比

### DeploymentPanel 组件

部署管理面板，控制模型部署和监控。

```tsx
import { DeploymentPanel } from './components/training';

function App() {
  return <DeploymentPanel />;
}
```

特性：
- 部署列表和详情
- 实时健康监控
- 流量分配控制
- 资源配置查看
- 部署操作（回滚、停止）

### TrainingPlatform 组件

完整的训练平台界面，整合所有功能。

```tsx
import { TrainingPlatform } from './components/training';

function App() {
  return <TrainingPlatform />;
}
```

## 后端 API

### 数据集 API

```
GET    /api/training/datasets           - 获取所有数据集
POST   /api/training/datasets           - 创建数据集
GET    /api/training/datasets/:id       - 获取数据集详情
PUT    /api/training/datasets/:id       - 更新数据集
DELETE /api/training/datasets/:id       - 删除数据集
POST   /api/training/datasets/:id/datapoints - 添加数据点
GET    /api/training/datasets/:id/export     - 导出数据集
```

### 训练 API

```
GET    /api/training/training-jobs      - 获取所有训练任务
POST   /api/training/training-jobs      - 创建训练任务
GET    /api/training/training-jobs/:id  - 获取训练任务详情
POST   /api/training/training-jobs/:id/start  - 启动训练
POST   /api/training/training-jobs/:id/pause  - 暂停训练
POST   /api/training/training-jobs/:id/stop   - 停止训练
GET    /api/training/training-jobs/:id/metrics - 获取训练指标
```

### 评估 API

```
GET    /api/training/test-suites        - 获取所有测试套件
POST   /api/training/test-suites        - 创建测试套件
POST   /api/training/evaluations        - 运行评估
GET    /api/training/evaluations/:id    - 获取评估结果
POST   /api/training/ab-tests           - 创建A/B测试
POST   /api/training/ab-tests/:id/start - 启动A/B测试
```

### 部署 API

```
GET    /api/training/deployments        - 获取所有部署
POST   /api/training/deployments        - 创建部署
GET    /api/training/deployments/:id    - 获取部署详情
PUT    /api/training/deployments/:id/traffic - 更新流量
POST   /api/training/deployments/:id/rollback - 回滚部署
POST   /api/training/deployments/:id/canary   - 创建金丝雀部署
POST   /api/training/deployments/:id/stop     - 停止部署
DELETE /api/training/deployments/:id    - 删除部署
```

## 架构设计

### 服务层

- **DatasetManager**: 数据集生命周期管理
- **TrainingEngine**: 训练任务编排和执行
- **EvaluationSystem**: 评估和测试管理
- **DeploymentManager**: 部署策略和监控

### 数据流

```
数据集创建 → 数据标注 → 训练准备 → 模型训练 → 性能评估 → 模型部署 → 监控反馈
```

### 技术栈

- **前端**: React + TypeScript + Framer Motion
- **可视化**: Recharts
- **后端**: Node.js + Express + TypeScript
- **状态管理**: 单例模式 + React Hooks

## 最佳实践

### 数据集管理

1. **质量优先**: 确保数据质量评分准确
2. **版本控制**: 定期创建版本快照
3. **标签规范**: 使用统一的标签体系
4. **数据平衡**: 保持训练数据的平衡性

### 模型训练

1. **合理配置**: 根据数据规模调整超参数
2. **监控指标**: 密切关注过拟合信号
3. **检查点策略**: 保存多个检查点备份
4. **日志记录**: 保持详细的训练日志

### 性能评估

1. **多维度评估**: 不仅看准确率，还要关注延迟和吞吐
2. **真实场景**: 测试用例应反映实际使用场景
3. **A/B测试**: 在生产环境前进行充分A/B测试
4. **持续监控**: 部署后持续监控性能指标

### 模型部署

1. **灰度发布**: 使用金丝雀发布降低风险
2. **监控告警**: 设置关键指标告警
3. **快速回滚**: 准备好回滚方案
4. **资源优化**: 根据负载动态调整资源

## 代码统计

- **服务层代码**: ~2,450 行
- **UI组件代码**: ~2,100 行
- **后端API代码**: ~1,050 行
- **总计**: ~5,600 行

## 性能指标

- **数据集加载**: <100ms
- **训练启动**: <3s
- **评估执行**: 根据测试用例数量，通常<5s
- **部署创建**: <3s
- **健康检查**: <1s

## 扩展性

系统设计考虑了扩展性：

1. **插件化架构**: 易于添加新的训练策略
2. **模块化设计**: 各组件独立可替换
3. **API优先**: 所有功能通过API暴露
4. **事件驱动**: 支持实时更新和通知

## 未来规划

- [ ] 分布式训练支持
- [ ] 更多模型架构支持
- [ ] 高级数据增强
- [ ] 自动超参数调优
- [ ] 联邦学习支持
- [ ] 模型压缩和量化
- [ ] 边缘设备部署
- [ ] 更多评估指标

## 许可证

MIT License

---

**AgentForge Training Platform** - 专业的AI Agent训练和优化解决方案
