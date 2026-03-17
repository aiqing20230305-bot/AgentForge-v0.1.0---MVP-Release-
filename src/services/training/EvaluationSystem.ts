/**
 * 评估系统
 * 负责性能评估、自动化测试和A/B测试
 */

import { TrainingJob } from './TrainingEngine';

export interface EvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  bleuScore?: number;
  rougeScore?: number;
  perplexity?: number;
  latency: number; // ms
  throughput: number; // requests/second
}

export interface TestCase {
  id: string;
  input: any;
  expectedOutput: string;
  metadata: {
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
  };
}

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  testCases: TestCase[];
  createdAt: number;
  updatedAt: number;
}

export interface EvaluationResult {
  id: string;
  testSuiteId: string;
  modelId: string;
  timestamp: number;
  metrics: EvaluationMetrics;
  testResults: TestResult[];
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    passRate: number;
  };
}

export interface TestResult {
  testCaseId: string;
  passed: boolean;
  actualOutput: string;
  expectedOutput: string;
  score: number;
  latency: number;
  error?: string;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'completed' | 'cancelled';
  variants: ABTestVariant[];
  traffic: {
    [variantId: string]: number; // percentage
  };
  startedAt?: number;
  completedAt?: number;
  results?: ABTestResults;
}

export interface ABTestVariant {
  id: string;
  name: string;
  modelId: string;
  config: any;
}

export interface ABTestResults {
  winner?: string;
  variants: {
    [variantId: string]: {
      metrics: EvaluationMetrics;
      sampleSize: number;
      confidence: number;
    };
  };
  statisticalSignificance: boolean;
}

export interface BenchmarkResult {
  modelId: string;
  timestamp: number;
  benchmarks: {
    [name: string]: {
      score: number;
      rank?: number;
      percentile?: number;
    };
  };
}

class EvaluationSystem {
  private testSuites: Map<string, TestSuite> = new Map();
  private evaluationResults: Map<string, EvaluationResult> = new Map();
  private abTests: Map<string, ABTest> = new Map();
  private benchmarks: Map<string, BenchmarkResult> = new Map();

