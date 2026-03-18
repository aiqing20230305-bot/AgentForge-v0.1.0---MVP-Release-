# 训练平台快速启动指南 🚀

## 10分钟上手AI训练平台

### 第一步：导入组件

```typescript
// 在你的 App.tsx 或主组件中
import { TrainingPlatform } from './components/training';

function App() {
  return <TrainingPlatform />;
}
```

就这么简单！完整的训练平台界面已经可用。

---

## 基础工作流

### 1. 创建数据集 (2分钟)

```typescript
import { datasetManager } from './services/training';

// 创建数据集
const dataset = datasetManager.createDataset(
  '我的第一个数据集',
  '用于训练对话Agent',
  {
    source: 'manual',
    domain: 'dialogue',
    language: 'zh-CN',
    tags: ['conversation', 'qa']
  }
);

// 添加数据
datasetManager.addDataPoint(dataset.id, {
  input: '你好，请问如何使用这个平台？',
  output: '欢迎使用！首先创建一个数据集，然后添加训练数据...',
  metadata: {
    source: 'manual',
    timestamp: Date.now(),
    quality: 0.9,
    tags: ['greeting', 'tutorial']
  }
});
```

### 2. 启动训练 (1分钟)

```typescript
import { trainingEngine } from './services/training';

// 创建训练任务
const job = trainingEngine.createTrainingJob(
  '对话Agent-v1',
  dataset.id,
  {
    modelType: 'fine-tuning',
    baseModel: 'claude-3-sonnet',
    hyperparameters: {
      learningRate: 0.0001,
      batchSize: 32,
      epochs: 5
    },
    optimization: {
      optimizer: 'adamw',
      scheduler: 'cosine'
    },
    dataConfig: {
      maxInputLength: 512,
      maxOutputLength: 256,
      shuffleData: true
    }
  }
);

// 启动训练
await trainingEngine.startTraining(job.id);

// 实时查看进度
console.log(`进度: ${job.progress.percentage}%`);
```

### 3. 运行评估 (1分钟)

```typescript
import { evaluationSystem } from './services/training';

// 创建测试套件
const testSuite = evaluationSystem.createTestSuite(
  '基础评估',
  '测试模型基础能力',
  [
    {
      input: { text: '你好' },
      expectedOutput: '你好！有什么可以帮助你的吗？',
      metadata: {
        category: 'greeting',
        difficulty: 'easy',
        tags: ['basic']
      }
    }
  ]
);

// 运行评估
const result = await evaluationSystem.runEvaluation(
  testSuite.id,
  job.id
);

console.log(`准确率: ${result.metrics.accuracy}`);
console.log(`F1分数: ${result.metrics.f1Score}`);
```

### 4. 部署模型 (1分钟)

```typescript
import { deploymentManager } from './services/training';

// 创建部署
const deployment = await deploymentManager.createDeployment(
  job.id,
  '1.0.0',
  '生产环境部署',
  'production',
  {
    replicas: 3,
    resources: {
      cpu: '2',
      memory: '4Gi'
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

console.log(`部署状态: ${deployment.status}`);
```

---

## 高级场景

### 场景1：批量导入数据

```typescript
// 从CSV导入
const csvData = `id,input,output,quality,tags
1,"问题1","答案1",0.9,"tag1;tag2"
2,"问题2","答案2",0.85,"tag2;tag3"`;

const dataset = datasetManager.importDataset(
  '批量导入数据',
  csvData,
  'csv',
  {
    source: 'import',
    domain: 'general',
    language: 'zh-CN',
    tags: ['imported']
  }
);
```

### 场景2：Prompt优化

```typescript
// 创建Prompt模板
const template = trainingEngine.createPromptTemplate(
  '客服助手',
  'You are a helpful customer service agent. {context}',
  ['context']
);

// 准备测试用例
const testCases = [
  {
    input: { context: 'User asks about refund' },
    expectedOutput: 'I can help you with the refund process...'
  }
];

// 优化Prompt
const optimized = await trainingEngine.optimizePrompt(
  template.id,
  testCases
);

console.log('优化后的Prompt:', optimized.template);
```

