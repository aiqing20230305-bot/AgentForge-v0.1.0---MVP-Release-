/**
 * Backend Jira Integration Service
 * 后端 Jira 集成服务
 */

import axios, { AxiosInstance } from 'axios';

interface JiraConfig {
  host: string;
  email: string;
  apiToken: string;
}

interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description?: any;
    status: any;
    priority?: any;
    assignee?: any;
    reporter?: any;
    created: string;
    updated: string;
    issuetype: any;
    labels: string[];
  };
}

export class JiraService {
  private client: AxiosInstance | null = null;
  private config: JiraConfig | null = null;

  /**
   * 初始化服务
   */
  initialize(config: JiraConfig): void {
    this.config = config;
    const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');

    this.client = axios.create({
      baseURL: `https://${config.host}/rest/api/3`,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    if (!this.client) {
      throw new Error('Service not initialized');
    }

    try {
      await this.client.get('/myself');
      return true;
    } catch (error) {
      console.error('Jira connection test failed:', error);
      return false;
    }
  }

  /**
   * 创建 Issue
   */
  async createIssue(payload: {
    projectKey: string;
    summary: string;
    description?: string;
    issueType: string;
    priority?: string;
    assignee?: string;
    labels?: string[];
  }): Promise<JiraIssue> {
    if (!this.client) {
      throw new Error('Service not initialized');
    }

    const body = {
      fields: {
        project: { key: payload.projectKey },
        summary: payload.summary,
        description: this.formatDescription(payload.description),
        issuetype: { name: payload.issueType },
        priority: payload.priority ? { name: payload.priority } : undefined,
        assignee: payload.assignee ? { accountId: payload.assignee } : undefined,
        labels: payload.labels
      }
    };

    const response = await this.client.post('/issue', body);
    return this.getIssue(response.data.key);
  }

  /**
   * 获取 Issue
   */
  async getIssue(issueKey: string): Promise<JiraIssue> {
    if (!this.client) {
      throw new Error('Service not initialized');
    }

    const response = await this.client.get(`/issue/${issueKey}`);
    return response.data;
  }

  /**
   * 更新 Issue
   */
  async updateIssue(issueKey: string, fields: any): Promise<void> {
    if (!this.client) {
      throw new Error('Service not initialized');
    }

    await this.client.put(`/issue/${issueKey}`, { fields });
  }

  /**
   * 搜索 Issues
   */
  async searchIssues(jql: string, maxResults: number = 50): Promise<JiraIssue[]> {
    if (!this.client) {
      throw new Error('Service not initialized');
    }

    const response = await this.client.post('/search', {
      jql,
      maxResults,
      fields: ['*all']
    });

    return response.data.issues;
  }

  /**
   * 转换 Issue 状态
   */
  async transitionIssue(issueKey: string, transitionId: string, comment?: string): Promise<void> {
    if (!this.client) {
      throw new Error('Service not initialized');
    }

    const body: any = {
      transition: { id: transitionId }
    };

    if (comment) {
      body.update = {
        comment: [{
          add: {
            body: this.formatDescription(comment)
          }
        }]
      };
    }

    await this.client.post(`/issue/${issueKey}/transitions`, body);
  }

  /**
   * 获取可用转换
   */
  async getTransitions(issueKey: string): Promise<any[]> {
    if (!this.client) {
      throw new Error('Service not initialized');
    }

    const response = await this.client.get(`/issue/${issueKey}/transitions`);
    return response.data.transitions;
  }

  /**
   * 添加评论
   */
  async addComment(issueKey: string, comment: string): Promise<void> {
    if (!this.client) {
      throw new Error('Service not initialized');
    }

    await this.client.post(`/issue/${issueKey}/comment`, {
      body: this.formatDescription(comment)
    });
  }

  /**
   * 格式化描述为 Atlassian Document Format
   */
  private formatDescription(text?: string): any {
    if (!text) return undefined;

    return {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text
            }
          ]
        }
      ]
    };
  }

  /**
   * Webhook 签名验证
   * 使用HMAC-SHA256验证Jira webhook签名
   * @param payload - Webhook请求体（字符串形式）
   * @param signature - Jira发送的签名（x-hub-signature或x-jira-signature头）
   * @returns 签名是否有效
   */
  verifyWebhook(payload: string, signature: string): boolean {
    const secret = process.env.JIRA_WEBHOOK_SECRET;

    if (!secret) {
      console.error('JIRA_WEBHOOK_SECRET not configured');
      return false;
    }

    if (!signature) {
      console.error('No signature provided');
      return false;
    }

    try {
      const crypto = require('crypto');

      // 移除签名前缀（如 "sha256="）
      const providedSignature = signature.startsWith('sha256=')
        ? signature.substring(7)
        : signature;

      // 生成期望的签名
      const hmac = crypto.createHmac('sha256', secret);
      const expectedSignature = hmac.update(payload).digest('hex');

      // 使用时间安全的比较函数，防止时序攻击
      return crypto.timingSafeEqual(
        Buffer.from(providedSignature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }

  /**
   * 处理 Webhook 事件
   */
  async handleWebhook(event: any): Promise<void> {
    const { webhookEvent, issue } = event;

    switch (webhookEvent) {
      case 'jira:issue_created':
        console.log('Issue created:', issue.key);
        break;

      case 'jira:issue_updated':
        console.log('Issue updated:', issue.key);
        break;

      case 'jira:issue_deleted':
        console.log('Issue deleted:', issue.key);
        break;

      default:
        console.log('Unknown webhook event:', webhookEvent);
    }
  }
}

export const jiraService = new JiraService();
