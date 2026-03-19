/**
 * 工作流画布 - 可视化编辑器核心
 * Workflow Canvas - Visual Editor Core
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { WorkflowNodeConfig, WorkflowEdge, NodeType } from '../../services/workflow/types';

interface WorkflowCanvasProps {
  nodes: WorkflowNodeConfig[];
  edges: WorkflowEdge[];
  onNodesChange: (nodes: WorkflowNodeConfig[]) => void;
  onEdgesChange: (edges: WorkflowEdge[]) => void;
  onNodeClick?: (node: WorkflowNodeConfig) => void;
  readOnly?: boolean;
}

interface DragState {
  nodeId: string;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

interface ConnectionState {
  sourceNodeId: string;
  sourceX: number;
  sourceY: number;
  currentX: number;
  currentY: number;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  readOnly = false,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState | null>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // 节点样式配置
  const getNodeStyle = (type: NodeType): any => {
    const baseStyle = {
      minWidth: '120px',
      minHeight: '60px',
      padding: '12px',
      borderRadius: '8px',
      border: '2px solid',
      backgroundColor: '#fff',
      cursor: readOnly ? 'default' : 'move',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'all 0.2s',
    };

    const styles: Record<NodeType, any> = {
      [NodeType.START]: { ...baseStyle, borderColor: '#10b981', backgroundColor: '#d1fae5' },
      [NodeType.END]: { ...baseStyle, borderColor: '#ef4444', backgroundColor: '#fee2e2' },
      [NodeType.TASK]: { ...baseStyle, borderColor: '#3b82f6', backgroundColor: '#dbeafe' },
      [NodeType.DECISION]: { ...baseStyle, borderColor: '#f59e0b', backgroundColor: '#fef3c7' },
      [NodeType.PARALLEL]: { ...baseStyle, borderColor: '#8b5cf6', backgroundColor: '#ede9fe' },
      [NodeType.LOOP]: { ...baseStyle, borderColor: '#ec4899', backgroundColor: '#fce7f3' },
      [NodeType.DELAY]: { ...baseStyle, borderColor: '#6366f1', backgroundColor: '#e0e7ff' },
      [NodeType.WEBHOOK]: { ...baseStyle, borderColor: '#14b8a6', backgroundColor: '#ccfbf1' },
      [NodeType.HTTP_REQUEST]: { ...baseStyle, borderColor: '#06b6d4', backgroundColor: '#cffafe' },
      [NodeType.TRANSFORM]: { ...baseStyle, borderColor: '#84cc16', backgroundColor: '#ecfccb' },
      [NodeType.FILTER]: { ...baseStyle, borderColor: '#eab308', backgroundColor: '#fef9c3' },
      [NodeType.AGGREGATE]: { ...baseStyle, borderColor: '#f97316', backgroundColor: '#ffedd5' },
      [NodeType.AI_AGENT]: { ...baseStyle, borderColor: '#a855f7', backgroundColor: '#f3e8ff' },
      [NodeType.NOTIFICATION]: { ...baseStyle, borderColor: '#f43f5e', backgroundColor: '#ffe4e6' },
      [NodeType.DATABASE]: { ...baseStyle, borderColor: '#0891b2', backgroundColor: '#cffafe' },
      [NodeType.FILE_OPERATION]: { ...baseStyle, borderColor: '#64748b', backgroundColor: '#f1f5f9' },
    };

    return styles[type] || baseStyle;
  };

  // 节点图标
  const getNodeIcon = (type: NodeType): string => {
    const icons: Record<NodeType, string> = {
      [NodeType.START]: '▶️',
      [NodeType.END]: '⏹️',
      [NodeType.TASK]: '📋',
      [NodeType.DECISION]: '❓',
      [NodeType.PARALLEL]: '⚡',
      [NodeType.LOOP]: '🔁',
      [NodeType.DELAY]: '⏱️',
      [NodeType.WEBHOOK]: '🔔',
      [NodeType.HTTP_REQUEST]: '🌐',
      [NodeType.TRANSFORM]: '🔄',
      [NodeType.FILTER]: '🔍',
      [NodeType.AGGREGATE]: '📊',
      [NodeType.AI_AGENT]: '🤖',
      [NodeType.NOTIFICATION]: '📧',
      [NodeType.DATABASE]: '💾',
      [NodeType.FILE_OPERATION]: '📁',
    };
    return icons[type] || '📌';
  };

  // 开始拖拽节点
  const handleNodeMouseDown = useCallback(
    (e: React.MouseEvent, node: WorkflowNodeConfig) => {
      if (readOnly) return;

      e.stopPropagation();
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      setDragState({
        nodeId: node.id,
        startX: e.clientX,
        startY: e.clientY,
        offsetX: node.position.x,
        offsetY: node.position.y,
      });

      setSelectedNodeId(node.id);
    },
    [readOnly]
  );

  // 拖拽节点
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragState) {
        const deltaX = (e.clientX - dragState.startX) / scale;
        const deltaY = (e.clientY - dragState.startY) / scale;

        const updatedNodes = nodes.map((node) =>
          node.id === dragState.nodeId
            ? {
                ...node,
                position: {
                  x: dragState.offsetX + deltaX,
                  y: dragState.offsetY + deltaY,
                },
              }
            : node
        );

        onNodesChange(updatedNodes);
      }

      if (connectionState) {
        setConnectionState({
          ...connectionState,
          currentX: e.clientX - (canvasRef.current?.getBoundingClientRect().left || 0),
          currentY: e.clientY - (canvasRef.current?.getBoundingClientRect().top || 0),
        });
      }
    },
    [dragState, connectionState, nodes, onNodesChange, scale]
  );

  // 结束拖拽
  const handleMouseUp = useCallback(() => {
    setDragState(null);
    setConnectionState(null);
  }, []);

  // 点击节点
  const handleNodeClick = useCallback(
    (node: WorkflowNodeConfig) => {
      setSelectedNodeId(node.id);
      onNodeClick?.(node);
    },
    [onNodeClick]
  );

  // 开始连接
  const handleStartConnection = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      if (readOnly) return;

      e.stopPropagation();
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      setConnectionState({
        sourceNodeId: nodeId,
        sourceX: node.position.x + 60,
        sourceY: node.position.y + 30,
        currentX: e.clientX - rect.left,
        currentY: e.clientY - rect.top,
      });
    },
    [nodes, readOnly]
  );

  // 完成连接
  const handleEndConnection = useCallback(
    (targetNodeId: string) => {
      if (!connectionState || readOnly) return;

      if (connectionState.sourceNodeId !== targetNodeId) {
        const newEdge: WorkflowEdge = {
          id: `e_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          source: connectionState.sourceNodeId,
          target: targetNodeId,
        };

        onEdgesChange([...edges, newEdge]);
      }

      setConnectionState(null);
    },
    [connectionState, edges, onEdgesChange, readOnly]
  );

  // 删除边
  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      if (readOnly) return;
      onEdgesChange(edges.filter((e) => e.id !== edgeId));
    },
    [edges, onEdgesChange, readOnly]
  );

  // 缩放
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((prev) => Math.max(0.1, Math.min(3, prev * delta)));
  }, []);

  // 渲染连接线
  const renderEdges = () => {
    return edges.map((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);

      if (!sourceNode || !targetNode) return null;

      const x1 = sourceNode.position.x + 120;
      const y1 = sourceNode.position.y + 30;
      const x2 = targetNode.position.x;
      const y2 = targetNode.position.y + 30;

      const midX = (x1 + x2) / 2;

      return (
        <g key={edge.id}>
          <path
            d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
            stroke="#94a3b8"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrowhead)"
            style={{ cursor: readOnly ? 'default' : 'pointer' }}
          />
          {!readOnly && (
            <circle
              cx={midX}
              cy={(y1 + y2) / 2}
              r="8"
              fill="#ef4444"
              style={{ cursor: 'pointer' }}
              onClick={() => handleDeleteEdge(edge.id)}
            >
              <title>删除连接</title>
            </circle>
          )}
        </g>
      );
    });
  };

  return (
    <div
      ref={canvasRef}
      className="workflow-canvas"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#f8fafc',
        backgroundImage: `
          linear-gradient(#e2e8f0 1px, transparent 1px),
          linear-gradient(90deg, #e2e8f0 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
        cursor: dragState ? 'grabbing' : 'default',
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* SVG 层 - 连接线 */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          transform: `scale(${scale})`,
          transformOrigin: '0 0',
        }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#94a3b8" />
          </marker>
        </defs>
        {renderEdges()}
        {/* 临时连接线 */}
        {connectionState && (
          <line
            x1={connectionState.sourceX}
            y1={connectionState.sourceY}
            x2={connectionState.currentX / scale}
            y2={connectionState.currentY / scale}
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        )}
      </svg>

      {/* 节点层 */}
      <div
        style={{
          transform: `scale(${scale}) translate(${pan.x}px, ${pan.y}px)`,
          transformOrigin: '0 0',
          width: '100%',
          height: '100%',
        }}
      >
        {nodes.map((node) => (
          <div
            key={node.id}
            style={{
              ...getNodeStyle(node.type),
              position: 'absolute',
              left: node.position.x,
              top: node.position.y,
              border:
                selectedNodeId === node.id
                  ? `3px solid #3b82f6`
                  : getNodeStyle(node.type).border,
            }}
            onMouseDown={(e) => handleNodeMouseDown(e, node)}
            onClick={() => handleNodeClick(node)}
          >
            {/* 节点内容 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>{getNodeIcon(node.type)}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{node.label}</div>
                {node.description && (
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    {node.description}
                  </div>
                )}
              </div>
            </div>

            {/* 连接点 */}
            {!readOnly && (
              <>
                <div
                  style={{
                    position: 'absolute',
                    right: '-8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: '#3b82f6',
                    cursor: 'crosshair',
                    border: '2px solid white',
                  }}
                  onMouseDown={(e) => handleStartConnection(e, node.id)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <title>拖拽创建连接</title>
                </div>
                <div
                  style={{
                    position: 'absolute',
                    left: '-8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    cursor: 'pointer',
                    border: '2px solid white',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEndConnection(node.id);
                  }}
                >
                  <title>连接到此节点</title>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* 工具栏 */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          display: 'flex',
          gap: '8px',
          backgroundColor: 'white',
          padding: '8px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <button
          onClick={() => setScale((s) => Math.min(3, s * 1.2))}
          style={{
            padding: '8px 12px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#f1f5f9',
            cursor: 'pointer',
          }}
        >
          ➕
        </button>
        <button
          onClick={() => setScale((s) => Math.max(0.1, s / 1.2))}
          style={{
            padding: '8px 12px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#f1f5f9',
            cursor: 'pointer',
          }}
        >
          ➖
        </button>
        <button
          onClick={() => setScale(1)}
          style={{
            padding: '8px 12px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#f1f5f9',
            cursor: 'pointer',
          }}
        >
          {Math.round(scale * 100)}%
        </button>
      </div>
    </div>
  );
};
