/**
 * 工作流控制器 - 后端 API
 * Workflow Controller - Backend API
 */

import { Request, Response } from 'express';

// 模拟数据存储
const workflows = new Map<string, any>();
const executions = new Map<string, any>();

/**
 * 获取所有工作流
 */
export const getAllWorkflows = async (req: Request, res: Response) => {
  try {
    const workflowList = Array.from(workflows.values());
    res.json({
      success: true,
      data: workflowList,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * 获取单个工作流
 */
export const getWorkflow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const workflow = workflows.get(id);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found',
      });
    }

    res.json({
      success: true,
      data: workflow,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * 创建工作流
 */
export const createWorkflow = async (req: Request, res: Response) => {
  try {
    const workflow = {
      ...req.body,
      id: `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        ...req.body.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    workflows.set(workflow.id, workflow);

    res.status(201).json({
      success: true,
      data: workflow,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * 更新工作流
 */
export const updateWorkflow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = workflows.get(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found',
      });
    }

    const updated = {
      ...existing,
      ...req.body,
      id,
      metadata: {
        ...existing.metadata,
        ...req.body.metadata,
        updatedAt: new Date(),
      },
    };

    workflows.set(id, updated);

    res.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * 删除工作流
 */
export const deleteWorkflow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!workflows.has(id)) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found',
      });
    }

    workflows.delete(id);

    res.json({
      success: true,
      message: 'Workflow deleted',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * 执行工作流
 */
export const executeWorkflow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { input } = req.body;

    const workflow = workflows.get(id);
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found',
      });
    }

    // 创建执行记录
    const execution = {
      executionId: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workflowId: id,
      status: 'running',
      startTime: new Date(),
      input,
    };

    executions.set(execution.executionId, execution);

    // 模拟异步执行
    setTimeout(() => {
      const completed = {
        ...execution,
        status: 'success',
        endTime: new Date(),
        duration: Date.now() - execution.startTime.getTime(),
        output: { message: 'Workflow executed successfully' },
      };
      executions.set(execution.executionId, completed);
    }, 1000);

    res.json({
      success: true,
      data: execution,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * 获取执行结果
 */
export const getExecutionResult = async (req: Request, res: Response) => {
  try {
    const { executionId } = req.params;
    const execution = executions.get(executionId);

    if (!execution) {
      return res.status(404).json({
        success: false,
        error: 'Execution not found',
      });
    }

    res.json({
      success: true,
      data: execution,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * 获取工作流执行历史
 */
export const getExecutionHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;

    const history = Array.from(executions.values())
      .filter((e) => e.workflowId === id)
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, Number(limit));

    res.json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * 获取模板列表
 */
export const getTemplates = async (req: Request, res: Response) => {
  try {
    // 这里应该从模板注册表获取
    res.json({
      success: true,
      data: [],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * 验证工作流
 */
export const validateWorkflow = async (req: Request, res: Response) => {
  try {
    const workflow = req.body;
    const errors: string[] = [];

    // 基本验证
    if (!workflow.name) errors.push('Workflow name is required');
    if (!workflow.nodes || workflow.nodes.length === 0) {
      errors.push('Workflow must have at least one node');
    }

    // 检查起始和结束节点
    const hasStart = workflow.nodes?.some((n: any) => n.type === 'start');
    const hasEnd = workflow.nodes?.some((n: any) => n.type === 'end');
    if (!hasStart) errors.push('Workflow must have a start node');
    if (!hasEnd) errors.push('Workflow must have an end node');

    res.json({
      success: true,
      data: {
        valid: errors.length === 0,
        errors,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * 获取工作流统计
 */
export const getWorkflowStatistics = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const workflowExecutions = Array.from(executions.values()).filter(
      (e) => e.workflowId === id
    );

    const successful = workflowExecutions.filter((e) => e.status === 'success').length;
    const totalDuration = workflowExecutions.reduce((sum, e) => sum + (e.duration || 0), 0);

    const statistics = {
      totalExecutions: workflowExecutions.length,
      successRate: workflowExecutions.length > 0 ? (successful / workflowExecutions.length) * 100 : 0,
      averageDuration: workflowExecutions.length > 0 ? totalDuration / workflowExecutions.length : 0,
      lastExecution: workflowExecutions[0] || null,
      failedExecutions: workflowExecutions.filter((e) => e.status === 'failed').length,
    };

    res.json({
      success: true,
      data: statistics,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
