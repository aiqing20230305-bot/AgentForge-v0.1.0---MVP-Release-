/**
 * 节点执行器注册表 - 各类型节点的执行实现
 * Node Executor Registry - Execution implementations for different node types
 */

import {
  NodeExecutor,
  WorkflowNodeConfig,
  ExecutionContext,
  NodeType,
  TaskNodeConfig,
  DelayNodeConfig,
  WebhookNodeConfig,
  AIAgentNodeConfig,
} from './types';
import { expressionEngine } from './expressionEngine';

/**
 * 任务节点执行器
 */
class TaskNodeExecutor implements NodeExecutor {
  async execute(node: TaskNodeConfig, context: ExecutionContext): Promise<any> {
    const { action, parameters, inputMapping, outputMapping } = node.data;

    // 输入数据映射
    let input = parameters;
    if (inputMapping && inputMapping.length > 0) {
      const sourceData = {
        ...context.variables,
        nodeData: Object.fromEntries(context.nodeData),
      };
      input = expressionEngine.mapData(sourceData, inputMapping);
    }

    // 执行任务（这里需要根据 action 调用相应的服务）
    let output: any;
    switch (action) {
      case 'log':
        console.log('[Task]', input);
        output = { logged: true, timestamp: new Date() };
        break;

      case 'calculate':
        output = this.executeCalculation(input);
        break;

      case 'transform':
        output = this.executeTransform(input);
        break;

      default:
        throw new Error(`Unknown task action: ${action}`);
    }

    // 输出数据映射
    if (outputMapping && outputMapping.length > 0) {
      output = expressionEngine.mapData(output, outputMapping);
    }

    return output;
  }

  private executeCalculation(input: any): any {
    const { expression, variables } = input;
    return {
      result: expressionEngine.executeJavaScript(expression, variables || {}),
    };
  }

  private executeTransform(input: any): any {
    const { data, transform } = input;
    return expressionEngine.executeJavaScript(transform, { data });
  }
}

/**
 * 延迟节点执行器
 */
class DelayNodeExecutor implements NodeExecutor {
  async execute(node: DelayNodeConfig, context: ExecutionContext): Promise<any> {
    const { duration, unit = 'ms' } = node.data;

    let delayMs = duration;
    switch (unit) {
      case 's':
        delayMs = duration * 1000;
        break;
      case 'm':
        delayMs = duration * 60 * 1000;
        break;
      case 'h':
        delayMs = duration * 60 * 60 * 1000;
        break;
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));

    return {
      delayed: delayMs,
      completedAt: new Date(),
    };
  }
}

/**
 * Webhook/HTTP 请求节点执行器
 */
class WebhookNodeExecutor implements NodeExecutor {
  async execute(node: WebhookNodeConfig, context: ExecutionContext): Promise<any> {
    const { url, method, headers = {}, body, authentication } = node.data;

    // 构建请求配置
    const requestConfig: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    // 添加认证
    if (authentication) {
      switch (authentication.type) {
        case 'bearer':
          requestConfig.headers = {
            ...requestConfig.headers,
            Authorization: `Bearer ${authentication.credentials.token}`,
          };
          break;
        case 'basic':
          const { username, password } = authentication.credentials;
          const encoded = btoa(`${username}:${password}`);
          requestConfig.headers = {
            ...requestConfig.headers,
            Authorization: `Basic ${encoded}`,
          };
          break;
        case 'apikey':
          requestConfig.headers = {
            ...requestConfig.headers,
            [authentication.credentials.headerName]: authentication.credentials.key,
          };
          break;
      }
    }

    // 添加请求体
    if (body && method !== 'GET') {
      // 支持模板变量替换
      const processedBody = this.processRequestBody(body, context);
      requestConfig.body = JSON.stringify(processedBody);
    }

    // 发送请求
    try {
      const response = await fetch(url, requestConfig);
      const responseData = await response.json();

      return {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
      };
    } catch (error: any) {
      throw new Error(`HTTP request failed: ${error.message}`);
    }
  }

  private processRequestBody(body: any, context: ExecutionContext): any {
    if (typeof body === 'string') {
      return expressionEngine.executeTemplate(body, {
        ...context.variables,
        nodeData: Object.fromEntries(context.nodeData),
      });
    }

    if (typeof body === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(body)) {
        if (typeof value === 'string') {
          result[key] = expressionEngine.executeTemplate(value as string, {
            ...context.variables,
            nodeData: Object.fromEntries(context.nodeData),
          });
        } else {
          result[key] = value;
        }
      }
      return result;
    }

    return body;
  }
}

/**
 * 数据转换节点执行器
 */
class TransformNodeExecutor implements NodeExecutor {
  async execute(node: WorkflowNodeConfig, context: ExecutionContext): Promise<any> {
    const { inputField, outputField, transformFunction } = node.data;

    // 获取输入数据
    const inputData = expressionEngine.executeJSONPath(inputField, {
      ...context.variables,
      nodeData: Object.fromEntries(context.nodeData),
    });

    // 执行转换
    const output = expressionEngine.executeJavaScript(transformFunction, {
      input: inputData,
      context: context.variables,
    });

    return { [outputField]: output };
  }
}

/**
 * 过滤节点执行器
 */
class FilterNodeExecutor implements NodeExecutor {
  async execute(node: WorkflowNodeConfig, context: ExecutionContext): Promise<any> {
    const { arraySource, filterExpression } = node.data;

    // 获取数组数据
    const array = expressionEngine.executeJSONPath(arraySource, {
      ...context.variables,
      nodeData: Object.fromEntries(context.nodeData),
    });

    if (!Array.isArray(array)) {
      throw new Error('Filter node requires an array input');
    }

    // 过滤
    const filtered = array.filter((item, index) =>
      expressionEngine.executeJavaScript(filterExpression, {
        item,
        index,
        context: context.variables,
      })
    );

    return { filtered, count: filtered.length };
  }
}

