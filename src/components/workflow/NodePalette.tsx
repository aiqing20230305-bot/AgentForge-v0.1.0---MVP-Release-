/**
 * 节点面板 - 可拖拽的节点库
 * Node Palette - Draggable Node Library
 */

import React from 'react';
import { NodeType } from '../../services/workflow/types';

interface NodePaletteProps {
  onAddNode: (type: NodeType) => void;
}

interface NodeCategory {
  name: string;
  icon: string;
  nodes: {
    type: NodeType;
    label: string;
    icon: string;
    description: string;
  }[];
}

const nodeCategories: NodeCategory[] = [
  {
    name: '基础',
    icon: '🔷',
    nodes: [
      { type: NodeType.TASK, label: '任务', icon: '📋', description: '执行自定义任务' },
      { type: NodeType.DELAY, label: '延迟', icon: '⏱️', description: '延迟执行' },
    ],
  },
  {
    name: '控制流',
    icon: '⚙️',
    nodes: [
      { type: NodeType.DECISION, label: '条件判断', icon: '❓', description: '根据条件分支' },
      { type: NodeType.PARALLEL, label: '并行', icon: '⚡', description: '并行执行多个分支' },
      { type: NodeType.LOOP, label: '循环', icon: '🔁', description: '循环执行' },
    ],
  },
  {
    name: '数据处理',
    icon: '📊',
    nodes: [
      { type: NodeType.TRANSFORM, label: '转换', icon: '🔄', description: '转换数据格式' },
      { type: NodeType.FILTER, label: '过滤', icon: '🔍', description: '过滤数据' },
      { type: NodeType.AGGREGATE, label: '聚合', icon: '📊', description: '聚合统计数据' },
    ],
  },
  {
    name: '集成',
    icon: '🔗',
    nodes: [
      { type: NodeType.WEBHOOK, label: 'Webhook', icon: '🔔', description: '发送 Webhook' },
      { type: NodeType.HTTP_REQUEST, label: 'HTTP 请求', icon: '🌐', description: 'HTTP API 调用' },
      { type: NodeType.DATABASE, label: '数据库', icon: '💾', description: '数据库操作' },
    ],
  },
  {
    name: 'AI',
    icon: '🤖',
    nodes: [
      { type: NodeType.AI_AGENT, label: 'AI Agent', icon: '🤖', description: '调用 AI Agent' },
    ],
  },
  {
    name: '通知',
    icon: '📧',
    nodes: [
      {
        type: NodeType.NOTIFICATION,
        label: '通知',
        icon: '📧',
        description: '发送通知',
      },
    ],
  },
  {
    name: '文件',
    icon: '📁',
    nodes: [
      {
        type: NodeType.FILE_OPERATION,
        label: '文件操作',
        icon: '📁',
        description: '文件读写操作',
      },
    ],
  },
];

export const NodePalette: React.FC<NodePaletteProps> = ({ onAddNode }) => {
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(
    new Set(['基础', '控制流'])
  );

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  };

  return (
    <div
      style={{
        width: '280px',
        height: '100%',
        backgroundColor: 'white',
        borderRight: '1px solid #e2e8f0',
        overflowY: 'auto',
        padding: '16px',
      }}
    >
      <h3
        style={{
          margin: '0 0 16px 0',
          fontSize: '16px',
          fontWeight: 600,
          color: '#1e293b',
        }}
      >
        节点库
      </h3>

      {nodeCategories.map((category) => (
        <div key={category.name} style={{ marginBottom: '12px' }}>
          <div
            onClick={() => toggleCategory(category.name)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              cursor: 'pointer',
              borderRadius: '6px',
              backgroundColor: '#f8fafc',
              fontWeight: 600,
              fontSize: '14px',
              color: '#475569',
            }}
          >
            <span>{category.icon}</span>
            <span style={{ flex: 1 }}>{category.name}</span>
            <span style={{ fontSize: '12px' }}>
              {expandedCategories.has(category.name) ? '▼' : '▶'}
            </span>
          </div>

          {expandedCategories.has(category.name) && (
            <div style={{ marginTop: '8px' }}>
              {category.nodes.map((node) => (
                <div
                  key={node.type}
                  onClick={() => onAddNode(node.type)}
                  style={{
                    padding: '12px',
                    marginBottom: '8px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    backgroundColor: 'white',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>{node.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>
                        {node.label}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        {node.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* 提示 */}
      <div
        style={{
          marginTop: '24px',
          padding: '12px',
          backgroundColor: '#f0f9ff',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#0369a1',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: '4px' }}>💡 提示</div>
        <div>点击节点将其添加到画布中央</div>
      </div>
    </div>
  );
};
