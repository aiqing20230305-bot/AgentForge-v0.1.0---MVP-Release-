/**
 * 工作流引擎 - 类型定义
 * Workflow Engine - Type Definitions
 */

// ==================== 节点类型 ====================
export enum NodeType {
  START = 'start',
  END = 'end',
  TASK = 'task',
  DECISION = 'decision',
  PARALLEL = 'parallel',
  LOOP = 'loop',
  DELAY = 'delay',
  WEBHOOK = 'webhook',
  HTTP_REQUEST = 'http_request',
  TRANSFORM = 'transform',
  FILTER = 'filter',
  AGGREGATE = 'aggregate',
  AI_AGENT = 'ai_agent',
  NOTIFICATION = 'notification',
  DATABASE = 'database',
  FILE_OPERATION = 'file_operation',
}

// ==================== 触发器类型 ====================
export enum TriggerType {
  MANUAL = 'manual',
  SCHEDULED = 'scheduled',
  WEBHOOK = 'webhook',
  EVENT = 'event',
  FILE_WATCH = 'file_watch',
}

// ==================== 执行状态 ====================
export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PAUSED = 'paused',
  SKIPPED = 'skipped',
}

// ==================== 数据映射 ====================
export interface DataMapping {
  source: string; // 源字段路径 (支持 lodash.get 格式)
  target: string; // 目标字段路径
  transform?: string; // 转换表达式 (JavaScript)
  default?: any; // 默认值
}

// ==================== 表达式引擎 ====================
export interface Expression {
  type: 'javascript' | 'jsonpath' | 'template';
  value: string;
}

// ==================== 条件判断 ====================
export interface Condition {
  left: string | Expression;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains' | 'matches';
  right: string | Expression;
  logicOperator?: 'and' | 'or';
}

// ==================== 节点配置 ====================
export interface BaseNodeConfig {
  id: string;
  type: NodeType;
  label: string;
  description?: string;
  position: { x: number; y: number };
  data: any;
  retryPolicy?: RetryPolicy;
  timeout?: number; // 超时时间（毫秒）
  onError?: ErrorHandler;
}

export interface TaskNodeConfig extends BaseNodeConfig {
  type: NodeType.TASK;
  data: {
    action: string;
    parameters: Record<string, any>;
    inputMapping?: DataMapping[];
    outputMapping?: DataMapping[];
  };
}

export interface DecisionNodeConfig extends BaseNodeConfig {
  type: NodeType.DECISION;
  data: {
    conditions: Condition[];
    defaultBranch?: string;
  };
}

export interface ParallelNodeConfig extends BaseNodeConfig {
  type: NodeType.PARALLEL;
  data: {
    branches: string[]; // 并行分支的节点ID
    waitForAll: boolean; // 是否等待所有分支完成
    continueOnError?: boolean;
  };
}

export interface LoopNodeConfig extends BaseNodeConfig {
  type: NodeType.LOOP;
  data: {
    iterableSource: string | Expression;
    itemVariable: string;
    maxIterations?: number;
    breakCondition?: Condition;
  };
}

export interface DelayNodeConfig extends BaseNodeConfig {
  type: NodeType.DELAY;
  data: {
    duration: number; // 延迟时间（毫秒）
    unit?: 'ms' | 's' | 'm' | 'h';
  };
}

export interface WebhookNodeConfig extends BaseNodeConfig {
  type: NodeType.WEBHOOK;
  data: {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    body?: any;
    authentication?: {
      type: 'none' | 'basic' | 'bearer' | 'apikey';
      credentials?: any;
    };
  };
}

