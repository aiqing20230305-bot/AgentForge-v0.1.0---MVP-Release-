/**
 * 工作流编辑器 - 主界面
 * Workflow Editor - Main Interface
 */

import React, { useState, useCallback } from 'react';
import { WorkflowDefinition, WorkflowNodeConfig, WorkflowEdge, NodeType } from '../../services/workflow/types';
import { WorkflowCanvas } from './WorkflowCanvas';
import { NodePalette } from './NodePalette';
import { NodePropertiesPanel } from './NodePropertiesPanel';
import { WorkflowToolbar } from './WorkflowToolbar';

interface WorkflowEditorProps {
  workflow: WorkflowDefinition;
  onSave: (workflow: WorkflowDefinition) => void;
  onExecute?: (workflow: WorkflowDefinition) => void;
}

export const WorkflowEditor: React.FC<WorkflowEditorProps> = ({
  workflow: initialWorkflow,
  onSave,
  onExecute,
}) => {
  const [workflow, setWorkflow] = useState<WorkflowDefinition>(initialWorkflow);
  const [selectedNode, setSelectedNode] = useState<WorkflowNodeConfig | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // 更新节点
  const handleNodesChange = useCallback((nodes: WorkflowNodeConfig[]) => {
    setWorkflow((prev) => ({ ...prev, nodes }));
    setHasChanges(true);
  }, []);

  // 更新边
  const handleEdgesChange = useCallback((edges: WorkflowEdge[]) => {
    setWorkflow((prev) => ({ ...prev, edges }));
    setHasChanges(true);
  }, []);

  // 添加节点
  const handleAddNode = useCallback(
    (type: NodeType) => {
      const newNode: WorkflowNodeConfig = {
        id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        label: `${type} 节点`,
        position: {
          x: 400 + Math.random() * 200,
          y: 200 + Math.random() * 200,
        },
        data: {},
      };

      handleNodesChange([...workflow.nodes, newNode]);
    },
    [workflow.nodes, handleNodesChange]
  );

  // 删除节点
  const handleDeleteNode = useCallback(() => {
    if (!selectedNode) return;

    const nodes = workflow.nodes.filter((n) => n.id !== selectedNode.id);
    const edges = workflow.edges.filter(
      (e) => e.source !== selectedNode.id && e.target !== selectedNode.id
    );

    handleNodesChange(nodes);
    handleEdgesChange(edges);
    setSelectedNode(null);
  }, [selectedNode, workflow.nodes, workflow.edges, handleNodesChange, handleEdgesChange]);

  // 更新节点属性
  const handleNodePropertiesChange = useCallback(
    (nodeId: string, properties: Partial<WorkflowNodeConfig>) => {
      const nodes = workflow.nodes.map((n) =>
        n.id === nodeId ? { ...n, ...properties } : n
      );
      handleNodesChange(nodes);

      if (selectedNode?.id === nodeId) {
        setSelectedNode({ ...selectedNode, ...properties });
      }
    },
    [workflow.nodes, selectedNode, handleNodesChange]
  );

  // 保存工作流
  const handleSave = useCallback(() => {
    onSave(workflow);
    setHasChanges(false);
  }, [workflow, onSave]);

  // 执行工作流
  const handleExecute = useCallback(() => {
    onExecute?.(workflow);
  }, [workflow, onExecute]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* 工具栏 */}
      <WorkflowToolbar
        workflow={workflow}
        hasChanges={hasChanges}
        onSave={handleSave}
        onExecute={handleExecute}
        onDeleteNode={selectedNode ? handleDeleteNode : undefined}
      />

      {/* 主内容区 */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 左侧：节点面板 */}
        <NodePalette onAddNode={handleAddNode} />

        {/* 中间：画布 */}
        <div style={{ flex: 1, position: 'relative' }}>
          <WorkflowCanvas
            nodes={workflow.nodes}
            edges={workflow.edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onNodeClick={setSelectedNode}
          />
        </div>

        {/* 右侧：属性面板 */}
        {selectedNode && (
          <NodePropertiesPanel
            node={selectedNode}
            onChange={(props) => handleNodePropertiesChange(selectedNode.id, props)}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
};
