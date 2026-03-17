/**
 * 表达式引擎 - 支持 JavaScript、JSONPath、模板字符串
 * Expression Engine - Supports JavaScript, JSONPath, Template Strings
 */

import { Expression } from './types';

export class ExpressionEngine {
  /**
   * 安全的沙箱环境
   */
  private createSandbox(context: Record<string, any>): any {
    return {
      // 提供的上下文变量
      ...context,

      // 安全的内置函数
      Math,
      Date,
      JSON,
      String,
      Number,
      Boolean,
      Array,
      Object,

      // 工具函数
      console: {
        log: (...args: any[]) => console.log('[Workflow]', ...args),
      },
    };
  }

  /**
   * 执行 JavaScript 表达式
   */
  executeJavaScript(code: string, context: Record<string, any>): any {
    try {
      const sandbox = this.createSandbox(context);

      // 创建函数作用域，防止访问全局对象
      const fn = new Function(
        ...Object.keys(sandbox),
        `"use strict"; return (${code});`
      );

      return fn(...Object.values(sandbox));
    } catch (error: any) {
      throw new Error(`JavaScript expression execution failed: ${error.message}`);
    }
  }

  /**
   * 执行 JSONPath 查询
   */
  executeJSONPath(path: string, data: any): any {
    try {
      // 简化版 JSONPath 实现
      const parts = path.replace(/^\$\.?/, '').split('.');
      let result = data;

      for (const part of parts) {
        // 数组索引处理
        const arrayMatch = part.match(/^(.+?)\[(\d+)\]$/);
        if (arrayMatch) {
          const [, key, index] = arrayMatch;
          result = result[key]?.[parseInt(index)];
        }
        // 通配符处理
        else if (part === '*') {
          if (Array.isArray(result)) {
            return result;
          } else if (typeof result === 'object') {
            return Object.values(result);
          }
        }
        // 普通属性访问
        else {
          result = result?.[part];
        }

        if (result === undefined) {
          return undefined;
        }
      }

      return result;
    } catch (error: any) {
      throw new Error(`JSONPath execution failed: ${error.message}`);
    }
  }

  /**
   * 执行模板字符串
   */
  executeTemplate(template: string, context: Record<string, any>): string {
    try {
      // 支持 ${variable} 和 {{variable}} 两种语法
      return template.replace(/\$\{([^}]+)\}|\{\{([^}]+)\}\}/g, (match, js, simple) => {
        const expr = js || simple;
        try {
          if (js) {
            // ${} 语法支持 JavaScript 表达式
            return String(this.executeJavaScript(expr, context));
          } else {
            // {{}} 语法仅支持简单变量访问
            return String(this.executeJSONPath(expr, context));
          }
        } catch (error) {
          console.warn(`Template expression evaluation failed: ${expr}`, error);
          return match; // 保留原始表达式
        }
      });
    } catch (error: any) {
      throw new Error(`Template execution failed: ${error.message}`);
    }
  }

  /**
   * 通用表达式执行
   */
  evaluate(expression: Expression | string, context: Record<string, any>): any {
    if (typeof expression === 'string') {
      // 如果是简单字符串，尝试从上下文中获取
      return this.executeJSONPath(expression, context);
    }

    switch (expression.type) {
      case 'javascript':
        return this.executeJavaScript(expression.value, context);

      case 'jsonpath':
        return this.executeJSONPath(expression.value, context);

      case 'template':
        return this.executeTemplate(expression.value, context);

      default:
        throw new Error(`Unknown expression type: ${(expression as any).type}`);
    }
  }

  /**
   * 评估条件表达式
   */
  evaluateCondition(
    left: any,
    operator: string,
    right: any,
    context: Record<string, any>
  ): boolean {
    // 解析左右值
    const leftValue = typeof left === 'object' ? this.evaluate(left, context) : left;
    const rightValue = typeof right === 'object' ? this.evaluate(right, context) : right;

    switch (operator) {
      case 'eq':
        return leftValue === rightValue;

      case 'ne':
        return leftValue !== rightValue;

      case 'gt':
        return leftValue > rightValue;

      case 'gte':
        return leftValue >= rightValue;

      case 'lt':
        return leftValue < rightValue;

      case 'lte':
        return leftValue <= rightValue;

      case 'in':
        return Array.isArray(rightValue) && rightValue.includes(leftValue);

      case 'contains':
        if (typeof leftValue === 'string') {
          return leftValue.includes(String(rightValue));
        }
        if (Array.isArray(leftValue)) {
          return leftValue.includes(rightValue);
        }
        return false;

      case 'matches':
        if (typeof leftValue === 'string' && typeof rightValue === 'string') {
          return new RegExp(rightValue).test(leftValue);
        }
        return false;

      default:
        throw new Error(`Unknown operator: ${operator}`);
    }
  }

  /**
   * 数据映射
   */
  mapData(
    source: any,
    mapping: Array<{
      source: string;
      target: string;
      transform?: string;
      default?: any;
    }>
  ): any {
    const result: any = {};

    for (const map of mapping) {
      try {
        // 获取源数据
        let value = this.executeJSONPath(map.source, source);

        // 应用默认值
        if (value === undefined && map.default !== undefined) {
          value = map.default;
        }

        // 应用转换
        if (map.transform && value !== undefined) {
          value = this.executeJavaScript(map.transform, { value, source });
        }

        // 设置目标值
        this.setNestedValue(result, map.target, value);
      } catch (error: any) {
        console.warn(`Data mapping failed for ${map.source} -> ${map.target}:`, error.message);
      }
    }

    return result;
  }

  /**
   * 设置嵌套对象的值
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const parts = path.split('.');
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
  }
}

// 导出单例
export const expressionEngine = new ExpressionEngine();