  /**
   * 创建测试套件
   */
  createTestSuite(
    name: string,
    description: string,
    testCases: Omit<TestCase, 'id'>[]
  ): TestSuite {
    const testSuite: TestSuite = {
      id: this.generateId(),
      name,
      description,
      testCases: testCases.map(tc => ({
        ...tc,
        id: this.generateId(),
      })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.testSuites.set(testSuite.id, testSuite);
    return testSuite;
  }

  /**
   * 添加测试用例
   */
  addTestCase(
    testSuiteId: string,
    testCase: Omit<TestCase, 'id'>
  ): TestCase {
    const testSuite = this.testSuites.get(testSuiteId);
    if (!testSuite) {
      throw new Error(`Test suite ${testSuiteId} not found`);
    }

    const newTestCase: TestCase = {
      ...testCase,
      id: this.generateId(),
    };

    testSuite.testCases.push(newTestCase);
    testSuite.updatedAt = Date.now();

    return newTestCase;
  }

  /**
   * 运行评估
   */
  async runEvaluation(
    testSuiteId: string,
    modelId: string
  ): Promise<EvaluationResult> {
    const testSuite = this.testSuites.get(testSuiteId);
    if (!testSuite) {
      throw new Error(`Test suite ${testSuiteId} not found`);
    }

    const testResults: TestResult[] = [];
    let totalLatency = 0;

    for (const testCase of testSuite.testCases) {
      const result = await this.runTestCase(testCase, modelId);
      testResults.push(result);
      totalLatency += result.latency;
    }

    const passed = testResults.filter(r => r.passed).length;
    const failed = testResults.length - passed;

    const metrics = this.calculateMetrics(testResults, totalLatency);

    const evaluationResult: EvaluationResult = {
      id: this.generateId(),
      testSuiteId,
      modelId,
      timestamp: Date.now(),
      metrics,
      testResults,
      summary: {
        totalTests: testResults.length,
        passed,
        failed,
        passRate: passed / testResults.length,
      },
    };

    this.evaluationResults.set(evaluationResult.id, evaluationResult);
    return evaluationResult;
  }

  /**
   * 运行单个测试用例
   */
  private async runTestCase(
    testCase: TestCase,
    modelId: string
  ): Promise<TestResult> {
    const startTime = Date.now();

    try {
      // 模拟模型推理
      const actualOutput = await this.simulateModelInference(
        testCase.input,
        modelId
      );

      const score = this.calculateSimilarity(
        actualOutput,
        testCase.expectedOutput
      );

      const passed = score >= 0.8; // 80% 相似度阈值

      return {
        testCaseId: testCase.id,
        passed,
        actualOutput,
        expectedOutput: testCase.expectedOutput,
        score,
        latency: Date.now() - startTime,
      };
    } catch (error) {
      return {
        testCaseId: testCase.id,
        passed: false,
        actualOutput: '',
        expectedOutput: testCase.expectedOutput,
        score: 0,
        latency: Date.now() - startTime,
        error: String(error),
      };
    }
  }

  /**
   * 计算评估指标
   */
  private calculateMetrics(
    testResults: TestResult[],
    totalLatency: number
  ): EvaluationMetrics {
    const passed = testResults.filter(r => r.passed).length;
    const total = testResults.length;

    // 计算混淆矩阵
    let truePositives = 0;
    let falsePositives = 0;
    let trueNegatives = 0;
    let falseNegatives = 0;

    testResults.forEach(result => {
      if (result.passed && result.score >= 0.8) truePositives++;
      else if (result.passed && result.score < 0.8) falsePositives++;
      else if (!result.passed && result.score < 0.8) trueNegatives++;
      else if (!result.passed && result.score >= 0.8) falseNegatives++;
    });

    const accuracy = passed / total;
    const precision =
      truePositives / (truePositives + falsePositives) || 0;
    const recall =
      truePositives / (truePositives + falseNegatives) || 0;
    const f1Score =
      precision + recall > 0
        ? (2 * precision * recall) / (precision + recall)
        : 0;

    const avgLatency = totalLatency / total;
    const throughput = (1000 / avgLatency) * 10; // 假设10个并发

    return {
      accuracy,
      precision,
      recall,
      f1Score,
      latency: avgLatency,
      throughput,
      bleuScore: this.calculateBLEU(testResults),
      rougeScore: this.calculateROUGE(testResults),
      perplexity: this.calculatePerplexity(testResults),
    };
  }

  /**
   * 创建A/B测试
   */
  createABTest(
    name: string,
    description: string,
    variants: Omit<ABTestVariant, 'id'>[]
  ): ABTest {
    const abTest: ABTest = {
      id: this.generateId(),
      name,
      description,
      status: 'draft',
      variants: variants.map(v => ({
        ...v,
        id: this.generateId(),
      })),
      traffic: {},
    };

    // 均匀分配流量
    const trafficPerVariant = 100 / variants.length;
    abTest.variants.forEach(v => {
      abTest.traffic[v.id] = trafficPerVariant;
    });

    this.abTests.set(abTest.id, abTest);
    return abTest;
  }

  /**
   * 启动A/B测试
   */
  async startABTest(testId: string): Promise<void> {
    const test = this.abTests.get(testId);
    if (!test) {
      throw new Error(`A/B test ${testId} not found`);
    }

    if (test.status !== 'draft') {
      throw new Error('A/B test can only be started from draft status');
    }

    test.status = 'running';
    test.startedAt = Date.now();

    // 模拟测试运行
    setTimeout(() => {
      this.completeABTest(testId);
    }, 10000); // 10秒后完成
  }

  /**
   * 完成A/B测试
   */
  private async completeABTest(testId: string): Promise<void> {
    const test = this.abTests.get(testId);
    if (!test || test.status !== 'running') return;

    const results: ABTestResults = {
      variants: {},
      statisticalSignificance: false,
    };

    // 为每个变体生成模拟结果
    for (const variant of test.variants) {
      const metrics = await this.simulateVariantMetrics(variant);
      results.variants[variant.id] = {
        metrics,
        sampleSize: Math.floor(Math.random() * 500 + 500),
        confidence: Math.random() * 0.3 + 0.7,
      };
    }

    // 确定获胜者
    const variantScores = Object.entries(results.variants).map(
      ([id, data]) => ({
        id,
        score: data.metrics.f1Score,
        confidence: data.confidence,
      })
    );

    variantScores.sort((a, b) => b.score - a.score);
    results.winner = variantScores[0].id;

    // 检查统计显著性
    if (variantScores[0].confidence > 0.95) {
      results.statisticalSignificance = true;
    }

    test.results = results;
    test.status = 'completed';
    test.completedAt = Date.now();
  }

  /**
   * 停止A/B测试
   */
  stopABTest(testId: string): void {
    const test = this.abTests.get(testId);
    if (!test) {
      throw new Error(`A/B test ${testId} not found`);
    }

    if (test.status === 'running') {
      test.status = 'cancelled';
      test.completedAt = Date.now();
    }
  }

  /**
   * 更新流量分配
   */
  updateTrafficSplit(
    testId: string,
    traffic: { [variantId: string]: number }
  ): void {
    const test = this.abTests.get(testId);
    if (!test) {
      throw new Error(`A/B test ${testId} not found`);
    }

    // 验证流量总和为100%
    const total = Object.values(traffic).reduce((sum, t) => sum + t, 0);
    if (Math.abs(total - 100) > 0.01) {
      throw new Error('Traffic split must sum to 100%');
    }

    test.traffic = traffic;
  }

  /**
   * 运行基准测试
   */
  async runBenchmark(
    modelId: string,
    benchmarks: string[]
  ): Promise<BenchmarkResult> {
    const result: BenchmarkResult = {
      modelId,
      timestamp: Date.now(),
      benchmarks: {},
    };

    for (const benchmark of benchmarks) {
      result.benchmarks[benchmark] = await this.runSingleBenchmark(
        modelId,
        benchmark
      );
    }

    this.benchmarks.set(modelId, result);
    return result;
  }

  /**
   * 运行单个基准测试
   */
  private async runSingleBenchmark(
    modelId: string,
    benchmark: string
  ): Promise<{ score: number; rank?: number; percentile?: number }> {
    // 模拟基准测试
    await new Promise(resolve => setTimeout(resolve, 100));

    const score = Math.random() * 40 + 60; // 60-100分

    return {
      score,
      rank: Math.floor(Math.random() * 100) + 1,
      percentile: Math.random() * 30 + 70,
    };
  }

  /**
   * 比较模型
   */
  compareModels(modelIds: string[]): {
    models: string[];
    metrics: {
      [modelId: string]: EvaluationMetrics | null;
    };
    winner?: string;
  } {
    const comparison: any = {
      models: modelIds,
      metrics: {},
    };

    // 获取每个模型的最新评估结果
    modelIds.forEach(modelId => {
      const results = Array.from(this.evaluationResults.values())
        .filter(r => r.modelId === modelId)
        .sort((a, b) => b.timestamp - a.timestamp);

      comparison.metrics[modelId] = results[0]?.metrics || null;
    });

    // 确定获胜者（基于F1分数）
    let bestScore = 0;
    modelIds.forEach(modelId => {
      const metrics = comparison.metrics[modelId];
      if (metrics && metrics.f1Score > bestScore) {
        bestScore = metrics.f1Score;
        comparison.winner = modelId;
      }
    });

    return comparison;
  }

  /**
   * 获取测试套件
   */
  getTestSuite(testSuiteId: string): TestSuite | undefined {
    return this.testSuites.get(testSuiteId);
  }

  /**
   * 获取所有测试套件
   */
  getAllTestSuites(): TestSuite[] {
    return Array.from(this.testSuites.values());
  }

  /**
   * 获取评估结果
   */
  getEvaluationResult(resultId: string): EvaluationResult | undefined {
    return this.evaluationResults.get(resultId);
  }

  /**
   * 获取模型的所有评估结果
   */
  getModelEvaluations(modelId: string): EvaluationResult[] {
    return Array.from(this.evaluationResults.values())
      .filter(r => r.modelId === modelId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * 获取A/B测试
   */
  getABTest(testId: string): ABTest | undefined {
    return this.abTests.get(testId);
  }

  /**
   * 获取所有A/B测试
   */
  getAllABTests(): ABTest[] {
    return Array.from(this.abTests.values());
  }

  /**
   * 获取基准测试结果
   */
  getBenchmarkResult(modelId: string): BenchmarkResult | undefined {
    return this.benchmarks.get(modelId);
  }

  /**
   * 模拟模型推理
   */
  private async simulateModelInference(
    input: any,
    modelId: string
  ): Promise<string> {
    await new Promise(resolve =>
      setTimeout(resolve, Math.random() * 100 + 50)
    );

    // 简单模拟：返回输入的处理版本
    const inputStr = JSON.stringify(input);
    return `Processed: ${inputStr.substring(0, 100)}...`;
  }

  /**
   * 计算相似度
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const maxLen = Math.max(len1, len2);

    if (maxLen === 0) return 1;

    const distance = this.levenshteinDistance(str1, str2);
    return 1 - distance / maxLen;
  }

  /**
   * Levenshtein距离
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,
            dp[i][j - 1] + 1,
            dp[i - 1][j - 1] + 1
          );
        }
      }
    }

    return dp[m][n];
  }

  /**
   * 计算BLEU分数
   */
  private calculateBLEU(results: TestResult[]): number {
    // 简化的BLEU计算
    let totalScore = 0;

    results.forEach(result => {
      const refWords = result.expectedOutput.toLowerCase().split(/\s+/);
      const hypWords = result.actualOutput.toLowerCase().split(/\s+/);

      let matches = 0;
      refWords.forEach(word => {
        if (hypWords.includes(word)) matches++;
      });

      const precision = matches / hypWords.length || 0;
      const brevityPenalty =
        hypWords.length < refWords.length
          ? Math.exp(1 - refWords.length / hypWords.length)
          : 1;

      totalScore += precision * brevityPenalty;
    });

    return totalScore / results.length;
  }

  /**
   * 计算ROUGE分数
   */
  private calculateROUGE(results: TestResult[]): number {
    // 简化的ROUGE-1计算
    let totalScore = 0;

    results.forEach(result => {
      const refWords = new Set(
        result.expectedOutput.toLowerCase().split(/\s+/)
      );
      const hypWords = new Set(
        result.actualOutput.toLowerCase().split(/\s+/)
      );

      const intersection = new Set(
        [...hypWords].filter(x => refWords.has(x))
      );

      const recall = intersection.size / refWords.size || 0;
      const precision = intersection.size / hypWords.size || 0;

      const f1 =
        recall + precision > 0
          ? (2 * recall * precision) / (recall + precision)
          : 0;

      totalScore += f1;
    });

    return totalScore / results.length;
  }

  /**
   * 计算困惑度
   */
  private calculatePerplexity(results: TestResult[]): number {
    // 简化的困惑度计算
    let totalLogProb = 0;
    let totalWords = 0;

    results.forEach(result => {
      const words = result.actualOutput.split(/\s+/);
      totalWords += words.length;

      // 模拟对数概率
      words.forEach(() => {
        totalLogProb += Math.log(Math.random() * 0.5 + 0.5);
      });
    });

    const avgLogProb = totalLogProb / totalWords;
    return Math.exp(-avgLogProb);
  }

  /**
   * 模拟变体指标
   */
  private async simulateVariantMetrics(
    variant: ABTestVariant
  ): Promise<EvaluationMetrics> {
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      accuracy: Math.random() * 0.3 + 0.7,
      precision: Math.random() * 0.3 + 0.7,
      recall: Math.random() * 0.3 + 0.7,
      f1Score: Math.random() * 0.3 + 0.7,
      latency: Math.random() * 100 + 50,
      throughput: Math.random() * 50 + 50,
    };
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const evaluationSystem = new EvaluationSystem();
