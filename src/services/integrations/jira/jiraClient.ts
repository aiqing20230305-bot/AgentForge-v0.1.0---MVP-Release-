/**
 * Jira API Client
 * 提供与 Jira REST API 的交互功能
 */

export interface JiraConfig {
  host: string;
  email: string;
  apiToken: string;
  projectKey?: string;
}

export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  description?: string;
  status: {
    name: string;
    id: string;
  };
  priority?: {
    name: string;
    id: string;
  };
  assignee?: {
    accountId: string;
    displayName: string;
    emailAddress: string;
  };
  reporter?: {
    accountId: string;
    displayName: string;
    emailAddress: string;
  };
  created: string;
  updated: string;
  issueType: {
    name: string;
    id: string;
  };
  labels?: string[];
  customFields?: Record<string, any>;
}

export interface JiraCreateIssuePayload {
  projectKey: string;
  summary: string;
  description?: string;
  issueType: string;
  priority?: string;
  assignee?: string;
  labels?: string[];
  customFields?: Record<string, any>;
}

export interface JiraTransition {
  id: string;
  name: string;
  to: {
    id: string;
    name: string;
  };
}

export interface JiraSearchOptions {
  jql: string;
  startAt?: number;
  maxResults?: number;
  fields?: string[];
}

export interface JiraSearchResult {
  total: number;
  issues: JiraIssue[];
  startAt: number;
  maxResults: number;
}

class JiraClient {
  private config: JiraConfig | null = null;
  private baseUrl: string = '';

  /**
   * 初始化 Jira 客户端
   */
  initialize(config: JiraConfig): void {
    this.config = config;
    this.baseUrl = `https://${config.host}/rest/api/3`;
  }

  /**
   * 获取认证头
   */
  private getAuthHeaders(): Record<string, string> {
    if (!this.config) {
      throw new Error('Jira client not initialized');
    }

    const auth = btoa(`${this.config.email}:${this.config.apiToken}`);
    return {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/myself`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return response.ok;
    } catch (error) {
      console.error('Jira connection test failed:', error);
      return false;
    }
  }

  /**
   * 获取项目信息
   */
  async getProject(projectKey: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/project/${projectKey}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get project: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 创建 Issue
   */
  async createIssue(payload: JiraCreateIssuePayload): Promise<JiraIssue> {
    const body = {
      fields: {
        project: {
          key: payload.projectKey
        },
        summary: payload.summary,
        description: payload.description ? {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: payload.description
                }
              ]
            }
          ]
        } : undefined,
        issuetype: {
          name: payload.issueType
        },
        priority: payload.priority ? {
          name: payload.priority
        } : undefined,
        assignee: payload.assignee ? {
          accountId: payload.assignee
        } : undefined,
        labels: payload.labels,
        ...payload.customFields
      }
    };

    const response = await fetch(`${this.baseUrl}/issue`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create issue: ${JSON.stringify(error)}`);
    }

