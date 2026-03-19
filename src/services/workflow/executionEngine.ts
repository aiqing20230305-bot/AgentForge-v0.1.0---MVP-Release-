/**
 * 工作流执行引擎 - 核心执行逻辑
 * Workflow Execution Engine - Core Execution Logic
 */

import {
  WorkflowDefinition,
  WorkflowNodeConfig,
  WorkflowEdge,
  ExecutionContext,
  ExecutionStatus,
  ExecutionTrace,
  WorkflowExecutionResult,
  NodeType,
  Condition,
  ParallelNodeConfig,
  LoopNodeConfig,
  DecisionNodeConfig,
} from './types';
import { expressionEngine } from './expressionEngine';
import { NodeExecutorRegistry } from './nodeExecutors';

export class ExecutionEngine {
  private nodeExecutors: NodeExecutorRegistry;
  private activeExecutions = new Map<string, ExecutionContext>();

  constructor() {
    this.nodeExecutors = new NodeExecutorRegistry();
  }

  /**
   * 执行工作流
   */
  async execute(
    workflow: WorkflowDefinition,
    input: any = {},
    triggeredBy: string = 'manual'
  ): Promise<WorkflowExecutionResult> {
    // 创建执行上下文
    const context = this.createExecutionContext(workflow, input, triggeredBy);
    this.activeExecutions.set(context.executionId, context);

    try {
      // 查找起始节点
      const startNode = workflow.nodes.find((n) => n.type === NodeType.START);
      if (!startNode) {
        throw new Error('No start node found in workflow');
      }

      // 开始执行
      context.status = ExecutionStatus.RUNNING;
      const output = await this.executeNode(startNode, workflow, context);

      // 执行完成
      context.status = ExecutionStatus.SUCCESS;
      context.endTime = new Date();
      context.duration = context.endTime.getTime() - context.startTime.getTime();

      return this.createExecutionResult(context, output);
    } catch (error: any) {
      // 执行失败
      context.status = ExecutionStatus.FAILED;
      context.endTime = new Date();
      context.duration = context.endTime.getTime() - context.startTime.getTime();

      return this.createExecutionResult(context, undefined, error);
    } finally {
      this.activeExecutions.delete(context.executionId);
    }
  }

  /**
   * 执行单个节点
   */
  private async executeNode(
    node: WorkflowNodeConfig,
    workflow: WorkflowDefinition,
    context: ExecutionContext
  ): Promise<any> {
    const trace: ExecutionTrace = {
      nodeId: node.id,
      nodeName: node.label,
      status: ExecutionStatus.RUNNING,
      startTime: new Date(),
      retries: 0,
    };

    context.currentNode = node.id;
    context.trace.push(trace);

    try {
      // 处理超时
      const timeout = node.timeout || workflow.settings.timeout || 30000;
      const result = await this.executeWithTimeout(
        () => this.executeNodeWithRetry(node, context),
        timeout
      );

      // 记录成功
      trace.status = ExecutionStatus.SUCCESS;
      trace.endTime = new Date();
      trace.duration = trace.endTime.getTime() - trace.startTime.getTime();
      trace.output = result;

      // 保存节点输出
      context.nodeData.set(node.id, result);

      // 执行后续节点
      if (node.type !== NodeType.END) {
        return await this.executeNextNodes(node, workflow, context, result);
      }

      return result;
    } catch (error: any) {
      // 处理错误
      trace.status = ExecutionStatus.FAILED;
      trace.endTime = new Date();
      trace.duration = trace.endTime.getTime() - trace.startTime.getTime();
      trace.error = {
        message: error.message,
        stack: error.stack,
        code: error.code,
      };

      // 错误处理策略
      if (node.onError) {
        return await this.handleNodeError(node, workflow, context, error);
      }

      throw error;
    }
  }

