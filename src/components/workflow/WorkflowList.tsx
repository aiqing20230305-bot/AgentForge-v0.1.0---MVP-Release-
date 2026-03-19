/**
 * 工作流列表
 * Workflow List
 */

import React, { useState, useEffect } from 'react';
import { WorkflowDefinition } from '../../services/workflow/types';
import { workflowManager } from '../../services/workflow';

interface WorkflowListProps {
  onSelectWorkflow: (workflow: WorkflowDefinition) => void;
  onCreateNew: () => void;
}

export const WorkflowList: React.FC<WorkflowListProps> = ({ onSelectWorkflow, onCreateNew }) => {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const list = await workflowManager.listWorkflows();
      setWorkflows(list);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('确定要删除此工作流吗？')) {
      return;
    }

    try {
      await workflowManager.deleteWorkflow(id);
      await loadWorkflows();
    } catch (error) {
      console.error('Failed to delete workflow:', error);
    }
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await workflowManager.duplicateWorkflow(id);
      await loadWorkflows();
    } catch (error) {
      console.error('Failed to duplicate workflow:', error);
    }
  };

  const filteredWorkflows = workflows.filter((w) =>
    searchQuery
      ? w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* 头部 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <h1 style={{ flex: 1, margin: 0, fontSize: '24px', fontWeight: 600 }}>
          📊 我的工作流
        </h1>

        <input
          type="text"
          placeholder="搜索工作流..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '300px',
            padding: '8px 12px',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        />

        <button
          onClick={onCreateNew}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#3b82f6',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s',
          }}
        >
          ➕ 创建工作流
        </button>
      </div>

      {/* 工作流列表 */}
      {filteredWorkflows.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            color: '#94a3b8',
          }}
        >
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>暂无工作流</p>
          <p style={{ fontSize: '14px' }}>点击"创建工作流"开始构建自动化流程</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {filteredWorkflows.map((workflow) => (
            <div
              key={workflow.id}
              onClick={() => onSelectWorkflow(workflow)}
              style={{
                padding: '20px',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: 'white',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'start', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600 }}>
                    {workflow.name}
                  </h3>
                  {workflow.description && (
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                      {workflow.description}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '12px', color: '#64748b' }}>
                <span>📊 {workflow.nodes.length} 节点</span>
                <span>🔗 {workflow.edges.length} 连接</span>
                <span>🎯 {workflow.triggers.length} 触发器</span>
              </div>

              {workflow.tags && workflow.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                  {workflow.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: '2px 8px',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: '#475569',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={(e) => handleDuplicate(workflow.id, e)}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '12px',
                    transition: 'all 0.2s',
                  }}
                >
                  📋 复制
                </button>
                <button
                  onClick={(e) => handleDelete(workflow.id, e)}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    border: '1px solid #fee2e2',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    color: '#dc2626',
                    cursor: 'pointer',
                    fontSize: '12px',
                    transition: 'all 0.2s',
                  }}
                >
                  🗑️ 删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