### 场景3：A/B测试

```typescript
// 创建A/B测试
const abTest = evaluationSystem.createABTest(
  '模型对比',
  '比较两个模型版本',
  [
    { name: '模型A', modelId: 'model-a', config: {} },
    { name: '模型B', modelId: 'model-b', config: {} }
  ]
);

// 启动测试
await evaluationSystem.startABTest(abTest.id);

// 等待结果
setTimeout(() => {
  const result = evaluationSystem.getABTest(abTest.id);
  if (result.results?.winner) {
    console.log('获胜者:', result.results.winner);
    console.log('统计显著:', result.results.statisticalSignificance);
  }
}, 11000);
```

### 场景4：金丝雀发布

```typescript
// 创建金丝雀部署
const canary = await deploymentManager.createCanaryDeployment(
  currentDeploymentId,
  newModelId,
  '2.0.0',
  [
    { name: '阶段1', traffic: 10, duration: 300000 },   // 10% 5分钟
    { name: '阶段2', traffic: 50, duration: 600000 },   // 50% 10分钟
    { name: '阶段3', traffic: 100, duration: 300000 }   // 100% 5分钟
  ]
);

// 系统会自动执行阶段化发布并监控健康状态
```

---

## 常用API速查

### 数据集
```typescript
// 创建
datasetManager.createDataset(name, description, metadata)

// 添加数据
datasetManager.addDataPoint(datasetId, dataPoint)
datasetManager.addDataPointsBatch(datasetId, dataPoints)

// 标注
datasetManager.annotateDataPoint(datasetId, dataPointId, annotation)
datasetManager.updateQuality(datasetId, dataPointId, quality)

// 版本
datasetManager.createVersion(datasetId, changes)
datasetManager.getVersionHistory(datasetId)

// 导入导出
datasetManager.exportDataset(datasetId, format)
datasetManager.importDataset(name, data, format, metadata)

// 查询
datasetManager.getDataset(datasetId)
datasetManager.getAllDatasets()
datasetManager.filterDataset(datasetId, filters)
```

### 训练
```typescript
// 任务管理
trainingEngine.createTrainingJob(name, datasetId, config)
trainingEngine.startTraining(jobId)
trainingEngine.pauseTraining(jobId)
trainingEngine.resumeTraining(jobId)
trainingEngine.stopTraining(jobId)

// Prompt
trainingEngine.createPromptTemplate(name, template, variables)
trainingEngine.optimizePrompt(templateId, testCases)

// 查询
trainingEngine.getTrainingJob(jobId)
trainingEngine.getAllTrainingJobs()
trainingEngine.getActiveJobs()
```

### 评估
```typescript
// 测试套件
evaluationSystem.createTestSuite(name, description, testCases)
evaluationSystem.addTestCase(testSuiteId, testCase)

// 评估
evaluationSystem.runEvaluation(testSuiteId, modelId)
evaluationSystem.getModelEvaluations(modelId)

// A/B测试
evaluationSystem.createABTest(name, description, variants)
evaluationSystem.startABTest(testId)
evaluationSystem.stopABTest(testId)
evaluationSystem.updateTrafficSplit(testId, traffic)

// 对比
evaluationSystem.compareModels(modelIds)
evaluationSystem.runBenchmark(modelId, benchmarks)
```

