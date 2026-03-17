/**
 * 节点属性面板
 * Node Properties Panel
 */

import React, { useState } from 'react';
import { WorkflowNodeConfig, NodeType } from '../../services/workflow/types';

interface NodePropertiesPanelProps {
  node: WorkflowNodeConfig;
  onChange: (properties: Partial<WorkflowNodeConfig>) => void;
  onClose: () => void;
}

export const NodePropertiesPanel: React.FC<NodePropertiesPanelProps> = ({
  node,
  onChange,
  onClose,
}) => {
  const [localNode, setLocalNode] = useState(node);

  const handleChange = (field: string, value: any) => {
    const updated = { ...localNode, [field]: value };
    setLocalNode(updated);
    onChange({ [field]: value });
  };

  const handleDataChange = (dataField: string, value: any) => {
    const updated = {
      ...localNode,
      data: { ...localNode.data, [dataField]: value },
    };
    setLocalNode(updated);
    onChange({ data: updated.data });
  };

  return (
    <div
      style={{
        width: '320px',
        height: '100%',
        backgroundColor: 'white',
        borderLeft: '1px solid #e2e8f0',
        overflowY: 'auto',
        padding: '16px',
      }}
    >
      {/* 标题 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ flex: 1, margin: 0, fontSize: '16px', fontWeight: 600 }}>节点属性</h3>
        <button
          onClick={onClose}
          style={{
            padding: '4px 8px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '18px',
          }}
        >
          ✕
        </button>
      </div>

      {/* 基本属性 */}
      <div style={{ marginBottom: '16px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '4px',
            color: '#475569',
          }}
        >
          节点名称
        </label>
        <input
          type="text"
          value={localNode.label}
          onChange={(e) => handleChange('label', e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '4px',
            color: '#475569',
          }}
        >
          描述
        </label>
        <textarea
          value={localNode.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            fontSize: '14px',
            resize: 'vertical',
          }}
        />
      </div>

      {/* 节点类型特定配置 */}
      {renderNodeTypeConfig(node.type, localNode.data, handleDataChange)}

      {/* 高级设置 */}
      <details style={{ marginTop: '16px' }}>
        <summary
          style={{
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px',
            marginBottom: '8px',
            color: '#475569',
          }}
        >
          高级设置
        </summary>

        <div style={{ marginTop: '12px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '4px',
              color: '#475569',
            }}
          >
            超时时间 (毫秒)
          </label>
          <input
            type="number"
            value={localNode.timeout || 30000}
            onChange={(e) => handleChange('timeout', parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
        </div>

        <div style={{ marginTop: '12px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '4px',
              color: '#475569',
            }}
          >
            重试次数
          </label>
          <input
            type="number"
            value={localNode.retryPolicy?.maxRetries || 0}
            onChange={(e) =>
              handleChange('retryPolicy', {
                ...localNode.retryPolicy,
                maxRetries: parseInt(e.target.value),
                retryDelay: localNode.retryPolicy?.retryDelay || 1000,
              })
            }
            min="0"
            max="10"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
        </div>
      </details>
    </div>
  );
};

// 渲染不同节点类型的配置
function renderNodeTypeConfig(
  type: NodeType,
  data: any,
  onChange: (field: string, value: any) => void
) {
  switch (type) {
    case NodeType.HTTP_REQUEST:
      return (
        <>
          <div style={{ marginBottom: '12px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '4px',
                color: '#475569',
              }}
            >
              URL
            </label>
            <input
              type="text"
              value={data.url || ''}
              onChange={(e) => onChange('url', e.target.value)}
              placeholder="https://api.example.com/data"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '4px',
                color: '#475569',
              }}
            >
              方法
            </label>
            <select
              value={data.method || 'GET'}
              onChange={(e) => onChange('method', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>
        </>
      );

    case NodeType.DELAY:
      return (
        <div style={{ marginBottom: '12px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '4px',
              color: '#475569',
            }}
          >
            延迟时间
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="number"
              value={data.duration || 1}
              onChange={(e) => onChange('duration', parseInt(e.target.value))}
              min="1"
              style={{
                flex: 1,
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
            <select
              value={data.unit || 's'}
              onChange={(e) => onChange('unit', e.target.value)}
              style={{
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              <option value="ms">毫秒</option>
              <option value="s">秒</option>
              <option value="m">分钟</option>
              <option value="h">小时</option>
            </select>
          </div>
        </div>
      );

    case NodeType.AI_AGENT:
      return (
        <>
          <div style={{ marginBottom: '12px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '4px',
                color: '#475569',
              }}
            >
              Agent ID
            </label>
            <input
              type="text"
              value={data.agentId || ''}
              onChange={(e) => onChange('agentId', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '4px',
                color: '#475569',
              }}
            >
              Prompt 模板
            </label>
            <textarea
              value={data.prompt || ''}
              onChange={(e) => onChange('prompt', e.target.value)}
              rows={4}
              placeholder="输入 prompt，支持 {{variable}} 变量"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'monospace',
              }}
            />
          </div>
        </>
      );

    default:
      return (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#f8fafc',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#64748b',
          }}
        >
          该节点类型暂无特定配置
        </div>
      );
  }
}