/**
 * 聚合节点执行器
 */
class AggregateNodeExecutor implements NodeExecutor {
  async execute(node: WorkflowNodeConfig, context: ExecutionContext): Promise<any> {
    const { arraySource, operation, field } = node.data;

    // 获取数组数据
    const array = expressionEngine.executeJSONPath(arraySource, {
      ...context.variables,
      nodeData: Object.fromEntries(context.nodeData),
    });

    if (!Array.isArray(array)) {
      throw new Error('Aggregate node requires an array input');
    }

    // 执行聚合操作
    let result: any;
    const values = field ? array.map((item) => item[field]) : array;

    switch (operation) {
      case 'sum':
        result = values.reduce((sum, val) => sum + (Number(val) || 0), 0);
        break;

      case 'avg':
        result = values.reduce((sum, val) => sum + (Number(val) || 0), 0) / values.length;
        break;

      case 'min':
        result = Math.min(...values.map(Number));
        break;

      case 'max':
        result = Math.max(...values.map(Number));
        break;

      case 'count':
        result = values.length;
        break;

      case 'distinct':
        result = [...new Set(values)];
        break;

      case 'group':
        result = values.reduce((groups: any, val) => {
          const key = String(val);
          groups[key] = (groups[key] || 0) + 1;
          return groups;
        }, {});
        break;

      default:
        throw new Error(`Unknown aggregate operation: ${operation}`);
    }

    return { result, operation, count: array.length };
  }
}

/**
 * AI Agent 节点执行器
 */
class AIAgentNodeExecutor implements NodeExecutor {
  async execute(node: AIAgentNodeConfig, context: ExecutionContext): Promise<any> {
    const { agentId, prompt, model = 'claude-3-sonnet', temperature = 0.7, maxTokens } = node.data;

    // 处理 prompt 模板
    const processedPrompt =
      typeof prompt === 'string'
        ? expressionEngine.executeTemplate(prompt, {
            ...context.variables,
            nodeData: Object.fromEntries(context.nodeData),
          })
        : expressionEngine.evaluate(prompt, {
            ...context.variables,
            nodeData: Object.fromEntries(context.nodeData),
          });

    // 这里应该调用实际的 AI Agent 服务
    // 目前返回模拟数据
    return {
      agentId,
      model,
      prompt: processedPrompt,
      response: `AI response for: ${processedPrompt.substring(0, 50)}...`,
      usage: {
        promptTokens: 100,
        completionTokens: 150,
        totalTokens: 250,
      },
    };
  }
}

/**
 * 通知节点执行器
 */
class NotificationNodeExecutor implements NodeExecutor {
  async execute(node: WorkflowNodeConfig, context: ExecutionContext): Promise<any> {
    const { channel, recipient, title, message } = node.data;

    // 处理消息模板
    const processedMessage = expressionEngine.executeTemplate(message, {
      ...context.variables,
      nodeData: Object.fromEntries(context.nodeData),
    });

    console.log(`[Notification] ${channel}: ${title} - ${processedMessage}`);

    return {
      sent: true,
      channel,
      recipient,
      timestamp: new Date(),
    };
  }
}

/**
 * 数据库操作节点执行器
 */
class DatabaseNodeExecutor implements NodeExecutor {
  async execute(node: WorkflowNodeConfig, context: ExecutionContext): Promise<any> {
    const { operation, collection, query, data } = node.data;

    // 这里应该调用实际的数据库服务
    // 目前返回模拟数据
    console.log(`[Database] ${operation} on ${collection}`);

    return {
      operation,
      collection,
      success: true,
      timestamp: new Date(),
    };
  }
}

/**
 * 文件操作节点执行器
 */
class FileOperationNodeExecutor implements NodeExecutor {
  async execute(node: WorkflowNodeConfig, context: ExecutionContext): Promise<any> {
    const { operation, path, content } = node.data;

    console.log(`[File] ${operation} on ${path}`);

    return {
      operation,
      path,
      success: true,
      timestamp: new Date(),
    };
  }
}

/**
 * 节点执行器注册表
 */
export class NodeExecutorRegistry {
  private executors = new Map<NodeType, NodeExecutor>();

  constructor() {
    // 注册所有执行器
    this.register(NodeType.TASK, new TaskNodeExecutor());
    this.register(NodeType.DELAY, new DelayNodeExecutor());
    this.register(NodeType.WEBHOOK, new WebhookNodeExecutor());
    this.register(NodeType.HTTP_REQUEST, new WebhookNodeExecutor());
    this.register(NodeType.TRANSFORM, new TransformNodeExecutor());
    this.register(NodeType.FILTER, new FilterNodeExecutor());
    this.register(NodeType.AGGREGATE, new AggregateNodeExecutor());
    this.register(NodeType.AI_AGENT, new AIAgentNodeExecutor());
    this.register(NodeType.NOTIFICATION, new NotificationNodeExecutor());
    this.register(NodeType.DATABASE, new DatabaseNodeExecutor());
    this.register(NodeType.FILE_OPERATION, new FileOperationNodeExecutor());
  }

  register(type: NodeType, executor: NodeExecutor): void {
    this.executors.set(type, executor);
  }

  get(type: NodeType): NodeExecutor {
    const executor = this.executors.get(type);
    if (!executor) {
      throw new Error(`No executor registered for node type: ${type}`);
    }
    return executor;
  }

  has(type: NodeType): boolean {
    return this.executors.has(type);
  }
}
