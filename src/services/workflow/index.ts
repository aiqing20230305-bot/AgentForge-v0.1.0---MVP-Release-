/**
 * 工作流引擎 - 导出模块
 * Workflow Engine - Export Module
 */

// 类型定义
export * from './types';

// 核心引擎
export { expressionEngine, ExpressionEngine } from './expressionEngine';
export { executionEngine, ExecutionEngine } from './executionEngine';
export { NodeExecutorRegistry } from './nodeExecutors';

// 管理器
export { workflowManager, WorkflowManager } from './workflowManager';
export { triggerManager, TriggerManager } from './triggerManager';
export { templateRegistry, TemplateRegistry } from './templateRegistry';

// 便捷函数
import { workflowManager } from './workflowManager';
import { templateRegistry } from './templateRegistry';

export const WorkflowService = {
  // 工作流管理
  createWorkflow: workflowManager.createWorkflow.bind(workflowManager),
  updateWorkflow: workflowManager.updateWorkflow.bind(workflowManager),
  getWorkflow: workflowManager.getWorkflow.bind(workflowManager),
  listWorkflows: workflowManager.listWorkflows.bind(workflowManager),
  deleteWorkflow: workflowManager.deleteWorkflow.bind(workflowManager),
  duplicateWorkflow: workflowManager.duplicateWorkflow.bind(workflowManager),

  // 执行管理
  executeWorkflow: workflowManager.executeWorkflow.bind(workflowManager),
  cancelExecution: workflowManager.cancelExecution.bind(workflowManager),
  pauseExecution: workflowManager.pauseExecution.bind(workflowManager),
  resumeExecution: workflowManager.resumeExecution.bind(workflowManager),
  getExecutionResult: workflowManager.getExecutionResult.bind(workflowManager),
  getExecutionHistory: workflowManager.getExecutionHistory.bind(workflowManager),

  // 工作流控制
  enableWorkflow: workflowManager.enableWorkflow.bind(workflowManager),
  disableWorkflow: workflowManager.disableWorkflow.bind(workflowManager),

  // 导入导出
  exportWorkflow: workflowManager.exportWorkflow.bind(workflowManager),
  importWorkflow: workflowManager.importWorkflow.bind(workflowManager),

  // 验证和统计
  validateWorkflow: workflowManager.validateWorkflow.bind(workflowManager),
  getStatistics: workflowManager.getWorkflowStatistics.bind(workflowManager),

  // 模板管理
  getTemplates: templateRegistry.getAll.bind(templateRegistry),
  getTemplate: templateRegistry.getById.bind(templateRegistry),
  searchTemplates: templateRegistry.search.bind(templateRegistry),
  getPopularTemplates: templateRegistry.getPopular.bind(templateRegistry),
  getTemplateCategories: templateRegistry.getCategories.bind(templateRegistry),
};
