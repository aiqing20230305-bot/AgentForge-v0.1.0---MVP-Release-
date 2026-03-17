/**
 * 训练引擎
 * 负责模型训练、微调、Prompt优化和训练监控
 */

import { Dataset } from './DatasetManager';

export interface TrainingConfig {
  modelType: 'fine-tuning' | 'prompt-optimization' | 'hybrid';
  baseModel: string;
  hyperparameters: {
    learningRate: number;
    batchSize: number;
    epochs: number;
    warmupSteps?: number;
    weightDecay?: number;
    maxGradNorm?: number;
  };
  optimization: {
    optimizer: 'adam' | 'sgd' | 'adamw';
    scheduler: 'linear' | 'cosine' | 'constant';
    earlyStoppingPatience?: number;
  };
  dataConfig: {
    maxInputLength: number;
    maxOutputLength: number;
    shuffleData: boolean;
    augmentation?: boolean;
  };
}

export interface TrainingJob {
  id: string;
  name: string;
  datasetId: string;
  config: TrainingConfig;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  progress: TrainingProgress;
  metrics: TrainingMetrics;
  checkpoints: Checkpoint[];
  logs: TrainingLog[];
}

export interface TrainingProgress {
  currentEpoch: number;
  totalEpochs: number;
  currentStep: number;
  totalSteps: number;
  percentage: number;
  estimatedTimeRemaining: number; // milliseconds
}

export interface TrainingMetrics {
  loss: number[];
  validationLoss: number[];
  accuracy: number[];
  validationAccuracy: number[];
  learningRate: number[];
  gradientNorm: number[];
  perplexity?: number[];
  bleu?: number[];
  rouge?: number[];
}

export interface Checkpoint {
  id: string;
  epoch: number;
  step: number;
  timestamp: number;
  metrics: {
    loss: number;
    validationLoss: number;
    accuracy: number;
  };
  modelPath: string;
  isBest: boolean;
}

export interface TrainingLog {
  timestamp: number;
  level: 'info' | 'warning' | 'error';
  message: string;
  data?: any;
}

export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
  performance: {
    avgScore: number;
    successRate: number;
    avgResponseTime: number;
  };
  versions: PromptVersion[];
}

export interface PromptVersion {
  version: number;
  template: string;
  timestamp: number;
  performance: {
    score: number;
    samples: number;
  };
}

class TrainingEngine {
  private jobs: Map<string, TrainingJob> = new Map();
  private promptTemplates: Map<string, PromptTemplate> = new Map();
  private activeJobs: Set<string> = new Set();

  /**
   * 创建训练任务
   */
  createTrainingJob(
    name: string,
    datasetId: string,
    config: TrainingConfig
  ): TrainingJob {
    const job: TrainingJob = {
      id: this.generateId(),
      name,
      datasetId,
      config,
      status: 'pending',
      createdAt: Date.now(),
      progress: {
        currentEpoch: 0,
        totalEpochs: config.hyperparameters.epochs,
        currentStep: 0,
        totalSteps: 0,
        percentage: 0,
        estimatedTimeRemaining: 0,
      },
      metrics: {
        loss: [],
        validationLoss: [],
        accuracy: [],
        validationAccuracy: [],
        learningRate: [],
        gradientNorm: [],
      },
      checkpoints: [],
      logs: [],
    };

    this.jobs.set(job.id, job);
    this.addLog(job.id, 'info', `Training job created: ${name}`);

    return job;
  }