  /**
   * 带重试的节点执行
   */
  private async executeNodeWithRetry(
    node: WorkflowNodeConfig,
    context: ExecutionContext
  ): Promise<any> {
    const retryPolicy = node.retryPolicy || { maxRetries: 0, retryDelay: 1000 };
    let lastError: any;

    for (let attempt = 0; attempt <= retryPolicy.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          // 计算退避延迟
          const delay =
            retryPolicy.retryDelay * Math.pow(retryPolicy.backoffMultiplier || 1, attempt - 1);
          await this.sleep(delay);

          // 更新重试次数
          const trace = context.trace[context.trace.length - 1];
          trace.retries = attempt;
        }

        return await this.executeNodeLogic(node, context);
      } catch (error: any) {
        lastError = error;

        // 检查是否应该重试
        if (
          retryPolicy.retryOn &&
          !retryPolicy.retryOn.includes(error.code || error.name)
        ) {
          break;
        }
      }
    }

    throw lastError;
  }

  /**
   * 执行节点逻辑
   */
  private async executeNodeLogic(
    node: WorkflowNodeConfig,
    context: ExecutionContext
  ): Promise<any> {
    // 特殊节点类型处理
    switch (node.type) {
      case NodeType.START:
        return context.variables;

      case NodeType.END:
        return context.nodeData.get(node.id);

      case NodeType.DECISION:
        return this.executeDecisionNode(node as DecisionNodeConfig, context);

      case NodeType.PARALLEL:
        return this.executeParallelNode(node as ParallelNodeConfig, context);

      case NodeType.LOOP:
        return this.executeLoopNode(node as LoopNodeConfig, context);

      default:
        // 使用注册的执行器
        const executor = this.nodeExecutors.get(node.type);
        return await executor.execute(node, context);
    }
  }

  /**
   * 执行决策节点
   */
  private async executeDecisionNode(
    node: DecisionNodeConfig,
    context: ExecutionContext
  ): Promise<any> {
    const { conditions } = node.data;

    for (let i = 0; i < conditions.length; i++) {
      const condition = conditions[i];
      const result = expressionEngine.evaluateCondition(
        condition.left,
        condition.operator,
        condition.right,
        {
          ...context.variables,
          nodeData: Object.fromEntries(context.nodeData),
        }
      );

      if (result) {
        return { branch: i, condition };
      }

      // 处理逻辑运算符
      if (i < conditions.length - 1) {
        if (condition.logicOperator === 'or' && result) {
          return { branch: i, condition };
        }
        if (condition.logicOperator === 'and' && !result) {
          continue;
        }
      }
    }

    // 默认分支
    return { branch: 'default', condition: null };
  }

  /**
   * 执行并行节点
   */
  private async executeParallelNode(
    node: ParallelNodeConfig,
    context: ExecutionContext
  ): Promise<any> {
    const { branches, waitForAll, continueOnError } = node.data;

    const promises = branches.map(async (nodeId) => {
      try {
        const branchNode = this.findNodeById(nodeId, context);
        return await this.executeNodeLogic(branchNode, context);
      } catch (error) {
        if (!continueOnError) {
          throw error;
        }
        return { error: (error as Error).message };
      }
    });

    if (waitForAll) {
      return await Promise.all(promises);
    } else {
      return await Promise.race(promises);
    }
  }

  /**
   * 执行循环节点
   */
  private async executeLoopNode(
    node: LoopNodeConfig,
    context: ExecutionContext
  ): Promise<any> {
    const { iterableSource, itemVariable, maxIterations = 1000, breakCondition } = node.data;

    // 获取迭代数据
    const items = expressionEngine.evaluate(iterableSource, {
      ...context.variables,
      nodeData: Object.fromEntries(context.nodeData),
    });

    if (!Array.isArray(items)) {
      throw new Error('Loop iterable source must be an array');
    }

    const results: any[] = [];
    const limit = Math.min(items.length, maxIterations);

    for (let i = 0; i < limit; i++) {
      // 设置循环变量
      context.variables[itemVariable] = items[i];
      context.variables[`${itemVariable}_index`] = i;

      // 检查中断条件
      if (breakCondition) {
        const shouldBreak = expressionEngine.evaluateCondition(
          breakCondition.left,
          breakCondition.operator,
          breakCondition.right,
          context.variables
        );
        if (shouldBreak) {
          break;
        }
      }

      // 执行循环体 (假设下一个节点是循环体)
      // 这里简化处理，实际应该找到循环体节点
      results.push({ item: items[i], index: i });
    }

    return results;
  }

  /**
   * 执行后续节点
   */
  private async executeNextNodes(
    currentNode: WorkflowNodeConfig,
    workflow: WorkflowDefinition,
    context: ExecutionContext,
    previousResult: any
  ): Promise<any> {
    // 查找所有出边
    const outgoingEdges = workflow.edges.filter((e) => e.source === currentNode.id);

    if (outgoingEdges.length === 0) {
      return previousResult;
    }

    // 单一出边
    if (outgoingEdges.length === 1) {
      const edge = outgoingEdges[0];
      if (this.shouldFollowEdge(edge, context, previousResult)) {
        const nextNode = workflow.nodes.find((n) => n.id === edge.target);
        if (nextNode) {
          return await this.executeNode(nextNode, workflow, context);
        }
      }
      return previousResult;
    }

    // 多分支（决策节点）
    for (const edge of outgoingEdges) {
      if (this.shouldFollowEdge(edge, context, previousResult)) {
        const nextNode = workflow.nodes.find((n) => n.id === edge.target);
        if (nextNode) {
          return await this.executeNode(nextNode, workflow, context);
        }
      }
    }

    return previousResult;
  }

  /**
   * 判断是否应该跟随边
   */
  private shouldFollowEdge(
    edge: WorkflowEdge,
    context: ExecutionContext,
    previousResult: any
  ): boolean {
    if (!edge.condition) {
      return true;
    }

    return expressionEngine.evaluateCondition(
      edge.condition.left,
      edge.condition.operator,
      edge.condition.right,
      {
        ...context.variables,
        result: previousResult,
        nodeData: Object.fromEntries(context.nodeData),
      }
    );
  }

  /**
   * 错误处理
   */
  private async handleNodeError(
    node: WorkflowNodeConfig,
    workflow: WorkflowDefinition,
    context: ExecutionContext,
    error: any
  ): Promise<any> {
    const handler = node.onError!;

    switch (handler.strategy) {
      case 'skip':
        return null;

      case 'fallback':
        if (handler.fallbackNode) {
          const fallbackNode = workflow.nodes.find((n) => n.id === handler.fallbackNode);
          if (fallbackNode) {
            return await this.executeNode(fallbackNode, workflow, context);
          }
        }
        break;

      case 'custom':
        if (handler.customHandler) {
          return expressionEngine.executeJavaScript(handler.customHandler, {
            error,
            node,
            context,
          });
        }
        break;

      case 'fail':
      default:
        throw error;
    }
  }

  /**
   * 超时执行
   */
  private executeWithTimeout<T>(fn: () => Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Execution timeout')), timeout)
      ),
    ]);
  }

  /**
   * 创建执行上下文
   */
  private createExecutionContext(
    workflow: WorkflowDefinition,
    input: any,
    triggeredBy: string
  ): ExecutionContext {
    return {
      workflowId: workflow.id,
      executionId: this.generateExecutionId(),
      triggeredBy,
      triggeredAt: new Date(),
      variables: {
        ...workflow.settings.variables,
        ...input,
      },
      nodeData: new Map(),
      trace: [],
      status: ExecutionStatus.PENDING,
      startTime: new Date(),
    };
  }

  /**
   * 创建执行结果
   */
  private createExecutionResult(
    context: ExecutionContext,
    output?: any,
    error?: any
  ): WorkflowExecutionResult {
    const metrics = this.calculateMetrics(context);

    return {
      executionId: context.executionId,
      workflowId: context.workflowId,
      status: context.status,
      output,
      error: error ? { message: error.message, stack: error.stack } : undefined,
      duration: context.duration || 0,
      trace: context.trace,
      metrics,
    };
  }

  /**
   * 计算执行指标
   */
  private calculateMetrics(context: ExecutionContext): any {
    const successNodes = context.trace.filter((t) => t.status === ExecutionStatus.SUCCESS).length;
    const failedNodes = context.trace.filter((t) => t.status === ExecutionStatus.FAILED).length;
    const skippedNodes = context.trace.filter((t) => t.status === ExecutionStatus.SKIPPED).length;
    const totalRetries = context.trace.reduce((sum, t) => sum + (t.retries || 0), 0);

    const avgDuration =
      context.trace.reduce((sum, t) => sum + (t.duration || 0), 0) / context.trace.length || 0;

    return {
      totalNodes: context.trace.length,
      executedNodes: context.trace.length,
      successNodes,
      failedNodes,
      skippedNodes,
      averageNodeDuration: avgDuration,
      totalRetries,
    };
  }

  /**
   * 工具方法
   */
  private findNodeById(nodeId: string, context: ExecutionContext): WorkflowNodeConfig {
    throw new Error('Method not implemented');
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 取消执行
   */
  async cancelExecution(executionId: string): Promise<void> {
    const context = this.activeExecutions.get(executionId);
    if (context) {
      context.status = ExecutionStatus.CANCELLED;
      this.activeExecutions.delete(executionId);
    }
  }

  /**
   * 暂停执行
   */
  async pauseExecution(executionId: string): Promise<void> {
    const context = this.activeExecutions.get(executionId);
    if (context) {
      context.status = ExecutionStatus.PAUSED;
    }
  }

  /**
   * 恢复执行
   */
  async resumeExecution(executionId: string): Promise<void> {
    const context = this.activeExecutions.get(executionId);
    if (context) {
      context.status = ExecutionStatus.RUNNING;
    }
  }
}

export const executionEngine = new ExecutionEngine();
