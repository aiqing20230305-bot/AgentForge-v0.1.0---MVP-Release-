/**
 * 工作流应用 - 主入口组件
 * Workflow App - Main Entry Component
 */

import React, { useState } from 'react';
import { WorkflowDefinition, WorkflowTemplate } from '../../services/workflow/types';
import { workflowManager } from '../../services/workflow';
import { WorkflowList } from './WorkflowList';
import { WorkflowEditor } from './WorkflowEditor';
import { TemplateMarket } from './TemplateMarket';

type ViewMode = 'list' | 'editor' | 'template';

export const WorkflowApp: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowDefinition | null>(null);
  const [showTemplateMarket, setShowTemplateMarket] = useState(false);

  const handleCreateNew = () => {
    setShowTemplateMarket(true);
  };

  const handleSelectTemplate = async (template: WorkflowTemplate) => {
    try {
      const workflow = await workflowManager.createWorkflow(
        template.name,
        template.description,
        template.id
      );
      setCurrentWorkflow(workflow);
      setViewMode('editor');
      setShowTemplateMarket(false);
    } catch (error) {
      console.error('Failed to create workflow from template:', error);
    }
  };

  const handleSelectWorkflow = (workflow: WorkflowDefinition) => {
    setCurrentWorkflow(workflow);
    setViewMode('editor');
  };

  const handleSaveWorkflow = async (workflow: WorkflowDefinition) => {
    try {
      await workflowManager.updateWorkflow(workflow);
      alert('工作流已保存！');
    } catch (error) {
      console.error('Failed to save workflow:', error);
      alert('保存失败，请重试');
    }
  };

  const handleExecuteWorkflow = async (workflow: WorkflowDefinition) => {
    try {
      const result = await workflowManager.executeWorkflow(workflow.id);
      console.log('Workflow execution result:', result);

      if (result.status === 'success') {
        alert(`工作流执行成功！\n耗时: ${result.duration}ms`);
      } else {
        alert(`工作流执行失败\n错误: ${result.error?.message}`);
      }
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      alert('执行失败，请重试');
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setCurrentWorkflow(null);
  };

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: '#f8fafc' }}>
      {viewMode === 'list' && (
        <WorkflowList onSelectWorkflow={handleSelectWorkflow} onCreateNew={handleCreateNew} />
      )}

      {viewMode === 'editor' && currentWorkflow && (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* 返回按钮 */}
          <div style={{ padding: '12px 16px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>
            <button
              onClick={handleBackToList}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#f1f5f9',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              ← 返回列表
            </button>
          </div>

          <div style={{ flex: 1, overflow: 'hidden' }}>
            <WorkflowEditor
              workflow={currentWorkflow}
              onSave={handleSaveWorkflow}
              onExecute={handleExecuteWorkflow}
            />
          </div>
        </div>
      )}

      {showTemplateMarket && (
        <TemplateMarket
          onSelectTemplate={handleSelectTemplate}
          onClose={() => setShowTemplateMarket(false)}
        />
      )}
    </div>
  );
};
