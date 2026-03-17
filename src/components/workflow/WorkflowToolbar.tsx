/**
 * 工作流工具栏
 * Workflow Toolbar
 */

import React from 'react';
import { WorkflowDefinition } from '../../services/workflow/types';

interface WorkflowToolbarProps {
  workflow: WorkflowDefinition;
  hasChanges: boolean;
  onSave: () => void;
  onExecute?: () => void;
  onDeleteNode?: () => void;
}

export const WorkflowToolbar: React.FC<WorkflowToolbarProps> = ({
  workflow,
  hasChanges,
  onSave,
  onExecute,
  onDeleteNode,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      {/* 标题 */}
      <div style={{ flex: 1 }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
          {workflow.name}
          {hasChanges && <span style={{ color: '#f59e0b', marginLeft: '8px' }}>*</span>}
        </h2>
        {workflow.description && (
          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
            {workflow.description}
          </p>
        )}
      </div>

      {/* 操作按钮 */}
      <button
        onClick={onSave}
        disabled={!hasChanges}
        style={{
          padding: '8px 16px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: hasChanges ? '#3b82f6' : '#e2e8f0',
          color: hasChanges ? 'white' : '#94a3b8',
          fontWeight: 600,
          cursor: hasChanges ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
        }}
      >
        💾 保存
      </button>

      {onExecute && (
        <button
          onClick={onExecute}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#10b981',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          ▶️ 执行
        </button>
      )}

      {onDeleteNode && (
        <button
          onClick={onDeleteNode}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#ef4444',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          🗑️ 删除节点
        </button>
      )}

      {/* 统计信息 */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          padding: '8px 16px',
          backgroundColor: '#f8fafc',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#64748b',
        }}
      >
        <div>
          <span style={{ fontWeight: 600 }}>{workflow.nodes.length}</span> 节点
        </div>
        <div>
          <span style={{ fontWeight: 600 }}>{workflow.edges.length}</span> 连接
        </div>
      </div>
    </div>
  );
};