export interface AIAgentNodeConfig extends BaseNodeConfig {
  type: NodeType.AI_AGENT;
  data: {
    agentId: string;
    prompt: string | Expression;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
}

export type WorkflowNodeConfig =
  | BaseNodeConfig
  | TaskNodeConfig
  | DecisionNodeConfig
  | ParallelNodeConfig
  | LoopNodeConfig
  | DelayNodeConfig
  | WebhookNodeConfig
  | AIAgentNodeConfig;

// ==================== 连接/边 ====================
export interface WorkflowEdge {
  id: string;
  source: string; // 源节点ID
  target: string; // 目标节点ID
  sourceHandle?: string; // 源节点的输出端口
  targetHandle?: string; // 目标节点的输入端口
  label?: string;
  condition?: Condition; // 条件边
  animated?: boolean;
}

// ==================== 触发器配置 ====================
export interface TriggerConfig {
  type: TriggerType;
  enabled: boolean;
  config: any;
}

export interface ManualTrigger extends TriggerConfig {
  type: TriggerType.MANUAL;
  config: {
    requireConfirmation?: boolean;
  };
}

export interface ScheduledTrigger extends TriggerConfig {
  type: TriggerType.SCHEDULED;
  config: {
    cron: string; // Cron 表达式
    timezone?: string;
    startDate?: Date;
    endDate?: Date;
  };
}

export interface WebhookTrigger extends TriggerConfig {
  type: TriggerType.WEBHOOK;
  config: {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    authentication?: {
      type: 'none' | 'token' | 'hmac';
      secret?: string;
    };
  };
}

export interface EventTrigger extends TriggerConfig {
  type: TriggerType.EVENT;
  config: {
    eventType: string;
    source?: string;
    filter?: Condition[];
  };
}

// ==================== 重试策略 ====================
export interface RetryPolicy {
  maxRetries: number;
  retryDelay: number; // 毫秒
  backoffMultiplier?: number; // 指数退避倍数
  retryOn?: string[]; // 重试的错误类型
}

// ==================== 错误处理 ====================
export interface ErrorHandler {
  strategy: 'fail' | 'skip' | 'retry' | 'fallback' | 'custom';
  fallbackNode?: string;
  customHandler?: string; // JavaScript 函数代码
  notification?: {
    enabled: boolean;
    channels: ('email' | 'slack' | 'webhook')[];
  };
}

// ==================== 工作流定义 ====================
export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  version: string;
  tags?: string[];
  category?: string;
  icon?: string;

  // 节点和连接
  nodes: WorkflowNodeConfig[];
  edges: WorkflowEdge[];

  // 触发器
  triggers: TriggerConfig[];

  // 全局配置
  settings: {
    timeout?: number;
    maxExecutionTime?: number;
    concurrency?: number;
    errorHandler?: ErrorHandler;
    variables?: Record<string, any>; // 工作流变量
  };

  // 元数据
  metadata: {
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    isTemplate?: boolean;
    templateId?: string;
  };
}

// ==================== 执行上下文 ====================
export interface ExecutionContext {
  workflowId: string;
  executionId: string;
  triggeredBy: string;
  triggeredAt: Date;

  // 运行时数据
  variables: Record<string, any>; // 全局变量
  nodeData: Map<string, any>; // 各节点的输出数据

  // 执行追踪
  trace: ExecutionTrace[];

  // 状态管理
  status: ExecutionStatus;
  currentNode?: string;

  // 统计信息
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

// ==================== 执行追踪 ====================
export interface ExecutionTrace {
  nodeId: string;
  nodeName: string;
  status: ExecutionStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  input?: any;
  output?: any;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  retries?: number;
}

// ==================== 工作流执行结果 ====================
export interface WorkflowExecutionResult {
  executionId: string;
  workflowId: string;
  status: ExecutionStatus;
  output?: any;
  error?: any;
  duration: number;
  trace: ExecutionTrace[];
  metrics: ExecutionMetrics;
}

// ==================== 执行指标 ====================
export interface ExecutionMetrics {
  totalNodes: number;
  executedNodes: number;
  successNodes: number;
  failedNodes: number;
  skippedNodes: number;
  averageNodeDuration: number;
  totalRetries: number;
}

// ==================== 工作流模板 ====================
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  tags: string[];
  popularity: number;
  definition: WorkflowDefinition;
  preview?: string; // 预览图URL
  examples?: string[]; // 使用示例
}

// ==================== 节点执行器接口 ====================
export interface NodeExecutor {
  execute(node: WorkflowNodeConfig, context: ExecutionContext): Promise<any>;
}

// ==================== 工作流引擎配置 ====================
export interface WorkflowEngineConfig {
  maxConcurrentExecutions?: number;
  defaultTimeout?: number;
  enableMetrics?: boolean;
  enableTracing?: boolean;
  storage?: {
    type: 'memory' | 'database' | 'file';
    config?: any;
  };
}
