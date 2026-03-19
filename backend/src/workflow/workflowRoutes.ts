/**
 * 工作流路由 - API 路由配置
 * Workflow Routes - API Route Configuration
 */

import { Router } from 'express';
import * as workflowController from './workflowController';

const router = Router();

// 工作流 CRUD
router.get('/workflows', workflowController.getAllWorkflows);
router.get('/workflows/:id', workflowController.getWorkflow);
router.post('/workflows', workflowController.createWorkflow);
router.put('/workflows/:id', workflowController.updateWorkflow);
router.delete('/workflows/:id', workflowController.deleteWorkflow);

// 工作流执行
router.post('/workflows/:id/execute', workflowController.executeWorkflow);
router.get('/executions/:executionId', workflowController.getExecutionResult);
router.get('/workflows/:id/executions', workflowController.getExecutionHistory);

// 工作流验证和统计
router.post('/workflows/validate', workflowController.validateWorkflow);
router.get('/workflows/:id/statistics', workflowController.getWorkflowStatistics);

// 模板
router.get('/templates', workflowController.getTemplates);

export default router;
