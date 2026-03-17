/**
 * 工作流管理器 - 统一管理接口
 * Workflow Manager - Unified Management Interface
 */

import {
  WorkflowDefinition,
  WorkflowExecutionResult,
  WorkflowTemplate,
  TriggerType,
  NodeType,
} from './types';
import { executionEngine } from './executionEngine';
import { triggerManager } from './triggerManager';
import { templateRegistry } from './templateRegistry';

/**
 * 工作流存储接口
 */
interface WorkflowStorage {
  save(workflow: WorkflowDefinition): Promise<void>;
  load(id: string): Promise<WorkflowDefinition | null>;
  list(): Promise<WorkflowDefinition[]>;
  delete(id: string): Promise<void>;
}

/**
 * 内存存储实现
 */
class MemoryStorage implements WorkflowStorage {
  private workflows = new Map<string, WorkflowDefinition>();

  async save(workflow: WorkflowDefinition): Promise<void> {
    this.workflows.set(workflow.id, workflow);
  }

  async load(id: string): Promise<WorkflowDefinition | null> {
    return this.workflows.get(id) || null;
  }

  async list(): Promise<WorkflowDefinition[]> {
    return Array.from(this.workflows.values());
  }

  async delete(id: string): Promise<void> {
    this.workflows.delete(id);
  }
}

/**
 * 工作流管理器
 */
export class WorkflowManager {
  private storage: WorkflowStorage;
  private executions = new Map<string, WorkflowExecutionResult>();

  constructor(storage?: WorkflowStorage) {
    this.storage = storage || new MemoryStorage();
  }