  /**
   * 启动训练
   */
  async startTraining(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Training job ${jobId} not found`);
    }

    if (job.status === 'running') {
      throw new Error('Training job is already running');
    }

    job.status = 'running';
    job.startedAt = Date.now();
    this.activeJobs.add(jobId);
    this.addLog(jobId, 'info', 'Training started');

    try {
      await this.executeTraining(job);
      job.status = 'completed';
      job.completedAt = Date.now();
      this.addLog(jobId, 'info', 'Training completed successfully');
    } catch (error) {
      job.status = 'failed';
      job.completedAt = Date.now();
      this.addLog(jobId, 'error', `Training failed: ${error}`);
      throw error;
    } finally {
      this.activeJobs.delete(jobId);
    }
  }

  /**
   * 执行训练
   */
  private async executeTraining(job: TrainingJob): Promise<void> {
    const { config } = job;
    const totalSteps = config.hyperparameters.epochs * 100; // 假设每个epoch 100步
    job.progress.totalSteps = totalSteps;

    for (let epoch = 1; epoch <= config.hyperparameters.epochs; epoch++) {
      if (job.status !== 'running') break;

      job.progress.currentEpoch = epoch;
      this.addLog(job.id, 'info', `Starting epoch ${epoch}/${config.hyperparameters.epochs}`);

      // 模拟训练步骤
      for (let step = 1; step <= 100; step++) {
        if (job.status !== 'running') break;

        job.progress.currentStep = (epoch - 1) * 100 + step;
        job.progress.percentage = (job.progress.currentStep / totalSteps) * 100;

        // 模拟训练指标
        const loss = this.simulateLoss(epoch, step);
        const valLoss = this.simulateValidationLoss(epoch, step);
        const accuracy = this.simulateAccuracy(epoch, step);
        const valAccuracy = this.simulateValidationAccuracy(epoch, step);

        job.metrics.loss.push(loss);
        job.metrics.validationLoss.push(valLoss);
        job.metrics.accuracy.push(accuracy);
        job.metrics.validationAccuracy.push(valAccuracy);
        job.metrics.learningRate.push(config.hyperparameters.learningRate);
        job.metrics.gradientNorm.push(Math.random() * 2);

        // 更新预估时间
        const elapsed = Date.now() - job.startedAt!;
        const avgTimePerStep = elapsed / job.progress.currentStep;
        job.progress.estimatedTimeRemaining =
          avgTimePerStep * (totalSteps - job.progress.currentStep);

        // 模拟训练延迟
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // 创建检查点
      const checkpoint = this.createCheckpoint(job, epoch);
      job.checkpoints.push(checkpoint);
      this.addLog(job.id, 'info', `Checkpoint saved at epoch ${epoch}`);

      // 早停检查
      if (this.shouldEarlyStop(job)) {
        this.addLog(job.id, 'info', 'Early stopping triggered');
        break;
      }
    }

    job.progress.percentage = 100;
  }

  /**
   * 暂停训练
   */
  pauseTraining(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Training job ${jobId} not found`);
    }

    if (job.status === 'running') {
      job.status = 'paused';
      this.activeJobs.delete(jobId);
      this.addLog(jobId, 'info', 'Training paused');
    }
  }

  /**
   * 恢复训练
   */
  async resumeTraining(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Training job ${jobId} not found`);
    }

    if (job.status === 'paused') {
      job.status = 'running';
      this.addLog(jobId, 'info', 'Training resumed');
      await this.executeTraining(job);
    }
  }

  /**
   * 停止训练
   */
  stopTraining(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Training job ${jobId} not found`);
    }

    if (job.status === 'running' || job.status === 'paused') {
      job.status = 'completed';
      job.completedAt = Date.now();
      this.activeJobs.delete(jobId);
      this.addLog(jobId, 'info', 'Training stopped by user');
    }
  }

  /**
   * 创建检查点
   */
  private createCheckpoint(job: TrainingJob, epoch: number): Checkpoint {
    const metrics = job.metrics;
    const lastIndex = metrics.loss.length - 1;

    const checkpoint: Checkpoint = {
      id: this.generateId(),
      epoch,
      step: job.progress.currentStep,
      timestamp: Date.now(),
      metrics: {
        loss: metrics.loss[lastIndex],
        validationLoss: metrics.validationLoss[lastIndex],
        accuracy: metrics.accuracy[lastIndex],
      },
      modelPath: `/models/${job.id}/checkpoint-${epoch}`,
      isBest: false,
    };

    // 检查是否是最佳检查点
    if (job.checkpoints.length === 0 ||
        checkpoint.metrics.validationLoss < Math.min(...job.checkpoints.map(c => c.metrics.validationLoss))) {
      job.checkpoints.forEach(c => (c.isBest = false));
      checkpoint.isBest = true;
    }

    return checkpoint;
  }

  /**
   * 早停检查
   */
  private shouldEarlyStop(job: TrainingJob): boolean {
    const patience = job.config.optimization.earlyStoppingPatience;
    if (!patience || job.checkpoints.length < patience) {
      return false;
    }

    const recentCheckpoints = job.checkpoints.slice(-patience);
    const bestLoss = Math.min(...recentCheckpoints.map(c => c.metrics.validationLoss));
    const currentLoss = recentCheckpoints[recentCheckpoints.length - 1].metrics.validationLoss;

    return currentLoss >= bestLoss;
  }

  /**
   * Prompt优化
   */
  async optimizePrompt(
    templateId: string,
    testCases: Array<{ input: any; expectedOutput: string }>
  ): Promise<PromptTemplate> {
    const template = this.promptTemplates.get(templateId);
    if (!template) {
      throw new Error(`Prompt template ${templateId} not found`);
    }

    // 遗传算法优化
    const generations = 10;
    const populationSize = 20;
    let population = this.initializePopulation(template.template, populationSize);

    for (let gen = 0; gen < generations; gen++) {
      // 评估种群
      const scores = await Promise.all(
        population.map(prompt => this.evaluatePrompt(prompt, testCases))
      );

      // 选择最佳个体
      const ranked = population
        .map((prompt, i) => ({ prompt, score: scores[i] }))
        .sort((a, b) => b.score - a.score);

      // 交叉和变异
      const nextGen: string[] = [];
      nextGen.push(...ranked.slice(0, 5).map(r => r.prompt)); // 保留最佳

      while (nextGen.length < populationSize) {
        const parent1 = ranked[Math.floor(Math.random() * 10)].prompt;
        const parent2 = ranked[Math.floor(Math.random() * 10)].prompt;
        const child = this.crossover(parent1, parent2);
        const mutated = this.mutate(child);
        nextGen.push(mutated);
      }

      population = nextGen;
    }

    // 获取最佳prompt
    const scores = await Promise.all(
      population.map(prompt => this.evaluatePrompt(prompt, testCases))
    );
    const bestIndex = scores.indexOf(Math.max(...scores));
    const bestPrompt = population[bestIndex];

    // 更新模板
    const newVersion: PromptVersion = {
      version: template.versions.length + 1,
      template: bestPrompt,
      timestamp: Date.now(),
      performance: {
        score: scores[bestIndex],
        samples: testCases.length,
      },
    };

    template.versions.push(newVersion);
    template.template = bestPrompt;
    template.performance.avgScore = scores[bestIndex];

    return template;
  }

  /**
   * 创建Prompt模板
   */
  createPromptTemplate(
    name: string,
    template: string,
    variables: string[]
  ): PromptTemplate {
    const promptTemplate: PromptTemplate = {
      id: this.generateId(),
      name,
      template,
      variables,
      performance: {
        avgScore: 0,
        successRate: 0,
        avgResponseTime: 0,
      },
      versions: [{
        version: 1,
        template,
        timestamp: Date.now(),
        performance: {
          score: 0,
          samples: 0,
        },
      }],
    };

    this.promptTemplates.set(promptTemplate.id, promptTemplate);
    return promptTemplate;
  }

  /**
   * 评估Prompt
   */
  private async evaluatePrompt(
    prompt: string,
    testCases: Array<{ input: any; expectedOutput: string }>
  ): Promise<number> {
    let totalScore = 0;

    for (const testCase of testCases) {
      // 模拟评估
      const similarity = Math.random() * 0.5 + 0.5; // 0.5-1.0
      totalScore += similarity;
    }

    return totalScore / testCases.length;
  }

  /**
   * 初始化种群
   */
  private initializePopulation(template: string, size: number): string[] {
    const population: string[] = [template];

    for (let i = 1; i < size; i++) {
      population.push(this.mutate(template));
    }

    return population;
  }

  /**
   * 交叉操作
   */
  private crossover(parent1: string, parent2: string): string {
    const words1 = parent1.split(' ');
    const words2 = parent2.split(' ');
    const midpoint = Math.floor(Math.random() * Math.min(words1.length, words2.length));

    return [...words1.slice(0, midpoint), ...words2.slice(midpoint)].join(' ');
  }

  /**
   * 变异操作
   */
  private mutate(template: string): string {
    const words = template.split(' ');
    const mutationRate = 0.1;

    const synonyms: Record<string, string[]> = {
      'please': ['kindly', 'could you', 'would you'],
      'analyze': ['examine', 'evaluate', 'assess'],
      'create': ['generate', 'produce', 'make'],
      'explain': ['describe', 'clarify', 'elucidate'],
    };

    return words
      .map(word => {
        if (Math.random() < mutationRate && synonyms[word.toLowerCase()]) {
          const alternatives = synonyms[word.toLowerCase()];
          return alternatives[Math.floor(Math.random() * alternatives.length)];
        }
        return word;
      })
      .join(' ');
  }

  /**
   * 获取训练任务
   */
  getTrainingJob(jobId: string): TrainingJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * 获取所有训练任务
   */
  getAllTrainingJobs(): TrainingJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * 获取活动任务
   */
  getActiveJobs(): TrainingJob[] {
    return Array.from(this.activeJobs)
      .map(id => this.jobs.get(id))
      .filter((job): job is TrainingJob => job !== undefined);
  }

  /**
   * 获取Prompt模板
   */
  getPromptTemplate(templateId: string): PromptTemplate | undefined {
    return this.promptTemplates.get(templateId);
  }

  /**
   * 获取所有Prompt模板
   */
  getAllPromptTemplates(): PromptTemplate[] {
    return Array.from(this.promptTemplates.values());
  }

  /**
   * 添加日志
   */
  private addLog(
    jobId: string,
    level: TrainingLog['level'],
    message: string,
    data?: any
  ): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.logs.push({
      timestamp: Date.now(),
      level,
      message,
      data,
    });

    // 限制日志数量
    if (job.logs.length > 1000) {
      job.logs = job.logs.slice(-1000);
    }
  }

  /**
   * 模拟损失函数
   */
  private simulateLoss(epoch: number, step: number): number {
    const base = 2.0;
    const decay = 0.1;
    const noise = (Math.random() - 0.5) * 0.1;
    return Math.max(0.1, base * Math.exp(-decay * epoch) + noise);
  }

  /**
   * 模拟验证损失
   */
  private simulateValidationLoss(epoch: number, step: number): number {
    const base = 2.2;
    const decay = 0.09;
    const noise = (Math.random() - 0.5) * 0.15;
    return Math.max(0.15, base * Math.exp(-decay * epoch) + noise);
  }

  /**
   * 模拟准确率
   */
  private simulateAccuracy(epoch: number, step: number): number {
    const base = 0.5;
    const improvement = 0.4;
    const noise = (Math.random() - 0.5) * 0.02;
    return Math.min(0.99, base + improvement * (1 - Math.exp(-0.15 * epoch)) + noise);
  }

  /**
   * 模拟验证准确率
   */
  private simulateValidationAccuracy(epoch: number, step: number): number {
    const base = 0.48;
    const improvement = 0.38;
    const noise = (Math.random() - 0.5) * 0.03;
    return Math.min(0.95, base + improvement * (1 - Math.exp(-0.14 * epoch)) + noise);
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const trainingEngine = new TrainingEngine();