    const result = await response.json();
    return this.getIssue(result.key);
  }

  /**
   * 获取 Issue
   */
  async getIssue(issueKey: string): Promise<JiraIssue> {
    const response = await fetch(`${this.baseUrl}/issue/${issueKey}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get issue: ${response.statusText}`);
    }

    const data = await response.json();
    return this.transformIssue(data);
  }

  /**
   * 更新 Issue
   */
  async updateIssue(issueKey: string, fields: Partial<JiraCreateIssuePayload>): Promise<void> {
    const body = {
      fields: {
        summary: fields.summary,
        description: fields.description ? {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: fields.description
                }
              ]
            }
          ]
        } : undefined,
        priority: fields.priority ? {
          name: fields.priority
        } : undefined,
        assignee: fields.assignee ? {
          accountId: fields.assignee
        } : undefined,
        labels: fields.labels,
        ...fields.customFields
      }
    };

    const response = await fetch(`${this.baseUrl}/issue/${issueKey}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to update issue: ${JSON.stringify(error)}`);
    }
  }

  /**
   * 搜索 Issues
   */
  async searchIssues(options: JiraSearchOptions): Promise<JiraSearchResult> {
    const params = new URLSearchParams({
      jql: options.jql,
      startAt: String(options.startAt || 0),
      maxResults: String(options.maxResults || 50)
    });

    if (options.fields) {
      params.append('fields', options.fields.join(','));
    }

    const response = await fetch(`${this.baseUrl}/search?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to search issues: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      total: data.total,
      issues: data.issues.map((issue: any) => this.transformIssue(issue)),
      startAt: data.startAt,
      maxResults: data.maxResults
    };
  }

  /**
   * 获取 Issue 的可用转换
   */
  async getTransitions(issueKey: string): Promise<JiraTransition[]> {
    const response = await fetch(`${this.baseUrl}/issue/${issueKey}/transitions`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get transitions: ${response.statusText}`);
    }

    const data = await response.json();
    return data.transitions;
  }

  /**
   * 执行状态转换
   */
  async transitionIssue(issueKey: string, transitionId: string, comment?: string): Promise<void> {
    const body: any = {
      transition: {
        id: transitionId
      }
    };

    if (comment) {
      body.update = {
        comment: [
          {
            add: {
              body: {
                type: 'doc',
                version: 1,
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: comment
                      }
                    ]
                  }
                ]
              }
            }
          }
        ]
      };
    }

    const response = await fetch(`${this.baseUrl}/issue/${issueKey}/transitions`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to transition issue: ${JSON.stringify(error)}`);
    }
  }

  /**
   * 添加评论
   */
  async addComment(issueKey: string, comment: string): Promise<void> {
    const body = {
      body: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: comment
              }
            ]
          }
        ]
      }
    };

    const response = await fetch(`${this.baseUrl}/issue/${issueKey}/comment`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Failed to add comment: ${response.statusText}`);
    }
  }

  /**
   * 获取项目的 Issue 类型
   */
  async getIssueTypes(projectKey: string): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/project/${projectKey}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get issue types: ${response.statusText}`);
    }

    const data = await response.json();
    return data.issueTypes;
  }

  /**
   * 获取优先级列表
   */
  async getPriorities(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/priority`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get priorities: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 搜索用户
   */
  async searchUsers(query: string, projectKey?: string): Promise<any[]> {
    const params = new URLSearchParams({ query });
    if (projectKey) {
      params.append('projectKeys', projectKey);
    }

    const response = await fetch(`${this.baseUrl}/user/search?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to search users: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 转换 Jira API 响应为标准格式
   */
  private transformIssue(data: any): JiraIssue {
    return {
      id: data.id,
      key: data.key,
      summary: data.fields.summary,
      description: this.extractDescription(data.fields.description),
      status: {
        name: data.fields.status.name,
        id: data.fields.status.id
      },
      priority: data.fields.priority ? {
        name: data.fields.priority.name,
        id: data.fields.priority.id
      } : undefined,
      assignee: data.fields.assignee ? {
        accountId: data.fields.assignee.accountId,
        displayName: data.fields.assignee.displayName,
        emailAddress: data.fields.assignee.emailAddress
      } : undefined,
      reporter: data.fields.reporter ? {
        accountId: data.fields.reporter.accountId,
        displayName: data.fields.reporter.displayName,
        emailAddress: data.fields.reporter.emailAddress
      } : undefined,
      created: data.fields.created,
      updated: data.fields.updated,
      issueType: {
        name: data.fields.issuetype.name,
        id: data.fields.issuetype.id
      },
      labels: data.fields.labels || [],
      customFields: this.extractCustomFields(data.fields)
    };
  }

  /**
   * 从 Atlassian Document Format 提取纯文本
   */
  private extractDescription(description: any): string | undefined {
    if (!description) return undefined;
    if (typeof description === 'string') return description;

    // ADF 格式
    if (description.content) {
      return this.extractTextFromADF(description.content);
    }

    return undefined;
  }

  /**
   * 递归提取 ADF 内容中的文本
   */
  private extractTextFromADF(content: any[]): string {
    let text = '';
    for (const node of content) {
      if (node.type === 'text') {
        text += node.text;
      } else if (node.content) {
        text += this.extractTextFromADF(node.content);
      }
      if (node.type === 'paragraph') {
        text += '\n';
      }
    }
    return text.trim();
  }

  /**
   * 提取自定义字段
   */
  private extractCustomFields(fields: any): Record<string, any> {
    const customFields: Record<string, any> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (key.startsWith('customfield_')) {
        customFields[key] = value;
      }
    }
    return customFields;
  }
}

export const jiraClient = new JiraClient();