  /**
   * 创建新工作流
   */
  async createWorkflow(
    name: string,
    description?: string,
    templateId?: string
  ): Promise<WorkflowDefinition> {
    let workflow: WorkflowDefinition;

    if (templateId) {
      // 从模板创建
      const template = templateRegistry.getById(templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      workflow = {
        ...template.definition,
        id: this.generateId(),
        name,
        description: description || template.description,
        metadata: {
          ...template.definition.metadata,
          createdAt: new Date(),
          updatedAt: new Date(),
          isTemplate: false,
          templateId,
        },
      };
    } else {
      // 创建空白工作流
      workflow = {
        id: this.generateId(),
        name,
        description,
        version: '1.0.0',
        tags: [],
        nodes: [
          {
            id: 'start',
            type: NodeType.START,
            label: '开始',
            position: { x: 100, y: 100 },
            data: {},
          },
          {
            id: 'end',
            type: NodeType.END,
            label: '结束',
            position: { x: 500, y: 100 },
            data: {},
          },
        ],
        edges: [{ id: 'e1', source: 'start', target: 'end' }],
        triggers: [{ type: TriggerType.MANUAL, enabled: true, config: {} }],
        settings: {
          timeout: 60000,
          maxExecutionTime: 300000,
          variables: {},
        },
        metadata: {
          createdBy: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };
    }

    await this.storage.save(workflow);
    return workflow;
  }

  /**
   * 更新工作流
   */
  async updateWorkflow(workflow: WorkflowDefinition): Promise<void> {
    workflow.metadata.updatedAt = new Date();
    await this.storage.save(workflow);

    // 重新注册触发器
    triggerManager.unregisterWorkflowTriggers(workflow.id);
    triggerManager.registerWorkflowTriggers(workflow);
  }

  /**
   * 获取工作流
   */
  async getWorkflow(id: string): Promise<WorkflowDefinition | null> {
    return await this.storage.load(id);
  }

  /**
   * 列出所有工作流
   */
  async listWorkflows(): Promise<WorkflowDefinition[]> {
    return await this.storage.list();
  }

  /**
   * 删除工作流
   */
  async deleteWorkflow(id: string): Promise<void> {
    triggerManager.unregisterWorkflowTriggers(id);
    await this.storage.delete(id);
  }

  /**
   * 执行工作流
   */
  async executeWorkflow(
    workflowId: string,
    input?: any,
    triggeredBy: string = 'manual'
  ): Promise<WorkflowExecutionResult> {
    const workflow = await this.storage.load(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const result = await executionEngine.execute(workflow, input, triggeredBy);

    // 保存执行结果
    this.executions.set(result.executionId, result);

    return result;
  }

  /**
   * 获取执行结果
   */
  getExecutionResult(executionId: string): WorkflowExecutionResult | undefined {
    return this.executions.get(executionId);
  }

  /**
   * 获取工作流的执行历史
   */
  getExecutionHistory(workflowId: string, limit: number = 50): WorkflowExecutionResult[] {
    return Array.from(this.executions.values())
      .filter((e) => e.workflowId === workflowId)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  /**
   * 取消执行
   */
  async cancelExecution(executionId: string): Promise<void> {
    await executionEngine.cancelExecution(executionId);
  }

  /**
   * 暂停执行
   */
  async pauseExecution(executionId: string): Promise<void> {
    await executionEngine.pauseExecution(executionId);
  }

  /**
   * 恢复执行
   */
  async resumeExecution(executionId: string): Promise<void> {
    await executionEngine.resumeExecution(executionId);
  }

  /**
   * 启用工作流
   */
  async enableWorkflow(workflowId: string): Promise<void> {
    const workflow = await this.storage.load(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    // 启用所有触发器
    for (const trigger of workflow.triggers) {
      trigger.enabled = true;
    }

    await this.storage.save(workflow);
    triggerManager.registerWorkflowTriggers(workflow);
  }

  /**
   * 禁用工作流
   */
  async disableWorkflow(workflowId: string): Promise<void> {
    const workflow = await this.storage.load(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    // 禁用所有触发器
    for (const trigger of workflow.triggers) {
      trigger.enabled = false;
    }

    await this.storage.save(workflow);
    triggerManager.unregisterWorkflowTriggers(workflowId);
  }

  /**
   * 复制工作流
   */
  async duplicateWorkflow(workflowId: string, newName?: string): Promise<WorkflowDefinition> {
    const original = await this.storage.load(workflowId);
    if (!original) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const duplicate: WorkflowDefinition = {
      ...original,
      id: this.generateId(),
      name: newName || `${original.name} (副本)`,
      metadata: {
        ...original.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    await this.storage.save(duplicate);
    return duplicate;
  }

  /**
   * 导出工作流
   */
  async exportWorkflow(workflowId: string): Promise<string> {
    const workflow = await this.storage.load(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    return JSON.stringify(workflow, null, 2);
  }

  /**
   * 导入工作流
   */
  async importWorkflow(json: string): Promise<WorkflowDefinition> {
    const workflow = JSON.parse(json) as WorkflowDefinition;

    // 生成新ID
    workflow.id = this.generateId();
    workflow.metadata.createdAt = new Date();
    workflow.metadata.updatedAt = new Date();

    await this.storage.save(workflow);
    return workflow;
  }

  /**
   * 验证工作流
   */
  validateWorkflow(workflow: WorkflowDefinition): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // 检查必要字段
    if (!workflow.id) errors.push('Workflow ID is required');
    if (!workflow.name) errors.push('Workflow name is required');
    if (!workflow.nodes || workflow.nodes.length === 0) {
      errors.push('Workflow must have at least one node');
    }

    // 检查起始和结束节点
    const hasStart = workflow.nodes.some((n) => n.type === NodeType.START);
    const hasEnd = workflow.nodes.some((n) => n.type === NodeType.END);
    if (!hasStart) errors.push('Workflow must have a start node');
    if (!hasEnd) errors.push('Workflow must have an end node');

    // 检查边的有效性
    for (const edge of workflow.edges) {
      const sourceExists = workflow.nodes.some((n) => n.id === edge.source);
      const targetExists = workflow.nodes.some((n) => n.id === edge.target);

      if (!sourceExists) {
        errors.push(`Edge ${edge.id}: source node ${edge.source} not found`);
      }
      if (!targetExists) {
        errors.push(`Edge ${edge.id}: target node ${edge.target} not found`);
      }
    }

    // 检查孤立节点
    const connectedNodes = new Set<string>();
    for (const edge of workflow.edges) {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    }

    for (const node of workflow.nodes) {
      if (
        node.type !== NodeType.START &&
        node.type !== NodeType.END &&
        !connectedNodes.has(node.id)
      ) {
        errors.push(`Node ${node.id} (${node.label}) is not connected`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 获取工作流统计
   */
  async getWorkflowStatistics(workflowId: string): Promise<any> {
    const executions = this.getExecutionHistory(workflowId);

    if (executions.length === 0) {
      return {
        totalExecutions: 0,
        successRate: 0,
        averageDuration: 0,
        lastExecution: null,
      };
    }

    const successful = executions.filter((e) => e.status === 'success').length;
    const totalDuration = executions.reduce((sum, e) => sum + e.duration, 0);

    return {
      totalExecutions: executions.length,
      successRate: (successful / executions.length) * 100,
      averageDuration: totalDuration / executions.length,
      lastExecution: executions[0],
      failedExecutions: executions.filter((e) => e.status === 'failed').length,
    };
  }

  /**
   * 获取所有模板
   */
  getTemplates(): WorkflowTemplate[] {
    return templateRegistry.getAll();
  }

  /**
   * 搜索模板
   */
  searchTemplates(query: string): WorkflowTemplate[] {
    return templateRegistry.search(query);
  }

  /**
   * 获取热门模板
   */
  getPopularTemplates(limit?: number): WorkflowTemplate[] {
    return templateRegistry.getPopular(limit);
  }

  /**
   * 工具方法
   */
  private generateId(): string {
    return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 导出单例
export const workflowManager = new WorkflowManager();