### 部署
```typescript
// 部署管理
deploymentManager.createDeployment(modelId, version, name, env, config)
deploymentManager.stopDeployment(deploymentId)
deploymentManager.deleteDeployment(deploymentId)

// 回滚
deploymentManager.rollbackDeployment(deploymentId, targetVersion, reason)

// 发布策略
deploymentManager.createCanaryDeployment(baselineId, newModelId, newVersion, stages)
deploymentManager.blueGreenDeployment(currentId, newModelId, newVersion)

// 版本管理
deploymentManager.createModelVersion(modelId, version, checkpointPath, metrics)
deploymentManager.validateModelVersion(modelId, version)
deploymentManager.archiveModelVersion(modelId, version)

// 查询
deploymentManager.getDeployment(deploymentId)
deploymentManager.getAllDeployments()
deploymentManager.getActiveDeployments()
deploymentManager.getRollbackHistory(deploymentId)
```

---

## UI组件使用

### 完整平台
```tsx
import { TrainingPlatform } from './components/training';
<TrainingPlatform />
```

### 独立组件
```tsx
import {
  DatasetManager,
  TrainingDashboard,
  EvaluationPanel,
  DeploymentPanel
} from './components/training';

// 使用任意组件
<DatasetManager />
<TrainingDashboard />
<EvaluationPanel />
<DeploymentPanel />
```

---

## 配置说明

### 训练配置模板

**快速训练（开发环境）**
```typescript
{
  modelType: 'fine-tuning',
  baseModel: 'claude-3-sonnet',
  hyperparameters: {
    learningRate: 0.001,
    batchSize: 16,
    epochs: 3
  },
  optimization: {
    optimizer: 'adam',
    scheduler: 'constant'
  },
  dataConfig: {
    maxInputLength: 256,
    maxOutputLength: 128,
    shuffleData: true
  }
}
```

**标准训练（生产环境）**
```typescript
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
    maxOutputLength: 256,
    shuffleData: true,
    augmentation: true
  }
}
```

### 部署配置模板

**开发环境**
```typescript
{
  replicas: 1,
  resources: {
    cpu: '1',
    memory: '2Gi'
  },
  scaling: {
    minReplicas: 1,
    maxReplicas: 2,
    targetCPU: 80,
    targetMemory: 85
  },
  healthCheck: {
    enabled: true,
    interval: 60,
    timeout: 10,
    failureThreshold: 5
  },
  rollout: {
    strategy: 'rolling',
    maxSurge: 1,
    maxUnavailable: 0
  }
}
```

**生产环境**
```typescript
{
  replicas: 5,
  resources: {
    cpu: '4',
    memory: '16Gi',
    gpu: 'nvidia-a100'
  },
  scaling: {
    minReplicas: 3,
    maxReplicas: 20,
    targetCPU: 60,
    targetMemory: 70
  },
  healthCheck: {
    enabled: true,
    interval: 30,
    timeout: 5,
    failureThreshold: 2
  },
  rollout: {
    strategy: 'canary',
    maxSurge: 2,
    maxUnavailable: 0
  }
}
```

---

## 常见问题

### Q: 如何批量添加数据？
```typescript
const dataPoints = [/* 你的数据数组 */];
datasetManager.addDataPointsBatch(datasetId, dataPoints);
```

### Q: 如何监控训练进度？
```typescript
const job = trainingEngine.getTrainingJob(jobId);
console.log(job.progress);
console.log(job.metrics);
```

### Q: 如何设置自动回滚？
部署配置中的`healthCheck`会自动触发回滚：
```typescript
healthCheck: {
  enabled: true,
  interval: 30,
  timeout: 10,
  failureThreshold: 3  // 连续3次失败后回滚
}
```

### Q: 如何导出训练好的模型？
```typescript
const checkpoint = job.checkpoints.find(c => c.isBest);
console.log('最佳模型路径:', checkpoint.modelPath);
```

---

## 下一步

1. 📚 阅读完整文档：`TRAINING_PLATFORM_README.md`
2. 🎯 查看完成报告：`TASK_304_COMPLETION_REPORT.md`
3. 💡 探索示例代码：在UI中实际操作
4. 🚀 开始你的第一个训练任务！

---

**祝你训练愉快！** 🎉

如有问题，请查阅完整文档或联系支持团队。
